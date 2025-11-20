use std::{
    path::PathBuf,
    time::{Duration, Instant},
};

use anyhow::{anyhow, Context, Result};
use chrono::Utc;
use futures_util::{SinkExt, StreamExt};
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};
use tokio::{fs, sync::mpsc, time::sleep};
use tokio_tungstenite::{connect_async, tungstenite::Message};

const STATUS_EVENT: &str = "agent://ws/status";
const MESSAGE_EVENT: &str = "agent://ws/message";
const PORT_WAIT_TIMEOUT_SECONDS: u64 = 30;

#[derive(Default)]
pub struct AgentWsCommandState {
    sender: tokio::sync::Mutex<Option<mpsc::Sender<String>>>,
    current_status: tokio::sync::Mutex<Value>,
}

impl AgentWsCommandState {
    pub async fn set_sender(&self, sender: Option<mpsc::Sender<String>>) {
        let mut guard = self.sender.lock().await;
        *guard = sender;
    }

    pub async fn set_status(&self, status: Value) {
        let mut guard = self.current_status.lock().await;
        *guard = status;
    }

    pub async fn get_status(&self) -> Value {
        let guard = self.current_status.lock().await;
        guard.clone()
    }

    pub async fn send(&self, payload: Value) -> Result<()> {
        let text = serde_json::to_string(&payload)?;
        log::info!("Sending ws message: {}", text);
        let sender = {
            let guard = self.sender.lock().await;
            guard.clone()
        };
        match sender {
            Some(tx) => match tx.send(text).await {
                Ok(_) => {
                    log::info!("agent ws send succeeded");
                }
                Err(err) => {
                    log::info!("agent ws send failed: {:?}", err);
                    return Err(anyhow!("agent ws send failed: {}", err));
                }
            },
            None => {
                log::info!("agent ws bridge not connected");
                return Err(anyhow!("agent ws bridge not connected"));
            }
        }
        Ok(())
    }
}

pub struct AgentWsBridge {
    app: AppHandle,
    port_file: PathBuf,
}

impl AgentWsBridge {
    pub fn spawn(app: AppHandle, port_file: PathBuf) {
        tauri::async_runtime::spawn(async move {
            let bridge = AgentWsBridge { app, port_file };
            bridge.run().await;
        });
    }

    async fn run(mut self) {
        loop {
            if let Err(err) = self.connect_once().await {
                log::warn!(
                    "agent ws bridge cycle finished with error: {}",
                    err.to_string()
                );
                self.emit_status("error", Some(json!({ "error": err.to_string() })));
                sleep(Duration::from_secs(2)).await;
            }
        }
    }

