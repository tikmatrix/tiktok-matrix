// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::{
    cmp::min,
    fs,
    fs::File,
    io::{self, BufReader, Write},
    net::TcpListener,
    path::Path,
    process::Command,
    time::Instant,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

use futures_util::stream::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{
    http::header::{ACCEPT, USER_AGENT},
    AppHandle, Manager,
};
use zip::read::ZipArchive;
mod init_log;
use crate::agent_ws_bridge::AgentWsBridge;
mod agent_ws_bridge;

/**
 * 读取分发商标识
 * 优先从资源目录读取 distributor.txt,如果不存在则返回 "OFFICIAL"
 */
#[tauri::command]
fn get_distributor_code(app_handle: tauri::AppHandle) -> Result<String, String> {
    // 方法 1: 从资源目录读取
    if let Some(resource_dir) = app_handle.path_resolver().resource_dir() {
        let distributor_file = resource_dir.join("distributor.txt");
        if distributor_file.exists() {
            if let Ok(code) = fs::read_to_string(&distributor_file) {
                let trimmed = code.trim().to_string();
                if !trimmed.is_empty() {
                    log::info!("📋 Distributor code loaded from resource: {}", trimmed);
                    return Ok(trimmed);
                }
            }
        }
    }

    // 方法 2: 从可执行文件同目录读取
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            let distributor_file = exe_dir.join("distributor.txt");
            if distributor_file.exists() {
                if let Ok(code) = fs::read_to_string(&distributor_file) {
                    let trimmed = code.trim().to_string();
                    if !trimmed.is_empty() {
                        log::info!("📋 Distributor code loaded from exe dir: {}", trimmed);
                        return Ok(trimmed);
                    }
                }
            }
        }
    }

    // 默认返回 OFFICIAL
    log::info!("📋 No distributor code found, using OFFICIAL");
    Ok("OFFICIAL".to_string())
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Progress {
    pub filesize: u64,
    pub transfered: u64,
    pub transfer_rate: f64,
    pub percentage: f64,
}

impl Progress {
    pub fn emit_progress(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_PROGRESS", &self).ok();
    }

    pub fn emit_finished(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_FINISHED", &self).ok();
    }
}

fn setup_env(working_dir: &str, version: String) {
    std::env::set_var("MATRIX_APP_WORK_DIR", working_dir);
    std::env::set_var(
        "MATRIX_APP_NAME",
        std::env::var("VITE_APP_NAME").unwrap_or("TikMatrix".into()),
    );
    std::env::set_var("MATRIX_APP_VERSION", version.clone());

    if cfg!(debug_assertions) {
        std::env::set_var("MOSS_URL", "http://localhost:8787/moss");
        std::env::set_var("RUST_BACKTRACE", "1");
        std::env::set_var("LOG_LEVEL", "info");
    }
}
#[tauri::command]
fn set_env(key: String, value: String) {
    std::env::set_var(key.clone(), value.clone());
    log::info!("set env: {} = {}", key, value);
}
#[tauri::command]
fn get_env(key: String) -> String {
    std::env::var(key.clone()).unwrap_or_default()
}

// 通用的设置文件读取函数
#[tauri::command]
fn read_settings_file_generic(app: tauri::AppHandle, filename: String) -> Result<String, String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let settings_path = work_dir.join("data").join(filename);

    match std::fs::read_to_string(&settings_path) {
        Ok(content) => Ok(content),
        Err(_) => Ok("{}".to_string()), // 返回空 JSON 对象如果文件不存在
    }
}

