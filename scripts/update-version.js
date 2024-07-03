import fs from 'fs'
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
console.log(config.package.version)
const signaturePath = `src-tauri/target/release/bundle/msi/tiktok-matrix_${config.package.version}_x64_en-US.msi.zip.sig`
const signature = fs.readFileSync(signaturePath, 'utf-8')
console.log(signature)
const updateJson = {
    "version": `v${config.package.version}`,
    "notes": `v${config.package.version} is released! Please update to the new version.`,
    "pub_date": new Date().toISOString(),
    "platforms": {
        "windows-x86_64": {
            "signature": signature,
            "url": `https://r2.tikmatrix.com/tiktok-matrix_${config.package.version}_x64_en-US.msi.zip`
        }
    }
}
const updateJsonStr = JSON.stringify(updateJson, null, 2)
console.log(updateJsonStr)
fs.writeFileSync('update.json', updateJsonStr)
const response1 = await fetch('https://api.tikmatrix.com/update.json', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': updateJsonStr.length,
        'Authorization': 'Bearer ' + process.env.TIKMATRIX_API_KEY
    },
    body: updateJsonStr
})
console.log(`Response1: ${response1.status} ${response1.statusText}`)
//update download url
const downloadUrl = `https://r2.tikmatrix.com/tiktok-matrix_${config.package.version}_x64_en-US.msi`
console.log(downloadUrl)
//put https://api.tikmatrix.com/download
const response2 = await fetch('https://api.tikmatrix.com/downloadUrl', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': downloadUrl.length,
        'Authorization': 'Bearer ' + process.env.TIKMATRIX_API_KEY
    },
    body: downloadUrl
})
console.log(`Response2: ${response2.status} ${response2.statusText}`)
