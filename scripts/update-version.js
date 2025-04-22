import fs from 'fs'
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const signaturePath = `src-tauri/target/release/bundle/msi/TikMatrix_${config.package.version}_x64_en-US.msi.zip.sig`
const signature = fs.readFileSync(signaturePath, 'utf-8')
let body = JSON.stringify({
    "version": `v${config.package.version}`,
    "notes": `v${config.package.version} is released! Please update to the new version.`,
    "pub_date": new Date().toISOString(),
    "platforms": {
        "windows-x86_64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/TikMatrix_${config.package.version}_x64_en-US.msi.zip`
        },
        "darwin-x86_64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/TikMatrix_${config.package.version}_x64_en-US.dmg`
        }
    }
}, null, 2)
let response = await fetch('https://pro.api.tikmatrix.com/ci/update_version_info', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': body.length,
        'Authorization': 'Bearer ' + process.env.API_KEY
    },
    body: body
})
console.log(`update_version_info: ${response.status} ${response.statusText}`)
