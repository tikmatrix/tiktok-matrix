# tiktok-matrix

tiktok matrix 是一个可以本地部署的，基于adb和android无障碍服务的tiktok自动化运营工具，可以实现自动注册账号，自动发布视频，自动点赞，自动关注，自动收藏，自动浏览视频等功能。
> tiktok matrix is a tiktok automation tool based on adb and android accessibility services that can be deployed locally. It can automatically register accounts, automatically publish videos, automatically like, automatically follow, automatically collect, and automatically browse videos.

## get started

[Official website](https://tikmatrix.com)

[Document](https://doc.tikmatrix.com)

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

* <https://github.com/Genymobile/scrcpy>

## release

### 1.0.5

* fix some bugs

### 1.0.4

* support android 5.0 and above
* fix some bugs

### 1.0.3

* fix bug of account edit
* fix bug of post video
* fix bug of group edit
* fix bug of auto register account

### 1.0.2

* fix bug of account edit
* fix bug of post video

### 1.0.1

* fix group edit bug

### 1.0.0

* add dashboard, you can view device status, account status, task status
* Reorganize the UI
* add likeProbability, followProbability, collectionProbability setting in group train
* show more devices in device list
* Add continuous registration feature, click once to register 8 accounts for each device
* Each group can create 6 training tasks and 6 publishing tasks per day

### 0.0.9

* fix bug of license check
* fix bug of auto register account
* fix bug of add sound
* add video title setting, random select title when publish video
* delete unused ocr models, reduce package size

### 0.0.8

* add email suffix setting, auto register account with email suffix
* add avatar repository, ramdom select avatar when register account
* add openai api-key setting, auto generate username/nickname/bio by AI(chatgpt) when register account

### 0.0.7

* auto register account by switch account, max account number is 8/device
* support auto switch account when auto publish video
* support auto switch account when auto train account
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
