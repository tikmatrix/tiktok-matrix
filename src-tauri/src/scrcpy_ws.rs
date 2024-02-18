use std::process::Stdio;

use futures_util::sink::SinkExt;
use futures_util::StreamExt;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::process::{Child, Command};
use tokio::time::{sleep, Duration};
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;

pub async fn start_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    while let Ok((stream, _)) = listener.accept().await {
        println!("new connection");
        tokio::spawn(handle_connection(stream));
    }
    Ok(())
}
async fn adb_forward_scrcpy_serber(serial: &str) -> Result<String, Box<dyn std::error::Error>> {
    //check if already forwarded
    let output = Command::new("bin/platform-tools/adb.exe")
        .arg("-s")
        .arg(serial)
        .arg("forward")
        .arg("--list")
        .output()
        .await?;
    let output = String::from_utf8(output.stdout).unwrap();
    if output.contains("localabstract:scrcpy") {
        return Ok(output
            .split("tcp:")
            .last()
            .unwrap()
            .split_whitespace()
            .next()
            .map(|s| s.to_string())
            .unwrap());
    } else {
        println!("forwarding scrcpy server");
    }
    let output = Command::new("bin/platform-tools/adb.exe")
        .arg("-s")
        .arg(serial)
        .arg("forward")
        .arg("tcp:0")
        .arg("localabstract:scrcpy")
        .output()
        .await?;
    Ok(String::from_utf8(output.stdout).unwrap())
}

async fn start_scrcpy_server(serial: &str) -> Result<Child, Box<dyn std::error::Error>> {
    let child = Command::new("bin/platform-tools/adb.exe")
        .arg("-s")
        .arg(serial)
        .arg("shell")
        .arg("CLASSPATH=/data/local/tmp/scrcpy-server-manual.jar")
        .arg("app_process")
        .arg("/")
        .arg("com.genymobile.scrcpy.Server")
        .arg("2.3.1")
        .arg("tunnel_forward=true")
        .arg("audio=false")
        .arg("control=false")
        .arg("cleanup=false")
        .arg("raw_stream=true")
        .arg("max_size=1920")
        .spawn()
        .expect("Failed to start scrcpy server");

    Ok(child)
}

async fn handle_connection(stream: tokio::net::TcpStream) {
    let mut client_ws_stream = accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");

    let url_msg = client_ws_stream
        .next()
        .await
        .expect("Expected first message from client")
        .expect("Error reading first message from client");
    let serial = String::from_utf8(url_msg.into_data()).expect("Error parsing first message");
    println!("serial: {}", serial);
    let local_port = adb_forward_scrcpy_serber(&serial).await.unwrap();
    println!("local_port: {}", local_port);
    let serial_clone = serial.clone();
    tauri::async_runtime::spawn(async move {
        start_scrcpy_server(&serial_clone).await.unwrap();
    });
    println!("scrcpy server started");
    //sleep for a while to wait for scrcpy server to start
    sleep(Duration::from_secs(1)).await;
    let (mut client_write, mut client_read) = client_ws_stream.split();
    //connect to scrcpy server
    let local_url = format!("127.0.0.1:{}", local_port);
    println!("connecting to scrcpy server: {}", local_url);

    let mut scrcpy_server = tokio::net::TcpStream::connect(local_url.clone())
        .await
        .unwrap();

    println!("connected to scrcpy server");
    let (mut scrcpy_read, mut scrcpy_write) = scrcpy_server.split();

    let mut ffmpeg = start_ffmpeg();

    let client_to_server = async {
        while let Some(msg) = client_read.next().await {
            let msg = msg.expect("Error reading message from client");
            match scrcpy_write.write_all(&msg.into_data()).await {
                Ok(_) => {}
                Err(e) => {
                    println!("Error writing to scrcpy server: {}", e);
                    break;
                }
            }
        }
        println!("client_to_server finished");
    };
    let server_to_ffmpeg = async {
        println!("server_to_ffmpeg started");
        let mut buffer = [0; 1024 * 10];
        while let Ok(n) = scrcpy_read.read(&mut buffer).await {
            if n == 0 {
                //sleep for a while to prevent busy loop
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                continue;
            }
            // println!("read {} bytes from scrcpy server", n);
            match ffmpeg
                .stdin
                .as_mut()
                .expect("Failed to open stdin")
                .write_all(&buffer[..n])
                .await
            {
                Ok(_) => {}
                Err(e) => {
                    println!("Error writing to ffmpeg: {}", e);
                    break;
                }
            }
        }
        println!("server_to_ffmpeg finished")
    };
    let ffmpeg_to_client = async {
        println!("ffmpeg_to_client started");
        let mut buffer = vec![0; 1024 * 10];
        let mut image_buffer = vec![];
        let mut stdout = ffmpeg.stdout.take().expect("Failed to open stdout");
        while let Ok(n) = stdout.read(&mut buffer).await {
            if n == 0 {
                //sleep for a while to prevent busy loop
                tokio::time::sleep(std::time::Duration::from_millis(100)).await;
                continue;
            }
            // check buffer for jpeg start and end
            let mut end = 0;
            for i in 0..n - 1 {
                if buffer[i] == 0xff && buffer[i + 1] == 0xd9 {
                    end = i + 2;
                    // println!("fond end at {}", end);
                    break;
                }
            }
            if end > 0 {
                image_buffer.extend_from_slice(&buffer[..end]);
                match client_write
                    .send(Message::binary(image_buffer.to_vec()))
                    .await
                {
                    Ok(_) => {}
                    Err(e) => {
                        println!("Error writing to client: {}", e);
                        break;
                    }
                }
                image_buffer.clear();
                buffer.copy_within(end..n, 0);
            } else {
                image_buffer.extend_from_slice(&buffer[..n]);
            }
        }
        println!("ffmpeg_to_client finished")
    };

    tokio::join!(client_to_server, server_to_ffmpeg, ffmpeg_to_client,);
}

fn start_ffmpeg() -> Child {
    let ffmpeg = Command::new("bin/ffmpeg.exe")
        .arg("-hwaccel")
        .arg("auto") // 自动选择最佳的硬件加速方法
        .arg("-i")
        .arg("-")
        .arg("-f")
        .arg("image2pipe")
        .arg("-c:v")
        .arg("mjpeg")
        .arg("-")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start FFmpeg");
    ffmpeg
}
#[tokio::test]
pub async fn main() {
    start_server(8092).await.unwrap();
}
