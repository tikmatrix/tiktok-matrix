# TikMatrix 白标功能说明

## 概述

白标功能允许您自定义TikMatrix应用的品牌标识，包括应用名称、Logo、主题颜色和品牌信息等，使其符合您的品牌形象。

## 功能特性

### 1. 基本设置

- **应用名称**: 自定义应用显示名称
- **Logo上传**: 支持自定义主Logo（推荐128x128px）

### 2. 品牌设置

- **支持邮箱**: 客户支持邮箱地址
- **教程地址**: 自定义教程链接
- **奖励页面**: 设置奖励页面链接
- **Telegram地址**: 设置Telegram群组或频道链接

### 3. 功能开关

- **显示教程链接**: 控制是否显示教程链接
- **显示品牌信息**: 控制品牌信息的显示

## 使用方法

### 方法一：通过UI界面配置

1. 启动TikMatrix应用
2. 点击标题栏的调色板图标 🎨
3. 在弹出的白标设置对话框中配置各项参数
4. 点击"保存"按钮应用设置

### 方法二：通过命令行工具配置

```bash
# 进入项目目录
cd tiktok-matrix

# 运行配置工具
node scripts/whitelabel-config.js
```

按照提示逐步配置各项参数。

### 方法三：直接编辑配置文件

1. 复制示例配置文件：

```bash
cp examples/whitelabel-config.json src/config/whitelabel-custom.json
```

2. 编辑配置文件：

```json
{
  "appName": "您的应用名称",
  "logo": {
    "main": "/src/assets/your-logo.png",
    "favicon": "/public/your-favicon.ico",
    "titleBar": "/src/assets/your-logo.png"
  },
  "theme": {
    "primaryColor": "#your-color",
    "secondaryColor": "#your-color",
    "accentColor": "#your-color"
  },
  "branding": {
    "supportEmail": "support@yoursite.com",
    "tutorialUrl": "https://yoursite.com/docs",
    "rewardsUrl": "https://yoursite.com/rewards",
    "telegramUrl": "https://t.me/yoursite"
  },
  "features": {
    "showTutorial": true,
    "showRewards": true,
    "showBranding": true,
    "customTheme": true
  }
}
```

## 配置文件说明

### 存储位置

- 用户配置：浏览器LocalStorage中的`whitelabel_config`
- 构建配置：`src/config/whitelabel-build.json`（构建时使用）
- 示例配置：`examples/whitelabel-config.json`

### 配置结构

```javascript
{
  appName: "应用名称",
  logo: {
    main: "主Logo路径",
    favicon: "网页图标路径", 
    titleBar: "标题栏图标路径"
  },
  branding: {
    supportEmail: "支持邮箱",
    tutorialUrl: "教程地址",
    rewardsUrl: "奖励页面地址",
    telegramUrl: "Telegram地址"
  },
  features: {
    showTutorial: "显示教程链接",
    showRewards: "显示奖励链接",
    showBranding: "显示品牌信息"
  }
}
```

## 构建自定义版本

### 1. 准备资源文件

```bash
# 将您的Logo文件放在正确位置
src/assets/your-logo.png       # 主Logo
public/your-favicon.ico        # 网页图标
```

### 2. 配置构建参数

```bash
# 使用命令行工具配置
node scripts/whitelabel-config.js

# 或手动编辑配置文件
src/config/whitelabel-build.json
```

### 3. 构建应用

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
```

## API参考

### 配置管理函数

```javascript
import { 
  getWhiteLabelConfig,
  saveWhiteLabelConfig, 
  resetWhiteLabelConfig,
  validateWhiteLabelConfig 
} from './config/whitelabel.js';

// 获取配置
const config = getWhiteLabelConfig();

// 保存配置
saveWhiteLabelConfig(newConfig);

// 重置配置
resetWhiteLabelConfig();

// 验证配置
validateWhiteLabelConfig(config);
```

### 工具函数

```javascript
import { 
  updateDocumentTitle,
  updateFavicon,
  initWhiteLabel 
} from './utils/whitelabel.js';

// 更新标题
updateDocumentTitle('新标题');

// 更新图标
updateFavicon('/path/to/icon.ico');

// 初始化白标
const config = initWhiteLabel();
```

## 注意事项

1. **图片格式**: Logo支持PNG、JPG格式，推荐PNG透明背景
2. **图片尺寸**: 主Logo推荐128x128px，favicon推荐32x32px
3. **颜色格式**: 支持HEX格式（#ffffff）
4. **文件大小**: Logo文件建议不超过2MB
5. **浏览器兼容**: 配置存储在LocalStorage，需要现代浏览器支持

## 常见问题

### Q: 修改配置后没有生效？

A: 请刷新页面或重启应用，某些配置需要重新加载才能生效。

### Q: 如何批量部署配置？

A: 可以通过修改`src/config/whitelabel.js`中的`DEFAULT_WHITELABEL_CONFIG`来设置默认配置。

### Q: 如何重置所有设置？

A: 在白标设置对话框中点击"重置为默认"按钮，或调用`resetWhiteLabelConfig()`函数。

### Q: 支持哪些图片格式？

A: 支持PNG、JPG、GIF格式，推荐使用PNG格式以获得最佳显示效果。

## 版本历史

- v1.0.0: 基础白标功能实现
- v1.1.0: 增加命令行配置工具
- v1.2.0: 支持配置导入导出

## 技术支持

如果您在使用白标功能时遇到问题，请联系：

- 邮箱: <support@tikmatrix.com>
- 网站: <https://tikmatrix.com>
- 文档: <https://tikmatrix.com/docs/whitelabel>
