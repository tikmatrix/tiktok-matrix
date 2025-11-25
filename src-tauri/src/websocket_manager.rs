use futures_util::{SinkExt, StreamExt};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};

/// WebSocket connection state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum WsState {
    Disconnected,
    Connecting,
    Connected,
    Reconnecting,
}

/// WebSocket status info for frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WsStatus {
    pub state: WsState,
    pub url: String,
    pub reconnect_attempts: u32,
    pub last_error: String,
}

/// Global WebSocket manager state
struct WsManagerState {
    state: WsState,
    url: String,
    reconnect_attempts: u32,
    max_retries: u32,
    last_error: String,
    should_reconnect: bool,
    shutdown_tx: Option<mpsc::Sender<()>>,
}

impl Default for WsManagerState {
    fn default() -> Self {
        Self {
            state: WsState::Disconnected,
            url: String::new(),
            reconnect_attempts: 0,
            max_retries: 10,
            last_error: String::new(),
            should_reconnect: false,
            shutdown_tx: None,
        }
    }
}

lazy_static::lazy_static! {
    static ref WS_STATE: Arc<Mutex<WsManagerState>> = Arc::new(Mutex::new(WsManagerState::default()));
}

/// Emit WebSocket status change to frontend
fn emit_ws_status(app_handle: &AppHandle, status: &WsStatus) {
    if let Err(e) = app_handle.emit_all("ws_status", status) {
        log::error!("Failed to emit ws_status: {}", e);
    }
}

/// Emit agent message to frontend
fn emit_agent_message(app_handle: &AppHandle, message: &str) {
    if let Err(e) = app_handle.emit_all("agent_message", message) {
        log::error!("Failed to emit agent_message: {}", e);
    }
}

/// Get current WebSocket status
fn get_current_status() -> WsStatus {
    let state = WS_STATE.lock();
    WsStatus {
        state: state.state.clone(),
        url: state.url.clone(),
        reconnect_attempts: state.reconnect_attempts,
        last_error: state.last_error.clone(),
    }
}

/// Calculate reconnect delay with exponential backoff
fn get_reconnect_delay(attempts: u32) -> u64 {
    let base_delay = 2000u64;
    let max_delay = 30000u64;
    let exponential_delay = base_delay * 2u64.pow(attempts.min(10));
    let jitter = (rand_jitter() * 1000.0) as u64;
    (exponential_delay + jitter).min(max_delay)
}

/// Simple random jitter (0.0 - 1.0)
fn rand_jitter() -> f64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .subsec_nanos();
    (nanos % 1000) as f64 / 1000.0
}

/// Start WebSocket connection to agent
pub async fn connect_ws(app_handle: AppHandle, ws_port: u16) -> Result<(), String> {
    let url = format!("ws://localhost:{}", ws_port);
    log::info!("Starting WebSocket connection to {}", url);

    // Check if already connected to the same URL
    {
        let state = WS_STATE.lock();
        if state.state == WsState::Connected && state.url == url {
            log::info!("WebSocket already connected to {}", url);
            return Ok(());
        }
    }

    // Disconnect existing connection if any
    disconnect_ws_internal().await;

    // Create shutdown channel
    let (shutdown_tx, shutdown_rx) = mpsc::channel::<()>(1);

    // Update state
    {
        let mut state = WS_STATE.lock();
        state.url = url.clone();
        state.state = WsState::Connecting;
        state.should_reconnect = true;
        state.reconnect_attempts = 0;
        state.last_error.clear();
        state.shutdown_tx = Some(shutdown_tx);
    }

    emit_ws_status(&app_handle, &get_current_status());

    // Spawn WebSocket connection task
    let app_handle_clone = app_handle.clone();
    tokio::spawn(async move {
        ws_connection_loop(app_handle_clone, url, shutdown_rx).await;
    });

    Ok(())
}

