import { fetch, Body, ResponseType } from '@tauri-apps/api/http';
import mock from '../mock'
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { emit, listen } from '@tauri-apps/api/event';

const request = async function request(config) {
  const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
  if (port === "0") {
    console.log("port is 0, wait for agent to start")
    let res = { code: 0, data: [] }
    return res;
  }
  const { method, url } = config
  const mockMethod = method || 'get'
  if (import.meta.env.VITE_APP_MOCK === 'true') {
    return Promise.resolve(mock(url, mockMethod.toLowerCase()))
  }
  const queryUrl = `http://127.0.0.1:50809${url}?${new URLSearchParams(config.params).toString()}`
  let options = {
    method: config.method || 'GET',
    headers: config.headers,
    body: config.data ? Body.json(config.data) : undefined,
    responseType: ResponseType.JSON,
    contentType: 'application/json'
  }
  console.log(`request: ${queryUrl} options: ${JSON.stringify(options)}`)
  const response = await fetch(`${queryUrl}`, options,);
  console.log(`response status: ${response.status}`)
  if (response.status >= 400) {
    await emit('NOTIFY', {
      type: 'error',
      message: `url: ${queryUrl}, code: ${response.status}, message: ${response.data}`,
      timeout: 2000
    });
    return { code: response.status, data: response.data, error: response.data, }
  }
  return response.data
}
export default request
