# Quick Start - Device Debug Inspector

## 快速开始

### 1. 如何打开

在设备的右侧工具栏中，点击 "Debug" 按钮（🐛图标）

### 2. 主界面布局

```
┌────────────────────────────────────────────────────────────┐
│  Device Debug Inspector - [设备序列号]          🔄 Refresh ✕ │
├───────────────┬───────────────┬───────────────────────────┤
│               │               │                           │
│  设备屏幕       │  属性面板      │     UI 层次树              │
│  (可交互)      │               │     (可搜索)               │
│               │               │                           │
│  - 双击 Tap    │  - XPath      │  - 树形展示                │
│  - 显示坐标    │  - Bounds     │  - 点击选中                │
│  - 高亮元素    │  - 状态       │  - 搜索过滤                │
│               │               │                           │
└───────────────┴───────────────┴───────────────────────────┘
```

### 3. 基本操作

#### 查看元素

- **在画布上点击** → 选中该位置的元素
- **在树中点击节点** → 选中该元素
- 选中后，画布会高亮显示元素边界

#### 执行操作

- **双击画布** → 在该坐标执行 Tap
- **点击 "Tap on center"** → 点击元素中心点

#### 搜索元素

在右侧搜索框输入关键字，支持搜索：

- text（按钮文字）
- content-desc（无障碍描述）
- resource-id（资源 ID）
- className（类名）

### 4. 常见使用场景

#### 场景1：查找按钮坐标

1. 点击 Refresh 刷新界面
2. 在画布上点击目标按钮
3. 在属性面板查看 Center 坐标

#### 场景2：获取元素 XPath

1. 选中目标元素
2. 在属性面板复制 XPath
3. 用于自动化脚本

#### 场景3：测试点击

1. 在画布上双击想要测试的位置
2. 观察设备是否响应
3. 如需重新测试，点击 Refresh

### 5. 后端配置

确保后端 WebSocket 服务器支持以下消息：

#### 请求消息格式

```json
{
  "action": "dump_hierarchy" | "screenshot" | "tap",
  "serial": "device_serial",
  "x": 100,  // tap 时需要
  "y": 200   // tap 时需要
}
```

#### 响应消息格式

```json
{
  "type": "hierarchy" | "screenshot" | "error",
  "data": "..." | base64_string,
  "message": "error message"  // 错误时
}
```

### 6. 故障排查

#### 无法连接

- 检查 WebSocket 服务是否运行在 9008 端口
- 查看浏览器控制台错误信息

#### 无法获取截图

- 确保设备有屏幕输出
- 检查后端是否正确实现 screenshot API

#### 点击无响应

- 验证坐标是否正确
- 检查后端 tap 功能实现

### 7. 键盘快捷键（待实现）

- `Ctrl + R` - 刷新
- `Ctrl + F` - 搜索
- `Esc` - 关闭对话框

### 8. 性能提示

- 大型层次树可能加载较慢
- 频繁刷新可能影响性能
- 建议在需要时再打开 Debug 窗口

## 开发集成

如果需要在其他地方打开 Debug Dialog：

```javascript
// 触发事件
await this.$emiter('openDebugDialog', {
  serial: 'device_serial',
  real_serial: 'device_real_serial'
})
```

## API 参考

### useDeviceDebugService

```javascript
import { useDeviceDebugService } from '@/service/debugService'

const {
  connected,      // WebSocket 连接状态
  loading,        // 加载状态
  screenshot,     // 截图数据
  hierarchy,      // 层次结构 XML
  error,          // 错误信息
  connect,        // 连接函数
  dumpHierarchy,  // Dump 层次结构
  getScreenshot,  // 获取截图
  tap,            // 执行 Tap
  disconnect      // 断开连接
} = useDeviceDebugService('device_serial')
```

### hierarchyParser

```javascript
import { 
  parseXmlHierarchy,    // 解析 XML
  generateXPathLite,    // 生成 XPath
  findNodesByText,      // 按文本查找
  findNodeById,         // 按 ID 查找
  flattenTree          // 扁平化树
} from '@/utils/hierarchyParser'
```

### canvasDrawer

```javascript
import {
  drawHighlight,         // 绘制高亮
  clearCanvas,           // 清空画布
  drawScreenshot,        // 绘制截图
  getDeviceCoordinates, // 获取设备坐标
  scaleBoundsToCanvas   // 缩放边界
} from '@/utils/canvasDrawer'
```
