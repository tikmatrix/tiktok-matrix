# TikMatrix

TikMatrix is a real android phone based on adb and android uiautomator. It provides tiktok automation tools for real phone registration, login, publish videos, like videos, follow, favorite, comment, private message, brush videos and more.

## Quick start

[Official website](https://www.tikmatrix.com)

[Video Tutorial](https://www.youtube.com/@tikmatrix)

## Discussions

[Join our Telegram](https://t.me/+iGhozoBfAbI5YmE1)

## Development

### Requirements

1. Node.js 18.x or higher
2. Rust 1.67.x or higher

### Install

```shell
npm install --global @tauri-apps/cli
npm install
npm run tauri dev
```

## FAQ

### How to run TikMatrix Agent on phone by adb?

You can check the reason why the agent is not running by the following command.

```shell
# You can find the device id by the following command.
adb devices
# Start the agent on the phone.
adb -s <device_id> shell am instrument -w -r -e debug false -e class com.github.tikmatrix.stub.Stub com.github.tikmatrix.test/androidx.test.runner.AndroidJUnitRunner
```

### How to customize TikMatrix Brand?

* src/src-tauri/tauri.conf.json

```shell
"package": {
    "productName": "TikMatrix",
    "version": "1.8.1"
  }
```

* src/i18n.js

```shell
 siteName: 'TikMatrix',
 siteUrl: 'https://www.tikmatrix.com',
```

### How to fix vcruntime140_1.dll not found?

Need to install Visual C++ Redistributable for Visual Studio 2015, 2017 and 2019.
<https://tikmatrix.com/blog/how-to-fix-vcruntime140.dll-not-found-when-open-TikMatrix>

### How to fix The application was unable to start correctly (0xc000007b)?

Need to install Visual C++ Redistributable for Visual Studio 2015, 2017 and 2019.
<https://tikmatrix.com/blog/how-to-fix-vcruntime140.dll-not-found-when-open-TikMatrix>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tikmatrix/tiktok-matrix&type=Date)](https://star-history.com/#tikmatrix/tiktok-matrix&Date)
