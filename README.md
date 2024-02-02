# tiktok-matrix

tiktok matrix 是一个可以本地部署的，基于adb和android无障碍服务的tiktok自动化运营工具，可以实现自动注册账号，自动发布视频，自动点赞，自动关注，自动收藏，自动浏览视频等功能。
> tiktok matrix is a tiktok automation tool based on adb and android accessibility services that can be deployed locally. It can automatically register accounts, automatically publish videos, automatically like, automatically follow, automatically collect, and automatically browse videos.

## get started

[官方网站](https://niostack.com/tiktok.html)

[中文文档](https://github.com/niostack/tiktok-matrix/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3)

[English Document](https://github.com/niostack/tiktok-matrix/wiki/EnglishDoc)

## telegram group

[Join Niostack telegram group](https://t.me/+iGhozoBfAbI5YmE1)

## dev

```shell
npm install --global @tauri-apps/cli
npm install --global shx
npm install
npm run tauri dev
npm run tauri build
```

## 感谢下面开源项目

* <https://github.com/niostack/atx-agent>
* <https://github.com/niostack/android-uiautomator-server>
* <https://github.com/DeviceFarmer/minicap>
* <https://github.com/DeviceFarmer/minitouch>

## release

### 0.0.7

* auto register account by swith account, max account number is 5/pre device
* support auto switch account when auto publish video
* support auto switch account when auto train account
* Incorporate the three scripts of registration, setting avatar, and collecting username into the registration automation process
* show task status in device operation panel

### 0.0.6

* add otg mode, you can use use or tcp(otg) to connect android device
* fix bug of register account
* fix bug of proxy server config
* auto refresh device list when device connect or disconnect

### 0.0.5

* add music menu, you can add music list and auto publish video with random music from music list
* can open device detail panel from publish job list
* fix auto upload video bug
* request admin permission when app start,beacuse save data to local file need admin permission

### 0.0.4

* save settings to local file
* add wifi config, auto connect wifi
* clear device video cache before upload video
* fix auto upload video bug

### 0.0.3

* optimize the stability of auto publish video
* add account info(like follower count,earning)

### 0.0.2

* add target country select
* Optimize the stability of video releases

### 0.0.1

* manage devices
* manage groups
* manage accounts
* manage materials
* auto register tiktok account
* auto upload video to tiktok with product link (ai video or upload material)
* auto train account by auto swipe to view For You videos ,auto click like , follow,collection
