# 版本更新和Agent启动逻辑迁移指南

## 概述

本次更新将版本更新检查和Agent进程管理逻辑从前端(Vue.js)迁移到后端(Rust)。这样做的好处是：

1. **更可靠的进程管理**: Rust原生进程管理比通过Tauri API调用更稳定
2. **减少前端复杂度**: 前端只负责UI展示，业务逻辑由后端处理
3. **更好的错误处理**: Rust的错误处理机制更完善
4. **自动重试机制**: 后端可以自动重试失败的操作
5. **健康监控**: 后端持续监控Agent进程状态

## 架构变更

### 之前的架构
```
前端(App.vue + TitleBar.vue)
├── 定时检查更新
├── 用户活动监听
├── 下载库文件
├── 启动Agent
└── 监控运行状态
```

### 现在的架构
```
后端(Rust)
├── UpdateManager
│   ├── 启动时检查更新
│   ├── 定时检查更新
│   ├── 用户活动追踪
│   └── 下载和安装库文件
└── AgentManager
    ├── Agent进程启动
    ├── 健康监控
    ├── 自动重试
    └── 状态维护

前端(Vue.js)
├── 显示版本信息
├── 监听后端事件
└── 通知后端状态变化
```

## 主要变更

### 新增模块

#### 1. `src-tauri/src/update_manager.rs`
负责所有版本更新相关的逻辑：
- 启动时自动检查更新
- 每10分钟(开发环境1分钟)定时检查
- 用户活动追踪(5分钟无活动视为空闲)
- 库文件下载和安装
- 智能更新: 只在系统空闲且无运行任务时执行

#### 2. `src-tauri/src/agent_manager.rs`
负责Agent进程的生命周期管理：
- 启动时自动启动Agent(最多重试3次)
- 每30秒健康检查
- 自动重启失败的Agent
- 端口占用检测
- 跨平台进程管理(Windows/macOS)

### 前端变更

#### `src/App.vue`
移除的功能：
- `lastUserActivity`, `autoUpdateTimer`, `userActivityEvents` 数据字段
- `setupUserActivityListeners()`, `removeUserActivityListeners()`
- `onUserActivity()`, `isSystemIdle()`
- `triggerAutoUpdate()`, `startAutoUpdateTimer()`, `stopAutoUpdateTimer()`

新增功能：
- `updateBackendState()`: 将运行任务状态同步到后端
- 用户活动事件监听，调用后端API
- 监听后端状态更新事件

#### `src/components/TitleBar.vue`
变更：
- 保留手动检查更新按钮(用于Tauri应用更新)
- 库文件更新由后端自动处理
- 新增后端事件监听

### 后端API

新增Tauri命令：

```rust
// 通知后端用户活动
update_manager_set_user_activity()

// 设置是否有运行中的任务
update_manager_set_running_tasks(has_tasks: bool)

// 启用/禁用自动更新
update_manager_set_auto_update_enabled(enabled: bool)

// 手动重启Agent
agent_manager_restart()

// 查询Agent是否运行
agent_manager_is_running() -> bool
```

新增事件：

```rust
// 更新管理器状态
"update_manager_status" {
    status: "checking" | "downloading" | "completed",
    message: string,
    timestamp: number
}

// Agent管理器状态
"agent_manager_status" {
    status: "starting" | "started" | "error" | "disconnected",
    message: string,
    timestamp: number
}
```

## 配置参数

可以通过以下常量调整行为：

### UpdateManager (update_manager.rs)
```rust
const UPDATE_CHECK_INTERVAL_MINUTES: u64 = 10;  // 更新检查间隔
const IDLE_THRESHOLD_MINUTES: u64 = 5;          // 空闲阈值
```

### AgentManager (agent_manager.rs)
```rust
const MAX_STARTUP_RETRIES: u32 = 3;             // 最大启动重试次数
const RETRY_DELAY_SECONDS: u64 = 5;             // 重试延迟
const STARTUP_TIMEOUT_SECONDS: u64 = 10;        // 启动超时
```

## 开发环境特殊处理

在`debug_assertions`模式下：
- 更新检查间隔: 1分钟(生产环境10分钟)
- 空闲阈值: 1分钟(生产环境5分钟)

## 测试要点

1. **启动测试**
   - 首次启动应自动检查更新
   - Agent应自动启动
   - 检查日志确认流程正确

2. **定时更新测试**
   - 等待10分钟(dev环境1分钟)
   - 确认在无任务且系统空闲时触发更新

3. **Agent重启测试**
   - 手动杀死Agent进程
   - 等待30秒，确认自动重启

4. **用户活动测试**
   - 移动鼠标、点击等操作
   - 确认更新不会在用户活动时触发

5. **任务运行测试**
   - 启动任务
   - 确认有任务运行时不触发更新

## 故障排查

### Agent无法启动
检查：
1. `bin/agent` 或 `bin/agent.exe` 是否存在
2. 端口50809是否被其他程序占用
3. 查看日志中的错误信息

### 更新不触发
检查：
1. `settings.auto_update_enabled` 是否为true
2. 是否有运行中的任务
3. 系统是否空闲(5分钟无用户活动)
4. 查看后端日志

### 库文件下载失败
检查：
1. 网络连接
2. API地址是否正确
3. 磁盘空间是否充足
4. 权限是否足够

## 回滚方案

如果遇到问题，可以临时回滚到之前的版本。主要需要：
1. 恢复 `App.vue` 中的自动更新逻辑
2. 恢复 `TitleBar.vue` 中的 `check_update()` 逻辑
3. 注释掉 `main.rs` 中的 UpdateManager 和 AgentManager 初始化

## 未来改进

- [ ] 添加更新进度通知
- [ ] 支持更新回滚
- [ ] 增加更详细的错误报告
- [ ] 支持自定义更新策略
- [ ] 添加单元测试和集成测试
