# Update Flow Documentation

## Overview

This document describes the optimized update flow for both application updates (Tauri) and library updates (agent, script, platform-tools, etc.).

## Architecture

### Frontend Components

#### 1. Update Manager Composable (`src/composables/useUpdateManager.js`)

A Vue 3 composable that manages all update-related state and operations:

**State Management:**
- `tauriUpdateAvailable`: Boolean indicating if a Tauri app update is available
- `tauriUpdateInfo`: Object containing update details (version, date, body)
- `checkingUpdates`: Boolean for update check progress
- `downloadingUpdate`: Boolean for download progress
- `installingUpdate`: Boolean for installation progress
- `downloadProgress`: Object tracking download progress (filesize, transferred, rate, percentage)

**Key Methods:**
- `checkForUpdates(options)`: Check for updates with flexible options
- `installTauriUpdate()`: Install Windows app update and relaunch
- `setTauriUpdateInfo(info)`: Update available update information
- `clearUpdateState()`: Reset update state
- `updateDownloadProgress(progress)`: Update download progress
- `resetDownloadProgress()`: Reset progress to zero

**Usage Example:**
```javascript
import { useUpdateManager } from '@/composables/useUpdateManager';

export default {
  setup() {
    const updateManager = useUpdateManager();
    return { updateManager };
  },
  methods: {
    async checkUpdate() {
      await this.updateManager.checkForUpdates({
        silent: false,
        checkTauriUpdate: true,
        checkLibraries: true
      });
    }
  }
}
```

#### 2. TitleBar Component (`src/components/TitleBar.vue`)

Manages the UI for update checks and initiates update processes:

**Key Methods:**
- `check_update(options)`: Main entry point for update checks
- `parseCheckUpdateArgs(arg)`: Parse update check arguments (supports legacy and new formats)
- `handleInitializationError(result, silent)`: Handle various initialization errors with appropriate UI
- `handleUpdateConfirm()`: Handle user confirmation of update
- `performWindowsUpdate()`: Install update on Windows
- `performMacUpdate()`: Open download page on macOS

**Backward Compatibility:**
```javascript
// Legacy format (still supported)
this.check_update(true);  // silent mode

// New format (recommended)
this.check_update({
  silent: false,
  checkTauriUpdate: true,
  checkLibraries: true
});
```

#### 3. Update Dialog (`src/components/dialogs/UpdateDialog.vue`)

Beautiful dialog showing update information with:
- Current vs new version comparison
- Markdown-rendered release notes (sanitized with DOMPurify)
- Platform-specific messages and actions
- Security: Strict XSS protection with URL protocol validation

### Backend Components

#### 1. Update Manager (`src-tauri/src/update_manager.rs`)

**Key Functions:**

- `check_libs_update()`: Check for library updates from remote server
- `get_local_lib_version()`: Get installed library version
- `save_local_lib_version()`: Save library version after update
- `check_lib_file_exists()`: Verify library file existence
- `download_lib_file()`: Download library file to temp directory
- `install_lib_file()`: Install downloaded library with retry logic
- `process_lib_update()`: Process single library update (download + install)
- `check_tauri_update()`: Check for Tauri application updates
- `install_and_relaunch_update()`: Install app update and restart

**Helper Functions (Refactored):**
- `reset_port_files()`: Reset port.txt, wsport.txt, wssport.txt to avoid conflicts
- `kill_agent_and_script()`: Kill agent/script processes and reset ports

**Benefits:**
- Reduced code duplication (port reset logic extracted)
- Better error handling with retry mechanism
- Clearer separation of concerns

#### 2. Auto Update Manager (`src-tauri/src/auto_update_manager.rs`)

**Key Functions:**

- `start_auto_update_timer()`: Start background timer for automatic updates
- `can_auto_update()`: Check all conditions for auto-update (refactored)
- `should_check_for_update()`: Check if enough time elapsed since last check
- `is_system_idle()`: Check if system has been idle for threshold duration
- `is_script_running()`: Check if automation script is currently running
- `check_has_running_tasks()`: Query agent for running tasks
- `update_user_activity()`: Update user activity timestamp
- `update_last_check()`: Update last check timestamp

