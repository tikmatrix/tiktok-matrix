# TitleBar 和 App 更新逻辑迁移到 Rust 后端

## 修改概述

将 TitleBar 组件中的**所有更新逻辑**（包括 Tauri 应用更新和库文件更新）以及 App.vue 中的**自动更新管理逻辑**从前端 JavaScript 迁移到 Rust 后端实现，通过 Tauri 的 invoke 调用和事件通知机制实现前后端交互。

## 修改的文件

### 1. 新增文件

#### `src-tauri/src/update_manager.rs`

新增的 Rust 模块，负责处理所有更新逻辑：

**数据结构：**

- `TauriUpdateInfo` - Tauri 应用更新信息
- `LibInfo` - 库文件信息
- `UpdateStatus` - 更新状态事件

**主要功能：**

**Tauri 应用更新：**

- `check_tauri_update()` - 检查 Tauri 应用更新
- `install_and_relaunch_update()` - 安装更新并重启应用

**库文件更新：**

- `check_libs_update()` - 从远程服务器检查库更新
- `get_local_lib_version()` - 获取本地库版本
- `save_local_lib_version()` - 保存库版本到本地
- `check_lib_file_exists()` - 检查库文件是否存在
- `download_lib_file()` - 下载库文件到临时目录
- `install_lib_file()` - 安装下载的库文件
- `process_lib_update()` - 处理单个库的完整更新流程

**事件发射：**

- `UPDATE_STATUS` - 更新状态事件，包含 status（checking/downloading/installing/completed/error）、message 和 lib_name

#### `src-tauri/src/auto_update_manager.rs`

新增的 Rust 模块，负责自动更新管理：

**数据结构：**

- `AutoUpdateConfig` - 自动更新配置（启用状态、检查间隔、空闲阈值）
- `AutoUpdateState` - 自动更新状态（上次检查时间、用户活动时间、运行状态）
- `AutoUpdateStateInfo` - 自动更新状态信息（用于查询）

**主要功能：**

- `update_user_activity()` - 更新用户活动时间戳
- `is_system_idle()` - 检查系统是否空闲
- `should_trigger_auto_update()` - 判断是否应触发自动更新
- `start_auto_update_timer()` - 启动自动更新定时器（后台任务）
- `stop_auto_update_timer()` - 停止自动更新定时器
- `trigger_auto_update()` - 触发自动更新检查
- `get_auto_update_state()` - 获取当前自动更新状态

**事件发射：**

- `AUTO_UPDATE_CHECK_CONDITIONS` - 检查是否满足自动更新条件（前端响应任务状态）
- `AUTO_UPDATE_TRIGGER` - 触发自动更新（通知 TitleBar 执行更新）

### 2. 修改文件

#### `src-tauri/src/main.rs`

**新增内容：**

- 导入 `update_manager` 模块
- 导入 `auto_update_manager` 模块
- 新增 11 个 Tauri commands：
  - `check_tauri_update` - 检查 Tauri 应用更新
  - `install_and_relaunch_update` - 安装应用更新并重启
  - `check_libs_update` - 检查库更新
  - `get_local_lib_version` - 获取本地库版本
  - `process_lib_update` - 处理单个库更新
  - `batch_update_libs` - 批量更新多个库
  - `update_user_activity` - 更新用户活动时间戳
  - `start_auto_update_timer` - 启动自动更新定时器
  - `stop_auto_update_timer` - 停止自动更新定时器
  - `check_can_auto_update` - 检查是否可以自动更新
  - `get_auto_update_state` - 获取自动更新状态

#### `src/components/TitleBar.vue`

**简化内容：**

- 移除 `download_and_update_lib()` 方法（约 80 行代码）
- 移除 `sanitizeVersion()` 方法
- 移除 `getLibStorageKey()` 方法
- 移除不再使用的导入：`checkUpdate`、`installUpdate`、`relaunch`

**简化后的 check_update() 方法：**

```javascript
async check_update(force = false, silent = false) {
  // 1. 调用 Rust 后端的 check_tauri_update 检查应用更新
  //    - Windows: 用户确认后调用 install_and_relaunch_update
  //    - macOS: 提示用户手动下载
  // 2. 调用 Rust 后端的 check_libs_update 检查库更新
  // 3. 调用 Rust 后端的 batch_update_libs 批量更新所有库
  // 4. 根据更新结果启动 agent
}
```

#### `src/App.vue`

**简化内容：**

- 移除 `lastUserActivity`、`autoUpdateTimer`、`userActivityEvents` 等数据字段
- 移除 `setupUserActivityListeners()` 方法
- 移除 `removeUserActivityListeners()` 方法
- 移除 `onUserActivity()` 方法
- 移除 `isSystemIdle()` 方法
- 移除 `triggerAutoUpdate()` 方法
- 大幅简化 `startAutoUpdateTimer()` 和 `stopAutoUpdateTimer()` 方法

**新增内容：**

