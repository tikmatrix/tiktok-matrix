// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};

use pickledb::{PickleDb, PickleDbDumpPolicy, SerializationMethod};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
#[derive(serde::Serialize)]
struct Settings {
    server_url: String,
    version: String,
}
fn setup_env() {
    let settings = get_settings().unwrap();
    std::env::set_var("SERVER_URL", &settings.server_url);
    std::env::set_var("VERSION", &settings.version);

    if cfg!(debug_assertions) {
        std::env::set_var("RUST_BACKTRACE", "1");
    }
}
fn get_db() -> PickleDb {
    PickleDb::load(
        "data/settings.db",
        PickleDbDumpPolicy::AutoDump,
        SerializationMethod::Json,
    )
    .unwrap_or_else(|_| {
        PickleDb::new(
            "data/settings.db",
            PickleDbDumpPolicy::AutoDump,
            SerializationMethod::Json,
        )
    })
}
#[tauri::command]
fn get_settings() -> Result<Settings, String> {
    let db = get_db();

    let local_ip = local_ip_address::local_ip().unwrap();
    let mut port = 8090;
    if cfg!(debug_assertions) {
        port = 18090;
    }
    let mut server_url = db
        .get::<String>("server_url")
        .unwrap_or_else(|| format!("http://{}:{}", local_ip, port));

    if server_url.is_empty() {
        server_url = format!("http://{}:{}", local_ip, port);
    }
    let version = db
        .get::<String>("version")
        .unwrap_or_else(|| "0.0.0".to_string());
    return Ok(Settings {
        server_url,
        version,
    });
}
#[tauri::command]
fn set_settings(server_url: Option<String>, version: Option<String>) {
    let mut db = get_db();

    if let Some(url) = server_url {
        db.set("server_url", &url).unwrap();
    }

    if let Some(version) = version {
        db.set("version", &version).unwrap();
    }
}

#[tauri::command]
fn start_agent() -> u32 {
    setup_env();
    //start scrcpy-agent
    let mut command = Command::new("bin/scrcpy-agent");
    if !cfg!(debug_assertions) {
        #[cfg(target_os = "windows")]
        command.creation_flags(0x08000000);
    }
    command
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed to start agent");
    let mut command = Command::new("bin/tiktok-agent");
    if !cfg!(debug_assertions) {
        #[cfg(target_os = "windows")]
        command.creation_flags(0x08000000);
    }
    let child = command
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed to start agent");
    child.id()
}
#[tauri::command]
fn stop_agent() {
    //kill adb process
    let mut command = Command::new("taskkill");
    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);
    command
        .args(&["/F", "/IM", "adb.exe"])
        .status()
        .expect("failed to kill adb processes");

    //kill tiktok-agent process
    let mut command = Command::new("taskkill");
    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);
    command
        .args(&["/F", "/IM", "tiktok-agent.exe"])
        .status()
        .expect("failed to kill agent processes");
    //kill scrcpy-agent process
    let mut command = Command::new("taskkill");
    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);
    command
        .args(&["/F", "/IM", "scrcpy-agent.exe"])
        .status()
        .expect("failed to kill agent processes");
}
//open_log_dir
#[tauri::command]
fn open_log_dir() {
    let mut command = Command::new("cmd");
    #[cfg(target_os = "windows")]
    command.creation_flags(0x08000000);
    command
        .args(&["/C", "start", "logs"])
        .status()
        .expect("failed to open log dir");
}

fn main() -> std::io::Result<()> {
    std::fs::create_dir_all("./logs")?;
    std::fs::create_dir_all("./tmp")?;
    std::fs::create_dir_all("./data")?;
    std::fs::create_dir_all("./upload")?;
    std::fs::create_dir_all("./upload/material")?;
    std::fs::create_dir_all("./upload/avatar")?;
    std::fs::create_dir_all("./upload/apk")?;
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_agent,
            stop_agent,
            get_settings,
            set_settings,
            open_log_dir
        ])
        .setup(|app| {
            let version = app.package_info().version.to_string();
            set_settings(None, Some(version));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
