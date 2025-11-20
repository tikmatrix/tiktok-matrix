use anyhow::{anyhow, Result};
use std::net::TcpListener;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tokio::time::sleep;

const AGENT_PORT: u16 = 50809;
const MAX_STARTUP_RETRIES: u32 = 3;
const RETRY_DELAY_SECONDS: u64 = 5;
const STARTUP_TIMEOUT_SECONDS: u64 = 10;

pub struct AgentManager {
    app: AppHandle,
    agent_running: Arc<AtomicBool>,
}

impl AgentManager {
    pub fn new(app: AppHandle) -> Self {
        Self {
            app,
            agent_running: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn is_agent_running(&self) -> bool {
        self.agent_running.load(Ordering::Relaxed)
    }

    pub fn spawn_startup_agent(self: Arc<Self>) {
        tauri::async_runtime::spawn(async move {
            // Wait a bit for the app to fully initialize
            sleep(Duration::from_secs(2)).await;

            log::info!("[AgentManager] Starting agent on application startup");
            self.emit_agent_status("starting", None);
            match self.start_agent_with_retry().await {
                Ok(_) => {
                    log::info!("[AgentManager] Agent started successfully");
                    self.emit_agent_status("started", None);
                }
                Err(e) => {
                    log::error!("[AgentManager] Failed to start agent: {:?}", e);
                    self.emit_agent_status("error", Some(&format!("Failed to start: {}", e)));
                }
            }
        });
    }

    pub fn spawn_health_monitor(self: Arc<Self>) {
        let manager = Arc::clone(&self);
        tauri::async_runtime::spawn(async move {
            loop {
                sleep(Duration::from_secs(30)).await;

                if !manager.check_agent_port().await {
                    if manager.agent_running.load(Ordering::Relaxed) {
                        log::warn!("[AgentManager] Agent port check failed, attempting restart");
                        manager.agent_running.store(false, Ordering::Relaxed);
                        manager.emit_agent_status("disconnected", Some("Port check failed"));

                        // Attempt to restart
                        manager.emit_agent_status("starting", Some("health_monitor_restart"));
                        if let Err(e) = manager.start_agent_with_retry().await {
                            log::error!("[AgentManager] Failed to restart agent: {:?}", e);
                            manager.emit_agent_status(
                                "error",
                                Some(&format!("Restart failed: {}", e)),
                            );
                        }
                    }
                } else {
                    if !manager.agent_running.load(Ordering::Relaxed) {
                        manager.agent_running.store(true, Ordering::Relaxed);
                        log::info!("[AgentManager] Agent detected and marked as running");
                    }
                }
            }
        });
    }

    async fn start_agent_with_retry(&self) -> Result<()> {
        for attempt in 1..=MAX_STARTUP_RETRIES {
            log::info!(
                "[AgentManager] Starting agent (attempt {}/{})",
                attempt,
                MAX_STARTUP_RETRIES
            );

            match self.start_agent_once().await {
                Ok(_) => {
                    self.agent_running.store(true, Ordering::Relaxed);
                    return Ok(());
                }
                Err(e) => {
                    log::error!("[AgentManager] Attempt {} failed: {:?}", attempt, e);
                    if attempt < MAX_STARTUP_RETRIES {
                        log::info!(
                            "[AgentManager] Waiting {} seconds before retry",
                            RETRY_DELAY_SECONDS
                        );
                        sleep(Duration::from_secs(RETRY_DELAY_SECONDS)).await;
                    }
                }
            }
        }

        Err(anyhow!(
            "Failed to start agent after {} attempts",
            MAX_STARTUP_RETRIES
        ))
    }

    async fn start_agent_once(&self) -> Result<()> {
        // Check if port is already in use
        if let Some(process_name) = self.check_agent_port_with_process().await {
            if process_name == "agent" || process_name == "agent.exe" {
                log::info!("[AgentManager] Agent is already running");
                self.emit_agent_status("already_running", None);
                // Emit the agent_started event for the frontend
                let _ = self.app.emit_all("agent_started", serde_json::json!({}));
                return Ok(());
            } else {
                return Err(anyhow!(
                    "Port {} is occupied by {}",
                    AGENT_PORT,
                    process_name
                ));
            }
        }

        let app_data_dir = self
            .app
            .path_resolver()
            .app_data_dir()
            .ok_or_else(|| anyhow!("Failed to get app data dir"))?;

        #[cfg(target_os = "macos")]
        let agent_filename = "agent";
        #[cfg(target_os = "windows")]
        let agent_filename = "agent.exe";

        let agent_path = app_data_dir.join("bin").join(agent_filename);
        if !agent_path.exists() {
            return Err(anyhow!("Agent executable not found at {:?}", agent_path));
        }

        log::info!("[AgentManager] Launching agent from {:?}", agent_path);

        #[cfg(target_os = "windows")]
        let child = {
            use std::os::windows::process::CommandExt;
            let mut cmd = std::process::Command::new(&agent_path);
            // On Windows, hide the console window
            cmd.creation_flags(0x08000000);
            cmd.spawn()
                .map_err(|e| anyhow!("Failed to spawn agent: {}", e))?
        };

        #[cfg(not(target_os = "windows"))]
        let child = {
            let mut cmd = std::process::Command::new(&agent_path);
            cmd.spawn()
                .map_err(|e| anyhow!("Failed to spawn agent: {}", e))?
        };

        let pid = child.id();
        log::info!("[AgentManager] Agent spawned with PID: {}", pid);

        // Save PID to file
        let pid_file = app_data_dir.join("agent.pid");
        tokio::fs::write(&pid_file, pid.to_string()).await?;

        // Wait for agent to start and write port
        self.wait_for_agent_startup(&app_data_dir).await?;

        log::info!("[AgentManager] Agent started successfully");

        // Emit the agent_started event for the frontend
        let _ = self.app.emit_all("agent_started", serde_json::json!({}));

        Ok(())
    }

    async fn wait_for_agent_startup(&self, app_data_dir: &PathBuf) -> Result<()> {
        let port_file = app_data_dir.join("port.txt");
        let start_time = std::time::Instant::now();

        while start_time.elapsed() < Duration::from_secs(STARTUP_TIMEOUT_SECONDS) {
            if let Ok(content) = tokio::fs::read_to_string(&port_file).await {
                if let Ok(port) = content.trim().parse::<u16>() {
                    if port > 0 {
                        log::info!("[AgentManager] Agent started on port {}", port);
                        return Ok(());
                    }
                }
            }
            sleep(Duration::from_millis(500)).await;
        }

        Err(anyhow!(
            "Agent startup timeout after {} seconds",
            STARTUP_TIMEOUT_SECONDS
        ))
    }

    async fn check_agent_port(&self) -> bool {
        match TcpListener::bind(("127.0.0.1", AGENT_PORT)) {
            Ok(_) => false, // Port is free, agent not running
            Err(_) => true, // Port is in use, likely agent is running
        }
    }

    async fn check_agent_port_with_process(&self) -> Option<String> {
        if !self.check_agent_port().await {
            return None;
        }

        #[cfg(target_os = "windows")]
        {
            use std::process::Command;
            let output = Command::new("netstat")
                .args(&["-ano"])
                .creation_flags(0x08000000)
                .output()
                .ok()?;

            let output_str = String::from_utf8_lossy(&output.stdout);
            let line = output_str
                .lines()
                .find(|line| line.contains(&format!(":{}", AGENT_PORT)))?;

            let pid = line.split_whitespace().last()?;

            let task_output = Command::new("tasklist")
                .args(&["/FI", &format!("PID eq {}", pid)])
                .creation_flags(0x08000000)
                .output()
                .ok()?;

            let task_str = String::from_utf8_lossy(&task_output.stdout);
            let process_line = task_str.lines().nth(3)?;
            let process_name = process_line.split_whitespace().next()?;

            Some(process_name.to_string())
        }

        #[cfg(target_os = "macos")]
        {
            use std::process::Command;
            let output = Command::new("lsof")
                .args(&["-i", &format!(":{}", AGENT_PORT)])
                .output()
                .ok()?;

            let output_str = String::from_utf8_lossy(&output.stdout);
            let line = output_str.lines().nth(1)?;
            let process_name = line.split_whitespace().next()?;

            Some(process_name.to_string())
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        None
    }

    pub async fn restart_agent(&self) -> Result<()> {
        log::info!("[AgentManager] Restarting agent");
        self.emit_agent_status("starting", Some("restart"));

        // Kill existing agent
        self.kill_agent().await;
        sleep(Duration::from_secs(2)).await;

        // Start with retry
        self.start_agent_with_retry().await?;

        Ok(())
    }

    async fn kill_agent(&self) {
        #[cfg(target_os = "windows")]
        {
            use std::process::Command;
            let _ = Command::new("taskkill")
                .args(&["/F", "/IM", "agent.exe"])
                .creation_flags(0x08000000)
                .status();
        }

        #[cfg(target_os = "macos")]
        {
            use std::process::Command;
            let _ = Command::new("pkill").args(&["-f", "agent"]).status();
        }

        self.agent_running.store(false, Ordering::Relaxed);
        log::info!("[AgentManager] Agent killed");
    }

    fn emit_agent_status(&self, status: &str, message: Option<&str>) {
        let _ = self.app.emit_all(
            "agent_manager_status",
            serde_json::json!({
                "status": status,
                "message": message,
                "timestamp": chrono::Utc::now().timestamp_millis(),
            }),
        );
    }
}