- `setupUserActivityTracking()` - 使用防抖机制追踪用户活动并通知 Rust
- 监听 `AUTO_UPDATE_CHECK_CONDITIONS` 事件，响应 Rust 的条件检查请求

**工作流程：**

1. 前端追踪用户活动（防抖 1 秒），调用 `update_user_activity` 通知 Rust
2. Agent 启动后调用 `start_auto_update_timer` 启动后台定时器
3. Rust 定时器触发时发送 `AUTO_UPDATE_CHECK_CONDITIONS` 事件
4. 前端响应事件，调用 `check_can_auto_update` 并传递任务状态
5. Rust 根据配置、任务状态、空闲状态决定是否触发更新
6. 如果满足条件，Rust 发送 `AUTO_UPDATE_TRIGGER` 事件给 TitleBar

**新增事件监听：**

```javascript
await this.$listen("UPDATE_STATUS", async (e) => {
  const status = e.payload;
  // 更新对话框标题
  if (status.lib_name) {
    this.check_update_dialog_title = status.message;
  }
  // 显示错误通知
  if (status.status === 'error') {
    await this.$emiter('NOTIFY', {
      type: 'error',
      message: status.message,
      timeout: 4000
    });
  }
});
```

## 技术架构

### 前后端交互流程

```
前端 TitleBar.vue
    ↓ invoke('check_tauri_update')
Rust update_manager
    ↓ 调用 Tauri updater API
    ↓ emit('UPDATE_STATUS', {status: 'checking'})
前端更新 UI
    ↓ 返回更新信息
前端显示更新对话框
    ↓ 用户确认 (Windows)
    ↓ invoke('install_and_relaunch_update')
Rust update_manager
    ↓ emit('UPDATE_STATUS', {status: 'downloading'})
    ↓ emit('UPDATE_STATUS', {status: 'installing'})
    ↓ 下载并安装更新
    ↓ 重启应用
---
前端 TitleBar.vue
    ↓ invoke('check_libs_update')
Rust update_manager
    ↓ emit('UPDATE_STATUS', {status: 'checking'})
前端更新 UI
    ↓
Rust check_libs_update()
    ↓ 返回库列表
前端收到库列表
    ↓ invoke('batch_update_libs', {libs, force})
Rust update_manager
    ↓ 遍历每个库
    ├─ emit('UPDATE_STATUS', {status: 'downloading', lib_name})
    ├─ download_lib_file()
    ├─ emit('DOWNLOAD_PROGRESS', {filesize, transfered, ...})
    ├─ emit('UPDATE_STATUS', {status: 'installing', lib_name})
    ├─ install_lib_file()
    └─ emit('UPDATE_STATUS', {status: 'completed'})
前端收到完成通知
    ↓
启动 agent
```

### 版本存储机制

**之前（前端）：**

- 使用 `persistentStorage.js` 的 `getItem()` / `setItem()`
- 存储键名通过 `getLibStorageKey()` 映射

**现在（后端）：**

- 直接存储在 `AppData/data/{lib_name}_version.txt` 文件中
- 统一的存储和读取接口

### 支持的库类型

1. **platform-tools** - Android Debug Bridge (adb)
2. **PaddleOCR** - OCR 识别工具
3. **apk** - Android 应用包
4. **test-apk** - 测试用 Android 应用包
5. **scrcpy** - 屏幕投屏工具
6. **script** - 自动化脚本可执行文件
7. **agent** - 本地服务可执行文件

## 优势

### 1. 代码简化

- 前端代码从约 150 行减少到约 50 行
- 移除了复杂的文件下载、解压、安装逻辑

### 2. 职责分离

- 前端只负责 UI 交互和用户反馈
- 后端负责文件操作、进程管理、权限设置

### 3. 错误处理

- 统一的错误处理机制
- 通过 UPDATE_STATUS 事件通知前端

### 4. 可维护性

- 更新逻辑集中在 Rust 模块中
- 易于测试和调试

### 5. 性能优化

- Rust 原生性能优势
- 批量更新支持

## 注意事项

1. **向后兼容**：原有的 `download_file_with_version`、`unzip_file`、`kill_process`、`grant_permission` 等命令仍然保留，update_manager 直接调用这些命令。

2. **事件系统**：使用 Tauri 的 `emit_all` 发送事件到所有窗口，确保 UI 能及时收到更新通知。

3. **平台差异**：代码中使用 `#[cfg(target_os = "macos")]` 处理 macOS 特定逻辑（如文件权限）。

4. **错误恢复**：如果某个库更新失败，会通过 UPDATE_STATUS 事件通知前端，但不会中断整个更新流程（除非是关键错误）。

## 测试建议

1. 测试正常更新流程
2. 测试强制更新（force=true）
3. 测试网络错误场景
4. 测试文件权限错误场景
5. 测试进程占用场景（agent 正在运行时更新）
6. 测试 Windows 和 macOS 平台差异

## 后续优化

1. 添加更新进度百分比显示
2. 支持断点续传
3. 添加更新回滚机制
4. 支持并行下载多个库
5. 添加更新缓存验证（checksum）
