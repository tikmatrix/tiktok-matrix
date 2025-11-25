/// Get single storage item
#[tauri::command]
pub fn get_storage_item(app: tauri::AppHandle, key: String) -> Result<Option<String>, String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let storage_path = work_dir.join("data").join("app_state.json");

    if !storage_path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&storage_path).map_err(|e| e.to_string())?;
    if content.trim().is_empty() {
        return Ok(None);
    }

    let store: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    if let Some(value) = store.get(&key) {
        if value.is_null() {
            return Ok(None);
        }
        Ok(Some(value.as_str().unwrap_or("").to_string()))
    } else {
        Ok(None)
    }
}

/// Set single storage item
#[tauri::command]
pub fn set_storage_item(app: tauri::AppHandle, key: String, value: String) -> Result<(), String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let data_dir = work_dir.join("data");
    let storage_path = data_dir.join("app_state.json");

    // Ensure data directory exists
    std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;

    // Load existing store or create new one
    let mut store: serde_json::Map<String, serde_json::Value> = if storage_path.exists() {
        let content = std::fs::read_to_string(&storage_path).map_err(|e| e.to_string())?;
        if content.trim().is_empty() {
            serde_json::Map::new()
        } else {
            serde_json::from_str(&content).unwrap_or_else(|_| serde_json::Map::new())
        }
    } else {
        serde_json::Map::new()
    };

    // Update the value
    store.insert(key, serde_json::Value::String(value));

    // Write back to file
    let json_str = serde_json::to_string_pretty(&store).map_err(|e| e.to_string())?;
    std::fs::write(&storage_path, json_str).map_err(|e| e.to_string())?;

    Ok(())
}

/// Remove single storage item
#[tauri::command]
pub fn remove_storage_item(app: tauri::AppHandle, key: String) -> Result<(), String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let storage_path = work_dir.join("data").join("app_state.json");

    if !storage_path.exists() {
        return Ok(());
    }

    let content = std::fs::read_to_string(&storage_path).map_err(|e| e.to_string())?;
    if content.trim().is_empty() {
        return Ok(());
    }

    let mut store: serde_json::Map<String, serde_json::Value> =
        serde_json::from_str(&content).unwrap_or_else(|_| serde_json::Map::new());

    store.remove(&key);

    let json_str = serde_json::to_string_pretty(&store).map_err(|e| e.to_string())?;
    std::fs::write(&storage_path, json_str).map_err(|e| e.to_string())?;

    Ok(())
}

/// Clear all storage
#[tauri::command]
pub fn clear_storage(app: tauri::AppHandle) -> Result<(), String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let storage_path = work_dir.join("data").join("app_state.json");

    let empty_store = serde_json::Map::new();
    let json_str = serde_json::to_string_pretty(&empty_store).map_err(|e| e.to_string())?;
    std::fs::write(&storage_path, json_str).map_err(|e| e.to_string())?;

    Ok(())
}

/// Get all storage keys
#[tauri::command]
pub fn get_all_storage_keys(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let storage_path = work_dir.join("data").join("app_state.json");

    if !storage_path.exists() {
        return Ok(Vec::new());
    }

    let content = std::fs::read_to_string(&storage_path).map_err(|e| e.to_string())?;
    if content.trim().is_empty() {
        return Ok(Vec::new());
    }

    let store: serde_json::Map<String, serde_json::Value> =
        serde_json::from_str(&content).unwrap_or_else(|_| serde_json::Map::new());

    Ok(store.keys().cloned().collect())
}

/// Get all storage data as snapshot
#[tauri::command]
pub fn get_storage_snapshot(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let storage_path = work_dir.join("data").join("app_state.json");

    if !storage_path.exists() {
        return Ok(serde_json::json!({}));
    }

    let content = std::fs::read_to_string(&storage_path).map_err(|e| e.to_string())?;
    if content.trim().is_empty() {
        return Ok(serde_json::json!({}));
    }

    let store: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(store)
}

/// Generic settings file read function
#[tauri::command]
pub fn read_settings_file_generic(
    app: tauri::AppHandle,
    filename: String,
) -> Result<String, String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let settings_path = work_dir.join("data").join(filename);

    match std::fs::read_to_string(&settings_path) {
        Ok(content) => Ok(content),
        Err(_) => Ok("{}".to_string()), // Return empty JSON object if file doesn't exist
    }
}

/// Generic settings file write function
#[tauri::command]
pub fn write_settings_file_generic(
    app: tauri::AppHandle,
    filename: String,
    content: String,
) -> Result<(), String> {
    let work_dir = app.path_resolver().app_data_dir().unwrap();
    let data_dir = work_dir.join("data");
    let settings_path = data_dir.join(filename);

    // Ensure data directory exists
    std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;

    std::fs::write(&settings_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

/// Read account warmup settings (backward compatible)
#[tauri::command]
pub fn read_settings_file(app: tauri::AppHandle) -> Result<String, String> {
    read_settings_file_generic(app, "account_warmup_settings.json".to_string())
}

/// Write account warmup settings (backward compatible)
#[tauri::command]
pub fn write_settings_file(app: tauri::AppHandle, content: String) -> Result<(), String> {
    write_settings_file_generic(app, "account_warmup_settings.json".to_string(), content)
}

/// Read post settings (backward compatible)
#[tauri::command]
pub fn read_post_settings_file(app: tauri::AppHandle) -> Result<String, String> {
    read_settings_file_generic(app, "post_settings.json".to_string())
}

/// Write post settings (backward compatible)
#[tauri::command]
pub fn write_post_settings_file(app: tauri::AppHandle, content: String) -> Result<(), String> {
    write_settings_file_generic(app, "post_settings.json".to_string(), content)
}
