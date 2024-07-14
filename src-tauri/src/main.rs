// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
fn setup_env() {
    if cfg!(debug_assertions) {
        std::env::set_var("RUST_BACKTRACE", "1");
    }
}

#[tauri::command]
fn start_agent() -> u32 {
    setup_env();

    let mut command = Command::new("bin/script/tiktok-agent");
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
    // Kill adb process
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command
            .args(&["/F", "/IM", "adb.exe"])
            .status()
            .expect("failed to kill adb processes");
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", "adb"])
            .status()
            .expect("failed to kill adb processes");
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
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", "tiktok-agent"])
            .status()
            .expect("failed to kill agent processes");
    }
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command
            .args(&["/F", "/IM", "script.exe"])
            .status()
            .expect("failed to kill train processes");
    }

    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("pkill");
        command
            .args(&["-f", "script"])
            .status()
            .expect("failed to kill train processes");
    }
}
//open_log_dir
#[tauri::command]
fn open_dir(name: String) {
    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new("cmd");
        #[cfg(target_os = "windows")]
        command.creation_flags(0x08000000);
        command
            .args(&["/C", "start", &name])
            .status()
            .expect("failed to open log dir");
    }
    #[cfg(target_os = "macos")]
    {
        let mut command = Command::new("open");
        command
            .args(&[&name])
            .status()
            .expect("failed to open log dir");
    }
}

fn main() -> std::io::Result<()> {
    std::fs::create_dir_all("./logs")?;
    std::fs::create_dir_all("./tmp")?;
    std::fs::create_dir_all("./data")?;
    std::fs::create_dir_all("./upload")?;
    std::fs::create_dir_all("./download")?;
    std::fs::create_dir_all("./upload/material")?;
    std::fs::create_dir_all("./upload/avatar")?;
    std::fs::create_dir_all("./upload/apk")?;
    stop_agent();
    start_agent();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_agent, stop_agent, open_dir])
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
