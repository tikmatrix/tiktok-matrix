// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::{Command, Stdio};

use pickledb::{PickleDb, PickleDbDumpPolicy, SerializationMethod};
use serde::{Deserialize, Serialize};
mod request_util;
mod ws;

#[derive(serde::Serialize)]
struct Settings {
    proxy_url: String,
    server_url: String,
    country: String,
    wifi_name: String,
    wifi_password: String,
    version: String,
    license: String,
}
fn setup_env() {
    let settings = get_settings().unwrap();
    std::env::set_var("PROXY_URL", &settings.proxy_url);
    std::env::set_var("SERVER_URL", &settings.server_url);
    std::env::set_var("COUNTRY", &settings.country);
    std::env::set_var("WIFI_NAME", &settings.wifi_name);
    std::env::set_var("WIFI_PASSWORD", &settings.wifi_password);
    std::env::set_var("VERSION", &settings.version);
    std::env::set_var("LICENSE", &settings.license);

    // if cfg!(debug_assertions) {
    //     std::env::set_var("RUST_BACKTRACE", "1");
    // }
}
#[tauri::command]
fn get_settings() -> Result<Settings, String> {
    let db = PickleDb::load(
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
    });

    let local_ip = local_ip_address::local_ip().unwrap();
    let proxy_url = db
        .get::<String>("proxy_url")
        .unwrap_or_else(|| format!("{}:7890", local_ip));
    let server_url = db
        .get::<String>("server_url")
        .unwrap_or_else(|| format!("http://{}:8090", local_ip));
    let country = db
        .get::<String>("country")
        .unwrap_or_else(|| "UK".to_string());
    let wifi_name = db
        .get::<String>("wifi_name")
        .unwrap_or_else(|| "ChinaNet-LVBC".to_string());
    let wifi_password = db
        .get::<String>("wifi_password")
        .unwrap_or_else(|| "5bvwmej4".to_string());
    let version = db
        .get::<String>("version")
        .unwrap_or_else(|| "0.0.0".to_string());
    let license = db
        .get::<String>("license")
        .unwrap_or_else(|| "".to_string());
    return Ok(Settings {
        proxy_url,
        server_url,
        country,
        wifi_name,
        wifi_password,
        version,
        license,
    });
}
#[tauri::command]
fn set_settings(
    proxy_url: Option<String>,
    server_url: Option<String>,
    country: Option<String>,
    wifi_name: Option<String>,
    wifi_password: Option<String>,
    version: Option<String>,
) {
    let mut db = PickleDb::new(
        "data/settings.db",
        PickleDbDumpPolicy::AutoDump,
        SerializationMethod::Json,
    );
    if let Some(url) = proxy_url {
        db.set("proxy_url", &url).unwrap();
    }
    if let Some(url) = server_url {
        db.set("server_url", &url).unwrap();
    }
    if let Some(country) = country {
        db.set("country", &country).unwrap();
    }
    if let Some(wifi_name) = wifi_name {
        db.set("wifi_name", &wifi_name).unwrap();
    }
    if let Some(wifi_password) = wifi_password {
        db.set("wifi_password", &wifi_password).unwrap();
    }
    if let Some(version) = version {
        db.set("version", &version).unwrap();
    }
}
#[tauri::command]
fn add_license(key: String) -> VerifyLicenseResponse {
    let uid: String = machine_uid::get().unwrap();
    let result: VerifyLicenseResponse = VerifyLicenseResponse {
        uid: uid.clone(),
        key: "".to_string(),
        status: "unlicensed".to_string(),
        name: None,
        limit: None,
        left_days: None,
    };
    let license = request_util::get_json::<VerifyLicenseResponse>(&format!(
        "/api/license/verify?uid={}&key={}",
        uid, key
    ));
    if let Ok(license) = license {
        let mut db = PickleDb::new(
            "data/settings.db",
            PickleDbDumpPolicy::AutoDump,
            SerializationMethod::Json,
        );
        db.set("license", &key).unwrap();
        return license;
    }
    return result;
}
#[derive(Debug, Deserialize, Serialize, Clone)]
struct VerifyLicenseResponse {
    pub uid: String,
    pub key: String,
    pub status: String,
    pub name: Option<String>,
    pub limit: Option<i32>,
    pub left_days: Option<i32>,
}
#[tauri::command]
fn get_license() -> VerifyLicenseResponse {
    let uid: String = machine_uid::get().unwrap();
    let result: VerifyLicenseResponse = VerifyLicenseResponse {
        uid: uid.clone(),
        key: "".to_string(),
        status: "unlicensed".to_string(),
        name: None,
        limit: None,
        left_days: None,
    };
    let db = PickleDb::load(
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
    });
    let key = db.get::<String>("license");
    if key.is_none() {
        return result;
    }
    let key = key.unwrap();
    let license = request_util::get_json::<VerifyLicenseResponse>(&format!(
        "/api/license/verify?uid={}&key={}",
        uid, key
    ));
    if let Ok(license) = license {
        return license;
    }
    return result;
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
            add_license,
            get_license
        ])
        .setup(|app| {
            let version = app.package_info().version.to_string();
            set_settings(None, None, None, None, None, Some(version));
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
