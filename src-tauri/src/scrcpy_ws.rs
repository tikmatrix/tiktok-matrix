use std::process::Stdio;

use byteorder::BigEndian;
use futures_util::sink::SinkExt;
use futures_util::StreamExt;
use std::io::Cursor;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::process::{Child, Command};
use tokio_tungstenite::accept_async;
use tokio_tungstenite::tungstenite::Message;

pub async fn start_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    while let Ok((stream, _)) = listener.accept().await {
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
        .creation_flags(0x08000000)
        .output()
        .await?;
    let output = String::from_utf8(output.stdout).unwrap();
    // check lines containing scrcpy
    let output = output.split('\n').collect::<Vec<&str>>();
    for line in output {
        // 394b4d4d37313098 tcp:55379 localabstract:scrcpy
        if line.starts_with(serial) && line.contains("localabstract:scrcpy") {
            let local_port = line.split(' ').collect::<Vec<&str>>()[1]
                .split(':')
                .collect::<Vec<&str>>()[1];
            return Ok(local_port.to_string());
        }
    }
    let output = Command::new("bin/platform-tools/adb.exe")
        .arg("-s")
        .arg(serial)
        .arg("forward")
        .arg("tcp:0")
        .arg("localabstract:scrcpy")
        .creation_flags(0x08000000)
        .output()
        .await?;
    Ok(String::from_utf8(output.stdout).unwrap())
}
// adb -s 394b4d4d37313098 shell CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / com.genymobile.scrcpy.Server 2.3.1 tunnel_forward=true audio=false control=true cleanup=false raw_stream=true max_size=720
async fn start_scrcpy_server(
    serial: &str,
    max_size: i16,
    control: &str,
) -> Result<Child, Box<dyn std::error::Error>> {
    //push scrcpy-server.jar to device
    Command::new("bin/platform-tools/adb.exe")
        .arg("-s")
        .arg(serial)
        .arg("push")
        .arg("bin/raw/scrcpy-server-v2.3.1")
        .arg("/data/local/tmp/scrcpy-server-manual.jar")
        .creation_flags(0x08000000)
        .output()
        .await?;
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
        .arg("log_level=info")
        .arg("power_on=true")
        .arg(format!("control={}", control))
        .arg("cleanup=true")
        .arg(format!("max_size={}", max_size))
        .arg("max_fps=50")
        .creation_flags(0x08000000)
        .stderr(Stdio::null())
        .stdout(Stdio::null())
        .spawn()
        .expect("Failed to start scrcpy server");

    Ok(child)
}
async fn connect_to_video_socket(
    serial: &str,
) -> Result<tokio::net::TcpStream, Box<dyn std::error::Error + Send + Sync>> {
    for _ in 0..10 {
        let local_port = adb_forward_scrcpy_serber(&serial).await.unwrap();
        // println!("local_port: {}", local_port);
        if local_port.is_empty() {
            tokio::time::sleep(std::time::Duration::from_secs(1000)).await;
            continue;
        }
        let local_url = format!("127.0.0.1:{}", local_port);
        // println!("connecting to scrcpy video server: {}", local_url);
        match tokio::net::TcpStream::connect(local_url.clone()).await {
            Ok(stream) => {
                let scrcpy_video_server = Some(stream);
                let mut scrcpy_video_server = match scrcpy_video_server {
                    Some(server) => server,
                    None => {
                        println!("Failed to connect: {}, retrying...", "None");
                        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                        continue;
                    }
                };
                let (mut read_socket, _) = scrcpy_video_server.split();

                // read one byte to check if scrcpy server is ready
                let mut buffer = [0; 1];
                let n = read_socket.read(&mut buffer).await.unwrap();
                if n > 0 {
                    return Ok(scrcpy_video_server);
                }
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                continue;
            }
            Err(e) => {
                println!("Failed to connect: {}, retrying...", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                continue;
            }
        }
    }
    Err("Failed to connect after 10 attempts".into())
}
async fn connect_to_control_socket(
    serial: &str,
) -> Result<tokio::net::TcpStream, Box<dyn std::error::Error + Send + Sync>> {
    let local_port = adb_forward_scrcpy_serber(&serial).await.unwrap();
    // println!("local_port: {}", local_port);
    if local_port.is_empty() {
        return Err("Failed to forward scrcpy server".into());
    }
    let local_url = format!("127.0.0.1:{}", local_port);
    // println!("connecting to scrcpy control server: {}", local_url);
    match tokio::net::TcpStream::connect(local_url.clone()).await {
        Ok(stream) => {
            let scrcpy_control_server = Some(stream);
            let scrcpy_control_server = match scrcpy_control_server {
                Some(server) => server,
                None => {
                    println!("Failed to connect: {}, retrying...", "None");
                    return Err("Failed to connect".into());
                }
            };
            // println!("connected to scrcpy control server");
            return Ok(scrcpy_control_server);
        }
        Err(e) => {
            println!("Failed to connect: {}, retrying...", e);
            return Err("Failed to connect".into());
        }
    }
}
async fn handle_connection(stream: tokio::net::TcpStream) {
    println!("new connection");
    let mut client_ws_stream = accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");
    // read serial from client
    let serial = client_ws_stream
        .next()
        .await
        .expect("Expected first message from client")
        .expect("Error reading first message from client");
    let serial = String::from_utf8(serial.into_data()).expect("Error parsing first message");
    // println!("serial: {}", serial);
    // read max size from client
    let max_size = client_ws_stream
        .next()
        .await
        .expect("Expected second message from client")
        .expect("Error reading second message from client");
    let max_size: i16 = String::from_utf8(max_size.into_data())
        .expect("Error parsing second message")
        .parse()
        .unwrap();
    // println!("max_size: {}", max_size);
    // read control from client
    let control = client_ws_stream
        .next()
        .await
        .expect("Expected third message from client")
        .expect("Error reading third message from client");
    let control = String::from_utf8(control.into_data()).expect("Error parsing third message");
    // println!("control: {}", control);

    let serial_clone = serial.clone();
    let control_clone = control.clone();
    tauri::async_runtime::spawn(async move {
        start_scrcpy_server(&serial_clone, max_size, &control_clone)
            .await
            .unwrap();
    });
    let (mut client_write, mut client_read) = client_ws_stream.split();

    let result = connect_to_video_socket(&serial).await;
    if result.is_err() {
        println!("Failed to connect after 10 attempts");
        return;
    }

    let mut scrcpy_video_server = result.unwrap();
    let (mut scrcpy_video_read_socket, _) = scrcpy_video_server.split();
    let mut scrcpy_control_server = None;
    if control == "true" {
        println!("control is true");
        let result = connect_to_control_socket(&serial).await;
        if result.is_err() {
            println!("Failed to connect to scrcpy control server");
            return;
        }
        scrcpy_control_server = Some(result.unwrap());
    }

    // read device name
    let mut buffer = [0; 64];
    let n = scrcpy_video_read_socket.read(&mut buffer).await.unwrap();
    let device_name = String::from_utf8_lossy(&buffer[..n]);
    //  read codec_id, width, height
    let mut buffer = [0; 12];
    let n = scrcpy_video_read_socket.read(&mut buffer).await.unwrap();
    let codec_id = u32::from_be_bytes([buffer[0], buffer[1], buffer[2], buffer[3]]);
    let width = u32::from_be_bytes([buffer[4], buffer[5], buffer[6], buffer[7]]);
    let height = u32::from_be_bytes([buffer[8], buffer[9], buffer[10], buffer[11]]);
    println!(
        "device_name: {}, codec_id: {}, width: {}, height: {}",
        device_name, codec_id, width, height
    );

    let client_to_server = async {
        while let Some(msg) = client_read.next().await {
            if scrcpy_control_server.is_none() {
                continue;
            }
            let msg = msg.expect("Error reading message from client");
            // println!("client_to_server: {:?}", msg);
            match msg {
                Message::Text(s) => {
                    let packet = match new_scrcpy_event(s, width, height) {
                        Some(value) => value,
                        None => continue,
                    };

                    // send to scrcpy server
                    let scrcpy_control_write_socket = scrcpy_control_server.as_mut().unwrap();
                    match scrcpy_control_write_socket.write_all(&packet).await {
                        Ok(_) => {
                            // println!(
                            //     "write to scrcpy server success - {:?} length: {}",
                            //     packet,
                            //     packet.len()
                            // );
                        }
                        Err(e) => {
                            println!("Error writing to scrcpy server: {}", e);
                            break;
                        }
                    }
                }
                _ => continue,
            };
        }
        // println!("client_to_server finished");
    };
    let server_to_client = async {
        let mut buffer = [0; 12];
        while let Ok(n) = scrcpy_video_read_socket.read(&mut buffer).await {
            if n == 0 {
                // scrcpy server has closed the connection
                println!("scrcpy server has closed the connection");
                break;
            }
            // println!("read {} bytes from scrcpy server", n);
            // let config_packet_flag = (buffer[0] & 0b1000_0000) != 0;
            // let key_frame_flag = (buffer[0] & 0b0100_0000) != 0;
            // let pts = u64::from_be_bytes([
            //     buffer[0] & 0b0011_1111, buffer[1], buffer[2], buffer[3], buffer[4], buffer[5], buffer[6], buffer[7],
            // ]);
            let packet_size = u32::from_be_bytes([buffer[8], buffer[9], buffer[10], buffer[11]]);
            // println!(
            //     "config_packet_flag: {}, key_frame_flag: {}, pts: {}, packet_size: {}",
            //     config_packet_flag, key_frame_flag, pts, packet_size
            // );

            // Now read the packet data
            let mut packet_data = vec![0; packet_size as usize];
            scrcpy_video_read_socket
                .read_exact(&mut packet_data)
                .await
                .unwrap();

            match client_write.send(Message::Binary(packet_data)).await {
                Ok(_) => {}
                Err(e) => {
                    println!("Failed to write to client's stdout: {}", e);
                    break;
                }
            }
        }
    };

    tokio::join!(client_to_server, server_to_client,);
    println!("connect finished");
}

fn new_scrcpy_event(event: String, width: u32, height: u32) -> Option<Vec<u8>> {
    let json: serde_json::Value = serde_json::from_str(&event).unwrap();
    let operation = json["operation"].as_str().unwrap();
    let action = match operation {
        "d" => 0,
        "m" => 2,
        "u" => 1,
        _ => return None,
    };
    let x = json["x"].as_i64().unwrap() as i32;
    let y = json["y"].as_i64().unwrap() as i32;
    let w = json["w"].as_i64().unwrap() as i16;
    let h = json["h"].as_i64().unwrap() as i16;
    let x = (x as f32 / w as f32 * width as f32) as i32;
    let y = (y as f32 / h as f32 * height as f32) as i32;
    let mut cursor = Cursor::new(Vec::new());
    byteorder::WriteBytesExt::write_u8(&mut cursor, 2).unwrap();
    byteorder::WriteBytesExt::write_u8(&mut cursor, action).unwrap();
    byteorder::WriteBytesExt::write_i64::<BigEndian>(&mut cursor, -42).unwrap();
    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, x).unwrap();
    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, y).unwrap();
    byteorder::WriteBytesExt::write_i16::<BigEndian>(&mut cursor, width as i16).unwrap();
    byteorder::WriteBytesExt::write_i16::<BigEndian>(&mut cursor, height as i16).unwrap();
    byteorder::WriteBytesExt::write_i16::<BigEndian>(&mut cursor, 1).unwrap();
    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, 1).unwrap();
    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, 1).unwrap();
    let packet = cursor.into_inner();
    Some(packet)
}

#[tokio::test]
pub async fn main() {
    start_server(7092).await.unwrap();
}
