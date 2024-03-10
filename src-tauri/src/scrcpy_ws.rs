use std::arch::x86_64;
use std::process::Stdio;

use byteorder::BigEndian;
use futures_util::sink::SinkExt;
use futures_util::StreamExt;
use std::io::Cursor;
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
        .output()
        .await?;
    Ok(String::from_utf8(output.stdout).unwrap())
}
// adb -s 394b4d4d37313098 shell CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / com.genymobile.scrcpy.Server 2.3.1 tunnel_forward=true audio=false control=true cleanup=false raw_stream=true max_size=720
async fn start_scrcpy_server(serial: &str) -> Result<Child, Box<dyn std::error::Error>> {
    //push scrcpy-server.jar to device
    Command::new("bin/platform-tools/adb.exe")
        .arg("-s")
        .arg(serial)
        .arg("push")
        .arg("bin/scrcpy-server-v2.3.1")
        .arg("/data/local/tmp/scrcpy-server-manual.jar")
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
        .arg("control=true")
        .arg("cleanup=true")
        .arg("max_size=800")
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
    
    let serial_clone = serial.clone();
    tauri::async_runtime::spawn(async move {
        start_scrcpy_server(&serial_clone).await.unwrap();
    });
    tokio::time::sleep(std::time::Duration::from_millis(3000)).await;
    let local_port = adb_forward_scrcpy_serber(&serial).await.unwrap();
    println!("local_port: {}", local_port);
    println!("scrcpy server started");
    let (mut client_write, mut client_read) = client_ws_stream.split();
    let local_url = format!("127.0.0.1:{}", local_port);
    //connect to scrcpy video server
    println!("connecting to scrcpy video server: {}", local_url);
    let mut scrcpy_video_server = None;
    for _ in 0..100 {
        match tokio::net::TcpStream::connect(local_url.clone()).await {
            Ok(stream) => {
                scrcpy_video_server = Some(stream);
                break;
            }
            Err(e) => {
                println!("Failed to connect: {}, retrying...", e);
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                continue;
            }
        }
    }

    let mut scrcpy_video_server = match scrcpy_video_server {
        Some(server) => server,
        None => {
            println!("Failed to connect after 10 attempts");
            return;
        }
    };
    let (mut scrcpy_video_read, _) = scrcpy_video_server.split();
    println!("connected to scrcpy video server");
    
    //connect to scrcpy control server
    println!("connecting to scrcpy control server: {}", local_url);
    let mut scrcpy_control_server = tokio::net::TcpStream::connect(local_url).await.unwrap();
    let (_, mut scrcpy_control_write) = scrcpy_control_server.split();
    println!("connected to scrcpy control server");

    let mut ffmpeg = start_ffmpeg();
    // read one byte to check if scrcpy server is ready
    let mut buffer = [0; 1];
    let n = scrcpy_video_read.read(&mut buffer).await.unwrap();
    println!("read {} bytes from scrcpy video server for test!", n);
    // read device name
    let mut buffer = [0; 64];
    let n = scrcpy_video_read.read(&mut buffer).await.unwrap();
    println!("read {} bytes from scrcpy video server", n);
    let device_name = String::from_utf8_lossy(&buffer[..n]);
    println!("device_name: {}", device_name);
    //  read codec_id, width, height
    let mut buffer = [0; 12];
    let n = scrcpy_video_read.read(&mut buffer).await.unwrap();
    println!("read {} bytes from scrcpy video server", n);
    let codec_id = u32::from_be_bytes([buffer[0], buffer[1], buffer[2], buffer[3]]);
    let width = u32::from_be_bytes([buffer[4], buffer[5], buffer[6], buffer[7]]);
    let height = u32::from_be_bytes([buffer[8], buffer[9], buffer[10], buffer[11]]);
    println!(
        " codec_id: {}, width: {}, height: {}",
        codec_id, width, height
    );
    let client_to_server = async {
        while let Some(msg) = client_read.next().await {
            let msg = msg.expect("Error reading message from client");
            println!("client_to_server: {:?}", msg);
            //convert minitouch message to scrcpy server message
            match msg {
                Message::Text(s) => {
                    let json: serde_json::Value = serde_json::from_str(&s).unwrap();
                    let operation = json["operation"].as_str().unwrap();
                    let action = match operation {
                        "d" => 0,
                        "m" => 2,
                        "u" => 1,
                        _ => continue,
                    };

                    let x = json["x"].as_i64().unwrap() as i32;
                    let y = json["y"].as_i64().unwrap() as i32;
                    let w = json["w"].as_i64().unwrap() as i16;
                    let h = json["h"].as_i64().unwrap() as i16;
                    // rescale x, y to scrcpy server's coordinate
                    let x = (x as f32 / w as f32 * width as f32) as i32;
                    let y = (y as f32 / h as f32 * height as f32) as i32;
                    println!("x: {}, y: {}", x, y);
                    let mut cursor = Cursor::new(Vec::new());
                    // dos.writeByte(ControlMessage.TYPE_INJECT_TOUCH_EVENT);
                    byteorder::WriteBytesExt::write_u8(&mut cursor, 2).unwrap();
                    // dos.writeByte(MotionEvent.ACTION_DOWN);
                    byteorder::WriteBytesExt::write_u8(&mut cursor, action).unwrap();
                    // dos.writeLong(-42); // pointerId
                    byteorder::WriteBytesExt::write_i64::<BigEndian>(&mut cursor, -1).unwrap();
                    // dos.writeInt(100);//x
                    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, x).unwrap();
                    // dos.writeInt(200);//y
                    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, y).unwrap();
                    // dos.writeShort(1080);//width
                    byteorder::WriteBytesExt::write_i16::<BigEndian>(&mut cursor, width as i16).unwrap();
                    // dos.writeShort(1920);//height
                    byteorder::WriteBytesExt::write_i16::<BigEndian>(&mut cursor, height as i16).unwrap();
                    // dos.writeShort(0xffff); // pressure
                    byteorder::WriteBytesExt::write_i16::<BigEndian>(&mut cursor, 1).unwrap();
                    // dos.writeInt(MotionEvent.BUTTON_PRIMARY); // action button
                    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, 1).unwrap();
                    // dos.writeInt(MotionEvent.BUTTON_PRIMARY); // buttons
                    byteorder::WriteBytesExt::write_i32::<BigEndian>(&mut cursor, 1).unwrap();

                    let packet = cursor.into_inner();

                    // send to scrcpy server
                    match scrcpy_control_write.write_all(&packet).await {
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
        println!("client_to_server finished");
    };
    let server_to_ffmpeg = async {
        
        println!("server_to_ffmpeg started");
        let mut buffer = [0; 12];
        while let Ok(n) = scrcpy_video_read.read(&mut buffer).await {
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
            scrcpy_video_read.read_exact(&mut packet_data).await.unwrap();

            // Now you can write the packet data to ffmpeg's stdin
            match ffmpeg.stdin.as_mut() {
                Some(stdin) => {
                    match stdin.write_all(&packet_data).await {
                        Ok(_) => {},
                        Err(e) => {
                            println!("Failed to write to ffmpeg's stdin: {}", e);
                            break;
                        }
                    }
                }
                None => {
                    println!("Failed to get ffmpeg's stdin");
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
        .arg("-hwaccel_output_format")
        .arg("qsv") // 自动选择最佳的硬件加速方法
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
    start_server(7092).await.unwrap();
}
