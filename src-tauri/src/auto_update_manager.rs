use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoUpdateConfig {
    pub enabled: bool,
    pub check_interval_minutes: u64,
    pub idle_threshold_minutes: u64,
}

impl Default for AutoUpdateConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            check_interval_minutes: 10,
            idle_threshold_minutes: 5,
        }
    }
}

#[derive(Debug, Clone)]
pub struct AutoUpdateState {
    pub last_check: Option<Instant>,
    pub last_user_activity: Instant,
    pub is_running: bool,
}

impl Default for AutoUpdateState {
    fn default() -> Self {
        Self {
            last_check: None,
            last_user_activity: Instant::now(),
            is_running: false,
        }
    }
}

// Global state for auto-update manager
lazy_static::lazy_static! {
    static ref AUTO_UPDATE_STATE: Arc<Mutex<AutoUpdateState>> = Arc::new(Mutex::new(AutoUpdateState::default()));
    pub static ref AUTO_UPDATE_CONFIG: Arc<Mutex<AutoUpdateConfig>> = Arc::new(Mutex::new(AutoUpdateConfig::default()));
}

/// Update user activity timestamp (called from frontend)
pub fn update_user_activity() {
    if let Ok(mut state) = AUTO_UPDATE_STATE.lock() {
        state.last_user_activity = Instant::now();
        log::debug!("User activity updated");
    }
}

/// Check if system is idle based on last user activity
pub fn is_system_idle(idle_threshold_minutes: u64) -> bool {
    if let Ok(state) = AUTO_UPDATE_STATE.lock() {
        let elapsed = state.last_user_activity.elapsed();
        let threshold = Duration::from_secs(idle_threshold_minutes * 60);
        let is_idle = elapsed >= threshold;
        log::debug!(
            "System idle check: elapsed={:?}, threshold={:?}, is_idle={}",
            elapsed,
            threshold,
            is_idle
        );
        return is_idle;
    }
    false
}

/// Check if auto-update should be triggered
pub fn should_trigger_auto_update(has_running_tasks: bool, config: &AutoUpdateConfig) -> bool {
    if !config.enabled {
        log::debug!("Auto-update is disabled");
        return false;
    }

    if has_running_tasks {
        log::debug!("Has running tasks, skipping auto-update");
        return false;
    }

    if !is_system_idle(config.idle_threshold_minutes) {
        log::debug!("System is not idle, skipping auto-update");
        return false;
    }

    // Check if enough time has passed since last check
    if let Ok(state) = AUTO_UPDATE_STATE.lock() {
        if let Some(last_check) = state.last_check {
            let elapsed = last_check.elapsed();
            let interval = Duration::from_secs(config.check_interval_minutes * 60);
            if elapsed < interval {
                log::debug!(
                    "Not enough time since last check: elapsed={:?}, interval={:?}",
                    elapsed,
                    interval
                );
                return false;
            }
        }
    }

    log::info!("Auto-update conditions met, should trigger update");
    true
}

/// Update the last check timestamp
pub fn update_last_check() {
    if let Ok(mut state) = AUTO_UPDATE_STATE.lock() {
        state.last_check = Some(Instant::now());
        log::debug!("Updated last check timestamp");
    }
}

/// Start auto-update timer
pub async fn start_auto_update_timer(
    app_handle: AppHandle,
    config: AutoUpdateConfig,
) -> Result<(), String> {
    log::info!(
        "Starting auto-update timer with interval: {} minutes",
        config.check_interval_minutes
    );

    // Update config
    if let Ok(mut cfg) = AUTO_UPDATE_CONFIG.lock() {
        *cfg = config.clone();
    }

    // Mark as running
    if let Ok(mut state) = AUTO_UPDATE_STATE.lock() {
        state.is_running = true;
    }

    // Spawn background task
    tokio::spawn(async move {
        let interval = Duration::from_secs(config.check_interval_minutes * 60);
        let mut interval_timer = tokio::time::interval(interval);

        loop {
            interval_timer.tick().await;

            // Check if still should be running
            let is_running = AUTO_UPDATE_STATE
                .lock()
                .map(|s| s.is_running)
                .unwrap_or(false);

            if !is_running {
                log::info!("Auto-update timer stopped");
                break;
            }

            log::debug!("Auto-update timer tick");

            // Get current config
            let current_config = AUTO_UPDATE_CONFIG
                .lock()
                .map(|c| c.clone())
                .unwrap_or_default();

            if !current_config.enabled {
                log::debug!("Auto-update is disabled, skipping check");
                continue;
            }

            // Emit event to frontend to check if has running tasks
            // Frontend will respond via check_can_auto_update command
            app_handle
                .emit_all("AUTO_UPDATE_CHECK_CONDITIONS", &())
                .ok();
        }
    });

    Ok(())
}

/// Stop auto-update timer
pub fn stop_auto_update_timer() -> Result<(), String> {
    log::info!("Stopping auto-update timer");

    if let Ok(mut state) = AUTO_UPDATE_STATE.lock() {
        state.is_running = false;
        state.last_check = None;
    }

    Ok(())
}

/// Trigger auto-update check (called from frontend after conditions check)
pub async fn trigger_auto_update(app_handle: &AppHandle) -> Result<(), String> {
    log::info!("Triggering auto-update check");

    // Update last check timestamp
    update_last_check();

    // Emit event to trigger update in TitleBar
    app_handle
        .emit_all("AUTO_UPDATE_TRIGGER", &())
        .map_err(|e| format!("Failed to emit auto-update trigger: {}", e))?;

    Ok(())
}

/// Get current auto-update state info
#[derive(Debug, Clone, Serialize)]
pub struct AutoUpdateStateInfo {
    pub is_running: bool,
    pub enabled: bool,
    pub check_interval_minutes: u64,
    pub idle_threshold_minutes: u64,
    pub seconds_since_last_activity: u64,
    pub seconds_since_last_check: Option<u64>,
}

pub fn get_auto_update_state() -> AutoUpdateStateInfo {
    let state = AUTO_UPDATE_STATE.lock().ok();
    let config = AUTO_UPDATE_CONFIG.lock().ok();

    let seconds_since_last_activity = state
        .as_ref()
        .map(|s| s.last_user_activity.elapsed().as_secs())
        .unwrap_or(0);

    let seconds_since_last_check = state
        .as_ref()
        .and_then(|s| s.last_check)
        .map(|t| t.elapsed().as_secs());

    AutoUpdateStateInfo {
        is_running: state.as_ref().map(|s| s.is_running).unwrap_or(false),
        enabled: config.as_ref().map(|c| c.enabled).unwrap_or(false),
        check_interval_minutes: config
            .as_ref()
            .map(|c| c.check_interval_minutes)
            .unwrap_or(10),
        idle_threshold_minutes: config
            .as_ref()
            .map(|c| c.idle_threshold_minutes)
            .unwrap_or(5),
        seconds_since_last_activity,
        seconds_since_last_check,
    }
}
