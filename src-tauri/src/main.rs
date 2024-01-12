// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};
#[tauri::command]
fn start_server() -> u32 {
    let child = Command::new("bin/tiktok-server")
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed to start server");
    return child.id();
}

#[tauri::command]
fn stop_server(pid: i32) {
    let _ = Command::new("taskkill")
        .args(&["/F", "/PID", &pid.to_string()])
        .spawn();
}
#[tauri::command]
fn start_agent() -> u32 {
    let child = Command::new("bin/tiktok-agent")
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed to start agent");
    return child.id();
}
#[tauri::command]
fn stop_agent(pid: i32) {
    let _ = Command::new("taskkill")
        .args(&["/F", "/PID", &pid.to_string()])
        .spawn();
}
#[tauri::command]
fn start_adb_server() -> u32 {
    //kill adb process
    let _ = Command::new("taskkill")
        .args(&["/F", "/IM", "adb.exe"])
        .status()
        .expect("failed to kill adb processes");

    let child = Command::new("bin/platform-tools/adb")
        .args(&["-a", "nodaemon", "server", "start"])
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed to start adb server");

    return child.id();
}
#[tauri::command]
fn stop_adb_server(pid: i32) {
    let _ = Command::new("taskkill")
        .args(&["/F", "/PID", &pid.to_string()])
        .spawn();
}
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_server,
            stop_server,
            start_agent,
            stop_agent,
            start_adb_server,
            stop_adb_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
