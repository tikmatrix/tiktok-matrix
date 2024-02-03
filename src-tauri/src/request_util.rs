use std::error::Error;

use serde::de::DeserializeOwned;

use reqwest;

const URL: &str = "https://tiktok.niostack.com";

pub fn get_json<T: DeserializeOwned>(url_path: &str) -> Result<T, Box<dyn Error>> {
    let mut url = String::from(URL);
    if cfg!(debug_assertions) {
        url = String::from("http://localhost:8095");
    }
    let response = match reqwest::blocking::get(format!("{}{}", url, url_path)) {
        Ok(response) => response,
        Err(e) => {
            return Err(e.into());
        }
    };

    let text = response
        .text()
        .unwrap_or_else(|_| String::from("Failed to read response text"));
    let json: T = match serde_json::from_str(&text) {
        Ok(json) => json,
        Err(e) => {
            return Err(e.into());
        }
    };

    Ok(json)
}
