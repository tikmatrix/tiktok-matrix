import request from '../utils/request'
import api from '../api'
export function auth({ password }) {
  return request({
    method: 'post',
    url: api.auth,
    data: {
      password
    }
  })
}
export function tiktok_query(data) {
  return request({
    method: 'post',
    url: api.tiktok_query,
    data: data
  })
}

export function get_devices() {
  return request({
    method: 'get',
    url: api.device
  })
}


export function get_materials_byused({ used }) {
  return request({
    method: 'get',
    url: api.material,
    params: { used }
  })
}
export function get_materials({ group_id }) {
  return request({
    method: 'get',
    url: api.material,
    params: { group_id }
  })
}
export function get_material_count({ used, group_id }) {
  return request({
    method: 'get',
    url: api.material_count,
    params: { used, group_id }
  })
}


export function upload_videos(data) {
  return request({
    method: 'post',
    url: api.upload_videos,
    data
  })
}

export function upload_video(data) {
  return request({
    method: 'post',
    url: api.upload_video,
    data
  })
}

export function delete_material({ id }) {
  return request({
    method: 'delete',
    url: api.material,
    params: { id }
  })
}
export function get_accounts() {
  return request({
    method: 'get',
    url: api.account
  })
}

export function add_account(account) {
  return request({
    method: 'post',
    url: api.account,
    data: account
  })
}
export function update_account(account) {
  return request({
    method: 'put',
    url: api.account,
    data: account
  })
}
export function delete_account({ id }) {
  return request({
    method: 'delete',
    url: api.account,
    params: { id }
  })
}

export function get_tasks() {
  return request({
    method: 'get',
    url: api.task
  })
}
export function delete_task({ id }) {
  return request({
    method: 'delete',
    url: api.task,
    params: { id }
  })
}
export function update_task({ id, status }) {
  return request({
    method: 'put',
    url: api.task,
    data: { id, status }
  })
}


export function init(data) {
  return request({
    method: 'post',
    url: api.init,
    data
  })
}
export function index({ serial, index }) {
  return request({
    method: 'get',
    url: api.index,
    params: { serial, index }
  })
}
export function get_groups() {
  return request({
    method: 'get',
    url: api.group
  })
}
export function add_group(group) {
  return request({
    method: 'post',
    url: api.group,
    data: group
  })
}
export function update_group(group) {
  return request({
    method: 'put',
    url: api.group,
    data: group
  })
}
export function delete_group({ id }) {
  return request({
    method: 'delete',
    url: api.group,
    params: { id }
  })
}
export function get_musics() {
  return request({
    method: 'get',
    url: api.music
  })
}
export function add_music({ release_name, artist_name }) {
  return request({
    method: 'post',
    url: api.music,
    data: { release_name, artist_name }
  })
}
export function update_music({ id, release_name, artist_name }) {
  return request({
    method: 'put',
    url: api.music,
    data: { id, release_name, artist_name }
  })
}
export function delete_music({ id }) {
  return request({
    method: 'delete',
    url: api.music,
    params: { id }
  })
}

export function get_watchers() {
  return request({
    method: 'get',
    url: api.watcher
  })
}
export function add_watcher({ name, conditions, action, status }) {
  return request({
    method: 'post',
    url: api.watcher,
    data: { name, conditions, action, status }
  })
}
export function update_watcher({ id, name, conditions, action, status }) {
  return request({
    method: 'put',
    url: api.watcher,
    data: { id, name, conditions, action, status }
  })
}
export function delete_watcher({ id }) {
  return request({
    method: 'delete',
    url: api.watcher,
    params: { id }
  })
}

