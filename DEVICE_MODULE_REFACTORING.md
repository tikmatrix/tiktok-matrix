# Device 模块重构说明

## 📋 概述

将 Device 模块的 WebSocket API 统一到标准命名规范，与其他模块（Task、Group、Account、Material）保持一致。

## ✅ 完成的变更

### 1. 统一命名规范

**旧的命名：**

- `device.fetch` - 获取设备列表

**新的命名：**

- `device.list` - 获取设备列表
- `device.count_online` - 统计在线设备数量

### 2. 前端变更

#### deviceWebSocketService.js

新增 `ws_list_devices` 函数：

```javascript
/**
 * Get list of devices via WebSocket
 * @param {string} source - Source of the request (e.g., 'manual', 'auto')
 * @param {Object} extra - Additional parameters
 * @returns {Promise<Array>} List of devices
 */
export async function ws_list_devices(source = 'manual', extra = {}) {
    try {
        console.log('[DeviceWS] Listing devices, source:', source)
        const response = await sendWsMessage('device.list', {
            source,
            ...extra
        })
        console.log('[DeviceWS] List devices response:', response)
        return response.data
    } catch (error) {
        console.error('[DeviceWS] Failed to list devices:', error)
        throw error
    }
}
```

#### App.vue

**变更前：**

```javascript
async requestDevices(source = 'manual', extra = {}) {
    const payload = {
        action: 'device.fetch',
        data: { source, ...extra }
    };
    try {
        await invoke('agent_ws_send', { payload });
    } catch (error) {
        console.error('requestDevices via WS failed:', error);
    }
}
```

**变更后：**

```javascript
import * as deviceWsService from './service/deviceWebSocketService';

async requestDevices(source = 'manual', extra = {}) {
    try {
        console.log('[App] Requesting devices via WebSocket service')
        await deviceWsService.ws_list_devices(source, extra)
    } catch (error) {
        console.error('[App] Request devices failed:', error)
    }
}
```

### 3. 后端变更

#### ws_server.rs

添加 `device.list` 支持，同时保持 `device.fetch` 向后兼容：

```rust
let action_result = match action.as_str() {
    "device.list" => send_device_snapshot_from_actor(online_addr, writer.clone(), "list")
        .await
        .map(|_| false),
    "device.fetch" => send_device_snapshot_from_actor(online_addr, writer.clone(), "fetch")
        .await
        .map(|_| false),
    // ... 其他处理
};
```

## 📊 命名规范对比

### 所有模块统一的命名规范

| 模块 | 列表操作 | 创建操作 | 更新操作 | 删除操作 | 其他操作 |
|------|---------|---------|---------|---------|---------|
| Task | `task.list` | `task.create` | `task.update` | `task.delete` | `task.running`, `task.delete_all`, `task.retry_all` |
| Group | `group.list` | `group.create` | `group.update` | `group.delete` | `group.get_by_id` |
| Account | `account.list` | `account.create` | `account.update` | `account.delete` | - |
| Material | `material.list` | - | `material.update` | `material.delete` | `material.delete_all`, `material.count` |
| Device | `device.list` ✅ | - | - | - | `device.count_online` |
| Settings | `settings.get` | - | `settings.update` | - | - |

### 命名规则

1. **模块名称**：小写，如 `task`, `group`, `device`
2. **操作名称**：小写，使用下划线分隔，如 `list`, `create`, `update`, `delete`, `count_online`
3. **组合格式**：`<模块>.<操作>`
4. **响应格式**：`<模块>.<操作>.response`

## 🔄 向后兼容

为了确保平滑过渡，后端同时支持：

- ✅ `device.list` (新标准命名)
- ✅ `device.fetch` (保持兼容)

前端已完全迁移到新命名，不再使用旧的 `device.fetch`。

## 📝 函数命名规范

### WebSocket Service 函数命名

所有 WebSocket service 函数遵循 `ws_<操作>_<对象>` 格式：

**Device 模块：**

- `ws_list_devices()` - 获取设备列表
- `ws_count_online_device()` - 统计在线设备数量

**其他模块：**

- `ws_get_tasks()` - 获取任务列表
- `ws_create_task()` - 创建任务
- `ws_get_groups()` - 获取分组列表
- `ws_get_materials()` - 获取素材列表
- `ws_update_material()` - 更新素材
- `ws_delete_material()` - 删除素材

## ✨ 优势

### 1. 统一性

所有模块使用相同的命名规范，降低学习成本

### 2. 可预测性

开发者能根据模块名和操作类型推测 API 名称

### 3. 可维护性

清晰的命名规范使代码更易于理解和维护

### 4. 扩展性

新增模块或操作时，遵循现有规范即可

## 🧪 测试建议

1. **功能测试**
   - 验证设备列表加载正常
   - 确认自动刷新功能工作正常
   - 测试手动刷新设备列表

2. **回归测试**
   - 确认其他模块（Task、Group、Material）不受影响
   - 验证 WebSocket 连接状态正常

3. **性能测试**
   - 对比迁移前后的响应时间
   - 确认无内存泄漏

## 📚 相关文档

- `REFACTORING_COMPLETED.md` - 前端架构重构完成总结
- `MIGRATION_GUIDE.md` - 组件迁移指南
- `ARCHITECTURE_REFACTORING.md` - 架构变更详细说明

## 🎯 后续工作

### 可选优化

1. **移除兼容代码**
   - 在确认所有客户端都更新后，可以移除 `device.fetch` 的兼容支持
   - 简化后端路由代码

2. **文档更新**
   - 更新 API 文档
   - 更新开发者指南

3. **添加更多 Device 操作**
   - `device.get_by_id` - 获取单个设备详情
   - `device.update` - 更新设备信息（如备注）
   - `device.delete` - 删除设备记录

## 📅 变更历史

- **2025-11-19**: 将 `device.fetch` 重构为 `device.list`，统一命名规范
- **2025-11-19**: 迁移 App.vue 使用 deviceWsService.ws_list_devices()
- **2025-11-19**: 后端同时支持新旧两种命名（向后兼容）

---

最后更新：2025-11-19
完成人：GitHub Copilot
