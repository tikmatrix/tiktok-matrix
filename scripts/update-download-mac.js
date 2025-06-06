import fs from 'fs'
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

//update mac download url
let body = `https://r2.tikmatrix.com/TikMatrix_${config.package.version}_universal.dmg`
let response = await fetch('https://pro.api.tikmatrix.com/ci/update_download_url', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': body.length,
        'Authorization': 'Bearer ' + process.env.API_KEY,
        'X-Platform': 'mac',
        'X-App': 'tikmatrix'
    },
    body: body
})
console.log(`update_download_url: ${response.status} ${response.statusText}`)