export function get_settings() {
  return request({
    method: 'get',
    url: api.settings
  })
}
export function update_settings(settings) {
  return request({
    method: 'put',
    url: api.settings,
    data: settings
  })
}
export function get_running_tasks() {
  return request({
    method: 'get',
    url: api.running_task,
  })
}
export function get_license() {
  return request({
    method: 'get',
    url: api.get_license,
    params: {}
  })
}
export function create_order(data) {
  return request({
    method: 'post',
    url: api.create_order,
    data: data
  })
}
export function get_order() {
  return request({
    method: 'post',
    url: api.get_order,
    data: {}
  })
}
export function close_order() {
  return request({
    method: 'post',
    url: api.close_order,
    data: {}
  })
}
export function activate_license(data) {
  return request({
    method: 'post',
    url: api.activate_license,
    data: data
  })
}
export function bind_affiliate(data) {
  return request({
    method: 'post',
    url: api.bind_affiliate,
    data: data
  })
}

export function count_task_by_status() {
  return request({
    method: 'get',
    url: api.count_task_by_status
  })
}

export function count_online_device() {
  return request({
    method: 'get',
    url: api.count_online_device
  })
}
export function count_all_account() {
  return request({
    method: 'get',
    url: api.count_all_account
  })
}
export function count_account_by_group_id({ group_id }) {
  return request({
    method: 'get',
    url: api.count_account_by_group_id,
    params: { group_id }
  })
}
export function retry_all_failed_tasks() {
  return request({
    method: 'get',
    url: api.retry_all_failed_tasks
  })
}


export function read_clipboard({ serial }) {
  return request({
    method: 'get',
    url: api.read_clipboard,
    params: { serial }
  })
}

export function delete_all_materials(params) {
  return request({
    method: 'delete',
    url: api.delete_all_materials,
    params: params
  })
}
export function delete_all_tasks() {
  return request({
    method: 'delete',
    url: api.delete_all_tasks
  })
}
export function delete_all_accounts() {
  return request({
    method: 'delete',
    url: api.delete_all_accounts
  })
}


export function get_ip({ serial }) {
  return request({
    method: 'get',
    url: api.get_ip,
    params: { serial }
  })
}

export function get_analytics() {
  return request({
    method: 'get',
    url: api.analytics
  })
}

export function adb_command(adbCommandRequest) {
  return request({
    method: 'post',
    data: adbCommandRequest,
    url: api.adb_command
  })
}
export function script(scriptRequest) {
  return request({
    method: 'post',
    data: scriptRequest,
    url: api.script
  })
}
export function scan_tcp(data) {
  return request({
    method: 'post',
    data,
    url: api.scan_tcp
  })
}
export function stop_task(data) {
  return request({
    method: 'post',
    data,
    url: api.stop_task
  })
}
export function get_menus() {
  return request({
    method: 'get',
    url: api.menus
  })
}

export function get_accounts_by_device({ device }) {
  return request({
    method: 'get',
    params: { device },
    url: api.get_accounts_by_device
  })
}
export function get_group_by_id({ id }) {
  return request({
    method: 'get',
    params: { id },
    url: api.get_group_by_id
  })
}
export function move_to_group(data) {
  return request({
    method: 'post',
    data,
    url: api.move_to_group
  })
}
export function set_text(data) {
  return request({
    method: 'post',
    data,
    url: api.set_text
  })
}

export function run_now_by_account(data) {
  return request({
    method: 'post',
    data,
    url: api.run_now_by_account
  })
}


export function message_now(data) {
  return request({
    method: 'post',
    data,
    url: api.message_now
  })
}
export function comment_now(data) {
  return request({
    method: 'post',
    data,
    url: api.comment_now
  })
}
export function follow_now(data) {
  return request({
    method: 'post',
    data,
    url: api.follow_now
  })
}


//reset_all_index
export function reset_all_index(data) {
  return request({
    method: 'get',
    data,
    url: api.reset_all_index
  })
}
export function edit_title(data) {
  return request({
    method: 'put',
    data,
    url: api.edit_title
  })
}


export function clear_gallery(data) {
  return request({
    method: 'post',
    data,
    url: api.clear_gallery
  })
}

export function scrape_now(data) {
  return request({
    method: 'post',
    data,
    url: api.scrape_now
  })
}

export function get_stripe_portal_url() {
  return request({
    method: 'get',
    url: api.get_stripe_portal_url
  })
}

export function get_stripe_checkout_url(data) {
  return request({
    method: 'post',
    data,
    url: api.get_stripe_checkout_url
  })
}

