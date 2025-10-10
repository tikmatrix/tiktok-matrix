# 白标功能说明文档

## 支持的白标配置

1. appName: 应用名称
    * tauri.conf.json 中的 windows.title 需要配置为 {appName}
    * tauri.conf.json 中的 package.productName 需要配置为 {appName}

2. appId: 应用 ID(自动把appName转为小写并去掉空格作为默认值)
    * tauri.conf.json 中的 updater.endpoint 需要配置为 <https://api.tikmatrix.com/front-api/check_update?app={appId}>
    * tauri.conf.json 中的 bundle.identifier 需要配置为 com.{appId}

3. logo: 应用 Logo 路径: logo.png
    * 需要替换 src/assets/logo.png

4. 官网域名: officialWebsite
    * tauri.conf.json 中的 build.officialWebsite 需要配置为 {officialWebsite}
5. API 域名: apiDomain
6. 客服邮箱: supportEmail
7. 客服telegram: supportTelegram
8. 客服whatsapp: supportWhatsapp
