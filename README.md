# TikMatrix

TikMatrix 是一个群控安卓真实手机（非云控，非协议），基于adb和android uiautomator的tiktok自动化运营工具，可以实现自动注册账号，自动登录，自动发布视频，自动点赞，自动关注，自动收藏，自动评论, 自动私信, 自动刷视频, 全网视频采集等功能。
> TikMatrix is a real android phone based on adb and android uiautomator. It provides tiktok automation tools for real phone registration, login, publish videos, like videos, follow, collect, comment, private message, brush videos and more.

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

1. 手动安装app

```shell
adb -s <device_id> install -r -t -g ../bin/com.github.tikmatrix.apk
adb -s <device_id> install -r -t -g ../bin/com.github.tikmatrix.test.apk
```

2. 手动启动UIAutomator

```shell
adb -s <device_id> shell am instrument -w -r -e debug false -e class com.github.tikmatrix.stub.Stub com.github.tikmatrix.test/androidx.test.runner.AndroidJUnitRunner
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tikmatrix/tiktok-matrix&type=Date)](https://star-history.com/#tikmatrix/tiktok-matrix&Date)
