use serde::{Deserialize, Serialize};
use std::fs;
use std::process::{Command, Stdio};
use tauri::{AppHandle, Manager};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

// Report distributor installation to agent
async fn report_distributor_install(app_handle: AppHandle) {
    // Get distributor code from environment variable
    let distributor_code =
        std::env::var("DISTRIBUTOR_CODE").unwrap_or_else(|_| "OFFICIAL".to_string());

    // Get machine ID from environment variable
    let machine_id = machine_uid::get()
        .map_err(|error| {
            log::error!("Failed to get machine uid for global events: {:?}", error);
            "UNKNOWN"
        })
        .unwrap_or("UNKNOWN".to_string());

    // Get app version
    let app_version = app_handle.package_info().version.to_string();

    // Get OS information
    let os_type = std::env::consts::OS;
    let os_arch = std::env::consts::ARCH;

    // Get OS version (platform-specific)
    let os_version = get_os_version();
    let os_full_version = format!("{} {} ({})", os_type, os_version, os_arch);

    log::info!(
        "Reporting distributor install: distributor={}, version={}, os={}, machine_id={}",
        distributor_code,
        app_version,
        os_full_version,
        machine_id
    );

    // Build request payload
    let payload = serde_json::json!({
        "distributor_code": distributor_code,
        "app_version": app_version,
        "os_version": os_full_version,
        "machine_id": machine_id,
    });

    // Call agent API
    match crate::agent_request(
        app_handle.clone(),
        "POST".to_string(),
        "/api/report_distributor_install".to_string(),
        None,          // params
        None,          // headers
        None,          // body
        None,          // form
        Some(payload), // data
        Some(30),      // timeout
        false,         // raw_response
    )
    .await
    {
        Ok(response) => {
            log::info!("Distributor install reported successfully: {:?}", response);
        }
        Err(e) => {
            log::error!("Failed to report distributor install: {}", e);
        }
    }
}

// Get OS version string
fn get_os_version() -> String {
    #[cfg(target_os = "windows")]
    {
        // Try to get Windows version from registry or system info
        if let Ok(output) = Command::new("cmd")
            .args(&["/C", "ver"])
            .creation_flags(0x08000000)
            .output()
        {
            if output.status.success() {
                let version_str = String::from_utf8_lossy(&output.stdout);
                return version_str.trim().to_string();
            }
        }
        "Unknown".to_string()
    }

    #[cfg(target_os = "macos")]
    {
        // Get macOS version using sw_vers
        if let Ok(output) = Command::new("sw_vers").arg("-productVersion").output() {
            if output.status.success() {
                let version_str = String::from_utf8_lossy(&output.stdout);
                return version_str.trim().to_string();
            }
        }
        "Unknown".to_string()
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        "Unknown".to_string()
    }
}

// Initialization result for the entire startup process
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitializationResult {
    pub success: bool,
    pub agent_status: AgentStatus,
    pub updates_checked: bool,
    pub updates_applied: Vec<String>,
    pub error: String,
}

// Initialization options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InitOptions {
    pub check_updates: bool,
    pub force_update: bool,
    pub silent: bool,
    pub check_libs_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStatus {
    pub running: bool,
    pub process_name: String,
    pub error: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentStartResult {
    pub success: bool,
    pub error_type: String, // "notfound", "port", "timeout", "start"
    pub process_name: String,
    pub message: String,
}

// Check if agent is running by checking port 50809
pub fn check_agent_running() -> AgentStatus {
    use std::net::TcpListener;

    let port = 50809;
    match TcpListener::bind(("0.0.0.0", port)) {
        Ok(_) => {
            log::info!("Agent is not running on port {}", port);
            AgentStatus {
                running: false,
                process_name: String::new(),
                error: String::new(),
            }
        }
        Err(_) => {
            log::info!("Agent is running on port {}", port);
            let process_name = get_process_using_port(port);
            AgentStatus {
                running: true,
                process_name,
                error: String::new(),
            }
        }
    }
}

// Get the process name using a specific port
fn get_process_using_port(port: u16) -> String {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        let mut command = Command::new("netstat");
        command.args(&["-ano"]);
        command.creation_flags(0x08000000); // Hide console window

        if let Ok(output) = command.output() {
            if output.status.success() {
                let output_str = String::from_utf8_lossy(&output.stdout);
                if let Some(line) = output_str
                    .lines()
                    .find(|line| line.contains(&format!(":{}", port)))
                {
                    if let Some(pid) = line.split_whitespace().last() {
                        let mut tasklist = Command::new("tasklist");
                        tasklist.args(&["/FI", &format!("PID eq {}", pid)]);
                        tasklist.creation_flags(0x08000000);

                        if let Ok(task_output) = tasklist.output() {
                            let task_str = String::from_utf8_lossy(&task_output.stdout);
                            if let Some(process_line) = task_str.lines().nth(3) {
                                let process_name =
                                    process_line.split_whitespace().next().unwrap_or("unknown");
                                log::info!(
                                    "Process using port {}: {} (PID: {})",
                                    port,
                                    process_name,
                                    pid
                                );
                                return process_name.to_string();
                            }
                        }
                    }
                }
            }
        }
        String::new()
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        let mut command = Command::new("lsof");
        command.args(&["-i", &format!(":{}", port)]);

        if let Ok(output) = command.output() {
            if output.status.success() {
                let output_str = String::from_utf8_lossy(&output.stdout);
                if let Some(line) = output_str.lines().nth(1) {
                    let process_name = line.split_whitespace().next().unwrap_or("unknown");
                    log::info!("Process using port {}: {}", port, process_name);
                    return process_name.to_string();
                }
            }
        }
        String::new()
    }
}