**Auto-Update Conditions:**
All conditions must be met for auto-update to proceed:
1. Auto-update is enabled in config
2. System is idle (no user activity for threshold time)
3. No automation script is running
4. Enough time has elapsed since last check
5. No tasks are running (queried from agent)

**Refactoring Benefits:**
- Cleaner, more readable code
- Single function (`can_auto_update`) checks all conditions
- Easier to maintain and extend
- Better logging for debugging

#### 3. Process Manager (`src-tauri/src/process_manager.rs`)

**Key Functions:**

- `initialize_app()`: Main initialization routine
  1. Check Tauri app updates (if requested and not silent)
  2. Check library updates (agent, script, platform-tools, etc.)
  3. Start agent process if not running
  4. Report distributor installation

**Initialization Options:**
```rust
pub struct InitOptions {
    pub check_updates: bool,        // Check for library updates
    pub silent: bool,                // Silent mode (no UI)
    pub check_libs_url: String,     // Custom update check URL
    pub check_tauri_update: bool,   // Check for app updates
}
```

## Update Flow

### 1. Manual Update Check

```
User clicks version button
    ↓
TitleBar.check_update()
    ↓
useUpdateManager.checkForUpdates()
    ↓
invoke('initialize_app', options)
    ↓
[Rust] process_manager::initialize_app()
    ↓
├─ [Optional] Check Tauri app update
│  └─ update_manager::check_tauri_update()
│      └─ Returns TauriUpdateInfo
│
├─ Check library updates
│  └─ update_manager::check_libs_update()
│      └─ Returns list of libraries to update
│  └─ For each library:
│      └─ update_manager::process_lib_update()
│          ├─ Compare versions
│          ├─ download_lib_file()
│          ├─ install_lib_file()
│          └─ save_local_lib_version()
│
└─ Start agent if not running
   └─ process_manager::start_agent_process()

[Result returned to frontend]
    ↓
If Tauri update available:
    Show UpdateDialog
    ↓
    User confirms
    ↓
    performWindowsUpdate() or performMacUpdate()
    ↓
    [Windows] installTauriUpdate()
        ├─ Listen to download progress
        ├─ Download and install update
        └─ Relaunch application
    
    [Mac] Open download page in browser
```

### 2. Automatic Update Check

```
Timer tick (every check_interval_minutes)
    ↓
can_auto_update() checks conditions:
    ├─ Is auto-update enabled?
    ├─ Is system idle?
    ├─ Is script NOT running?
    ├─ Enough time since last check?
    └─ No tasks running?
    ↓
All conditions met?
    ↓ Yes
update_manager::check_tauri_update()
    ↓
Emit 'TAURI_UPDATE_STATUS' event
    ↓
Frontend receives event
    ↓
useUpdateManager.setTauriUpdateInfo()
    ↓
Red badge appears on version button
    ↓
User can click to see UpdateDialog
```

## Error Handling

### Frontend Errors

The `handleInitializationError` method handles various error types:

1. **Port 50809 occupied**: Agent port is in use by another process
2. **Missing VC Runtime**: Visual C++ Redistributable not installed (Windows)
3. **Agent not found**: Agent binary not found
4. **Timeout**: Agent failed to start within timeout

### Backend Errors

Errors are logged and emitted as events via the `UPDATE_STATUS` event.

## Security Considerations

The UpdateDialog component renders Markdown release notes with strict security:
- DOMPurify sanitization with whitelist
- Safe URL protocols only (https, http, mailto, tel)
- All links get `rel="noopener noreferrer"` and `target="_blank"`
- DOMParser for safer HTML handling

## Best Practices

1. **Always check update conditions** before triggering updates
2. **Use silent mode** for background checks
3. **Handle all error cases** with appropriate UI feedback
4. **Test on all platforms** (Windows, Mac)
5. **Keep backward compatibility** when changing APIs
