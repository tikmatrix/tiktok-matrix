// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};

use pickledb::{PickleDb, PickleDbDumpPolicy, SerializationMethod};
use tauri::{CustomMenuItem, Manager, Menu};
mod ws;

#[derive(serde::Serialize)]
struct Settings {
    server_url: String,
    version: String,
}
fn setup_env() {
    let settings = get_settings().unwrap();
    std::env::set_var("SERVER_URL", &settings.server_url);
    std::env::set_var("VERSION", &settings.version);

    // if cfg!(debug_assertions) {
    //     std::env::set_var("RUST_BACKTRACE", "1");
    // }
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

    let mut server_url = db
        .get::<String>("server_url")
        .unwrap_or_else(|| format!("http://{}:8090", local_ip));

    if server_url.is_empty() {
        server_url = format!("http://{}:8090", local_ip);
    }
    println!("server_url: {}", server_url);
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

//check license
#[tauri::command]
fn start_server() -> u32 {
    setup_env();

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
    setup_env();
    let child = Command::new("bin/tiktok-agent")
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed to start agent");
    return child.id();
}
#[tauri::command]
fn stop_agent(pid: i32) {
    //kill adb process
    let _ = Command::new("taskkill")
        .args(&["/F", "/IM", "adb.exe"])
        .status()
        .expect("failed to kill adb processes");
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
fn main() -> std::io::Result<()> {
    std::fs::create_dir_all("./tmp")?;
    std::fs::create_dir_all("./data")?;
    std::fs::create_dir_all("./upload")?;
    std::fs::create_dir_all("./upload/material")?;
    std::fs::create_dir_all("./upload/apk")?;
    let menu = Menu::new().add_item(CustomMenuItem::new("github", "GitHub"));
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_server,
            stop_server,
            start_agent,
            stop_agent,
            start_adb_server,
            stop_adb_server,
            get_settings,
            set_settings,
        ])
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            main_window.on_menu_event(move |event| match event.menu_item_id() {
                "github" => {
                    if let Err(err) = webbrowser::open("https://github.com/niostack/tiktok-matrix")
                    {
                        eprintln!("Failed to open web page: {}", err);
                    }
                }

                _ => {}
            });
            let version = app.package_info().version.to_string();
            set_settings(None, Some(version));
            tauri::async_runtime::spawn(async move {
                std::env::set_var("http_proxy", "");
                let _ = Command::new("taskkill")
                    .args(&["/F", "/IM", "adb.exe"])
                    .status()
                    .expect("failed to kill adb processes");
                //sleep 3 s
                std::thread::sleep(std::time::Duration::from_secs(3));
                ws::start_server(8092).await.unwrap();
            });
            Ok(())
        })
        .menu(menu)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
