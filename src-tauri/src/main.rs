// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::{
    cmp::min,
    fs::File,
    io::{self, BufReader, Write},
    path::Path,
    process::{Command, Stdio},
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
fn setup_env(working_dir: &str) {
    std::env::set_var("TAURI_APP_WORK_DIR", working_dir);
    if cfg!(debug_assertions) {
        std::env::set_var("RUST_BACKTRACE", "1");
    }
}
#[tauri::command]
async fn download_file(
    url: String,
    path: String,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let client = Client::new();
    let res = client
        .get(&url)
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

    let mut file = File::create(&path).or(Err(format!("创建 `{}` 文件失败", &path)))?;
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
fn grant_adb_permission(app: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    {
        let work_dir = app.path_resolver().app_data_dir().unwrap();
        let work_dir = work_dir.to_str().unwrap();
        //chmod +x
        let mut command = Command::new("chmod");
        command
            .args(&["+x", &format!("{}/{}", work_dir, "platform-tools/adb")])
            .status()
            .expect("failed to chmod");
    }
}
#[tauri::command]
fn grant_script_permission(app: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    {
        let work_dir = app.path_resolver().app_data_dir().unwrap();
        let work_dir = work_dir.to_str().unwrap();
        //chmod +x
        let mut command = Command::new("chmod");
        command
            .args(&["+x", &format!("{}/{}", work_dir, "bin/script")])
            .status()
            .expect("failed to chmod");
    }
}
#[tauri::command]
fn grant_agent_permission(app: tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    {
        let work_dir = app.path_resolver().app_data_dir().unwrap();
        let work_dir = work_dir.to_str().unwrap();
        //chmod +x
        let mut command = Command::new("chmod");
        command
            .args(&["+x", &format!("{}/{}", work_dir, "bin/tiktok-agent")])
            .status()
            .expect("failed to chmod");
    }
}
#[tauri::command]
fn start_agent(app: tauri::AppHandle) -> u32 {
    //check bin/tiktok-agent exist
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let work_dir = work_dir.to_str().unwrap();
    let bin_path = format!("{}/{}", work_dir, "bin/tiktok-agent");

    let mut command = Command::new(bin_path);
    if !cfg!(debug_assertions) {
        #[cfg(target_os = "windows")]
        command.creation_flags(0x08000000);
    }
    match command.stdout(Stdio::piped()).spawn() {
        Ok(child) => {
            log::info!("start tiktok-agent success");
            child.id()
        }
        Err(e) => {
            log::error!("start tiktok-agent failed: {}", e);
            0
        }
    }
}
#[tauri::command]
fn stop_agent() {
    // Kill adb process
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command
            .args(&["/F", "/IM", "adb.exe"])
            .status()
            .expect("failed to kill adb processes");
        log::info!("stop adb success");
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", "adb"])
            .status()
            .expect("failed to kill adb processes");
        log::info!("stop adb success");
    }

    // Kill tiktok-agent process
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command
            .args(&["/F", "/IM", "tiktok-agent.exe"])
            .status()
            .expect("failed to kill agent processes");
        log::info!("stop tiktok-agent success");
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", "tiktok-agent"])
            .status()
            .expect("failed to kill agent processes");
        log::info!("stop tiktok-agent success");
    }
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command
            .args(&["/F", "/IM", "script.exe"])
            .status()
            .expect("failed to kill script processes");

        log::info!("stop script success");
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", "script"])
            .status()
            .expect("failed to kill script processes");

        log::info!("stop script success");
    }
}
//open_log_dir
#[tauri::command]
fn open_dir(name: String, app: tauri::AppHandle) {
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("cmd");
        #[cfg(target_os = "windows")]
        command.creation_flags(0x08000000);
        command
            .args(&[
                "/C",
                "start",
                format!(
                    "{}/{}",
                    app.path_resolver()
                        .app_data_dir()
                        .unwrap()
                        .to_str()
                        .unwrap(),
                    name
                )
                .as_str(),
            ])
            .status()
            .expect("failed to open log dir");
    }
    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("open");
        command
            .args(&[format!(
                "{}/{}",
                app.path_resolver()
                    .app_data_dir()
                    .unwrap()
                    .to_str()
                    .unwrap(),
                name
            )
            .as_str()])
            .status()
            .expect("failed to open log dir");
    }
}

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            grant_adb_permission,
            grant_script_permission,
            grant_agent_permission,
            start_agent,
            stop_agent,
            open_dir,
            download_file,
            unzip_file
        ])
        .setup(|app| {
            let work_dir = app.path_resolver().app_data_dir().unwrap();
            let work_dir = work_dir.to_str().unwrap();
            setup_env(work_dir);
            init_log::init(work_dir);
            log::info!("work_dir: {}", work_dir);
            std::fs::create_dir_all(format!("{}/{}", work_dir, "bin"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "logs"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "tmp"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "data"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "download"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload/material"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload/avatar"))?;
            std::fs::create_dir_all(format!("{}/{}", work_dir, "upload/apk"))?;
            std::fs::write(format!("{}/port.txt", work_dir), "8090")?;
            std::fs::write(format!("{}/wsport.txt", work_dir), "8092")?;

            //迁移数据
            #[cfg(target_os = "windows")]
            if Path::new("data").exists() {
                if Path::new("data/settings.db").exists() {
                    std::fs::copy(
                        "data/settings.db",
                        format!("{}/{}", work_dir, "data/settings.db"),
                    )?;
                    std::fs::rename("data/settings.db", "data/settings.db.bak")?;
                }
                if Path::new("data/tiktok.db").exists() {
                    std::fs::copy(
                        "data/tiktok.db",
                        format!("{}/{}", work_dir, "data/tiktok.db"),
                    )?;
                    std::fs::rename("data/tiktok.db", "data/tiktok.db.bak")?;
                }
                if Path::new("data/tiktok.db-shm").exists() {
                    std::fs::copy(
                        "data/tiktok.db-shm",
                        format!("{}/{}", work_dir, "data/tiktok.db-shm"),
                    )?;
                    std::fs::rename("data/tiktok.db-shm", "data/tiktok.db-shm.bak")?;
                }
                if Path::new("data/tiktok.db-wal").exists() {
                    std::fs::copy(
                        "data/tiktok.db-wal",
                        format!("{}/{}", work_dir, "data/tiktok.db-wal"),
                    )?;
                    std::fs::rename("data/tiktok.db-wal", "data/tiktok.db-wal.bak")?;
                }
            }
            stop_agent();
            start_agent(app.app_handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
