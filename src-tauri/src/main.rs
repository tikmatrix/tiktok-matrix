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
mod auto_update_manager;
mod init_log;
mod process_manager;
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

    // Log proxy configuration for debugging
    log_proxy_config();
}

/// Log system proxy configuration if set
fn log_proxy_config() {
    // Try to detect system proxy first (Windows/macOS specific)
    if let Some(system_proxy) = detect_system_proxy() {
        log::info!("🌐 System proxy detected: {}", system_proxy);
    }

    // Check environment variables
    let env_proxy = detect_env_proxy();
    if let Some(proxy_info) = env_proxy {
        log::info!("🌐 Environment proxy configured: {}", proxy_info);
    }

    // Check NO_PROXY
    if let Ok(no_proxy) = std::env::var("NO_PROXY").or_else(|_| std::env::var("no_proxy")) {
        if !no_proxy.trim().is_empty() {
            log::info!("🌐 NO_PROXY configured: {}", no_proxy);
        }
    }

    // If nothing is detected, log that
    if detect_system_proxy().is_none() && detect_env_proxy().is_none() {
        log::info!("No proxy configuration detected");
    }
}

/// Detect system proxy settings (Windows registry or macOS scutil)
fn detect_system_proxy() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        detect_windows_proxy_settings()
    }

    #[cfg(target_os = "macos")]
    {
        detect_macos_proxy_settings()
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        None
    }
}

/// Detect proxy from environment variables
fn detect_env_proxy() -> Option<String> {
    const PROXY_VARS: [&str; 6] = [
        "HTTPS_PROXY",
        "https_proxy",
        "HTTP_PROXY",
        "http_proxy",
        "ALL_PROXY",
        "all_proxy",
    ];

    let mut found_proxies = Vec::new();
    for key in PROXY_VARS.iter() {
        if let Ok(value) = std::env::var(key) {
            let trimmed = value.trim();
            if !trimmed.is_empty() {
                found_proxies.push(format!("{}={}", key, trimmed));
            }
        }
    }

    if found_proxies.is_empty() {
        None
    } else {
        Some(found_proxies.join(", "))
    }
}

#[cfg(target_os = "windows")]
fn detect_windows_proxy_settings() -> Option<String> {
    use winreg::{enums::HKEY_CURRENT_USER, RegKey};

    // Try to read from Windows registry first
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if let Ok(settings) =
        hkcu.open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings")
    {
        // Check if proxy is enabled
        if let Ok(proxy_enable) = settings.get_value::<u32, _>("ProxyEnable") {
            if proxy_enable != 0 {
                if let Ok(server) = settings.get_value::<String, _>("ProxyServer") {
                    let trimmed = server.trim();
                    if !trimmed.is_empty() {
                        return Some(format!("Registry: {}", trimmed));
                    }
                }
            }
        }

        // Check for auto-config URL (PAC)
        if let Ok(auto_config) = settings.get_value::<String, _>("AutoConfigURL") {
            let trimmed = auto_config.trim();
            if !trimmed.is_empty() {
                return Some(format!("PAC: {}", trimmed));
            }
        }
    }

    // Fallback to netsh command
    if let Ok(output) = Command::new("netsh")
        .args(&["winhttp", "show", "proxy"])
        .creation_flags(0x08000000) // CREATE_NO_WINDOW
        .output()
    {
        if output.status.success() {
            let text = String::from_utf8_lossy(&output.stdout);
            // Skip "Direct access" messages
            if !text.contains("Direct access") && !text.contains("直接访问") {
                for line in text.lines() {
                    let trimmed = line.trim();
                    // Look for proxy server line
                    if trimmed.starts_with("Proxy Server") || trimmed.starts_with("代理服务器")
                    {
                        if let Some(colon_pos) = trimmed.find(':') {
                            let proxy_value = trimmed[colon_pos + 1..].trim();
                            if !proxy_value.is_empty() && proxy_value != "(none)" {
                                return Some(format!("WinHTTP: {}", proxy_value));
                            }
                        }
                    }
                }
            }
        }
    }

    None
}

