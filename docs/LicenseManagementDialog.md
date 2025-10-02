# 许可证管理对话框重构文档

## 概述

`LicenseManagementDialog.vue` 是一个重构后的许可证管理对话框组件，用于处理许可证激活、订阅管理、支付处理等功能。

## 组件结构

### 主组件

- **LicenseManagementDialog.vue** - 主容器组件，负责状态管理和组件协调

### 子组件

- **DialogHeader.vue** - 对话框标题组件
- **UserInfoCard.vue** - 用户信息卡片（MID、许可证状态等）
- **OrderDisplay.vue** - 订单显示组件（支付信息、QR码等）
- **PricingTable.vue** - 定价表组件（月度/年度计划）
- **PaymentButtons.vue** - 支付按钮组件（Stripe、USDT等）
- **PrivacyAgreement.vue** - 隐私协议确认组件
- **LoadingDialogs.vue** - 各种加载对话框组件

### 业务逻辑混入 (Mixins)

- **paymentMixin.js** - 支付相关逻辑
- **licenseMixin.js** - 许可证相关逻辑
- **orderMixin.js** - 订单相关逻辑

## 使用方法

### 基本使用

```vue
<template>
  <LicenseManagementDialog 
    ref="licenseDialog" 
    :license="licenseData" 
  />
</template>

<script>
import LicenseManagementDialog from './components/LicenseManagementDialog.vue'

export default {
  components: {
    LicenseManagementDialog
  },
  methods: {
    showLicenseDialog() {
      this.$refs.licenseDialog.show()
    }
  }
}
</script>
```

### Props

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| license | Object | 是 | 许可证信息对象 |

### 方法

| 方法名 | 描述 |
|--------|------|
| show() | 显示对话框 |
| close() | 关闭对话框 |

## 重构优势

### 📦 模块化

- 每个功能模块拆分为独立组件
- 便于单独开发和测试
- 提高代码复用性

### 🔧 可维护性

- 职责单一，逻辑清晰
- 通过 mixins 管理业务逻辑
- 样式模块化管理

### 🚀 性能优化

- 支持懒加载
- 更好的 Tree Shaking
- 减少不必要的重渲染

### 👥 团队协作

- 不同开发者可并行开发子组件
- 减少代码冲突
- 统一的接口规范

## 样式组织

### CSS 类名规范

- 主容器使用 `.license-management-dialog` 类
- 所有样式都限定在主容器作用域内
- 支持深色模式和响应式设计

### 动画效果

- 模态框滑入动画
- 悬停效果增强
- 渐变背景动画
- 按钮交互动画

## 开发指南

### 添加新的子组件

1. 在 `src/components/pricing/` 目录下创建新组件
2. 在主组件中导入并注册
3. 通过 props 和 events 进行通信

### 添加新的业务逻辑

1. 在对应的 mixin 文件中添加方法
2. 如果是新的业务领域，创建新的 mixin 文件
3. 在主组件中引入并使用

### 样式修改

1. 修改 `license-management-dialog.css` 文件
2. 遵循 BEM 命名规范
3. 保持响应式设计兼容性

## 迁移指南

### 从旧组件迁移

1. 更新导入路径：`./StripePriceTableDialog.vue` → `./LicenseManagementDialog.vue`
2. 更新组件引用：`stripePriceTableDialog` → `licenseManagementDialog`
3. 检查并更新相关的事件监听

### API 兼容性

- 主要 API 保持向后兼容
- 新增了更细粒度的事件系统
- 部分内部实现发生变化，但外部接口保持稳定

## 文件结构

```
src/
├── components/
│   ├── LicenseManagementDialog.vue          # 主组件
│   ├── pricing/                             # 子组件目录
│   │   ├── DialogHeader.vue
│   │   ├── UserInfoCard.vue
│   │   ├── OrderDisplay.vue
│   │   ├── PricingTable.vue
│   │   ├── PaymentButtons.vue
│   │   ├── PrivacyAgreement.vue
│   │   └── LoadingDialogs.vue
│   └── styles/
│       └── license-management-dialog.css    # 样式文件
├── mixins/                                  # 业务逻辑混入
│   ├── paymentMixin.js
│   ├── licenseMixin.js
│   └── orderMixin.js
└── docs/
    └── LicenseManagementDialog.md           # 本文档
```

## 注意事项

1. **向后兼容性**：虽然进行了重构，但保持了主要 API 的向后兼容
2. **样式隔离**：使用 scoped 样式确保不会影响其他组件
3. **错误处理**：增强了错误处理和用户反馈
4. **国际化**：完整支持多语言切换
5. **可访问性**：遵循 WCAG 无障碍访问标准

## 未来规划

- [ ] 添加单元测试
- [ ] 支持更多支付方式
- [ ] 优化移动端体验
- [ ] 添加键盘快捷键支持
- [ ] 实现组件主题定制
