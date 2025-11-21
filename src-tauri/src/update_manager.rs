use anyhow::{anyhow, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::time::{interval, sleep};

const CHECK_LIBS_URL: &str = "https://api.tikmatrix.com/front-api/check_libs?beta=0";
const UPDATE_CHECK_INTERVAL_MINUTES: u64 = 10;
const IDLE_THRESHOLD_MINUTES: u64 = 5;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LibInfo {
    pub name: String,
    pub version: String,
    #[serde(rename = "downloadUrl")]
    pub download_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckLibsResponse {
    pub code: i32,
    pub data: CheckLibsData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckLibsData {
    pub libs: Vec<LibInfo>,
}

pub struct UpdateManager {
    app: AppHandle,
    last_user_activity: Arc<AtomicU64>,
    has_running_tasks: Arc<AtomicBool>,
    auto_update_enabled: Arc<AtomicBool>,
}

impl UpdateManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            last_user_activity: Arc::new(AtomicU64::new(
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            )),
            has_running_tasks: Arc::new(AtomicBool::new(false)),
            auto_update_enabled: Arc::new(AtomicBool::new(true)),
        }
    }

    pub fn update_user_activity(&self) {
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
        self.last_user_activity.store(timestamp, Ordering::Relaxed);
    }

    pub fn set_has_running_tasks(&self, has_tasks: bool) {
        self.has_running_tasks.store(has_tasks, Ordering::Relaxed);
    }

    pub fn set_auto_update_enabled(&self, enabled: bool) {
        self.auto_update_enabled.store(enabled, Ordering::Relaxed);
    }

    fn is_system_idle(&self) -> bool {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis() as u64;
        let last_activity = self.last_user_activity.load(Ordering::Relaxed);
        let idle_duration_ms = now.saturating_sub(last_activity);

        // Use different thresholds for debug vs release
        let threshold_ms = if cfg!(debug_assertions) {
            1 * 60 * 1000 // 1 minute for debug
        } else {
            IDLE_THRESHOLD_MINUTES * 60 * 1000
        };

        idle_duration_ms > threshold_ms
    }

    pub fn spawn_periodic_updater(self: Arc<Self>) {
        let manager = Arc::clone(&self);
        tauri::async_runtime::spawn(async move {
            // Wait a bit after startup before starting the periodic updater
            sleep(Duration::from_secs(30)).await;

            let interval_duration = if cfg!(debug_assertions) {
                Duration::from_secs(60) // 1 minute for debug
            } else {
                Duration::from_secs(UPDATE_CHECK_INTERVAL_MINUTES * 60)
            };

            let mut ticker = interval(interval_duration);
            loop {
                ticker.tick().await;

                if !manager.auto_update_enabled.load(Ordering::Relaxed) {
                    log::info!("[UpdateManager] Auto-update is disabled, skipping check");
                    continue;
                }

                if manager.has_running_tasks.load(Ordering::Relaxed) {
                    log::info!("[UpdateManager] Has running tasks, skipping auto-update");
                    continue;
                }

                if !manager.is_system_idle() {
                    log::info!("[UpdateManager] System not idle, skipping auto-update");
                    continue;
                }

                log::info!("[UpdateManager] Triggering periodic update check");
                if let Err(e) = manager.check_and_update_libs(true).await {
                    log::error!("[UpdateManager] Periodic update check failed: {:?}", e);
                }
            }
        });
    }

    pub async fn check_initial_update(&self) -> Result<()> {
        log::info!("[UpdateManager] Checking initial update on startup");
        self.check_and_update_libs(false).await
    }

    pub async fn run_manual_update(&self, silent: bool) -> Result<()> {
        log::info!(
            "[UpdateManager] Manual update triggered (silent={})",
            silent
        );
        self.check_and_update_libs(silent).await
    }

    async fn check_and_update_libs(&self, silent: bool) -> Result<()> {
        if !silent {
            self.emit_update_status("checking", "Checking for updates...");
        }

        let result = async {
            let platform = self.get_platform().await;
            let app_name = std::env::var("MATRIX_APP_NAME").unwrap_or_else(|_| "TikMatrix".to_string());

            let client = Client::builder().timeout(Duration::from_secs(10)).build()?;

            let url = format!(
                "{}?time={}",
                CHECK_LIBS_URL,
                chrono::Utc::now().timestamp_millis()
            );
            let response = client
                .get(&url)
                .header("User-Agent", platform)
                .header("X-App-Id", app_name)
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(anyhow!("Failed to check libs: HTTP {}", response.status()));
            }

            let check_libs_response: CheckLibsResponse = response.json().await?;

            if check_libs_response.code != 20000 {
                return Err(anyhow!(
                    "Invalid response code: {}",
                    check_libs_response.code
                ));
            }

            let libs = check_libs_response.data.libs;
            log::info!("[UpdateManager] Found {} libs to check", libs.len());

            for lib in libs {
                if let Err(e) = self.check_and_update_single_lib(&lib, silent).await {
                    log::error!("[UpdateManager] Failed to update {}: {:?}", lib.name, e);
                }
            }

            Ok(())
        }.await;

        // Always emit completed status if not silent, regardless of success or failure
        if !silent {
            match &result {
                Ok(_) => {
                    self.emit_update_status("completed", "Update check completed");
                }
                Err(e) => {
                    self.emit_update_status("error", &format!("Update check failed: {}", e));
                }
            }
        }

        result
    }

    async fn check_and_update_single_lib(&self, lib: &LibInfo, silent: bool) -> Result<()> {
        log::info!(
            "[UpdateManager] Checking lib: {} version {}",
            lib.name,
            lib.version
        );

        if !silent {
            self.emit_update_status("downloading", &format!("Checking {} update...", lib.name));
        }

        let app_data_dir = self
            .app
            .path_resolver()
            .app_data_dir()
            .ok_or_else(|| anyhow!("Failed to get app data dir"))?;

        let storage_key = self.get_lib_storage_key(&lib.name);
        let stored_version = self.get_stored_version(&storage_key).await?;

        log::debug!(
            "[UpdateManager] Lib {} - local: {}, remote: {}",
            lib.name,
            stored_version,
            lib.version
        );

        // Check if update is needed
        if stored_version == lib.version {
            let needs_file_check = matches!(
                lib.name.as_str(),
                "platform-tools" | "PaddleOCR" | "agent" | "script"
            );

            if needs_file_check {
                if self.check_lib_files_exist(&lib.name, &app_data_dir).await {
                    log::info!("[UpdateManager] Lib {} is up to date", lib.name);
                    return Ok(());
                }
            } else {
                log::info!("[UpdateManager] Lib {} is up to date", lib.name);
                return Ok(());
            }
        }

        // Download and install the lib
        log::info!(
            "[UpdateManager] Downloading {} from {}",
            lib.name,
            lib.download_url
        );
        self.download_and_install_lib(lib, &app_data_dir, silent)
            .await?;

        // Update stored version
        self.set_stored_version(&storage_key, &lib.version).await?;

        Ok(())
    }

    async fn download_and_install_lib(
        &self,
        lib: &LibInfo,
        app_data_dir: &PathBuf,
        silent: bool,
    ) -> Result<()> {
        let tmp_dir = app_data_dir.join("tmp");
        tokio::fs::create_dir_all(&tmp_dir).await?;

        let file_name = lib
            .download_url
            .split('/')
            .last()
            .ok_or_else(|| anyhow!("Invalid download URL"))?;
        let download_path = tmp_dir.join(file_name);

        // Download file
        if !silent {
            self.emit_update_status("downloading", &format!("Downloading {}...", lib.name));
        }

        let download_url = if lib.download_url.contains('?') {
            format!("{}&v={}", lib.download_url, lib.version)
        } else {
            format!("{}?v={}", lib.download_url, lib.version)
        };

        // Use the existing Tauri command to download
        let download_path_str = download_path.to_string_lossy().to_string();
        self.app.emit_all(
            "update_manager_download",
            serde_json::json!({
                "url": download_url,
                "path": download_path_str,
                "lib_name": lib.name,
            }),
        )?;

        // For now, we'll do a simple download here
        let client = Client::new();
        let response = client.get(&download_url).send().await?;
        let bytes = response.bytes().await?;
        tokio::fs::write(&download_path, bytes).await?;

        // Install the lib based on type
        self.install_lib(lib, &download_path, app_data_dir, silent)
            .await?;

        Ok(())
    }

    async fn install_lib(
        &self,
        lib: &LibInfo,
        download_path: &PathBuf,
        app_data_dir: &PathBuf,
        _silent: bool,
    ) -> Result<()> {
        match lib.name.as_str() {
            "platform-tools" => {
                log::info!("[UpdateManager] Installing platform-tools");
                self.kill_process("adb").await;
                sleep(Duration::from_secs(3)).await;
                self.unzip_file(download_path, app_data_dir).await?;
                self.grant_permission_if_needed("platform-tools/adb", app_data_dir)
                    .await;
            }
            "PaddleOCR" => {
                log::info!("[UpdateManager] Installing PaddleOCR");
                self.kill_process("PaddleOCR-json").await;
                self.unzip_file(download_path, app_data_dir).await?;
            }
            "apk" | "test-apk" | "scrcpy" => {
                log::info!("[UpdateManager] Installing {}", lib.name);
                let bin_dir = app_data_dir.join("bin");
                tokio::fs::create_dir_all(&bin_dir).await?;
                let dest = bin_dir.join(download_path.file_name().unwrap());
                tokio::fs::copy(download_path, dest).await?;
                if lib.name == "apk" || lib.name == "test-apk" {
                    std::env::set_var("agent_version", &lib.version);
                }
            }
            "script" | "agent" => {
                log::info!("[UpdateManager] Installing {}", lib.name);
                self.kill_process(&lib.name).await;
                sleep(Duration::from_secs(3)).await;
                let bin_dir = app_data_dir.join("bin");
                tokio::fs::create_dir_all(&bin_dir).await?;
                let dest = bin_dir.join(download_path.file_name().unwrap());
                tokio::fs::copy(download_path, dest).await?;
                self.grant_permission_if_needed(&format!("bin/{}", lib.name), app_data_dir)
                    .await;
            }
            _ => {
                log::warn!("[UpdateManager] Unknown lib type: {}", lib.name);
            }
        }
        Ok(())
    }

    async fn unzip_file(&self, zip_path: &PathBuf, dest_dir: &PathBuf) -> Result<()> {
        use std::fs::File;
        use std::io::BufReader;
        use zip::read::ZipArchive;

        let zip_path = zip_path.clone();
        let dest_dir = dest_dir.clone();

        // Run the blocking I/O in a separate thread
        tokio::task::spawn_blocking(move || -> Result<()> {
            let file = File::open(&zip_path)?;
            let mut archive = ZipArchive::new(BufReader::new(file))?;

            for i in 0..archive.len() {
                let mut file = archive.by_index(i)?;
                let outpath = dest_dir.join(file.name());

                if file.name().ends_with('/') {
                    std::fs::create_dir_all(&outpath)?;
                } else {
                    if let Some(p) = outpath.parent() {
                        std::fs::create_dir_all(p)?;
                    }
                    let mut outfile = std::fs::File::create(&outpath)?;
                    std::io::copy(&mut file, &mut outfile)?;
                }
            }

            Ok(())
        })
        .await??;

        Ok(())
    }

    async fn kill_process(&self, name: &str) {
        #[cfg(target_os = "windows")]
        {
            use std::process::Command;
            let _ = Command::new("taskkill")
                .args(&["/F", "/IM", &format!("{}.exe", name)])
                .creation_flags(0x08000000)
                .status();
        }

        #[cfg(target_os = "macos")]
        {
            use std::process::Command;
            let _ = Command::new("pkill").args(&["-f", name]).status();
        }
    }

    async fn grant_permission_if_needed(&self, relative_path: &str, app_data_dir: &PathBuf) {
        #[cfg(target_os = "macos")]
        {
            use std::process::Command;
            let full_path = app_data_dir.join(relative_path);
            let _ = Command::new("chmod")
                .args(&["+x", full_path.to_str().unwrap()])
                .status();
            log::info!("[UpdateManager] Granted permission to {}", relative_path);
        }

        #[cfg(not(target_os = "macos"))]
        {
            let _ = (relative_path, app_data_dir);
        }
    }

    async fn check_lib_files_exist(&self, lib_name: &str, app_data_dir: &PathBuf) -> bool {
        match lib_name {
            "platform-tools" => {
                #[cfg(target_os = "macos")]
                let file = app_data_dir.join("platform-tools/adb");
                #[cfg(target_os = "windows")]
                let file = app_data_dir.join("platform-tools/adb.exe");
                file.exists()
            }
            "PaddleOCR" => {
                #[cfg(target_os = "macos")]
                let file = app_data_dir.join("PaddleOCR-json/PaddleOCR-json");
                #[cfg(target_os = "windows")]
                let file = app_data_dir.join("PaddleOCR-json/PaddleOCR-json.exe");
                file.exists()
            }
            "agent" => {
                #[cfg(target_os = "macos")]
                let file = app_data_dir.join("bin/agent");
                #[cfg(target_os = "windows")]
                let file = app_data_dir.join("bin/agent.exe");
                file.exists()
            }
            "script" => {
                #[cfg(target_os = "macos")]
                let file = app_data_dir.join("bin/script");
                #[cfg(target_os = "windows")]
                let file = app_data_dir.join("bin/script.exe");
                file.exists()
            }
            "apk" | "test-apk" | "scrcpy" => {
                let bin_dir = app_data_dir.join("bin");
                if !bin_dir.exists() {
                    return false;
                }

                match tokio::fs::read_dir(&bin_dir).await {
                    Ok(mut dir) => {
                        while let Ok(Some(entry)) = dir.next_entry().await {
                            let name = entry.file_name();
                            if name
                                .to_string_lossy()
                                .to_ascii_lowercase()
                                .contains(&lib_name.to_ascii_lowercase())
                            {
                                return true;
                            }
                        }
                        false
                    }
                    Err(_) => false,
                }
            }
            _ => true,
        }
    }

    fn get_lib_storage_key(&self, lib_name: &str) -> String {
        lib_name.to_string()
    }

    async fn get_stored_version(&self, key: &str) -> Result<String> {
        let app_data_dir = self
            .app
            .path_resolver()
            .app_data_dir()
            .ok_or_else(|| anyhow!("Failed to get app data dir"))?;
        let data_dir = app_data_dir.join("data");
        tokio::fs::create_dir_all(&data_dir).await?;

        let version_file = data_dir.join(format!("{}_version.txt", key));
        match tokio::fs::read_to_string(&version_file).await {
            Ok(content) => Ok(content.trim().to_string()),
            Err(_) => Ok("0".to_string()),
        }
    }

    async fn set_stored_version(&self, key: &str, version: &str) -> Result<()> {
        let app_data_dir = self
            .app
            .path_resolver()
            .app_data_dir()
            .ok_or_else(|| anyhow!("Failed to get app data dir"))?;
        let data_dir = app_data_dir.join("data");
        tokio::fs::create_dir_all(&data_dir).await?;

        let version_file = data_dir.join(format!("{}_version.txt", key));
        tokio::fs::write(&version_file, version).await?;
        Ok(())
    }

    async fn get_platform(&self) -> String {
        #[cfg(target_os = "windows")]
        return "windows".to_string();

        #[cfg(target_os = "macos")]
        {
            use std::process::Command;
            let output = Command::new("uname").arg("-m").output();
            if let Ok(output) = output {
                let arch = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if arch.contains("arm") || arch.contains("aarch64") {
                    return "mac-arm".to_string();
                }
            }
            "mac-intel".to_string()
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        "linux".to_string()
    }

    fn emit_update_status(&self, status: &str, message: &str) {
        let _ = self.app.emit_all(
            "update_manager_status",
            serde_json::json!({
                "status": status,
                "message": message,
                "timestamp": chrono::Utc::now().timestamp_millis(),
            }),
        );
    }
}