#[cfg(target_os = "macos")]
fn detect_macos_proxy_settings() -> Option<String> {
    use std::collections::HashMap;

    let output = Command::new("/usr/sbin/scutil")
        .arg("--proxy")
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut map = HashMap::new();

    // Parse scutil output
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if let Some((key, value)) = trimmed.split_once(':') {
            map.insert(key.trim().to_string(), value.trim().to_string());
        }
    }

    let mut entries = Vec::new();

    // Check HTTP proxy
    if map.get("HTTPEnable").map(|v| v == "1").unwrap_or(false) {
        if let Some(host) = map.get("HTTPProxy") {
            let host = host.trim();
            if !host.is_empty() {
                let port = map
                    .get("HTTPPort")
                    .map(|p| format!(":{}", p))
                    .unwrap_or_default();
                entries.push(format!("http://{}{}", host, port));
            }
        }
    }

    // Check HTTPS proxy
    if map.get("HTTPSEnable").map(|v| v == "1").unwrap_or(false) {
        if let Some(host) = map.get("HTTPSProxy") {
            let host = host.trim();
            if !host.is_empty() {
                let port = map
                    .get("HTTPSPort")
                    .map(|p| format!(":{}", p))
                    .unwrap_or_default();
                entries.push(format!("https://{}{}", host, port));
            }
        }
    }

    // Check SOCKS proxy
    if map.get("SOCKSEnable").map(|v| v == "1").unwrap_or(false) {
        if let Some(host) = map.get("SOCKSProxy") {
            let host = host.trim();
            if !host.is_empty() {
                let port = map
                    .get("SOCKSPort")
                    .map(|p| format!(":{}", p))
                    .unwrap_or_default();
                entries.push(format!("socks://{}{}", host, port));
            }
        }
    }

    if entries.is_empty() {
        None
    } else {
        Some(entries.join(", "))
    }
}

/// Apply proxy configuration to reqwest ClientBuilder
/// Bypasses proxy for localhost/127.0.0.1 addresses
pub fn apply_proxy_config(
    builder: reqwest::ClientBuilder,
    target_url: &str,
) -> Result<reqwest::ClientBuilder, String> {
    // Check if target is localhost - bypass proxy for local requests
    if is_localhost_url(target_url) {
        log::info!("🏠 Bypassing proxy for localhost URL: {}", target_url);
        return Ok(builder);
    }

    // Check NO_PROXY environment variable
    if should_bypass_proxy(target_url) {
        log::info!(
            "🚫 Bypassing proxy due to NO_PROXY setting for: {}",
            target_url
        );
        return Ok(builder);
    }

    // First check environment variables (highest priority)
    if let Some(env_proxy) = get_first_env_proxy() {
        log::info!("🌐 Using environment proxy: {}", env_proxy);
        let proxy = reqwest::Proxy::all(&env_proxy)
            .map_err(|e| format!("Invalid proxy URL from environment: {}", e))?;
        return Ok(builder.proxy(proxy));
    }

    // Then check system proxy
    if let Some(system_proxy_url) = get_system_proxy_url() {
        log::info!("🌐 Using system proxy: {}", system_proxy_url);
        let proxy = reqwest::Proxy::all(&system_proxy_url)
            .map_err(|e| format!("Invalid system proxy URL: {}", e))?;
        return Ok(builder.proxy(proxy));
    }

    log::info!("No proxy configured, using direct connection");
    Ok(builder)
}

/// Check if URL is localhost address
fn is_localhost_url(url: &str) -> bool {
    let lower = url.to_lowercase();
    lower.starts_with("http://localhost")
        || lower.starts_with("https://localhost")
        || lower.starts_with("http://127.0.0.1")
        || lower.starts_with("https://127.0.0.1")
        || lower.starts_with("http://[::1]")
        || lower.starts_with("https://[::1]")
}

/// Check if URL should bypass proxy based on NO_PROXY environment variable
fn should_bypass_proxy(url: &str) -> bool {
    // Get NO_PROXY variable (check both cases)
    let no_proxy = std::env::var("NO_PROXY")
        .or_else(|_| std::env::var("no_proxy"))
        .ok();

    if let Some(no_proxy) = no_proxy {
        let no_proxy = no_proxy.trim();
        if no_proxy.is_empty() {
            return false;
        }

        // Parse URL to extract host
        let host = match url::Url::parse(url) {
            Ok(parsed) => {
                if let Some(host) = parsed.host_str() {
                    host.to_lowercase()
                } else {
                    return false;
                }
            }
            Err(_) => return false,
        };

        // Check if host matches any NO_PROXY pattern
        for pattern in no_proxy.split(',') {
            let pattern = pattern.trim().to_lowercase();
            if pattern.is_empty() {
                continue;
            }

            // Exact match
            if host == pattern {
                return true;
            }

            // Domain suffix match (e.g., .example.com)
            if pattern.starts_with('.') && host.ends_with(&pattern) {
                return true;
            }

            // Wildcard match (e.g., *.example.com)
            if pattern.starts_with('*') {
                let suffix = &pattern[1..];
                if host.ends_with(suffix) {
                    return true;
                }
            }
        }
    }

    false
}

