use reqwest;
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/// Log system proxy configuration if set
pub fn log_proxy_config() {
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
pub fn detect_system_proxy() -> Option<String> {
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
pub fn detect_env_proxy() -> Option<String> {
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
pub fn is_localhost_url(url: &str) -> bool {
    let lower = url.to_lowercase();
    lower.starts_with("http://localhost")
        || lower.starts_with("https://localhost")
        || lower.starts_with("http://127.0.0.1")
        || lower.starts_with("https://127.0.0.1")
        || lower.starts_with("http://[::1]")
        || lower.starts_with("https://[::1]")
}

/// Check if URL should bypass proxy based on NO_PROXY environment variable
pub fn should_bypass_proxy(url: &str) -> bool {
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
pub fn get_first_env_proxy() -> Option<String> {
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
pub fn get_system_proxy_url() -> Option<String> {
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