// 通用的设置文件写入函数
#[tauri::command]
fn write_settings_file_generic(
    app: tauri::AppHandle,
    filename: String,
    content: String,
) -> Result<(), String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let data_dir = work_dir.join("data");
    let settings_path = data_dir.join(filename);

    // 确保 data 目录存在
    std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;

    std::fs::write(&settings_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

// 为了向后兼容，保留原有的函数名
#[tauri::command]
fn read_settings_file(app: tauri::AppHandle) -> Result<String, String> {
    read_settings_file_generic(app, "account_warmup_settings.json".to_string())
}

#[tauri::command]
fn write_settings_file(app: tauri::AppHandle, content: String) -> Result<(), String> {
    write_settings_file_generic(app, "account_warmup_settings.json".to_string(), content)
}

#[tauri::command]
fn read_post_settings_file(app: tauri::AppHandle) -> Result<String, String> {
    read_settings_file_generic(app, "post_settings.json".to_string())
}

#[tauri::command]
fn write_post_settings_file(app: tauri::AppHandle, content: String) -> Result<(), String> {
    write_settings_file_generic(app, "post_settings.json".to_string(), content)
}
#[tauri::command]
async fn download_file(
    url: String,
    path: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    download_file_with_version(url, path, app_handle, None).await
}

#[tauri::command]
async fn download_file_with_version(
    url: String,
    path: String,
    app_handle: tauri::AppHandle,
    version: Option<String>,
) -> Result<(), String> {
    let client = Client::new();

    // 根据是否提供版本号来构建URL参数
    let request_url = if let Some(v) = version {
        if url.contains('?') {
            format!("{}&v={}", url, v)
        } else {
            format!("{}?v={}", url, v)
        }
    } else {
        // 回退到时间戳方式（兼容性）
        if url.contains('?') {
            format!("{}&t={}", url, Instant::now().elapsed().as_secs())
        } else {
            format!("{}?t={}", url, Instant::now().elapsed().as_secs())
        }
    };
    log::info!("Downloading from URL: {}", &request_url);
    let res = client
        .get(&request_url)
        .header(
            USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
        )
        .header(ACCEPT, "application/octet-stream")
        .send()
        .await
        .or(Err(format!("解析 `{}` 文件失败", &url)))?;
    let total_size = res
        .content_length()
        .ok_or(format!("获取 `{}` 文件大小失败", &url))?;

    let mut file: File = File::create(&path).or(Err(format!("创建 `{}` 文件失败", &path)))?;
    let mut stream = res.bytes_stream();
    let mut progress = Progress {
        filesize: total_size,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
    };

    let start = Instant::now();
    let mut downloaded_bytes = 0;
    let mut last_update = Instant::now();
    while let Some(item) = stream.next().await {
        let chunk = item.or(Err(format!("下载 `{}` 文件失败", &path)))?;
        file.write(&chunk)
            .or(Err(format!("写入 `{}` 文件失败", &path)))?;
        downloaded_bytes = min(downloaded_bytes + (chunk.len() as u64), total_size);

        progress.transfered = downloaded_bytes;
        progress.percentage = (progress.transfered * 100 / total_size) as f64;
        progress.transfer_rate = (downloaded_bytes as f64) / (start.elapsed().as_secs() as f64)
            + (start.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();

        if last_update.elapsed().as_millis() >= 100 {
            progress.emit_progress(&app_handle);
            last_update = std::time::Instant::now();
        }
    }

    progress.emit_finished(&app_handle);

    return Ok(());
}

#[tauri::command]
fn unzip_file(zip_path: String, dest_dir: String) -> Result<(), String> {
    let file = File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = ZipArchive::new(BufReader::new(file)).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = Path::new(&dest_dir).join(file.name());

        if (*file.name()).ends_with('/') {
            std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(&p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
            io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
fn grant_permission(app: tauri::AppHandle, path: String) {
    //exec chmod +x only os is macos
    #[cfg(target_os = "macos")]
    {
        let work_dir = app.path_resolver().app_data_dir().unwrap();
        let work_dir = work_dir.to_str().unwrap();
        let path = format!("{}/{}", work_dir, path);
        //chmod +x
        let mut command = Command::new("chmod");
        command
            .args(&["+x", &path])
            .status()
            .expect("failed to chmod");
        log::info!("grant_permission: {}", path);
    }
    #[cfg(target_os = "windows")]
    {
        let work_dir = app.path_resolver().app_data_dir().unwrap();
        let work_dir = work_dir.to_str().unwrap();
        let path = format!("{}/{}", work_dir, path);
        log::info!("no need grant_permission: {}", path);
    }
}
#[tauri::command]
fn is_agent_running() -> String {
    //check 50809 port is listening
    let port = 50809;
    match TcpListener::bind(("0.0.0.0", port)) {
        Ok(_) => {
            log::info!("agent is not running on port {}", port);
            "".to_string()
        }
        Err(_) => {
            log::info!("agent is running on port {}", port);
            //check which process is listening on port 50809
            #[cfg(target_os = "windows")]
            {
                let mut command = Command::new("netstat");
                command.args(&["-ano"]);
                command.creation_flags(0x08000000); // 隐藏命令行窗口
                let output = command.output().unwrap();
                if output.status.success() {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    if output_str.contains(&format!(":{}", port)) {
                        // 找到包含端口号的行
                        if let Some(line) = output_str
                            .lines()
                            .find(|line| line.contains(&format!(":{}", port)))
                        {
                            // 提取PID
                            if let Some(pid) = line.split_whitespace().last() {
                                // 使用tasklist命令获取进程名
                                let mut tasklist = Command::new("tasklist");
                                tasklist.args(&["/FI", &format!("PID eq {}", pid)]);
                                tasklist.creation_flags(0x08000000);
                                if let Ok(task_output) = tasklist.output() {
                                    let task_str = String::from_utf8_lossy(&task_output.stdout);
                                    if let Some(process_line) = task_str.lines().nth(3) {
                                        let process_name = process_line
                                            .split_whitespace()
                                            .next()
                                            .unwrap_or("unknown");
                                        log::info!(
                                            "agent is running on port {}, process: {} (PID: {})",
                                            port,
                                            process_name,
                                            pid
                                        );
                                        return process_name.to_string();
                                    }
                                }
                            }
                        }
                        "".to_string()
                    } else {
                        log::info!("agent is not running on port {}", port);
                        "".to_string()
                    }
                } else {
                    log::info!("agent is not running on port {}", port);
                    "".to_string()
                }
            }

            #[cfg(target_os = "macos")]
            {
                let mut command = Command::new("lsof");
                command.args(&["-i", format!(":{}", port).as_str()]);
                let output = command.output().unwrap();
                if output.status.success() {
                    let output_str = String::from_utf8_lossy(&output.stdout);
                    if let Some(line) = output_str.lines().nth(1) {
                        let process_name = line.split_whitespace().next().unwrap_or("unknown");
                        log::info!(
                            "agent is running on port {}, process: {}",
                            port,
                            process_name
                        );
                        return process_name.to_string();
                    }
                    "".to_string()
                } else {
                    log::info!("agent is not running on port {}", port);
                    "".to_string()
                }
            }
        }
    }
}
#[tauri::command]
fn kill_process(name: String) {
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command
            .args(&["/F", "/IM", format!("{}.exe", name).as_str()])
            .status()
            .expect("failed to kill processes");
        log::info!("kill process:{} success", name);
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", name.as_str()])
            .status()
            .expect("failed to kill processes");
        log::info!("kill process:{} success", name);
    }
}

//open_log_dir
#[tauri::command]
fn open_dir(name: String, app: tauri::AppHandle) {
    let path = format!(
        "{}{}{}",
        app.path_resolver()
            .app_data_dir()
            .unwrap()
            .to_str()
            .unwrap(),
        std::path::MAIN_SEPARATOR,
        name
    );
    log::info!("open_dir: {}", path);
    let _ = open::that(path);
}
const CREATE_NEW_CONSOLE: u32 = 0x00000010;
#[tauri::command]
fn open_adb_terminal(dir: String) {
    #[cfg(target_os = "windows")]
    {
        // powershell -NoExit -Command "cd 'C:/path/to/platform-tools'"
        let mut command = Command::new("powershell.exe");
        command.args(&[
            "-NoExit",
            "-Command",
            &format!("cd '{}';", dir.replace("\\", "/")),
        ]);
        command
            .creation_flags(CREATE_NEW_CONSOLE)
            .spawn()
            .expect("failed to open PowerShell");
    }
    #[cfg(target_os = "macos")]
    {
        // osascript -e 'tell application "Terminal" to do script "cd /path/to/platform-tools"'
        let script = format!(
            "tell application \"Terminal\" to do script \"cd '{}'\"",
            dir.replace("'", "\\'")
        );
        let mut command = Command::new("osascript");
        command.args(&["-e", &script]);
        command.spawn().expect("failed to open Terminal");
    }
}

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_distributor_code,
            grant_permission,
            kill_process,
            open_dir,
            download_file,
            download_file_with_version,
            unzip_file,
            is_agent_running,
            set_env,
            get_env,
            read_settings_file_generic,
            write_settings_file_generic,
            read_settings_file,
            write_settings_file,
            read_post_settings_file,
            write_post_settings_file,
            open_adb_terminal
        ])
        .setup(|app| {
            let app_data_dir = app.path_resolver().app_data_dir().unwrap();
            let work_dir = app_data_dir.to_str().unwrap();
            let version = app.package_info().version.clone();
            let version_str = version.to_string();
            setup_env(work_dir, version_str);
            init_log::init(work_dir);
            log::info!("work_dir: {}", work_dir);

            // 读取并记录分发商代码
            let app_handle = app.handle();
            match get_distributor_code(app_handle.clone()) {
                Ok(code) => {
                    log::info!("✅ Distributor Code: {}", code);
                    std::env::set_var("DISTRIBUTOR_CODE", &code);
                }
                Err(e) => log::warn!("⚠️  Failed to get distributor code: {}", e),
            }

            let ui_cache_dir = app_data_dir.join("upload").join("ui");
            std::fs::create_dir_all(&ui_cache_dir)?;
            app.fs_scope()
                .allow_directory(&ui_cache_dir, true)
                .map_err(|err| std::io::Error::new(std::io::ErrorKind::Other, err.to_string()))?;

            std::fs::create_dir_all(format!("{}/{}", work_dir, "bin"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "logs"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "tmp"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "data"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "download"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload/material"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload/avatar"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload/apk"))?;
            //delete logs older than 3 days
            delete_logs_older_than_3_days(work_dir);

            std::fs::write(format!("{}/port.txt", work_dir), "0")?;
            std::fs::write(format!("{}/wsport.txt", work_dir), "0")?;
            std::fs::write(format!("{}/wssport.txt", work_dir), "0")?;
            let agent_ws_port_file = app_data_dir.join("wssport.txt");
            AgentWsBridge::spawn(app_handle, agent_ws_port_file);
            Ok(())
        })
        .on_page_load(|_window, _payload| {
            log::info!("[TikMatrix] page load triggered");
            log::info!("VITE_APP_NAME: {:?}", std::env::var("VITE_APP_NAME"));
            log::info!("VITE_TARGET_APP: {:?}", std::env::var("VITE_TARGET_APP"));
        })
        //listen to the tauri update event
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
fn delete_logs_older_than_3_days(work_dir: &str) {
    //delete logs older than 3 days
    let logs_dir = format!("{}/logs", work_dir);
    let logs_dir = Path::new(&logs_dir);
    if logs_dir.exists() {
        for entry in std::fs::read_dir(logs_dir).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_file() {
                let metadata = std::fs::metadata(&path).unwrap();
                let last_modified = metadata.created().unwrap();
                let three_days_ago =
                    std::time::SystemTime::now() - std::time::Duration::from_secs(3 * 24 * 60 * 60);
                if last_modified < three_days_ago {
                    log::info!("delete expired log: {}", path.to_str().unwrap());
                    std::fs::remove_file(&path).unwrap();
                }
            }
        }
    }
}