/// Get first available proxy URL from environment variables
fn get_first_env_proxy() -> Option<String> {
    const PROXY_VARS: [&str; 6] = [
        "HTTPS_PROXY",
        "https_proxy",
        "HTTP_PROXY",
        "http_proxy",
        "ALL_PROXY",
        "all_proxy",
    ];

    for key in PROXY_VARS.iter() {
        if let Ok(value) = std::env::var(key) {
            let trimmed = value.trim();
            if !trimmed.is_empty() {
                return Some(trimmed.to_string());
            }
        }
    }
    None
}

/// Get system proxy URL (Windows/macOS)
fn get_system_proxy_url() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        get_windows_proxy_url()
    }

    #[cfg(target_os = "macos")]
    {
        get_macos_proxy_url()
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        None
    }
}

#[cfg(target_os = "windows")]
fn get_windows_proxy_url() -> Option<String> {
    use winreg::{enums::HKEY_CURRENT_USER, RegKey};

    // Try registry first
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    if let Ok(settings) =
        hkcu.open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings")
    {
        if let Ok(proxy_enable) = settings.get_value::<u32, _>("ProxyEnable") {
            if proxy_enable != 0 {
                if let Ok(server) = settings.get_value::<String, _>("ProxyServer") {
                    let trimmed = server.trim();
                    if !trimmed.is_empty() {
                        // If server doesn't have protocol, add http://
                        return Some(
                            if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
                                trimmed.to_string()
                            } else {
                                format!("http://{}", trimmed)
                            },
                        );
                    }
                }
            }
        }
    }

    None
}

#[cfg(target_os = "macos")]
fn get_macos_proxy_url() -> Option<String> {
    use std::collections::HashMap;

    let output = Command::new("/usr/sbin/scutil")
        .arg("--proxy")
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut map = HashMap::new();

    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        if let Some((key, value)) = trimmed.split_once(':') {
            map.insert(key.trim().to_string(), value.trim().to_string());
        }
    }

    // Prefer HTTPS proxy
    if map.get("HTTPSEnable").map(|v| v == "1").unwrap_or(false) {
        if let Some(host) = map.get("HTTPSProxy") {
            let host = host.trim();
            if !host.is_empty() {
                let port = map.get("HTTPSPort").and_then(|p| {
                    let trimmed = p.trim();
                    if trimmed.is_empty() {
                        None
                    } else {
                        Some(trimmed)
                    }
                });
                return Some(if let Some(port) = port {
                    format!("https://{}:{}", host, port)
                } else {
                    format!("https://{}", host)
                });
            }
        }
    }

    // Fallback to HTTP proxy
    if map.get("HTTPEnable").map(|v| v == "1").unwrap_or(false) {
        if let Some(host) = map.get("HTTPProxy") {
            let host = host.trim();
            if !host.is_empty() {
                let port = map.get("HTTPPort").and_then(|p| {
                    let trimmed = p.trim();
                    if trimmed.is_empty() {
                        None
                    } else {
                        Some(trimmed)
                    }
                });
                return Some(if let Some(port) = port {
                    format!("http://{}:{}", host, port)
                } else {
                    format!("http://{}", host)
                });
            }
        }
    }

    None
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

