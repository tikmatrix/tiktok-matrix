import request, { post } from '../utils/request'
import * as util from '../utils'
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

export function logout() {
  util.delCookie('password')
}
export function get_devices() {
  return request({
    method: 'get',
    url: api.device
  })
}

export function install(data) {
  return request({
    method: 'post',
    url: api.install,
    data
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
  return post({
    url: api.upload_videos,
    data
  })
}

export function upload_video(data) {
  return post({
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


//repair
export function init({ serial, init }) {
  return request({
    method: 'get',
    url: api.init,
    params: { serial, init }
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
export function get_task_status({ serial }) {
  return request({
    method: 'get',
    url: api.task_status,
    params: { serial }
  })
}
export function get_license() {
  return request({
    method: 'get',
    url: api.get_license
  })
}
export function add_license({ key }) {
  return request({
    method: 'post',
    url: api.add_license,
    data: { key }
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

export function delete_all_materials() {
  return request({
    method: 'delete',
    url: api.delete_all_materials
  })
}
export function delete_all_tasks() {
  return request({
    method: 'delete',
    url: api.delete_all_tasks
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

export function train_now(data) {
  return request({
    method: 'post',
    data,
    url: api.train_now
  })
}
export function run_task_now(data) {
  return request({
    method: 'post',
    data,
    url: api.run_task_now
  })
}
export function publish_now(data) {
  return request({
    method: 'post',
    data,
    url: api.publish_now
  })
}

export function message_now(data) {
  return request({
    method: 'post',
    data,
    url: api.message_now
  })
}
export function share_now(data) {
  return request({
    method: 'post',
    data,
    url: api.share_now
  })
}
export function follow_now(data) {
  return request({
    method: 'post',
    data,
    url: api.follow_now
  })
}
export function scrape_now(data) {
  return request({
    method: 'post',
    data,
    url: api.scrape_now
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
export function install_now(data) {
  return request({
    method: 'post',
    data,
    url: api.install_now
  })
}

export function clear_gallery(data) {
  return request({
    method: 'post',
    data,
    url: api.clear_gallery
  })
}



