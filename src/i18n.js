import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  locale: 'en', // 设置默认语言
  messages: {
    en: {
      siteName: 'TikMatrix',
      siteUrl: 'https://www.tikmatrix.com',
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
      groups: 'Groups',
      titles: 'Titles',
      name: 'Name',
      addAccount: 'Add Account',
      addMaterial: 'Add Videos',
      group: 'Group',
      defaultGroup: 'Default Group',
      retry: 'Retry',
      preview: 'Preview',
      showSimInfo: 'Sim Info',
      reboot: 'Reboot',
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
      follow: 'Follow',
      favorite: 'Favorite',
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
      showTimeSetting: 'Time Setting',
      uploadVideo: 'Upload Video',
      input_output: 'Input/Output',
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
      showLanguageSetting: 'Language Setting',
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
      idle: 'Idle',
      running: 'Running',
      hideTips: 'Hide this device',
      installAPK: 'Install APK',
      apk: 'APK',
      enableTCP: 'Enable ADB TCP',
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
      initAppAgent: 'Init Agent',
      startRegister: 'Start Register',
      startFillProfile: 'Start Fill Profile',
      startLogin: 'Start Login',
      startTrain: 'Start Train',
      startPublish: 'Start Publish',
      telegram: 'Telegram',
      buyLicense: 'Buy License',
      proxySettings: 'Proxy Settings',
      proxyEnabled: 'Proxy Enabled',
      proxyDisabled: 'Proxy Disabled',
      setProxy: 'Set Proxy',
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
      enableFastInput: 'Enable Fast Input',
      select: 'Select',
      second: 'Second',
      viewDuration: 'View Duration',
      trainConfig: 'Train Config',
      publishConfig: 'Publish Config',
      indexUpdated: 'Index Updated',
      screenOff: 'Enable Hibernation Casting',
      scrapeFans: 'Scrape Flowers',
      scrapeFollowers: 'Scrape Followers',
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
      openAppAgent: 'Open Agent',
      trainStartTimeFormatError: 'Train Start Time Format Error',
      publishStartTimeFormatError: 'Publish Start Time Format Error',
      telegramCustom: 'Telegram Custom',
      price: 'Price',
      month: 'Month',
      year: 'Year',
      free: 'Free',
      computer: 'Computer',
      usernameRequired: 'Username Required',
      usernameMustStartWithAt: 'Username must start with @',
      updateAgent: 'Update Agent',
      transferRate: 'Transfer Rate',
      percentage: 'Percentage',
      pasteSuccess: 'Paste Success',
      batchAdd: 'Batch Add',
      batchAddTips: 'Email##Password##Username##Device\nExample: tiktok##email1##123##test##1\nOne account per line',
      batchAddConfirm: 'Are you sure you want to add these {count} accounts?',
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
      share: 'Share',
      shareTitle: 'Repost Target Posts To Selected Accounts',
      postUrlRequired: 'Post Url Required',
      targetUsernameRequired: 'Target Username Required',
      trainSettings: 'Train',
      publishSettings: 'Publish',
      editTitle: 'Edit Title',
      title: 'Title',
      materials: 'Materials',
      md5: 'MD5',
      no_devices_tips: 'No devices found! Please connect your device via USB or TCP!',
      follow: 'Follow',
      followTitle: 'Follow Target Accounts',
      followJobs: 'Follow Jobs',
      startPublishBeta: 'Start Publish(Beta)',
      scrapeFansJobs: 'Scrape Fans Jobs',
      progress: 'Progress',
      inputPackageName: 'Input Package Name',
      tiktok: 'Tiktok',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout all accounts on this device?',
      depositNetwork: 'Deposit Network',
      depositAddress: 'Deposit Address',
      depositComment: 'Deposit Comment',
      detecting_devices: 'Detecting devices...',
      githubAuth: 'GitHub Auth',
      githubAuthStatus: 'GitHub Auth Status',
      notAuthorized: 'Not Authorized',
      authorized: 'Authorized',
      authorizeWithGithub: 'Authorize with GitHub, Forever Free Trial(1 phone)',
      githubAuthSuccessMessage: 'GitHub authorization completed successfully!',
      githubAuthFailureMessage: 'GitHub authorization failed. Please try again.',
      githubAuthErrorMessage: 'An error occurred during GitHub authorization.',
      unlicensed: 'Unlicensed',
      days: "days",
      licenseValid: "License valid for {days} days",
      activateLicense: "Click to activate license",
      updateService: 'Update Service',
      updateServiceSuccess: 'Update Service Success',
      installJobs: 'Install Jobs',
      apkPath: 'APK Path',
      sort: 'Sort',
      emails: 'Emails',
      emailsTips: 'One email per line',
      addSound: 'Add Sound',
      soundVolume: 'Sound Volume',
      originSound: 'Origin Sound',
      addSoundTips: 'Add music recommended by TikTok',
      addProductLinkTips: 'Enabling this will automatically add the first product link in the showcase when publishing',
      addProductLink: 'Add Product Link',
      autoWakeUp: 'Auto WakeUp Agent',
      checkUpdate: 'Check Update',
      updateConfirm: 'Are you sure you want to update?',
      deviceFound: 'devices found! Please wait...',
      startScript: 'Start Script',
      scriptName: 'Script Name',
      scriptArgs: 'Script Args',
      openDownloadDir: 'Open Download Dir',
      tutorial: 'Tutorial',
      waitingTasks: 'Waiting Tasks',
      runningTasks: 'Running Tasks',
      successTasks: 'Success Tasks',
      failedTasks: 'Failed Tasks',
      invalidLicense: 'Invalid License',
      openAppDir: 'Open App Dir',
      moveToFirst: 'Move To First',
      unFollow: 'UnFollow',
      userActions: 'Follow/UnFollow',
      postActions: 'Like/Comment/Share/Favorite/View',
      view: 'View',
      initing: 'Initing',
      grantTikTok: 'Grant TikTok',
      pay: 'USDT-TRC20 Pay',
      remainingTime: 'Remaining Time',
      paymentSuccess: 'Congratulations, payment successful!',
      payTips: 'Click the button below to get the payment address!',
      fetching: 'Fetching...',
      afterPayTip: 'Payment result is refreshing...,Please wait 1-2 minutes after payment, do not close the page!',
      closeOrder: 'Close Order',
      leftDays: 'Left Days',
      usdtTip: 'Please use {network} network, transfer {amount} USDT to the address above!',
      licensed: 'Licensed',
      licensedDays: 'Licensed Days',
      activate: 'Activate',
      default: 'Default',
      licenseCode: 'License Code',
      startWithGithub: 'Start With Github',
      monthly: 'Monthly',
      yearly: 'Yearly',
      freeDescription: 'Free Trial, Limit 1 Phone, Some Features Free Trial, Github Auth Required!',
      monthlyDescription: 'Buy 1 Month, Unlimited, All Features Available!',
      yearlyDescription: 'Buy 1 Year(50% Off), Unlimited, All Features Available!',
      freeLimited: 'Limit 1 Phone',
      allFeatures: 'All Features',
      unlimitedDevices: 'Unlimited Devices',
      customerSupport: 'Customer Support',
      forever: 'Forever',
      activateSuccess: 'Congratulations, activation successful!',
      displayMode: 'Display Mode',
      no: 'NO.',
      serial: 'Serial',
      mode: 'Mode',
      forwardPort: 'Forward Port',
      ip: 'IP',
      connectType: 'Connect Type',
      setSort: 'Set Sort',
      batchDM: 'Batch DM',
      usdttrc20: 'Pay With USDT-TRC20',
      usdtbep20: 'Pay With USDT-BEP20',
      loadSoundWaitTime: 'Load Sound Wait Time',
      batchDMTips: 'If there are 1000 target accounts, and there are 100 accounts in the currently selected device, then each account will DM 10 target accounts, so the tasks will be evenly distributed to each selected account',
      noAccount: 'No account found, did you forget to add the account to the account list?',
      grantSuccess: 'Permission granted successfully',
      fastInputEnabled: 'Fast Input Enabled',
      autoRetry: 'Auto Retry',
      needLicense: 'Sorry, you need to activate the license before you can use this feature!',
      deletePost: 'Delete Post',
      maxViews: 'Max Views',
      maxViewsTips: 'Posts with views less than the maximum views will be deleted',
      loginStatus: 'Login Status',
      activating: 'Activating',
      targetUsernameTips: 'Target Username, one per line',
      targetPostUrlTips: 'Target Post Url, one per line',
      toggleSidebar: 'Toggle Sidebar',
      moveSuccess: 'Move Success',
    },
    'zh-CN': {
      moveSuccess: '移动成功',
      toggleSidebar: '切换侧边栏',
      targetPostUrlTips: '目标帖子链接,每行1个',
      targetUsernameTips: '目标用户名,每行1个',
      activating: '激活中',
      loginStatus: '登录状态',
      maxViews: '最大观看数',
      maxViewsTips: '删除观看数小于最大观看数的帖子',
      deletePost: '删除帖子',
      needLicense: '很抱歉,您需要激活授权后才能使用该功能!',
      autoRetry: '自动重试',
      fastInputEnabled: '快速输入已启用',
      grantSuccess: '权限添加成功',
      noAccount: '未找到账号,您是否忘记了添加账号到账号列表?',
      batchDMTips: '如果有1000个目标账号,当前选择的设备中有100个账号,那么每个账号会私信10个目标账号,平均分配任务到每个选择执行的账号',
      loadSoundWaitTime: '加载声音等待时间',
      usdtbep20: 'USDT-BEP20 支付',
      usdttrc20: 'USDT-TRC20 支付',
      batchDM: '批量私信',
      setSort: '设置排序',
      connectType: '连接类型',
      ip: 'IP',
      forwardPort: '转发端口',
      mode: '型号',
      serial: '设备标识',
      no: 'NO.',
      displayMode: '显示模式',
      activateSuccess: '恭喜您，激活成功！',
      forever: '永久',
      customerSupport: '客服支持',
      unlimitedDevices: '无限设备',
      allFeatures: '所有功能',
      freeLimited: '限制1台手机',
      freeDescription: '免费试用, 限制1台手机, 部分功能免费试用, 需要Github认证!',
      monthlyDescription: '购买1个月, 无限制, 所有功能都可以使用!',
      yearlyDescription: '购买1年(5折), 无限制, 所有功能都可以使用!',
      monthly: '月度',
      yearly: '年度',
      startWithGithub: '通过 Github 开始',
      licenseCode: '授权码',
      default: '默认',
      activate: '激活',
      licensedDays: '已授权天数',
      licensed: '已授权',
      usdtTip: '请使用 {network} 网络,向上方地址转账 {amount} USDT!',
      closeOrder: '关闭订单',
      afterPayTip: '支付结果刷新中...,支付后请等待1-2分钟,不要关闭页面！',
      fetching: '获取中...',
      payTips: '点击下方按钮获取支付地址！',
      paymentSuccess: '恭喜您，支付成功！',
      remainingTime: '剩余时间',
      pay: 'USDT-TRC20 支付',
      leftDays: '剩余天数',
      grantTikTok: '授权TikTok',
      initing: '初始化中',
      view: '查看',
      postActions: '点赞 / 评论 / 分享 / 收藏 / 观看',
      userActions: '关注 / 取消关注',
      unFollow: '取消关注',
      moveToFirst: '移动到第一位',
      openAppDir: '打开应用目录',
      invalidLicense: '无效授权',
      waitingTasks: '等待中任务',
      runningTasks: '运行中任务',
      successTasks: '成功任务',
      failedTasks: '失败任务',
      tutorial: '教程',
      openDownloadDir: '打开下载目录',
      scriptName: '脚本名称',
      scriptArgs: '脚本参数',
      startScript: '开始脚本',
      deviceFound: '个设备已找到! 请稍等...',
      updateConfirm: '确定要更新吗?',
      checkUpdate: '检查更新',
      autoWakeUp: '自动唤醒 Agent',
      addProductLink: '添加商品链接',
      addProductLinkTips: '启用后将自动在发布时添加橱窗中的第一个商品链接',
      addSoundTips: '添加TikTok推荐的音乐',
      originSound: '原声',
      soundVolume: '声音音量',
      addSound: '添加声音',
      passwordTips: '请输入密码',
      emailsTips: '每行一个用于注册账号的邮箱',
      emails: '邮箱',
      sort: '排序',
      apkPath: 'APK 路径',
      installJobs: '安装任务',
      updateServiceSuccess: '更新服务成功',
      updateService: '更新服务',
      licensed: "已激活",
      unlicensed: "激活",
      days: "天",
      licenseValid: "许可证有效期：{days}天",
      activateLicense: "点击激活许可证",
      githubAuth: 'GitHub 认证',
      githubAuthStatus: 'GitHub 认证状态',
      notAuthorized: '未认证',
      authorized: '已认证',
      authorizeWithGithub: '通过 GitHub 授权,永久免费试用(1台手机)',
      githubAuthSuccessMessage: 'GitHub 认证成功!',
      githubAuthFailureMessage: 'GitHub 认证失败. 请重试.',
      githubAuthErrorMessage: '在 GitHub 认证过程中发生错误.',
      detecting_devices: '正在检测设备...',
      depositNetwork: '充币网络',
      depositAddress: '充币地址',
      depositComment: '充币备注',
      logoutConfirm: '确定要退出这个设备上面的所有账号吗?',
      logout: '登出',
      tiktok: 'Tiktok',
      inputPackageName: '输入包名',
      progress: '进度',
      scrapeFansJobs: '采集粉丝任务',
      startPublishBeta: '开始发布(测试版)',
      followJobs: '关注任务',
      followTitle: '关注账号',
      follow: '关注',
      no_devices_tips: '未找到设备! 请通过USB或TCP连接设备!',
      md5: 'MD5',
      materials: '素材库',
      title: '标题',
      editTitle: '编辑标题',
      publishSettings: '发布',
      trainSettings: '养号',
      targetUsernameRequired: '目标用户名必填',
      postUrlRequired: '帖子链接必填',
      shareTitle: '转发目标帖子到选择的账号',
      share: '分享',
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
      batchAddConfirm: '是否确定要添加这些 {count} 个帐号?',
      batchAddTips: '平台##邮箱##密码##用户名##设备号\n例如: email1##123##test##1\n每行一个帐号',
      batchAdd: '批量添加',
      pasteSuccess: '粘贴成功',
      percentage: '百分比',
      transferRate: '传输速率',
      updateAgent: '更新Agent',
      usernameMustStartWithAt: '用户名必须以 @ 开头',
      usernameRequired: '用户名必填',
      computer: '电脑',
      free: '免费',
      month: '月',
      year: '年',
      price: '价格',
      telegramCustom: 'Telegram 客服',
      publishStartTimeFormatError: '发布开始时间格式错误',
      trainStartTimeFormatError: '养号开始时间格式错误',
      openAppAgent: '打开 Agent',
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
      scrapeFollowers: '采集粉丝',
      scrapeFans: '采集粉丝',
      screenOff: '开启息屏投屏',
      indexUpdated: '序号已更新',
      publishConfig: '发布配置',
      trainConfig: '养号配置',
      viewDuration: '观看时长',
      second: '秒',
      minute: '分钟',
      select: '选择',
      enableFastInput: '启用快速输入法',
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
      setProxy: '设置代理',
      proxyEnabled: '代理已启用',
      proxyDisabled: '代理已禁用',
      proxySettings: '代理设置',
      buyLicense: '购买授权',
      telegram: 'Telegram',
      startPublish: '开始发布',
      startTrain: '开始养号',
      startLogin: '开始登录',
      startFillProfile: '开始设置资料',
      startRegister: '开始注册',
      siteName: 'TikMatrix',
      siteUrl: 'https://www.tikmatrix.com',
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
      groups: '分组',
      titles: '标题',
      name: '名称',
      addAccount: '添加帐号',
      addMaterial: '添加视频',
      group: '分组',
      defaultGroup: '默认分组',
      retry: '重试',
      preview: '预览',
      showSimInfo: 'Sim卡 信息',
      reboot: '重启',
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
      follow: '关注',
      favorite: '收藏',
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
      idle: '空闲',
      running: '运行中',
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
      installAPK: '安装 APK',
      apk: 'APK',
      init: '初始化',
      enableTCP: '启用 ADB TCP',
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
      showTimeSetting: '时间设置',
      showLanguageSetting: '语言设置',
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
      initAppAgent: '初始化 Agent',
    },

  }
})
