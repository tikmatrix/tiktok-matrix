import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  locale: 'en', // 设置默认语言
  messages: {
    en: {
      siteName: 'Tik Matrix',
      devices: 'Devices',
      accounts: 'Accounts',
      autoPublish: 'Auto Publishing',
      autoTrain: 'Auto Train',
      dialogWatcher: 'Dialog Watcher',
      version: 'Version',
      email: 'Email',
      password: 'Password',
      device: 'Device',
      disable: 'Disable',
      enable: 'Enable',
      add: 'Add',
      unbinded: 'Unbinded',
      update: 'Update',
      actions: 'Actions',
      delete: 'Delete',
      edit: 'Edit',
      execing: 'Execing',
      refresh: 'Refresh',
      installApk: 'Install APK',
      uninstallApk: 'Uninstall APK',
      menu: 'Menu',
      back: 'Back',
      home: 'Home',
      wakeup: 'Wakeup',
      sleep: 'Sleep',
      openTiktok: 'Open Tiktok',
      stopTiktok: 'Stop Tiktok',
      enableProxy: 'Enable Proxy',
      disableProxy: 'Disable Proxy',
      batchAction: 'Batch Action',
      total: 'Total',
      previous: 'Previous',
      next: 'Next',
      enterTips: 'Enter keywords',
      clearTiktok: 'Clear Tiktok',
      connecting: 'Connecting',
      autoScripts: 'Auto Scripts',
      register: 'Reg',
      login: 'Login',
      uploadAvatar: 'Upload Avatar',
      keyboard: 'Keyboard',
      inputText: 'Input text to device',
      startTime: 'Start Time',
      endTime: 'End Time',
      material: 'Material',
      account: 'Account',
      waiting: 'Waiting',
      success: 'Success',
      failed: 'Failed',
      status: 'Status',
      unused: 'Unused',
      used: 'Used',
      id: 'ID',
      demoTip: 'This is a demo site, the data is not real. If you want to experience the real data, please contact us: {email}',
      demoTip2: 'Join Telegram Group',
      repair: 'Repair',
      groups: 'Groups',
      titles: 'Titles',
      name: 'Name',
      addAccount: 'Add Account',
      addMaterial: 'Add Videos',
      group: 'Group',
      defaultGroup: 'Default Group',
      retry: 'Retry',
      preview: 'Preview',
      openAutoDateTime: 'Open Auto Date Time',
      closeAutoDateTime: 'Close Auto Date Time',
      connectWifi: 'Connect Wifi',
      disconnectWifi: 'Disconnect Wifi',
      torchOn: 'Torch On',
      torchOff: 'Torch Off',
      showSimInfo: 'Show Sim Info',
      openWhoer: 'Open Whoer',
      openNotification: 'Open Notification',
      reboot: 'Reboot',
      rebootAll: 'Reboot All',
      search: 'Search',
      shell: 'Shell',
      all: 'All',
      conditions: 'Conditions',
      action: 'Action',
      online: 'Online',
      offline: 'Offline',
      setTimezone: 'Set Timezone',
      selfMade: 'Self Made',
      aiMade: 'AI Made',
      publishType: 'Publish Type',
      productLink: 'Product Link',
      enterLicenseId: 'Enter License ID',
      infoCrawler: 'Info Crawler',
      username: 'Username',
      fans: 'Fans',
      shopCreator: 'Shop Creator',
      block: 'Block',
      earnings: 'Earnings',
      musics: 'Musics',
      releaseName: 'Release Name',
      artistName: 'Artist Name',
      connectionMode: 'Connection Mode',
      task_status: 'Task Status',
      settings: 'Settings',
      proxyServerTips: 'Is it necessary to batch use proxy server for mobile phones?',
      timezoneTips: 'Used for batch setting of time zone automatic script',
      wifiTips: 'Used for batch connecting wifi automatic script',
      emailTips: 'Customize the registration email suffix',
      openaiTips: 'Is it necessary to customize the username and nickname with AI',
      licenseTips: 'Enter the license key',
      passwordTips: 'Enter the password',
      save: 'Save',
      setProfile: 'Set Profile',
      avatars: 'Avatars',
      trainTimer: 'Train Timer',
      publishTimer: 'Publish Timer',
      trainJobs: 'Train Jobs',
      publishJobs: 'Publish Jobs',
      trainTimeTips: 'Train timer, up to 6 timer can be configured',
      publishTimeTips: 'Publish timer, up to 6 timer can be configured',
      dashboard: 'Dashboard',
      allGroups: 'All Groups',
      overview: 'Overview',
      deviceCount: 'Device Count',
      trainJobCount: 'TrainJob Count',
      publishJobCount: 'PublishJob Count',
      trainJobQueue: 'TrainJob Queue',
      publishJobQueue: 'PublishJob Queue',
      matrixGroup: 'Matrix Group',
      accountCount: 'Account Count',
      retryAllFaied: 'Retry All Failed',
      like: 'Like',
      floow: 'Floow',
      collect: 'Collect',
      interact: 'Interact',
      logs: 'Logs',
      quickOperation: 'Quick Operation',
      postUrl: 'Post Url',
      topicCount: 'Topic Count',
      commentCount: 'Comment Count',
      commentJobCount: 'CommentJob Count',
      commentJobQueue: 'CommentJob Queue',
      clearAll: 'Clear All',
      comments: 'Comments',
      registerAll: 'Register All',
      proxys: 'Proxys',
      server: 'Server',
      port: 'Port',
      test: 'Test',
      init: 'Init',
      resetSize: 'Reset Size',
      resetDensity: 'Reset Density',
      showTimeSetting: 'Show Time Setting',
      uploadVideo: 'Upload Video',
      input_output: 'Input&Output',
      trainDuration: 'Train Duration',
      minute: 'Minute',
      clearNotification: 'Clear Notification',
      showAll: 'Show All',
      allStatus: 'All Status',
      analytics: 'Analytics',
      day_hour: 'Day Hour',
      follower_count: 'Followers',
      video_count: 'Videos',
      video_collect_count: 'Collects',
      video_comment_count: 'Comments',
      video_like_count: 'Likes',
      video_play_count: 'Views',
      video_share_count: 'Shares',
      postBots: 'Post Bots',
      editBots: 'Edit Bots',
      user: 'User',
      host: 'Host',
      edit_bot: 'Edit Bot',
      post_bot: 'Post Bot',
      multilogin: 'Multilogin',
      start: 'Start',
      stop: 'Stop',
      download_video: 'Download Video',
      upload_background: 'Upload Background',
      upload_overlay: 'Upload Overlay',
      clear_background: 'Clear Background',
      clear_overlay: 'Clear Overlay',
      background: 'Background',
      overlay: 'Overlay',
      start_bot: 'Start Bot',
      stop_bot: 'Stop Bot',
      videos: 'Videos',
      running: 'Running',
      stopped: 'Stopped',
      clearTasks: 'Clear Tasks',
      startAll: 'Start All',
      stopAll: 'Stop All',
      initAll: 'Init All',
      bot: 'Bot',
      upload: 'Upload',
      download: 'Download',
      ipinfo: 'IP Info',
      finished: 'Finished',
      clear: 'Clear',
      unlock: 'Unlock',
      showLanguageSetting: 'Show Language Setting',
      matchAccount: 'Match Account',
      setInputMethod: 'Set Input Method',
      enableTCP: 'Enable TCP',
      readClipboard: 'Read Clipboard',
      train: 'Train',
      copy: 'Copy',
      topics: 'Topics',
      comments: 'Comments',
      topicsTips: 'Enter the topic to be searched,one topic per line',
      commentsTips: 'Enter the content to be commented,one content per line',
      titlesTips: 'Enter the title and tags of the video,one title per line',
      remark: 'Remark',
      document: 'Document',
      selected: 'Selected',
      selectAll: 'Select All',
      open: 'Open',
      close: 'Close',
      proxy: 'Proxy',
      power: 'Power',
      reboot: 'Reboot',
      up: 'Up',
      down: 'Down',
      right: 'Right',
      left: 'Left',
      time: 'Time',
      language: 'Lang',
      sim: 'SIM',
      input: 'Input',
      tcp: 'TCP',
      enter: 'Enter',
      successRate: 'Success Rate',
      isRunning: 'Is Running',
      task: 'Task',
      RUNNING: 'Running',
      IDLE: 'Idle',
      hideTips: 'Hide this device',
      showHiddenDevices: 'Show hidden devices',
      installAPK: 'Install APK',
      apk: 'APK',
      enableTCP: 'Enable ADB TCP Connection',
      match: 'Match',
      matchAccount: 'Match Account',
      post: 'Post',
      copySuccess: 'Copy Success',
      initStart: 'Init Start,It will take about 10 seconds',
      initSuccess: 'Init Success',
      units: 'Units',
      allDevices: 'All Devices',
      addGroup: 'Add Group',
      general: 'General',
      tktools: 'TKTools',
      moveToGroup: 'Move To Group',
      noDevicesSelected: 'No Devices Selected',
      uid: 'UID',
      proxyServer: 'Proxy Server',
      license: 'License',
      emailSuffix: 'Email Suffix',
      registerSettings: 'Register Settings',
      nicknames: 'Nicknames',
      nicknamesTips: 'Enter the nickname, one nickname per line',
      usernames: 'Usernames',
      usernamesTips: 'Enter the username, one username per line',
      bios: 'Bios',
      biosTips: 'Enter the signature, one signature per line',
      avatarsPath: 'Avatars Path',
      profile: 'Profile',
      profileTips: 'Setup Profile',
      proxys: 'Proxys',
      source: 'Source',
      createTime: 'Create Time',
      editGroup: 'Edit Group',
      deleteGroup: 'Delete Group',
      commandSendSuccess: 'Command Send Success',
      noDevicesSelected: 'No Devices Selected',
      debug: 'Debug',
      scanTCPDevice: 'Scan TCP Device',
      startScan: 'Start Scan',
      scanIpTitle: 'Scan IP Range',
      scanPortTip: 'Scan Port',
      capture: 'Capture',
      videoUrl: 'Video Url',
      supportedSites: 'Supported Sites',
      fission: 'Fission',
      dynamicScale: 'Dynamic Scale',
      smartFrameCut: 'Smart Frame Cut',
      adjustFrameRate: 'Adjust Frame Rate',
      adjustBitRate: 'Adjust Bit Rate',
      publish: 'Publish',
      stopTask: 'Stop Task',
      comment: 'Comment',
      quickActions: 'Shortcut',
      uploadToGallery: 'Upload To Gallery',
      openIpChecker: 'Open IP Checker',
      initApp: 'Init TikMatrix App',
      startRegister: 'Start Register',
      startFillProfile: 'Start Fill Profile',
      startLogin: 'Start Login',
      startTrain: 'Start Train',
      startPublish: 'Start Publish',
      whatsapp: 'Whatsapp',
      telegram: 'Telegram',
      buyLicense: 'Buy License',
      proxySettings: 'Proxy Settings',
      proxyEnabled: 'Proxy Enabled',
      proxyDisabled: 'Proxy Disabled',
      setProxy: 'Set Proxy',
      serverStarting: 'Server Starting',
      serverStartingTips: 'Server starting, please wait for a moment, if it takes too long, please try to restart the server',
      clearGallery: 'Clear Gallery',
      openNekoBox: 'Open NekoBox',
      messageSettings: 'Message Settings',
      messageContent: 'Message Content',
      targetUsernamesPath: 'Target Usernames Path',
      messageContentTips: 'Enter the message content, one content per line',
      messageJobs: 'Message Jobs',
      targetUsername: 'Target Username',
      taskCreated: 'Task Created',
      commentTargetPost: 'Comment Target Post',
      postUrl: 'Post Url',
      confirmClearAll: 'Confirm Clear All?',
      confirm: 'Confirm',
      accountCount: 'Account Count',
      addTopic: 'Add Topic',
      parse: 'Parse',
      setFastInput: 'Set Fast Input',
      select: 'Select',
      second: 'Second',
      viewDuration: 'View Duration',
      trainConfig: 'Train Config',
      publishConfig: 'Publish Config',
      indexUpdated: 'Index Updated',
      screenOff: 'Screen Off',
      scrapeFans: 'Scrape Flowers',
      startScrape: 'Start Scrape',
      scrapeTitle: 'Scrape Target User Followers',
      targetUsername: 'Target Username',
      onlyOneDeviceSelected: 'Only One Device Selected',
      openDownloadDir: 'Open Download Dir',
      operating: 'Operating',
      image: 'Image',
      video: 'Video',
      imageCount: 'Image Count',
      tiktokSettings: 'Tiktok Settings',
      global: 'Global: com.zhiliaoapp.musically',
      asia: 'Asia: com.ss.android.ugc.trill',
      tiktokPackagename: 'Tiktok Packagename',
      openTikMatrixApp: 'Open TikMatrix App',
      trainStartTimeFormatError: 'Train Start Time Format Error',
      publishStartTimeFormatError: 'Publish Start Time Format Error',
      usdtTip: 'Please make sure the coin network is USDT-TRC20, to avoid the loss of funds when the recharge fails! Recharge after sending the recharge screenshot to get the license code!',
      telegramCustom: 'Telegram Custom',
      price: 'Price',
      month: 'Month',
      year: 'Year',
      freeTrial: 'Free Trial(Limit 1 phone)',
      computer: 'Computer',
      usernameRequired: 'Username Required',
      usernameMustStartWithAt: 'Username must start with @',
      updateAgent: 'Update Agent',
      transferRate: 'Transfer Rate',
      percentage: 'Percentage',
      pasteSuccess: 'Paste Success',
      batchAdd: 'Batch Add',
      batchAddTips: 'Email##Password##Username##Device\nExample: email1##123##test##1\nOne account per line',
      batchAddConfirm: 'Are you sure you want to add these {count} accounts?',
      address: 'Address',
      export: 'Export',
      exportConfirm: 'Are you sure you want to export accounts?',
      logined: 'Logined',
      unlogined: 'Unlogined',
      batchAddFailTips: 'No valid accounts found',
      resetIndex: 'Reset Index',
      tasks: 'Tasks',
      packageNameSettings: 'Package Name Settings',
      registerSettings: 'Register Settings',
      messageSettings: 'Message Settings',
      openLogs: 'Open Logs',
      deleteGroupConfirm: 'Are you sure you want to delete this group?',
      exitConfirm: 'Are you sure you want to exit?',
      shareJobs: 'Share Jobs',
      startMessage: 'Start Message',
      startShare: 'Start Share',
      shareTitle: 'Repost Target Posts To Selected Accounts',
      postUrlRequired: 'Post Url Required',
      targetUsernameRequired: 'Target Username Required',
      trainSettings: 'Train Settings',
      publishSettings: 'Publish Settings',
      editTitle: 'Edit Title',
      title: 'Title',
      materials: 'Materials',
      md5: 'MD5',
      no_devices_tips: 'No devices found! Please connect your device via USB or TCP!',
      startFollow: 'Start Follow',
      followTitle: 'Follow Target Accounts',
      followJobs: 'Follow Jobs',
      downloadOcr: 'Download OCR',
      startPublishBeta: 'Start Publish(Beta)',
      addProductLinkConfirm: 'Do you want to add this product link? This is a beta feature, if you do not need it, please click No, if you need please click Yes, and make sure you have at least 1 item in your shelf',
      scrapeFansJobs: 'Scrape Fans Jobs',
      progress: 'Progress',
      instools: 'InsTools',
      openInstagram: 'Open Instagram',
      stopInstagram: 'Stop Instagram',
    },
    'zh-CN': {
      stopInstagram: '停止Instagram',
      openInstagram: '打开Instagram',
      instools: 'Ins工具箱',
      progress: '进度',
      scrapeFansJobs: '采集粉丝任务',
      startPublishBeta: '开始发布(测试版)',
      addProductLinkConfirm: '是否需要添加该商品链接? 这是一个内测功能,如果你不需要请点击No, 如果需要请点击Yes,并确保你的橱窗中已经添加了至少1个商品',
      downloadOcr: '下载OCR',
      followJobs: '关注任务',
      followTitle: '关注账号',
      startFollow: '开始关注',
      no_devices_tips: '未找到设备! 请通过USB或TCP连接设备!',
      md5: 'MD5',
      materials: '素材库',
      title: '标题',
      editTitle: '编辑标题',
      publishSettings: '发布设置',
      trainSettings: '养号设置',
      targetUsernameRequired: '目标用户名必填',
      postUrlRequired: '帖子链接必填',
      shareTitle: '转发目标帖子到选择的账号',
      startShare: '开始分享',
      startMessage: '开始私信',
      shareJobs: '分享任务',
      exitConfirm: '是否确定退出?',
      deleteGroupConfirm: '是否确定删除该组?',
      openLogs: '打开日志',
      messageSettings: '消息设置',
      registerSettings: '注册设置',
      packageNameSettings: '包名设置',
      tasks: '任务',
      resetIndex: '重置索引',
      batchAddFailTips: '未找到有效帐号',
      logined: '已登录',
      unlogined: '未登录',
      exportConfirm: '是否确定导出帐号',
      export: '导出',
      address: '地址',
      batchAddConfirm: '是否确定要添加这些 {count} 个帐号?',
      batchAddTips: '邮箱##密码##用户名##设备号\n例如: email1##123##test##1\n每行一个帐号',
      batchAdd: '批量添加',
      pasteSuccess: '粘贴成功',
      percentage: '百分比',
      transferRate: '传输速率',
      updateAgent: '更新Agent',
      usernameMustStartWithAt: '用户名必须以 @ 开头',
      usernameRequired: '用户名必填',
      computer: '电脑',
      freeTrial: '免费试用(限制1个手机)',
      month: '月',
      year: '年',
      price: '价格',
      telegramCustom: 'Telegram 客服',
      usdtTip: '请确保充币网络为USDT-TRC20, 以避免出现充值失败导致资金损失!充币后请联系客户发送充币截图获取授权码!',
      publishStartTimeFormatError: '发布开始时间格式错误',
      trainStartTimeFormatError: '养号开始时间格式错误',
      openTikMatrixApp: '打开 TikMatrix App',
      tiktokPackagename: 'Tiktok 包名',
      asia: '亚洲: com.ss.android.ugc.trill',
      global: '全球: com.zhiliaoapp.musically',
      tiktokSettings: 'Tiktok 设置',
      imageCount: '图片数量',
      image: '图片',
      video: '视频',
      operating: '操作中',
      openDownloadDir: '打开下载目录',
      onlyOneDeviceSelected: '只能选择一个设备',
      targetUsername: '目标用户名',
      scrapeTitle: '采集用户粉丝列表',
      startScrape: '开始采集',
      scrapeFans: '采集粉丝',
      screenOff: '息屏投屏',
      indexUpdated: '序号已更新',
      publishConfig: '发布配置',
      trainConfig: '养号配置',
      viewDuration: '观看时长',
      second: '秒',
      minute: '分钟',
      select: '选择',
      setFastInput: '设置快速输入法',
      parse: '解析',
      addTopic: '添加主题',
      accountCount: '账号数量',
      confirm: '确认',
      confirmClearAll: '确认清除所有？',
      postUrl: '帖子链接',
      commentTargetPost: '评论目标帖子',
      taskCreated: '任务创建成功',
      targetUsername: '目标用户名',
      messageJobs: '私信任务',
      messageContentTips: '请输入消息内容，每行一个消息',
      targetUsernamesPath: '目标用户名文件路径',
      messageContent: '消息内容',
      messageSettings: '私信设置',
      openNekoBox: '打开 NekoBox',
      clearGallery: '清除图库',
      serverStartingTips: '服务正在启动中,请稍候,如果长时间没有反应，请尝试重启服务',
      serverStarting: '服务正在启动',
      setProxy: '设置代理',
      proxyEnabled: '代理已启用',
      proxyDisabled: '代理已禁用',
      proxySettings: '代理设置',
      buyLicense: '购买授权',
      telegram: 'Telegram',
      whatsapp: 'Whatsapp',
      startPublish: '开始发布',
      startTrain: '开始养号',
      startLogin: '开始登录',
      startFillProfile: '开始设置资料',
      startRegister: '开始注册',
      siteName: 'Tik Matrix',
      devices: '设备',
      accounts: '帐号',
      autoPublish: '自动发布',
      autoTrain: '自动养号',
      dialogWatcher: '弹窗监控',
      version: '版本',
      email: '邮箱',
      password: '密码',
      device: '设备',
      disable: '禁用',
      enable: '启用',
      add: '添加',
      unbinded: '未绑定',
      update: '更新',
      actions: '操作',
      delete: '删除',
      edit: '编辑',
      refresh: '刷新',
      installApk: '安装 APK',
      uninstallApk: '卸载 APK',
      menu: '菜单',
      back: '返回',
      home: '主页',
      wakeup: '唤醒',
      sleep: '休眠',
      openTiktok: '打开 Tiktok',
      stopTiktok: '停止 Tiktok',
      enableProxy: '启用代理',
      disableProxy: '禁用代理',
      batchAction: '批量操作',
      total: '总数',
      previous: '上一页',
      next: '下一页',
      enterTips: '输入关键字',
      clearTiktok: '清除 Tiktok',
      connecting: '连接中',
      autoScripts: '自动脚本',
      register: '注册',
      login: '登录',
      uploadAvatar: '上传头像',
      keyboard: '键盘',
      inputText: '输入文本到设备',
      startTime: '开始时间',
      endTime: '结束时间',
      material: '视频',
      account: '帐号',
      waiting: '等待中',
      execing: '执行中',
      success: '成功',
      failed: '失败',
      status: '状态',
      unused: '未使用',
      used: '已使用',
      id: 'ID',
      demoTip: '这是一个演示站点，数据并不真实。如果您想体验真实数据，请联系我们：{email}',
      demoTip2: '加入 Telegram 群组',
      repair: '修复',
      groups: '分组',
      titles: '标题',
      name: '名称',
      addAccount: '添加帐号',
      addMaterial: '添加视频',
      group: '分组',
      defaultGroup: '默认分组',
      retry: '重试',
      preview: '预览',
      openAutoDateTime: '打开自动日期时间',
      closeAutoDateTime: '关闭自动日期时间',
      connectWifi: '连接 Wifi',
      disconnectWifi: '断开 Wifi',
      torchOn: '打开手电筒',
      torchOff: '关闭手电筒',
      showSimInfo: '显示 Sim 信息',
      openWhoer: '打开 Whoer',
      openNotification: '打开通知',
      reboot: '重启',
      rebootAll: '重启所有设备',
      search: '搜索',
      shell: '终端',
      all: '全部',
      conditions: '条件',
      action: '动作',
      online: '在线',
      offline: '离线',
      setTimezone: '设置时区',
      selfMade: '自制',
      aiMade: 'AI 制作',
      publishType: '发布类型',
      productLink: '商品链接',
      enterLicenseId: '输入 License ID',
      infoCrawler: '信息采集',
      username: '用户名',
      fans: '粉丝',
      shopCreator: '创作者',
      block: '封禁',
      earnings: '收益',
      musics: '音乐',
      releaseName: '发行名称',
      artistName: '音乐名称',
      connectionMode: '连接模式',
      task_status: '任务状态',
      settings: '设置',
      proxyServerTips: '是否需要批量给手机使用代理服务器?',
      timezoneTips: '用于批量设置时区的自动脚本',
      wifiTips: '用于批量连接wifi的自动脚本',
      emailTips: '自定义注册邮箱后缀',
      openaiTips: '是否需要AI定制用户名和昵称',
      licenseTips: '输入授权码',
      save: '保存',
      setProfile: '设置资料',
      avatars: '头像',
      trainTimes: '养号时间',
      publishTimes: '发布时间',
      trainJobs: '养号任务',
      publishJobs: '发布任务',
      trainTimeTips: '养号时间，最多配置6个时间点',
      publishTimeTips: '发布时间，最多配置6个时间点',
      dashboard: '仪表盘',
      allGroups: '全部分组',
      quickStart: '快速开始',
      overview: '概览',
      deviceCount: '设备数量',
      accountCount: '帐号数量',
      trainJobCount: '养号任务数量',
      publishJobCount: '发布任务数量',
      trainJobQueue: '养号任务队列',
      publishJobQueue: '发布任务队列',
      matrixGroup: '矩阵分组',
      retryAllFaied: '重试所有失败',
      like: '点赞',
      floow: '关注',
      collect: '收藏',
      interact: '互动',
      logs: '日志',
      quickOperation: '快速操作',
      commentCount: '评论数量',
      commentJobCount: '评论任务数量',
      commentJobQueue: '评论任务队列',
      document: '文档',
      selected: '已选择',
      selectAll: '全选',
      showAll: '显示全部',
      open: '开启',
      stop: '停止',
      close: '关闭',
      clear: '清空',
      proxy: '代理',
      train: '养号',
      power: '电源',
      reboot: '重启',
      up: '上滑',
      down: '下滑',
      left: '左滑',
      right: '右滑',
      time: '时间',
      language: '语言',
      sim: 'SIM',
      upload: '上传',
      input: '输入',
      tcp: 'TCP',
      enter: '输入',
      successRate: '成功率',
      isRunning: '运行中',
      task: '任务',
      RUNNING: '运行中',
      IDLE: '空闲',
      remark: '备注',
      trainTimer: '养号定时器',
      trainDuration: '养号时长',
      topics: '话题',
      comments: '评论',
      publishTimer: '发布定时器',
      topicsTips: '输入要搜索的话题,一行一个话题',
      commentsTips: '输入要评论的内容,一行一个评论',
      titlesTips: '输入视频的标题和标签,一行一个标题',
      hideTips: '隐藏这个设备',
      showHiddenDevices: '显示隐藏设备',
      installAPK: '安装 APK',
      apk: 'APK',
      init: '初始化',
      enableTCP: '启用 ADB TCP 连接',
      match: '匹配',
      matchAccount: '匹配账号',
      post: '发布',
      copySuccess: '复制成功',
      copy: '复制',
      initStart: '初始化开始,大概需要10秒钟',
      initSuccess: '初始化成功',
      units: '台',
      allDevices: '全部设备',
      addGroup: '新增分组',
      general: '通用',
      tktools: 'TK工具箱',
      clearAll: '清空所有',
      allStatus: '全部状态',
      moveToGroup: '移动到分组',
      noDevicesSelected: '未选择设备',
      showTimeSetting: '显示时间设置',
      showLanguageSetting: '显示语言设置',
      uid: 'UID',
      proxyServer: '代理服务器',
      license: '授权码',
      emailSuffix: '邮箱后缀',
      registerSettings: '注册设置',
      nicknames: '昵称',
      nicknamesTips: '输入昵称,一行一个昵称',
      usernames: '用户名',
      usernamesTips: '输入用户名,一行一个用户名',
      bios: '签名',
      biosTips: '输入签名,一行一个签名',
      avatarsPath: '头像路径',
      profile: '资料',
      profileTips: '设置个人资料',
      proxys: '代理',
      source: '来源',
      createTime: '创建时间',
      editGroup: '编辑分组',
      deleteGroup: '删除分组',
      uploadVideo: '上传视频',
      commandSendSuccess: '命令发送成功',
      noDevicesSelected: '未选择设备',
      debug: '调试',
      scanTCPDevice: '扫描 TCP 设备',
      startScan: '开始扫描',
      scanIpTitle: '扫描 IP 范围',
      scanPortTip: '扫描端口',
      capture: '采集',
      videoUrl: '视频链接',
      supportedSites: '支持站点',
      fission: '裂变',
      dynamicScale: '动态缩放',
      smartFrameCut: '智能抽帧',
      adjustFrameRate: '调整帧率',
      adjustBitRate: '调整码率',
      publish: '发布',
      stopTask: '停止任务',
      comment: '评论',
      quickActions: '快捷操作',
      uploadToGallery: '上传到相册',
      openIpChecker: '打开 IP 检查器',
      initApp: '初始化TikMatrix App',
    }
  }
})
