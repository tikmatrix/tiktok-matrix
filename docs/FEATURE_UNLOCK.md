# 功能解锁系统

## 概述

TikMatrix支持功能解锁系统，允许通过特定的解锁码来启用高级功能。这些功能默认是隐藏的，只有在输入正确的解锁码后才会显示。

## 已支持的功能

### 1. 关注计划功能 (followPlan)

- **解锁码**: `cGxhbl9rZXk=` (base64编码的 "plan_key")
- **功能描述**: 启用关注计划相关功能

### 2. 白标功能 (whiteLabel)

- **解锁码**: `d2hpdGVsYWJlbA==` (base64编码的 "whitelabel")
- **功能描述**: 启用应用的白标定制功能，包括：
  - 应用名称自定义
  - Logo自定义
  - 品牌信息配置
  - Telegram链接配置

## 如何使用

1. 打开应用设置页面
2. 找到"功能解锁"部分
3. 在输入框中输入对应的解锁码
4. 点击"解锁"按钮
5. 解锁成功后，相应的功能将在界面中显示

## 解锁状态持久化

- 解锁状态保存在localStorage中
- 应用重启后解锁状态依然有效
- 存储键名: `unlockedFeatures`

## 开发者信息

### 添加新功能

要添加新的可解锁功能，需要：

1. 在 `TikTokSettings.vue` 的 `featureMap` 中添加新的解锁码映射
2. 在需要条件显示的组件中使用 `isFeatureUnlocked()` 检查解锁状态
3. 添加相应的事件监听来响应解锁状态变化

### 解锁码生成

```bash
echo -n "your_feature_name" | base64
```

### API参考

详见 `src/utils/features.js` 中的功能解锁工具函数。