/// Main WebSocket connection loop with reconnection logic
async fn ws_connection_loop(
    app_handle: AppHandle,
    url: String,
    mut shutdown_rx: mpsc::Receiver<()>,
) {
    loop {
        // Check if should continue
        let should_reconnect = {
            let state = WS_STATE.lock();
            state.should_reconnect
        };

        if !should_reconnect {
            log::info!("WebSocket reconnection disabled, exiting loop");
            break;
        }

        // Check max retries
        let (attempts, max_retries) = {
            let state = WS_STATE.lock();
            (state.reconnect_attempts, state.max_retries)
        };

        if attempts >= max_retries {
            log::error!("WebSocket max retries ({}) exceeded", max_retries);
            {
                let mut state = WS_STATE.lock();
                state.state = WsState::Disconnected;
                state.should_reconnect = false;
                state.last_error = format!("Max retries ({}) exceeded", max_retries);
            }
            emit_ws_status(&app_handle, &get_current_status());
            break;
        }

        // Update state to connecting/reconnecting
        {
            let mut state = WS_STATE.lock();
            if attempts > 0 {
                state.state = WsState::Reconnecting;
            } else {
                state.state = WsState::Connecting;
            }
        }
        emit_ws_status(&app_handle, &get_current_status());

        log::info!(
            "Attempting WebSocket connection to {} (attempt {}/{})",
            url,
            attempts + 1,
            max_retries
        );

        // Try to connect with timeout
        let connect_result =
            tokio::time::timeout(tokio::time::Duration::from_secs(10), connect_async(&url)).await;

        match connect_result {
            Ok(Ok((ws_stream, _))) => {
                log::info!("WebSocket connected successfully to {}", url);

                // Update state to connected
                {
                    let mut state = WS_STATE.lock();
                    state.state = WsState::Connected;
                    state.reconnect_attempts = 0;
                    state.last_error.clear();
                }
                emit_ws_status(&app_handle, &get_current_status());

                // Handle messages
                let (mut write, mut read) = ws_stream.split();

                loop {
                    tokio::select! {
                        // Check for shutdown signal
                        _ = shutdown_rx.recv() => {
                            log::info!("WebSocket shutdown signal received");
                            let _ = write.close().await;
                            {
                                let mut state = WS_STATE.lock();
                                state.state = WsState::Disconnected;
                                state.should_reconnect = false;
                            }
                            emit_ws_status(&app_handle, &get_current_status());
                            return;
                        }
                        // Handle incoming messages
                        msg = read.next() => {
                            match msg {
                                Some(Ok(Message::Text(text))) => {
                                    emit_agent_message(&app_handle, &text);
                                }
                                Some(Ok(Message::Ping(data))) => {
                                    if let Err(e) = write.send(Message::Pong(data)).await {
                                        log::error!("Failed to send pong: {}", e);
                                        break;
                                    }
                                }
                                Some(Ok(Message::Close(_))) => {
                                    log::info!("WebSocket server closed connection");
                                    break;
                                }
                                Some(Err(e)) => {
                                    log::error!("WebSocket error: {}", e);
                                    {
                                        let mut state = WS_STATE.lock();
                                        state.last_error = e.to_string();
                                    }
                                    break;
                                }
                                None => {
                                    log::info!("WebSocket stream ended");
                                    break;
                                }
                                _ => {}
                            }
                        }
                    }
                }

                // Connection lost, check if should reconnect
                let should_reconnect = {
                    let mut state = WS_STATE.lock();
                    state.state = WsState::Disconnected;
                    state.reconnect_attempts += 1;
                    state.should_reconnect
                };

                if !should_reconnect {
                    emit_ws_status(&app_handle, &get_current_status());
                    break;
                }

                emit_ws_status(&app_handle, &get_current_status());
            }
            Ok(Err(e)) => {
                log::error!("WebSocket connection failed: {}", e);
                {
                    let mut state = WS_STATE.lock();
                    state.last_error = e.to_string();
                    state.reconnect_attempts += 1;
                }
                emit_ws_status(&app_handle, &get_current_status());
            }
            Err(_) => {
                log::error!("WebSocket connection timeout");
                {
                    let mut state = WS_STATE.lock();
                    state.last_error = "Connection timeout".to_string();
                    state.reconnect_attempts += 1;
                }
                emit_ws_status(&app_handle, &get_current_status());
            }
        }

        // Wait before reconnecting
        let attempts = {
            let state = WS_STATE.lock();
            state.reconnect_attempts
        };
        let delay = get_reconnect_delay(attempts);
        log::info!("Reconnecting in {}ms...", delay);

        // Wait with shutdown check
        tokio::select! {
            _ = shutdown_rx.recv() => {
                log::info!("WebSocket shutdown during reconnect wait");
                {
                    let mut state = WS_STATE.lock();
                    state.state = WsState::Disconnected;
                    state.should_reconnect = false;
                }
                emit_ws_status(&app_handle, &get_current_status());
                return;
            }
            _ = tokio::time::sleep(tokio::time::Duration::from_millis(delay)) => {}
        }
    }
}

/// Disconnect WebSocket (internal)
async fn disconnect_ws_internal() {
    let shutdown_tx = {
        let mut state = WS_STATE.lock();
        state.should_reconnect = false;
        state.shutdown_tx.take()
    };

    if let Some(tx) = shutdown_tx {
        let _ = tx.send(()).await;
        // Give some time for the connection to close
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    }
}

/// Disconnect WebSocket connection
pub async fn disconnect_ws(app_handle: AppHandle) -> Result<(), String> {
    log::info!("Disconnecting WebSocket");
    disconnect_ws_internal().await;

    {
        let mut state = WS_STATE.lock();
        state.state = WsState::Disconnected;
        state.url.clear();
        state.reconnect_attempts = 0;
        state.last_error.clear();
    }

    emit_ws_status(&app_handle, &get_current_status());
    Ok(())
}

/// Get current WebSocket status
pub fn get_ws_status() -> WsStatus {
    get_current_status()
}

/// Reset reconnect attempts (call after network restored)
pub fn reset_reconnect_attempts() {
    let mut state = WS_STATE.lock();
    state.reconnect_attempts = 0;
}

// ============ Tauri Commands ============

/// Connect to agent WebSocket
#[tauri::command]
pub async fn ws_connect(app_handle: AppHandle, port: u16) -> Result<(), String> {
    connect_ws(app_handle, port).await
}

/// Disconnect from agent WebSocket
#[tauri::command]
pub async fn ws_disconnect(app_handle: AppHandle) -> Result<(), String> {
    disconnect_ws(app_handle).await
}

/// Get WebSocket status
#[tauri::command]
pub fn ws_get_status() -> WsStatus {
    get_ws_status()
}

/// Reset reconnect attempts
#[tauri::command]
pub fn ws_reset_reconnect() {
    reset_reconnect_attempts();
}
