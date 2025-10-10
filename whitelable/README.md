# 白标功能说明文档

## 支持的白标配置

1. appName: 应用名称
    * tauri.conf.json 中的 windows.title 需要配置为 {appName}
    * tauri.conf.json 中的 package.productName 需要配置为 {appName}
    * src\config\whitelabel.js 中的 DEFAULT_WHITELABEL_CONFIG.appName 需要配置为 {appName}

2. appId: 应用 ID(自动把appName转为小写并去掉空格作为默认值)
    * tauri.conf.json 中的 updater.endpoint 需要配置为 <https://api.tikmatrix.com/front-api/check_update?app={appId}>
    * tauri.conf.json 中的 bundle.identifier 需要配置为 com.{appId}

3. logo: 应用 Logo 路径: logo.png
    * 需要替换 src/assets/logo.png

4. 官网域名: officialWebsite
    * src\config\whitelabel.js 中的 DEFAULT_WHITELABEL_CONFIG.officialWebsite 需要配置为 {officialWebsite}

5. API 域名
    * src\config\whitelabel.js 中的 DEFAULT_WHITELABEL_CONFIG.apiDomain 需要配置为 {apiDomain}
    * tauri.conf.json 中的 allowlist.http.scope 需要替换为 {apiDomain}

6. 客服邮箱
    * src\config\whitelabel.js 中的 DEFAULT_WHITELABEL_CONFIG.emailSupport 需要配置为 {emailSupport}

7. 客服telegram
    * src\config\whitelabel.js 中的 DEFAULT_WHITELABEL_CONFIG.telegramSupport 需要配置为 {telegramSupport}
8. 客服whatsapp
    * src\config\whitelabel.js 中的 DEFAULT_WHITELABEL_CONFIG.whatsappSupport 需要配置为 {whatsappSupport}
