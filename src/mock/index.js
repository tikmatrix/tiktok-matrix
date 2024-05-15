import api from '../api'
let devices = []
for (let i = 1; i <= 88; i++) {
  devices.push({
    id: i,
    group_id: Math.floor(Math.random() * 3) + 1,
    serial: 'divice' + i,
    forward_port: '10800',
    ip: '192.168.0.' + i,
    agent_ip: '127.0.0.1'
  })
}
let groups = []
for (let i = 1; i <= 3; i++) {
  groups.push({
    id: i,
    name: 'Group' + i,
    auto_train: Math.round(Math.random()), // 生成0或1的随机整数
    auto_publish: Math.round(Math.random()), // 生成0或1的随机整数
    publish_type: Math.round(Math.random()) + 1, // 生成0或1的随机整数
    product_link: 'https://vm.tiktok.com/ZGe2xRC8t/'
  })
}
let musics = []
for (let i = 1; i <= 20; i++) {
  musics.push({
    id: i,
    release_name: 'release_name' + i,
    artist_name: 'artist_name' + i
  })
}
let materials = []
for (let i = 1; i <= 100; i++) {
  materials.push({
    id: i.toString(),
    md5: '6aed71a8304f9dc68a9acd66fc5e057d',
    name: 'mock.webp',
    create_time: '2023-11-13 13:43:49',
    used: Math.round(Math.random()), // 生成0或1的随机整数
    group_id: Math.floor(Math.random() * 10) + 1 // 生成1到10之间的随机整数
  })
}
let accounts = []
for (let i = 1; i <= 10; i++) {
  accounts.push({
    id: i,
    email: 'admin' + i + '@tikmatrix.com',
    username: '@admin' + i,
    pwd: '123qwe...',
    register_time: '2023-11-13 13:43:49',
    last_login_time: '2023-11-13 13:43:49',
    fans: 0,
    device: 'device' + i,
    automated: 0,
    online: 1,
    group_id: Math.floor(Math.random() * 10) + 1 // 生成1到10之间的随机整数
  })
}
let publish_jobs = []
for (let i = 1; i <= 100; i++) {
  publish_jobs.push({
    id: i.toString(),
    create_time: '2023-11-13 13:43:49',
    start_time: '2023-11-13 13:43:49',
    end_time: '2023-11-13 13:43:49',
    status: Math.floor(Math.random() * 4), // 生成0到3之间的随机整数
    material: 'mock.webp',
    username: '@admin' + i,
    title: 'title',
    device: 'device' + i,
    publish_type: 1,
    product_link: 'https://vm.tiktok.com/ZGe2xRC8t/',
    group_id: Math.floor(Math.random() * 10) + 1 // 生成1到10之间的随机整数
  })
}
let train_jobs = []
for (let i = 1; i <= 100; i++) {
  train_jobs.push({
    id: i.toString(),
    create_time: '2023-11-13 13:43:49',
    start_time: '2023-11-13 13:43:49',
    end_time: '2023-11-13 13:43:49',
    status: Math.floor(Math.random() * 4), // 生成0到3之间的随机整数
    click: 1,
    favorites: 1,
    follow: 1,
    username: '@admin' + i,
    device: 'device' + i,
    group_id: Math.floor(Math.random() * 10) + 1 // 生成1到10之间的随机整数
  })
}
let watchers = []
for (let i = 1; i <= 100; i++) {
  watchers.push({
    id: i.toString(),
    name: 'name',
    conditions: 'hello,ok',
    action: 'click',
    status: Math.floor(Math.random() * 4) // 生成0到3之间的随机整数
  })
}
let avatars = []
for (let i = 1; i <= 100; i++) {
  avatars.push({
    id: i.toString(),
    name: 'mock.webp'
  })
}
let post_comments = []
for (let i = 1; i <= 100; i++) {
  post_comments.push({
    id: i.toString(),
    create_time: '2023-11-13 13:43:49',
    post_url: 'https://www.tiktok.com/@ferchugimenez/video/7312216650374188294',
    topic_count: 3,
    comment_count: 20,
    account_count: 8
  })
}
let analytics = []
for (let i = 1; i <= 100; i++) {
  analytics.push({
    id: i.toString(),
    create_time: '2023-11-13 13:43:49',
    day_hour: '2023-11-13 ' + Math.floor(Math.random() * 24),
    follower_count: Math.floor(Math.random() * 1000000),
    video_count: Math.floor(Math.random() * 1000000),
    video_collect_count: Math.floor(Math.random() * 1000000),
    video_comment_count: Math.floor(Math.random() * 1000000),
    video_like_count: Math.floor(Math.random() * 1000000),
    video_play_count: Math.floor(Math.random() * 1000000),
    username: 'username' + Math.floor(Math.random() * 10)
  })
}
let virtual_hosts = []
for (let i = 1; i <= 10; i++) {
  virtual_hosts.push({
    id: i.toString(),
    user: 'root',
    password: 'xxxx',
    host: 'vnc://192.168.1.' + i,
    port: '22',
    name: 'baking',
    edit_bot: 'baking',
    post_bot: 'baking',
    multilogin: 'baking'
  })
}
let menus = ["dashboard", "groups", "devices", "materials", "accounts", "publishJobs", "trainJobs", "dialogWatcher", "avatars", "settings"]

