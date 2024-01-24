use futures_util::sink::SinkExt;
use futures_util::StreamExt;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::connect_async;

pub async fn start_server(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection(stream));
    }
    Ok(())
}

async fn handle_connection(stream: tokio::net::TcpStream) {
    let mut client_ws_stream = accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");
    let url_msg = client_ws_stream
        .next()
        .await
        .expect("Expected URL message from client")
        .expect("Error reading URL message from client");
    let local_url = String::from_utf8(url_msg.into_data()).expect("Error parsing URL message");
    let (server_ws_stream, _) = connect_async(&local_url).await.expect("Failed to connect");

    let (mut client_write, mut client_read) = client_ws_stream.split();
    let (mut server_write, mut server_read) = server_ws_stream.split();

    let client_to_server = async {
        while let Some(message) = client_read.next().await {
            match message {
                Ok(message) => match server_write.send(message).await {
                    Ok(_) => {}
                    Err(_) => {
                        break;
                    }
                },
                Err(e) => {
                    break;
                }
            }
        }
    };

    let server_to_client = async {
        while let Some(message) = server_read.next().await {
            match message {
                Ok(message) => match client_write.send(message).await {
                    Ok(_) => {}
                    Err(_) => {
                        break;
                    }
                },
                Err(e) => {
                    break;
                }
            }
        }
    };

    tokio::join!(client_to_server, server_to_client);
}
