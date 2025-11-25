// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::{fs, net::TcpListener, process::Command};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

use tauri::Manager;

mod auto_update_manager;
mod file_utils;
mod http_client;
mod init_log;
mod process_manager;
mod proxy_config;
mod storage;
mod update_manager;

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

    // Log proxy configuration for debugging
    proxy_config::log_proxy_config();
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

// ============ Update Manager Commands ============

/// Check libraries update from remote server
#[tauri::command]
async fn check_libs_update(
    app_handle: tauri::AppHandle,
    check_libs_url: String,
    platform: String,
    app_name: String,
) -> Result<update_manager::CheckLibsResponse, String> {
    update_manager::check_libs_update(&app_handle, &check_libs_url, &platform, &app_name).await
}

/// Get local library version
#[tauri::command]
fn get_local_lib_version(app_handle: tauri::AppHandle, lib_name: String) -> String {
    update_manager::get_local_lib_version(&app_handle, &lib_name)
}

/// Process single library update (download + install)
#[tauri::command]
async fn process_lib_update(
    app_handle: tauri::AppHandle,
    lib: update_manager::LibInfo,
) -> Result<bool, String> {
    update_manager::process_lib_update(&app_handle, &lib).await
}

/// Batch process multiple libraries update
#[tauri::command]
async fn batch_update_libs(
    app_handle: tauri::AppHandle,
    libs: Vec<update_manager::LibInfo>,
) -> Result<Vec<String>, String> {
    let mut updated_libs = Vec::new();

    for lib in libs {
        match update_manager::process_lib_update(&app_handle, &lib).await {
            Ok(true) => {
                log::info!("Library {} updated successfully", lib.name);
                updated_libs.push(lib.name.clone());
            }
            Ok(false) => {
                log::info!("Library {} is up to date", lib.name);
            }
            Err(e) => {
                log::error!("Failed to update library {}: {}", lib.name, e);
                let error_status = update_manager::UpdateStatus {
                    status: "error".to_string(),
                    message: format!("Failed to update {}: {}", lib.name, e),
                    lib_name: Some(lib.name.clone()),
                };
                error_status.emit(&app_handle);
                return Err(format!("Failed to update {}: {}", lib.name, e));
            }
        }
    }

    // Emit completion status
    let complete_status = update_manager::UpdateStatus {
        status: "completed".to_string(),
        message: "All libraries update completed".to_string(),
        lib_name: None,
    };
    complete_status.emit(&app_handle);

    Ok(updated_libs)
}

/// Check for Tauri application updates
#[tauri::command]
async fn check_tauri_update(
    app_handle: tauri::AppHandle,
) -> Result<update_manager::TauriUpdateInfo, String> {
    update_manager::check_tauri_update(&app_handle).await
}

/// Install Tauri application update and relaunch
#[tauri::command]
async fn install_and_relaunch_update(app_handle: tauri::AppHandle) -> Result<(), String> {
    update_manager::install_and_relaunch_update(&app_handle).await
}

// ============ Auto Update Manager Commands ============

/// Update user activity timestamp
#[tauri::command]
fn update_user_activity() {
    auto_update_manager::update_user_activity();
}

/// Start auto-update timer
#[tauri::command]
async fn start_auto_update_timer(
    app_handle: tauri::AppHandle,
    config: auto_update_manager::AutoUpdateConfig,
) -> Result<(), String> {
    auto_update_manager::start_auto_update_timer(app_handle, config).await
}

/// Stop auto-update timer
#[tauri::command]
fn stop_auto_update_timer() -> Result<(), String> {
    auto_update_manager::stop_auto_update_timer()
}

/// Get auto-update state info
#[tauri::command]
fn get_auto_update_state() -> auto_update_manager::AutoUpdateStateInfo {
    auto_update_manager::get_auto_update_state()
}

fn main() -> std::io::Result<()> {
    tauri::Builder::default()
        .on_window_event(|event| {
            // Handle window close/destroy events to shutdown agent processes
            match event.event() {
                tauri::WindowEvent::CloseRequested { .. } => {
                    // Don't prevent close, but shutdown processes before closing
                    log::info!("Window close requested, shutting down agent processes...");
                    process_manager::shutdown_processes(&event.window().app_handle());
                }
                tauri::WindowEvent::Destroyed => {
                    // Also handle destroy event as a fallback
                    log::info!("Window destroyed, ensuring agent processes are shutdown...");
                    process_manager::shutdown_processes(&event.window().app_handle());
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_distributor_code,
            file_utils::grant_permission,
            kill_process,
            file_utils::open_dir,
            file_utils::download_file,
            file_utils::download_file_with_version,
            file_utils::unzip_file,
            is_agent_running,
            set_env,
            get_env,
            http_client::http_request,
            http_client::agent_request,
            storage::get_storage_item,
            storage::set_storage_item,
            storage::remove_storage_item,
            storage::clear_storage,
            storage::get_all_storage_keys,
            storage::get_storage_snapshot,
            storage::read_settings_file_generic,
            storage::write_settings_file_generic,
            storage::read_settings_file,
            storage::write_settings_file,
            storage::read_post_settings_file,
            storage::write_post_settings_file,
            file_utils::open_adb_terminal,
            check_libs_update,
            get_local_lib_version,
            process_lib_update,
            batch_update_libs,
            check_tauri_update,
            install_and_relaunch_update,
            update_user_activity,
            start_auto_update_timer,
            stop_auto_update_timer,
            get_auto_update_state,
            process_manager::check_agent_status,
            process_manager::start_agent,
            process_manager::wait_for_agent_ready,
            process_manager::shutdown_agent,
            process_manager::initialize_app
        ])
        .setup(|app| {
            let app_data_dir = app.path_resolver().app_data_dir().unwrap();
            let work_dir = app_data_dir.to_str().unwrap();
            log::info!("work_dir: {}", work_dir);
            init_log::init(work_dir);
            let version = app.package_info().version.clone();
            let version_str = version.to_string();
            setup_env(work_dir, version_str);

            // 读取并记录分发商代码
            let app_handle = app.handle();
            match get_distributor_code(app_handle) {
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
            file_utils::delete_logs_older_than_3_days(work_dir);

            std::fs::write(format!("{}/port.txt", work_dir), "0")?;
            std::fs::write(format!("{}/wsport.txt", work_dir), "0")?;
            std::fs::write(format!("{}/wssport.txt", work_dir), "0")?;
            Ok(())
        })
        .on_page_load(|_window, _payload| {
            log::info!("[TikMatrix] page load triggered");
        })
        //listen to the tauri update event
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
