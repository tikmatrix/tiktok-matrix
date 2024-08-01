const updateJson = {
    "agent_version": "1.0.0",
    "agent_windows_url": "https://r2.tikmatrix.com/tiktok-agent.exe",
    "agent_mac_url": "https://r2.tikmatrix.com/tiktok-agent",
    "script_version": "1.0.0",
    "script_windows_url": "https://r2.tikmatrix.com/script.exe",
    "script_mac_url": "https://r2.tikmatrix.com/script",
    "apk_version": "1.0.0",
    "apk_url": "https://r2.tikmatrix.com/com.github.tikmatrix.apk",
    "test_apk_version": "1.0.0",
    "test_apk_url": "https://r2.tikmatrix.com/com.github.tikmatrix.test.apk",
    "scrcpy_version": "2.3.1",
    "scrcpy_url": "https://r2.tikmatrix.com/scrcpy-server",
    "platform_tools_version": "35.0.1",
    "platform_tools_mac_url": "https://r2.tikmatrix.com/platform-tools-latest-darwin.zip",
    "platform_tools_windows_url": "https://r2.tikmatrix.com/platform-tools-latest-windows.zip"
}
const updateJsonStr = JSON.stringify(updateJson, null, 2)
console.log(updateJsonStr)
const response1 = await fetch('https://api.tikmatrix.com/coreVersion.json', {
    method: 'PUT',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Length': updateJsonStr.length,
        'Authorization': 'Bearer ' + process.env.TIKMATRIX_API_KEY
    },
    body: updateJsonStr
})
console.log(`Response1: ${response1.status} ${response1.statusText}`)

