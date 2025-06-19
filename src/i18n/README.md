# 国际化（i18n）文件管理

本目录包含项目的所有国际化（i18n）相关文件和工具。

## 目录结构

```
i18n/
├── index.js          # 主入口文件，导入所有语言并配置i18n
├── check-and-sync.js # 检查和同步翻译文件的工具
├── package.json      # 包配置
├── README.md         # 本文档
├── backups/          # 翻译文件备份目录（自动创建）
└── locales/          # 语言文件目录
    ├── en.js         # 英语翻译
    ├── zh-CN.js      # 中文翻译
    └── ru.js         # 俄语翻译
```

## 翻译文件管理

### 检查和同步翻译

我们提供了一个简单的工具来检查和同步所有语言文件：

```bash
cd src/i18n
node check-and-sync.js
```

这个工具会：
1. 分析所有语言文件，找出所有唯一的翻译键
2. 检查每种语言中缺失的翻译
3. 生成更新后的语言文件，确保所有文件包含相同的键
4. 对缺失的翻译，暂时使用英文作为默认值
5. 在执行操作前，创建原始文件的备份

### 添加新的翻译键

当需要添加新的翻译时，您可以：

1. 在任意一个语言文件中添加新的键值对
2. 运行 `check-and-sync.js` 脚本，它会自动将新键添加到所有语言文件中
3. 然后为其他语言提供适当的翻译

### 添加新的语言

要添加新的语言支持，请执行以下步骤：

1. 在 `locales` 目录中创建新的语言文件，如 `ja.js` 表示日语
2. 在新语言文件中添加基本的翻译结构：
   ```javascript
   export default {
     // 添加关键翻译
     startNow: '今すぐ開始',
     // ...其他翻译
   };
   ```
3. 运行 `check-and-sync.js` 脚本，它会确保新语言文件包含所有必要的键
4. 在 `index.js` 中导入并添加到 `messages` 对象中

例如：

```javascript
// 在index.js中添加
import ja from './locales/ja.js';

export const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
    'ru': ru,
    'ja': ja  // 添加日语
  }
});
```

## 最佳实践

- 保持所有语言文件中的键一致（使用 `check-and-sync.js` 来确保一致性）
- 使用有意义的键名（如 `confirmDelete` 而不是 `message1`）
- 对于缺少翻译的键，暂时使用英文作为默认值
- 定期运行检查工具确保翻译文件的一致性
- 在更新翻译前，先备份原始文件（`check-and-sync.js` 会自动执行此操作） 