import fs from 'fs'

/**
 * 版本信息更新脚本
 * 用法:
 *   node update-version.js
 *   node update-version.js --app=tikmatrix --app-name=TikMatrix
 *   node update-version.js --app=videomagic --app-name=VideoMagic
 */

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2)
    const params = {
        app: 'tikmatrix',
        appName: 'TikMatrix'
    }

    for (const arg of args) {
        if (arg.startsWith('--app=')) {
            params.app = arg.split('=')[1]
        } else if (arg.startsWith('--app-name=')) {
            params.appName = arg.split('=')[1]
        }
    }

    return params
}

const params = parseArgs()
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const signaturePath = `src-tauri/target/release/bundle/msi/${params.appName}_${config.package.version}_x64_en-US.msi.zip.sig`
const signature = fs.readFileSync(signaturePath, 'utf-8')

console.log(`App: ${params.app}`)
console.log(`App Name: ${params.appName}`)
console.log(`Version: v${config.package.version}`)

let body = JSON.stringify({
    "version": `v${config.package.version}`,
    "notes": `v${config.package.version} is released! Please update to the new version.`,
    "pub_date": new Date().toISOString(),
    "platforms": {
        "windows-x86_64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/${params.appName}_${config.package.version}_x64_en-US.msi.zip`
        },
        "darwin-x86_64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/${params.appName}_${config.package.version}_universal.dmg`
        },
        "darwin-arm64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/${params.appName}_${config.package.version}_universal.dmg`
        }
    }
}, null, 2)

let response = await fetch('https://api.tikmatrix.com/ci/update_version_info', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': body.length,
        'Authorization': 'Bearer ' + process.env.API_KEY,
        'X-App': params.app
    },
    body: body
})
console.log(`update_version_info: ${response.status} ${response.statusText}`)
