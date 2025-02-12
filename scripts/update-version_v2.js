import fs from 'fs'
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
console.log(config.package.version)
const signaturePath = `src-tauri/target/release/bundle/msi/TikMatrix_${config.package.version}_x64_en-US.msi.zip.sig`
const signature = fs.readFileSync(signaturePath, 'utf-8')
console.log(signature)
// const changelogPath = "CHANGELOG.md"
// const changelog = fs.readFileSync(changelogPath, 'utf-8')
// api-key:Z1IsWABNeIR0icBGPKdNi9uaiHyB8vZbG3DdJPTsSzInrEmYcYf2uTIg3GxEwkal
const updateJson = {
    "version": `v${config.package.version}`,
    "notes": `v${config.package.version} is released! Please update to the new version.`,
    "pub_date": new Date().toISOString(),
    "platforms": {
        "windows-x86_64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/TikMatrix_${config.package.version}_x64_en-US.msi.zip`
        }
    }
}
const updateJsonStr = JSON.stringify(updateJson, null, 2)
console.log(updateJsonStr)
// fs.writeFileSync('update.json', updateJsonStr)
const response1 = await fetch('https://pro.api.tikmatrix.com/ci/update_version_info', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': updateJsonStr.length,
        'Authorization': 'Bearer ' + process.env.API_KEY
    },
    body: updateJsonStr
})
console.log(`update_version_info: ${response1.status} ${response1.statusText}`)
//update download url
const downloadUrl = `https://r2.tikmatrix.com/TikMatrix_${config.package.version}_x64_en-US.msi`
console.log(downloadUrl)
//put https://pro.api.tikmatrix.com/download
const response2 = await fetch('https://pro.api.tikmatrix.com/ci/update_download_url', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': downloadUrl.length,
        'Authorization': 'Bearer ' + process.env.API_KEY
    },
    body: downloadUrl
})
console.log(`update_download_url: ${response2.status} ${response2.statusText}`)
