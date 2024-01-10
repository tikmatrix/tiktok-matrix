// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};

#[tauri::command]
fn start_server() -> u32 {
    let env = std::env::var("ENV").unwrap_or_else(|_| "dev".to_string());
    if env == "dev" {
        let child = Command::new("cargo")
            .args(&["run", "-p", "rust_server"])
            .current_dir("../../")
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to start server");
        return child.id();
    } else {
        let child = Command::new("rust_server")
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to start server");
        return child.id();
    }
}

#[tauri::command]
fn stop_server(pid: u32) {
    // 使用 PID 来获取子进程
    let process = match psutil::process::Process::new(pid) {
        Ok(process) => process,
        Err(_) => return,
    };

    // 停止子进程
    process.kill().expect("failed to stop server");
}
#[tauri::command]
fn start_agent() -> u32 {
    let env = std::env::var("ENV").unwrap_or_else(|_| "dev".to_string());
    if env == "dev" {
        let child = Command::new("cargo")
            .args(&["run", "-p", "rust_agent"])
            .current_dir("../../")
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to start agent");
        return child.id();
    } else {
        let child = Command::new("rust_agent")
            .stdout(Stdio::piped())
            .spawn()
            .expect("failed to start agent");
        return child.id();
    }
}
#[tauri::command]
fn stop_agent(pid: u32) {
    // 使用 PID 来获取子进程
    let process = match psutil::process::Process::new(pid) {
        Ok(process) => process,
        Err(_) => return,
    };

    // 停止子进程
    process.kill().expect("failed to stop agent");
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_server,
            stop_server,
            start_agent,
            stop_agent
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
