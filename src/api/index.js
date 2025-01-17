const api = {
  auth: '/api/auth',
  install: '/api/install',
  device: '/api/device',
  account: '/api/account',
  material: '/api/material',
  upload_video: '/api/upload_video',
  upload_videos: '/api/material/upload_videos',
  material_count: '/api/material/count',

  train_now: '/api/train_now',
  publish_now: '/api/publish_now',
  message_now: '/api/message_now',
  share_now: '/api/share_now',
  follow_now: '/api/follow_now',
  scrape_now: '/api/scrape_now',
  init: '/api/device/init',
  index: '/api/device/index',
  group: '/api/group',
  music: '/api/music',
  watcher: '/api/dialog_watcher',
  settings: '/api/settings',
  task_status: '/api/device/task_status',
  get_license: '/api/get_license',
  add_license: '/api/add_license',
  count_online_device: '/api/device/count_online',
  count_all_account: '/api/account/count_all',
  count_account_by_group_id: '/api/account/count_account_by_group_id',
  task: '/api/task',
  count_task_by_status: '/api/task/count_by_status',
  retry_all_failed_tasks: '/api/task/retry_all',
  delete_all_tasks: '/api/task/delete_all',
  run_task_now: '/api/task/run_now',
  read_clipboard: '/api/get_clipboard',
  delete_all_materials: '/api/material/delete_all',
  proxy: '/agent/api/proxy',
  get_ip: '/api/get_ip',
  analytics: '/api/data_analysis',
  adb_command: '/agent/api/adb_command',
  script: '/agent/api/script',
  scan_tcp: '/agent/api/tcp_scan',
  stop_task: '/agent/api/stop_task',
  menus: '/api/menus',
  get_accounts_by_device: '/api/account_by_device',
  get_group_by_id: '/api/group/get_by_id',
  move_to_group: '/api/device/move_to_group',
  set_text: '/api/device/set_text',
  reset_all_index: '/api/device/reset_all_index',
  edit_title: '/api/material/update_title',
  install_now: '/api/install_now',
  clear_gallery: '/api/clear_gallery',
}
export default api
