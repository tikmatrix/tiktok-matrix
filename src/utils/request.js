import axios from 'axios'
import mock from '../mock'
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { appDataDir } from '@tauri-apps/api/path';
const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
export function post(config) {
  !config && (config = { headers: {} })
  !config.headers && (config.headers = {})
  !config.data && (config.data = {})
  config.baseURL = 'http://127.0.0.1:' + port
  const { method, url, data, headers } = config
  const mockMethod = method || 'get'
  if (import.meta.env.VITE_APP_MOCK === 'true') {
    return Promise.resolve(mock(url, mockMethod.toLowerCase()))
  }
  console.log('request', config)
  return axios.post(`${config.baseURL}${url}`, data, { headers: headers }).then(ret => {
    let res
    if (typeof ret === 'string') {
      res = JSON.parse(ret.data)
    } else {
      res = ret.data
    }
    return res
  })
}

const request = function request(config) {
  !config && (config = { headers: {} })
  !config.headers && (config.headers = {})
  !config.data && (config.data = {})
  !config.params && (config.params = {})
  config.baseURL = 'http://127.0.0.1:' + port
  const { method, url } = config
  const mockMethod = method || 'get'
  if (import.meta.env.VITE_APP_MOCK === 'true') {
    return Promise.resolve(mock(url, mockMethod.toLowerCase()))
  }
  // console.log('request', config)
  return axios(config).then(ret => {
    let res
    if (typeof ret === 'string') {
      res = JSON.parse(ret.data)
    } else {
      res = ret.data
    }
    return res
  })
}
export default request