    async fn connect_once(&mut self) -> Result<()> {
        let ws_url = self.wait_for_ws_url().await?;
        self.emit_status("connecting", Some(json!({ "url": ws_url })));
        log::info!("connecting to agent ws: {}", ws_url);

        let (ws_stream, _) = connect_async(&ws_url)
            .await
            .with_context(|| format!("failed to connect to agent ws: {}", ws_url))?;

        let (mut write, mut read) = ws_stream.split();
        let (command_tx, mut command_rx) = mpsc::channel::<String>(64);
        self.update_command_sender(Some(command_tx.clone())).await;

        self.emit_status("connected", Some(json!({ "url": ws_url })));
        log::info!("connected to agent ws: {}", ws_url);

        let mut disconnect_payload = json!({ "graceful": false });

        loop {
            tokio::select! {
                maybe_msg = read.next() => {
                    match maybe_msg {
                        Some(Ok(Message::Text(text))) => self.handle_text_message(&text).await,
                        Some(Ok(Message::Binary(binary))) => {
                            log::debug!("agent ws binary message ({} bytes) ignored", binary.len());
                        }
                        Some(Ok(Message::Ping(_))) | Some(Ok(Message::Pong(_))) => {}
                        Some(Ok(Message::Frame(_))) => {}
                        Some(Ok(Message::Close(frame))) => {
                            let reason = frame
                                .map(|f| f.reason.to_string())
                                .unwrap_or_else(|| "remote closed".to_string());
                            disconnect_payload = json!({ "reason": reason, "graceful": true });
                            break;
                        }
                        Some(Err(err)) => {
                            log::warn!("agent ws receive error: {:?}", err);
                            self.emit_status("error", Some(json!({ "error": err.to_string() })));
                            disconnect_payload = json!({
                                "graceful": false,
                                "reason": err.to_string(),
                                "phase": "receive"
                            });
                            break;
                        }
                        None => {
                            disconnect_payload = json!({ "reason": "remote closed", "graceful": false });
                            break;
                        }
                    }
                }
                maybe_command = command_rx.recv() => {
                    match maybe_command {
                        Some(text) => {
                            if let Err(err) = write.send(Message::Text(text)).await {
                                log::warn!("agent ws send error: {:?}", err);
                                self.emit_status("error", Some(json!({ "error": err.to_string(), "phase": "send" })));
                                disconnect_payload = json!({
                                    "graceful": false,
                                    "reason": err.to_string(),
                                    "phase": "send"
                                });
                                break;
                            }
                        }
                        None => {
                            log::debug!("agent ws command channel closed");
                            break;
                        }
                    }
                }
            }
        }

        self.update_command_sender(None).await;
        log::info!("agent ws disconnected");
        self.emit_status("disconnected", Some(disconnect_payload));
        Ok(())
    }

    async fn update_command_sender(&self, sender: Option<mpsc::Sender<String>>) {
        match self.app.try_state::<AgentWsCommandState>() {
            Some(state) => state.set_sender(sender).await,
            None => log::warn!("AgentWsCommandState not registered"),
        }
    }

    async fn handle_text_message(&self, text: &str) {
        log::info!("agent ws received message: {}", text);
        let payload: Value = serde_json::from_str(text).unwrap_or_else(|_| {
            json!({
                "raw": text,
                "timestamp": Utc::now().timestamp_millis()
            })
        });
        self.emit_message(payload);
    }

    fn emit_message(&self, payload: Value) {
        if let Err(err) = self.app.emit_all(MESSAGE_EVENT, payload) {
            log::error!("failed to emit agent ws message event: {:?}", err);
        }
    }

    fn emit_status(&self, status: &str, extra: Option<Value>) {
        let payload = json!({
            "status": status,
            "timestamp": Utc::now().timestamp_millis(),
            "extra": extra
        });
        if let Err(err) = self.app.emit_all(STATUS_EVENT, payload.clone()) {
            log::error!("failed to emit agent ws status event: {:?}", err);
        }
        // Update stored status
        let app = self.app.clone();
        tauri::async_runtime::spawn(async move {
            match app.try_state::<AgentWsCommandState>() {
                Some(state) => state.set_status(payload).await,
                None => log::warn!("AgentWsCommandState not registered"),
            }
        });
    }

    async fn wait_for_ws_url(&self) -> Result<String> {
        let start = Instant::now();
        loop {
            match self.try_build_ws_url().await {
                Ok(Some(url)) => return Ok(url),
                Ok(None) => {}
                Err(err) => {
                    log::debug!("failed to read ws port: {:?}", err);
                }
            }
            if start.elapsed() >= Duration::from_secs(PORT_WAIT_TIMEOUT_SECONDS) {
                return Err(anyhow!(
                    "Timed out waiting for agent websocket port after {} seconds",
                    PORT_WAIT_TIMEOUT_SECONDS
                ));
            }
            sleep(Duration::from_secs(1)).await;
        }
    }

    async fn try_build_ws_url(&self) -> Result<Option<String>> {
        let content = match fs::read_to_string(&self.port_file).await {
            Ok(content) => content,
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(err) => return Err(err.into()),
        };
        let port = content.trim();
        if port.is_empty() || port == "0" {
            return Ok(None);
        }
        Ok(Some(format!("ws://127.0.0.1:{}", port)))
    }
}
