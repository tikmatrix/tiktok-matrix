//read update.json
import fs from 'fs'
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
console.log(config.package.version)
const signaturePath = `src-tauri/target/release/bundle/msi/tiktok-matrix_${config.package.version}_x64_en-US.msi.zip.sig`
const signature = fs.readFileSync(signaturePath, 'utf-8')
console.log(signature)
const updateJsonPath = "update.json"
const updateJson = JSON.parse(fs.readFileSync(updateJsonPath, 'utf-8'))
console.log(updateJson)
updateJson.version = `v${config.package.version}`
updateJson.notes = `v${config.package.version} is released! Please update to the new version.`
updateJson.pub_date = new Date().toISOString()
updateJson.platforms["windows-x86_64"].signature = signature
updateJson.platforms["windows-x86_64"].url = `https://github.tikmatrix.com/https://github.com/tikmatrix/tiktok-matrix/releases/download/v${config.package.version}/tiktok-matrix_${config.package.version}_x64_en-US.msi.zip`
console.log(updateJson)
fs.writeFileSync(updateJsonPath, JSON.stringify(updateJson, null, 2))