const data = {
  put: {
    [api.shell]: {},
    [api.add_license]: {},
    [api.settings]: {}
  },
  post: {
    [api.shell]: {},
    [api.add_license]: {},
    [api.settings]: {},
    [api.gen_topic_comments]: [
      {
        no: 1,
        account_id: 1,
        content: 'You were the Chosen One!',
        parent_no: 0
      },
      {
        no: 2,
        account_id: 2,
        content: 'I hate sand. It’s coarse and rough and irritating and it gets everywhere.',
        parent_no: 1
      },
      {
        no: 3,
        account_id: 3,
        content: 'I don’t like sand. It’s coarse and rough and irritating and it gets everywhere.',
        parent_no: 2
      }
    ]
  },
  get: {
    [api.device]: devices,
    [api.material]: materials,
    [api.account]: accounts,
    [api.publish_job]: publish_jobs,
    [api.train_job]: train_jobs,
    [api.group]: groups,
    [api.music]: musics,
    [api.material_count]: Math.floor(Math.random() * 100),
    [api.watcher]: watchers,
    [api.get_license]: {
      uid: '12ab-34cd-56ef-78gh',
      key: 'abcd-efgh-ijkl-mnop',
      left_days: 50,
      name: 'Niostack',
      status: 'pass'
    },
    [api.settings]: {
      proxy_url: '192.168.0.1:7890',
      server_url: 'http://example.com',
      timezone: 'GMT+00:00',
      wifi_name: 'ExampleWiFi',
      wifi_password: 'ExamplePassword',
      version: '1.0.0',
      adb_mode: 'USB'
    },
    [api.task_status]: 'RUNNING',
    [api.count_online_device]: 2000,
    [api.count_all_account]: 16000,
    [api.count_train_job_by_status]: [
      {
        status: 0,
        count: 232
      },
      {
        status: 1,
        count: 32
      },
      {
        status: 2,
        count: 23232
      },
      {
        status: 3,
        count: 232
      }
    ],
    [api.count_publish_job_by_status]: [
      {
        status: 0,
        count: 232
      },
      {
        status: 1,
        count: 32
      },
      {
        status: 2,
        count: 23232
      },
      {
        status: 3,
        count: 232
      }
    ],
    [api.count_comment_job_by_status]: [
      {
        status: 0,
        count: 232
      },
      {
        status: 1,
        count: 32
      },
      {
        status: 2,
        count: 23232
      },
      {
        status: 3,
        count: 232
      }
    ],
    [api.count_account_by_group_id]: Math.floor(Math.random() * 100),
    [api.post_comment]: post_comments,
    [api.analytics]: analytics,
    [api.virtualHosts]: virtual_hosts,
    [api.menus]: menus
  }
}

const mock = (url, method) => {
  return {
    code: 1,
    message: '成功',
    data: data[method][url]
  }
}
export default mock
