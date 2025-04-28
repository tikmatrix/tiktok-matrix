import fs from 'fs'
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

//update windows download url
let body = `https://r2.tikmatrix.com/IgMatrix_${config.package.version}_x64_en-US.msi`
//put https://pro.api.tikmatrix.com/download
let response = await fetch('https://pro.api.tikmatrix.com/ci/update_download_url_igmatrix', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': body.length,
        'Authorization': 'Bearer ' + process.env.API_KEY,
        'X-Platform': 'windows',
        'X-App': 'tikmatrix'
    },
    body: body
})
console.log(`update_download_url: ${response.status} ${response.statusText}`)
