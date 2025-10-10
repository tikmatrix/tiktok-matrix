# Device Debug Inspector Integration

## 功能说明

Device Debug Inspector 是一个集成在 TikMatrix 项目中的 Android 设备调试工具，用于实时查看设备的 UI 层次结构。

## 主要功能

### 1. 设备屏幕预览

- 实时显示设备截图
- 双击画布触发 tap 操作
- 显示鼠标坐标
- 支持高亮显示选中的元素

### 2. UI 层次结构查看

- 树形展示 Android UI 层次
- 搜索节点（支持 text、contentDesc、resourceId、className）
- 点击节点选中元素
- 显示节点图标和状态

### 3. 元素属性检查

- 显示选中元素的所有属性
- XPath 生成和复制
- Bounds、Size、Center 信息
- 可点击性、焦点、滚动等状态
- 一键点击元素中心点

## 使用方法

1. **打开 Debug Dialog**
   - 在设备列表中，点击设备旁边的 Debug 按钮
   - 或者在大屏幕模式下，点击右侧工具栏的 Debug 按钮

2. **刷新界面**
   - 点击右上角的 Refresh 按钮
   - 或者使用画布上的刷新按钮

3. **选择元素**
   - 方式1：在画布上点击元素
   - 方式2：在右侧树形结构中点击节点

4. **执行操作**
   - 双击画布上的位置执行 tap
   - 在属性面板中点击 "Tap on center" 按钮

## 文件结构

```
src/
├── components/
│   ├── device/
│   │   ├── DeviceScreenCanvas.vue          # 设备屏幕画布组件
│   │   ├── DeviceElementInspector.vue      # 元素属性检查器组件
│   │   ├── DeviceHierarchyViewer.vue       # 层次结构查看器组件
│   │   └── TreeNode.vue                    # 树节点组件
│   └── dialogs/
│       └── DeviceDebugDialog.vue           # 主调试对话框
├── service/
│   └── debugService.js                     # 调试服务（WebSocket 通信）
└── utils/
    ├── hierarchyParser.js                  # 层次结构解析工具
    └── canvasDrawer.js                     # Canvas 绘图工具
```

## 技术实现

### WebSocket 通信

Debug 功能通过 WebSocket 与后端通信：

```javascript
// 连接
const wsUrl = `ws://127.0.0.1:9008`

// 消息格式
{
  action: 'dump_hierarchy',
  serial: 'device_serial'
}

// 响应格式
{
  type: 'hierarchy' | 'screenshot',
  data: '...'
}
```

### 后端 API 需求

需要后端提供以下功能：

1. **Dump Hierarchy**
   - 获取设备的 UI 层次结构（XML 格式）
   - 类似 `uiautomator dump` 命令

2. **Screenshot**
   - 获取设备截图（Base64 编码）

3. **Tap**
   - 在指定坐标执行点击操作
   - 参数：x, y 坐标

### 层次结构解析

支持解析 Android UIAutomator 的 XML 格式：

```xml
<node class="android.widget.Button" 
      text="Click Me" 
      resource-id="com.example:id/button" 
      bounds="[100,200][300,400]" 
      clickable="true" />
```

解析后的结构：

```javascript
{
  id: 'node-xxx',
  tag: 'node',
  className: 'android.widget.Button',
  text: 'Click Me',
  resourceId: 'com.example:id/button',
  bounds: {
    x: 100, y: 200,
    width: 200, height: 200,
    centerX: 200, centerY: 300
  },
  clickable: true,
  children: [...]
}
```

## 依赖项

已使用项目现有依赖：

- Vue 3
- @headlessui/vue
- @fortawesome/vue-fontawesome
- Tailwind CSS + DaisyUI
- @tauri-apps/api

## 注意事项

1. **WebSocket 连接**
   - 确保后端 WebSocket 服务器运行在 9008 端口
   - 需要实现相应的消息处理逻辑

2. **性能优化**
   - 大型层次树可能导致性能问题
   - 建议实现虚拟滚动或懒加载

3. **坐标转换**
   - 画布坐标需要转换为设备实际坐标
   - 注意设备分辨率和画布大小的比例

## 后续优化建议

1. 添加更多交互功能
   - 长按、滑动等手势
   - 录制操作序列

2. 性能优化
   - 虚拟滚动
   - 层次树懒加载
   - WebSocket 消息压缩

3. 用户体验
   - 快捷键支持
   - 历史记录
   - 截图保存

4. 高级功能
   - 代码生成（自动化脚本）
   - 对比模式（比较两个界面）
   - 性能监控
