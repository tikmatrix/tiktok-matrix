use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct DistributorInfo {
    pub code: String,
    pub is_bound: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DistributorReportRequest {
    pub distributor_code: String,
    pub app_version: String,
    pub os_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DistributorReportResponse {
    pub code: i32,
    pub data: Option<DistributorReportData>,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DistributorReportData {
    pub distributor_code: String,
    pub already_bound: bool,
    pub install_time: String,
}

/// 获取编译时嵌入的分发商代码
pub fn get_embedded_distributor_code() -> String {
    env!("DISTRIBUTOR_CODE").to_string()
}

/// 上报安装信息到后端
pub async fn report_install(
    machine_id: &str,
    app_id: &str,
    app_version: &str,
) -> Result<DistributorReportResponse, String> {
    let distributor_code = get_embedded_distributor_code();

    // 获取操作系统版本
    let os_version = get_os_version_internal();

    // 获取 agent 的端口
    let work_dir = std::env::var("MATRIX_APP_WORK_DIR").unwrap_or_else(|_| "".to_string());
    let port_file = format!("{}/port.txt", work_dir);
    let port = std::fs::read_to_string(&port_file).unwrap_or_else(|_| "3344".to_string());

    let api_url = format!(
        "http://127.0.0.1:{}/api/report_distributor_install",
        port.trim()
    );

    let request_body = DistributorReportRequest {
        distributor_code: distributor_code.clone(),
        app_version: app_version.to_string(),
        os_version,
    };

    let client = reqwest::Client::new();
    let response = client
        .post(&api_url)
        .header("X-Machine-Id", machine_id)
        .header("X-App-Id", app_id)
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    let status = response.status();
    let text = response
        .text()
        .await
        .unwrap_or_else(|_| String::from("Failed to read response"));

    if !status.is_success() {
        return Err(format!("Request failed with status {}: {}", status, text));
    }

    // 解析 agent 返回的 CommonResponse
    #[derive(serde::Deserialize)]
    struct CommonResponse {
        code: i32,
        data: String,
    }

    let common_response: CommonResponse =
        serde_json::from_str(&text).map_err(|e| format!("Failed to parse response: {}", e))?;

    if common_response.code != 0 {
        return Err(format!("API error: {}", common_response.data));
    }

    // 解析内部的 data 字段
    let result: DistributorReportResponse = serde_json::from_str(&common_response.data)
        .map_err(|e| format!("Failed to parse inner data: {}", e))?;

    Ok(result)
}

/// 获取操作系统版本信息 (导出为 Tauri 命令)
#[tauri::command]
pub fn get_os_version() -> String {
    get_os_version_internal()
}

/// 内部获取操作系统版本信息
fn get_os_version_internal() -> String {
    #[cfg(target_os = "windows")]
    {
        format!("Windows {}", std::env::consts::ARCH)
    }
    #[cfg(target_os = "macos")]
    {
        format!("macOS {}", std::env::consts::ARCH)
    }
    #[cfg(target_os = "linux")]
    {
        format!("Linux {}", std::env::consts::ARCH)
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        "Unknown".to_string()
    }
}