/// Generic HTTP request handler with intelligent proxy selection
#[tauri::command]
async fn http_request(
    method: String,
    url: String,
    headers: Option<std::collections::HashMap<String, String>>,
    body: Option<String>,
    timeout: Option<u64>,
) -> Result<HttpResponse, String> {
    log::info!("HTTP request: {} {}", method, url);

    // Create client with timeout
    let timeout_duration = std::time::Duration::from_secs(timeout.unwrap_or(30));
    let mut client_builder = Client::builder()
        .connect_timeout(std::time::Duration::from_secs(10))
        .timeout(timeout_duration);

    // Apply intelligent proxy configuration (bypasses localhost automatically)
    client_builder = apply_proxy_config(client_builder, &url)?;

    let client = client_builder
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Build request
    let mut request = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        "HEAD" => client.head(&url),
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    // Add headers
    if let Some(headers_map) = headers {
        for (key, value) in headers_map {
            request = request.header(&key, &value);
        }
    }

    // Add body for POST/PUT/PATCH
    if let Some(body_content) = body {
        request = request.body(body_content);
    }

    // Send request
    let response = request
        .send()
        .await
        .map_err(|e| format!("Request failed: {}", e))?;

    // Extract response details
    let status = response.status().as_u16();
    let mut response_headers = std::collections::HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(value_str) = value.to_str() {
            response_headers.insert(key.to_string(), value_str.to_string());
        }
    }

    // Get response body as text
    let body_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;

    Ok(HttpResponse {
        status,
        headers: response_headers,
        body: body_text,
    })
}

#[derive(Serialize, Deserialize, Debug)]
pub struct HttpResponse {
    pub status: u16,
    pub headers: std::collections::HashMap<String, String>,
    pub body: String,
}

