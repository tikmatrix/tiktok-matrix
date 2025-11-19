use std::{path::PathBuf, time::Duration};

use anyhow::{Context, Result};
use chrono::Utc;
use futures_util::StreamExt;
use serde_json::{json, Value};
use tauri::{AppHandle, Manager};
use tokio::{fs, time::sleep};
use tokio_tungstenite::{connect_async, tungstenite::Message};

const STATUS_EVENT: &str = "agent://ws/status";
const MESSAGE_EVENT: &str = "agent://ws/message";

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
                log::warn!("agent ws bridge cycle finished with error: {:?}", err);
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

        self.emit_status("connected", Some(json!({ "url": ws_url })));
        log::info!("connected to agent ws: {}", ws_url);
        let (_write, mut read) = ws_stream.split();

        while let Some(message) = read.next().await {
            match message {
                Ok(Message::Text(text)) => self.handle_text_message(&text).await,
                Ok(Message::Binary(binary)) => {
                    log::debug!("agent ws binary message ({} bytes) ignored", binary.len());
                }
                Ok(Message::Ping(_)) | Ok(Message::Pong(_)) => {
                    // no-op
                }
                Ok(Message::Frame(_)) => {
                    // reserved for internal use, ignore
                }
                Ok(Message::Close(frame)) => {
                    let reason = frame
                        .map(|f| f.reason.to_string())
                        .unwrap_or_else(|| "remote closed".to_string());
                    self.emit_status(
                        "disconnected",
                        Some(json!({ "reason": reason, "graceful": true })),
                    );
                    break;
                }
                Err(err) => {
                    log::warn!("agent ws receive error: {:?}", err);
                    self.emit_status("error", Some(json!({ "error": err.to_string() })));
                    break;
                }
            }
        }

        // ensure we notify listeners if loop exits without close frame
        self.emit_status("disconnected", Some(json!({ "graceful": false })));
        Ok(())
    }

    async fn handle_text_message(&self, text: &str) {
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
        if let Err(err) = self.app.emit_all(STATUS_EVENT, payload) {
            log::error!("failed to emit agent ws status event: {:?}", err);
        }
    }

    async fn wait_for_ws_url(&self) -> Result<String> {
        loop {
            match self.try_build_ws_url().await {
                Ok(Some(url)) => return Ok(url),
                Ok(None) => {}
                Err(err) => {
                    log::debug!("failed to read ws port: {:?}", err);
                }
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