// Start agent process
pub fn start_agent_process(app_handle: &AppHandle) -> Result<AgentStartResult, String> {
    // Check if agent is already running
    let status = check_agent_running();

    if status.running {
        // Check if it's our agent
        if status.process_name == "agent.exe" || status.process_name == "agent" {
            log::info!("Agent is already running");
            return Ok(AgentStartResult {
                success: true,
                error_type: String::new(),
                process_name: status.process_name,
                message: "Agent is already running".to_string(),
            });
        } else {
            let pname = status.process_name.clone();
            log::warn!("Port 50809 is occupied by: {}", pname);
            return Ok(AgentStartResult {
                success: false,
                error_type: "port".to_string(),
                process_name: status.process_name,
                message: format!("Port 50809 is occupied by {}", pname),
            });
        }
    }

    // Get agent binary path
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    #[cfg(target_os = "windows")]
    let agent_filename = "agent.exe";

    #[cfg(target_os = "macos")]
    let agent_filename = "agent";

    let agent_path = app_data_dir.join("bin").join(agent_filename);

    // Check if agent binary exists
    if !agent_path.exists() {
        log::error!("Agent binary not found at: {:?}", agent_path);
        return Ok(AgentStartResult {
            success: false,
            error_type: "notfound".to_string(),
            process_name: String::new(),
            message: format!("Agent binary not found at: {:?}", agent_path),
        });
    }

    // Start agent process
    log::info!("Starting agent from: {:?}", agent_path);

    #[cfg(target_os = "windows")]
    {
        let mut command = Command::new(&agent_path);
        command.creation_flags(0x08000000); // Hide console window
        command.stdout(Stdio::null());
        command.stderr(Stdio::null());

        match command.spawn() {
            Ok(child) => {
                let pid = child.id();
                log::info!("Agent started with PID: {}", pid);

                // Save PID to file
                let pid_file = app_data_dir.join("agent.pid");
                if let Err(e) = fs::write(&pid_file, pid.to_string()) {
                    log::warn!("Failed to write PID file: {}", e);
                }

                Ok(AgentStartResult {
                    success: true,
                    error_type: String::new(),
                    process_name: agent_filename.to_string(),
                    message: format!("Agent started with PID: {}", pid),
                })
            }
            Err(e) => {
                log::error!("Failed to start agent: {}", e);
                Ok(AgentStartResult {
                    success: false,
                    error_type: "start".to_string(),
                    process_name: String::new(),
                    message: format!("Failed to start agent: {}", e),
                })
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        match Command::new(&agent_path)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
        {
            Ok(child) => {
                let pid = child.id();
                log::info!("Agent started with PID: {}", pid);

                // Save PID to file
                let pid_file = app_data_dir.join("agent.pid");
                if let Err(e) = fs::write(&pid_file, pid.to_string()) {
                    log::warn!("Failed to write PID file: {}", e);
                }

                Ok(AgentStartResult {
                    success: true,
                    error_type: String::new(),
                    process_name: agent_filename.to_string(),
                    message: format!("Agent started with PID: {}", pid),
                })
            }
            Err(e) => {
                log::error!("Failed to start agent: {}", e);
                Ok(AgentStartResult {
                    success: false,
                    error_type: "start".to_string(),
                    process_name: String::new(),
                    message: format!("Failed to start agent: {}", e),
                })
            }
        }
    }
}

// Wait for agent to be ready by checking port.txt
pub async fn wait_agent_ready(
    app_handle: &AppHandle,
    timeout_seconds: u64,
) -> Result<bool, String> {
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    let port_file = app_data_dir.join("port.txt");

    for i in 0..timeout_seconds {
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

        if let Ok(content) = fs::read_to_string(&port_file) {
            if let Ok(port) = content.trim().parse::<u16>() {
                if port > 0 {
                    log::info!("Agent is ready on port: {}", port);
                    return Ok(true);
                }
            }
        }

        log::debug!("Waiting for agent... ({}/{})", i + 1, timeout_seconds);
    }

    log::error!(
        "Agent did not become ready within {} seconds",
        timeout_seconds
    );
    Ok(false)
}

// Shutdown agent and script processes
pub fn shutdown_processes(app_handle: &AppHandle) {
    #[cfg(target_os = "windows")]
    {
        // Kill agent
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command.args(&["/F", "/IM", "agent.exe"]);
        if let Err(e) = command.status() {
            log::warn!("Failed to kill agent.exe: {}", e);
        } else {
            log::info!("Killed agent.exe");
        }

        // Kill script
        let mut command = Command::new("taskkill");
        command.creation_flags(0x08000000);
        command.args(&["/F", "/IM", "script.exe"]);
        if let Err(e) = command.status() {
            log::warn!("Failed to kill script.exe: {}", e);
        } else {
            log::info!("Killed script.exe");
        }
    }

    #[cfg(target_os = "macos")]
    {
        // Kill agent
        let mut command = Command::new("pkill");
        command.args(&["-f", "agent"]);
        if let Err(e) = command.status() {
            log::warn!("Failed to kill agent: {}", e);
        } else {
            log::info!("Killed agent");
        }

        // Kill script
        let mut command = Command::new("pkill");
        command.args(&["-f", "script"]);
        if let Err(e) = command.status() {
            log::warn!("Failed to kill script: {}", e);
        } else {
            log::info!("Killed script");
        }
    }

    // Clear PID file
    if let Some(app_data_dir) = app_handle.path_resolver().app_data_dir() {
        let pid_file = app_data_dir.join("agent.pid");
        if let Err(e) = fs::write(&pid_file, "") {
            log::warn!("Failed to clear PID file: {}", e);
        }
    }
}

// Tauri commands
#[tauri::command]
pub fn check_agent_status() -> AgentStatus {
    check_agent_running()
}

#[tauri::command]
pub fn start_agent(app_handle: AppHandle) -> Result<AgentStartResult, String> {
    start_agent_process(&app_handle)
}

#[tauri::command]
pub async fn wait_for_agent_ready(
    app_handle: AppHandle,
    timeout_seconds: u64,
) -> Result<bool, String> {
    wait_agent_ready(&app_handle, timeout_seconds).await
}

#[tauri::command]
pub fn shutdown_agent(app_handle: AppHandle) {
    shutdown_processes(&app_handle);
}

// Unified initialization process
#[tauri::command]
pub async fn initialize_app(
    app_handle: AppHandle,
    options: InitOptions,
) -> Result<InitializationResult, String> {
    log::info!("Starting app initialization with options: {:?}", options);

    let mut result = InitializationResult {
        success: false,
        agent_status: check_agent_running(),
        updates_checked: false,
        updates_applied: Vec::new(),
        error: String::new(),
    };

    // Emit initialization started event
    app_handle
        .emit_all(
            "INIT_STATUS",
            &serde_json::json!({
                "stage": "started",
                "message": "Initialization started"
            }),
        )
        .ok();

    // Step 1: Check updates if requested
    if options.check_updates {
        app_handle
            .emit_all(
                "INIT_STATUS",
                &serde_json::json!({
                    "stage": "checking_updates",
                    "message": "Checking for updates..."
                }),
            )
            .ok();

        // Get platform info
        let platform = get_platform();
        let app_name = app_handle.package_info().name.clone();

        // Determine check_libs_url: use provided option, else fallback to env / dev / prod defaults
        let mut check_libs_url = options.check_libs_url.clone();
        if check_libs_url.trim().is_empty() {
            // 1) try environment variable override
            if let Ok(env_url) = std::env::var("TIKMATRIX_CHECK_LIBS_URL") {
                if !env_url.trim().is_empty() {
                    check_libs_url = env_url;
                }
            }

            // 2) fallback defaults
            if check_libs_url.trim().is_empty() {
                if cfg!(debug_assertions) {
                    // In dev builds prefer local dev server
                    check_libs_url =
                        "http://localhost:8787/front-api/check_libs?beta=0".to_string();
                } else {
                    // Production default (can be overridden by environment)
                    check_libs_url =
                        "https://api.tikmatrix.com/front-api/check_libs?beta=0".to_string();
                }
            }

            // Emit which URL we're using for frontend visibility/debug
            app_handle
                .emit_all(
                    "INIT_STATUS",
                    &serde_json::json!({
                        "stage": "check_libs_url",
                        "message": format!("Using check_libs_url: {}", check_libs_url)
                    }),
                )
                .ok();
        }

        // Check libraries update
        match crate::update_manager::check_libs_update(
            &app_handle,
            &check_libs_url,
            &platform,
            &app_name,
        )
        .await
        {
            Ok(response) => {
                result.updates_checked = true;

                let libs = response.data.libs;

                // Update each library
                for lib in libs {
                    match crate::update_manager::process_lib_update(
                        &app_handle,
                        &lib,
                        options.force_update,
                    )
                    .await
                    {
                        Ok(true) => {
                            log::info!("Library {} updated successfully", lib.name);
                            result.updates_applied.push(lib.name.clone());
                        }
                        Ok(false) => {
                            log::info!("Library {} is up to date", lib.name);
                        }
                        Err(e) => {
                            log::error!("Failed to update library {}: {}", lib.name, e);
                            result.error = format!("Library update failed: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to check updates: {}", e);
                result.error = format!("Update check failed: {}", e);
            }
        }
    }

    // Step 2: Check and start agent
    app_handle
        .emit_all(
            "INIT_STATUS",
            &serde_json::json!({
                "stage": "starting_agent",
                "message": "Starting agent..."
            }),
        )
        .ok();

    result.agent_status = check_agent_running();

    if !result.agent_status.running {
        // Agent not running, start it
        match start_agent_process(&app_handle) {
            Ok(start_result) => {
                if start_result.success {
                    // Wait for agent to be ready
                    match wait_agent_ready(&app_handle, 10).await {
                        Ok(ready) => {
                            if ready {
                                result.success = true;
                                result.agent_status = check_agent_running();

                                app_handle
                                    .emit_all(
                                        "INIT_STATUS",
                                        &serde_json::json!({
                                            "stage": "completed",
                                            "message": "Initialization completed successfully"
                                        }),
                                    )
                                    .ok();

                                // Emit agent_started event for backward compatibility
                                app_handle
                                    .emit_all("agent_started", &serde_json::json!({}))
                                    .ok();

                                // Report distributor installation after agent is ready
                                tokio::spawn(report_distributor_install(app_handle.clone()));
                            } else {
                                result.error = "Agent startup timeout".to_string();
                            }
                        }
                        Err(e) => {
                            result.error = format!("Failed to wait for agent: {}", e);
                        }
                    }
                } else {
                    result.error = start_result.message;
                }
            }
            Err(e) => {
                result.error = format!("Failed to start agent: {}", e);
            }
        }
    } else if result.agent_status.process_name == "agent.exe"
        || result.agent_status.process_name == "agent"
    {
        // Agent is already running
        result.success = true;
        app_handle
            .emit_all(
                "INIT_STATUS",
                &serde_json::json!({
                    "stage": "completed",
                    "message": "Agent already running"
                }),
            )
            .ok();
        app_handle
            .emit_all("agent_started", &serde_json::json!({}))
            .ok();

        // Report distributor installation when agent is already running
        tokio::spawn(report_distributor_install(app_handle.clone()));
    } else {
        // Port occupied by another process
        result.error = format!(
            "Port 50809 is occupied by {}",
            result.agent_status.process_name
        );
    }

    if !result.success && result.error.is_empty() {
        result.error = "Initialization failed for unknown reason".to_string();
    }

    log::info!("App initialization result: {:?}", result);
    Ok(result)
}

// Get platform string
fn get_platform() -> String {
    #[cfg(target_os = "windows")]
    {
        "windows".to_string()
    }

    #[cfg(all(target_os = "macos", target_arch = "aarch64"))]
    {
        "mac-arm".to_string()
    }

    #[cfg(all(target_os = "macos", not(target_arch = "aarch64")))]
    {
        "mac-intel".to_string()
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        "unknown".to_string()
    }
}