/// Agent request handler - automatically reads port and handles localhost agent requests
#[tauri::command]
async fn agent_request(
    app_handle: tauri::AppHandle,
    method: String,
    url: String,
    params: Option<std::collections::HashMap<String, serde_json::Value>>,
    headers: Option<std::collections::HashMap<String, String>>,
    body: Option<String>,
    form: Option<std::collections::HashMap<String, String>>,
    data: Option<serde_json::Value>,
    timeout: Option<u64>,
    raw_response: bool,
) -> Result<serde_json::Value, String> {
    // Read agent port from file
    let app_data_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let port_file = app_data_dir.join("port.txt");

    let port = match fs::read_to_string(&port_file) {
        Ok(content) => {
            let trimmed = content.trim();
            if trimmed == "0" {
                log::info!("Agent port is 0, agent not ready yet");
                return Ok(serde_json::json!({ "code": 0, "data": [] }));
            }
            trimmed.to_string()
        }
        Err(_) => {
            log::warn!("Failed to read agent port, using default 50809");
            "50809".to_string()
        }
    };

    // Build query string from params
    let query_string = if let Some(params_map) = params {
        let mut query_parts = Vec::new();
        for (key, value) in params_map {
            // Handle different JSON value types
            match value {
                serde_json::Value::Null => continue,
                serde_json::Value::Array(arr) => {
                    for item in arr {
                        if !item.is_null() {
                            let value_str = match item {
                                serde_json::Value::String(s) => s,
                                _ => item.to_string().trim_matches('"').to_string(),
                            };
                            query_parts.push(format!(
                                "{}={}",
                                urlencoding::encode(&key),
                                urlencoding::encode(&value_str)
                            ));
                        }
                    }
                }
                _ => {
                    let value_str = match value {
                        serde_json::Value::String(s) => s,
                        _ => value.to_string().trim_matches('"').to_string(),
                    };
                    query_parts.push(format!(
                        "{}={}",
                        urlencoding::encode(&key),
                        urlencoding::encode(&value_str)
                    ));
                }
            }
        }
        if query_parts.is_empty() {
            String::new()
        } else {
            format!("?{}", query_parts.join("&"))
        }
    } else {
        String::new()
    };

    let query_url = format!("http://localhost:{}{}{}", port, url, query_string);
    log::info!("Agent request: {} {}", method, query_url);

    // Prepare headers
    let mut final_headers = headers.unwrap_or_default();

    // Handle body content
    let body_string = if let Some(body_content) = body {
        Some(body_content)
    } else if let Some(form_data) = form {
        // Form data - convert to URL encoded string
        final_headers.insert(
            "Content-Type".to_string(),
            "application/x-www-form-urlencoded".to_string(),
        );
        let form_parts: Vec<String> = form_data
            .iter()
            .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
            .collect();
        Some(form_parts.join("&"))
    } else if let Some(json_data) = data {
        // JSON data
        if !final_headers.contains_key("Content-Type")
            && !final_headers.contains_key("content-type")
        {
            final_headers.insert("Content-Type".to_string(), "application/json".to_string());
        }
        Some(json_data.to_string())
    } else {
        None
    };

    // Make HTTP request using the generic http_request
    let response = http_request(
        method,
        query_url.clone(),
        Some(final_headers),
        body_string,
        timeout,
    )
    .await?;

    // Handle error responses with notification
    if response.status >= 400 {
        let error_message = format!(
            "url: {}, code: {}, message: {}",
            query_url, response.status, response.body
        );

        // Emit error notification
        app_handle
            .emit_all(
                "NOTIFY",
                serde_json::json!({
                    "type": "error",
                    "message": error_message,
                    "timeout": 2000
                }),
            )
            .ok();

        if raw_response {
            return Ok(serde_json::json!(response));
        }

        // Try to parse error body as JSON
        let error_data = serde_json::from_str::<serde_json::Value>(&response.body)
            .unwrap_or_else(|_| serde_json::Value::String(response.body.clone()));

        return Ok(serde_json::json!({
            "code": response.status,
            "data": error_data,
            "error": error_data
        }));
    }

    // Return raw response if requested
    if raw_response {
        return Ok(serde_json::json!(response));
    }

    // Parse JSON response
    match serde_json::from_str::<serde_json::Value>(&response.body) {
        Ok(json) => Ok(json),
        Err(_) => Ok(serde_json::Value::String(response.body)),
    }
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
    // Build request URL with version or timestamp parameter first
    let request_url = if let Some(v) = version {
        if url.contains('?') {
            format!("{}&v={}", url, v)
        } else {
            format!("{}?v={}", url, v)
        }
    } else {
        // Fallback to timestamp for cache busting
        if url.contains('?') {
            format!("{}&t={}", url, Instant::now().elapsed().as_secs())
        } else {
            format!("{}?t={}", url, Instant::now().elapsed().as_secs())
        }
    };
    log::info!("Downloading from URL: {}", &request_url);

    // Create client with longer timeout and explicit proxy configuration
    let mut client_builder = Client::builder()
        .connect_timeout(std::time::Duration::from_secs(30))
        .timeout(std::time::Duration::from_secs(300)); // 5 minutes for large files

    // Apply detected proxy configuration (bypasses localhost automatically)
    client_builder = apply_proxy_config(client_builder, &request_url)?;

    let client = client_builder
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Request URL is already built above
    log::info!("Sending HTTP request...");

    let res = client
        .get(&request_url)
        .header(
            USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
        )
        .header(ACCEPT, "application/octet-stream")
        .send()
        .await
        .map_err(|e| format!("Failed to send request to `{}`: {}", &request_url, e))?;

    // Check response status
    if !res.status().is_success() {
        return Err(format!(
            "Server returned error status {} for `{}`",
            res.status(),
            &request_url
        ));
    }

    let total_size = res.content_length().ok_or(format!(
        "Failed to get content length from `{}`",
        &request_url
    ))?;

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
        let chunk =
            item.map_err(|e| format!("Stream error while downloading `{}`: {}", &request_url, e))?;
        file.write(&chunk)
            .map_err(|e| format!("Failed to write to file `{}`: {}", &path, e))?;
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
    log::info!(
        "Successfully downloaded {} bytes to {}",
        downloaded_bytes,
        &path
    );

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
    force: bool,
) -> Result<bool, String> {
    update_manager::process_lib_update(&app_handle, &lib, force).await
}

/// Batch process multiple libraries update
#[tauri::command]
async fn batch_update_libs(
    app_handle: tauri::AppHandle,
    libs: Vec<update_manager::LibInfo>,
    force: bool,
) -> Result<Vec<String>, String> {
    let mut updated_libs = Vec::new();

    for lib in libs {
        match update_manager::process_lib_update(&app_handle, &lib, force).await {
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
            http_request,
            agent_request,
            read_settings_file_generic,
            write_settings_file_generic,
            read_settings_file,
            write_settings_file,
            read_post_settings_file,
            write_post_settings_file,
            open_adb_terminal,
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
            delete_logs_older_than_3_days(work_dir);

            std::fs::write(format!("{}/port.txt", work_dir), "0")?;
            std::fs::write(format!("{}/wsport.txt", work_dir), "0")?;
            std::fs::write(format!("{}/wssport.txt", work_dir), "0")?;
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
