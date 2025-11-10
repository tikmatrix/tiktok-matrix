import { fetch, Body, ResponseType } from '@tauri-apps/api/http';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
import { emit } from '@tauri-apps/api/event';

function buildQuery(params) {
  if (!params || typeof params !== 'object') {
    return '';
  }
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }
    searchParams.append(key, String(value));
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function buildBody(config) {
  if (config?.body) {
    return config.body;
  }
  if (config?.form) {
    return Body.form(config.form);
  }
  if (config?.data !== undefined) {
    return Body.json(config.data);
  }
  return undefined;
}

function shouldSetJsonContentType(config) {
  if (config?.headers && Object.keys(config.headers).some(key => key.toLowerCase() === 'content-type')) {
    return false;
  }
  if (config?.body) {
    return false;
  }
  if (config?.form) {
    return false;
  }
  return config?.data !== undefined;
}

const request = async function request(config) {
  let port = '50809';
  try {
    const portFile = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
    if (portFile && portFile.trim()) {
      port = portFile.trim();
    }
  } catch (error) {
    console.warn('Failed to read agent port, fallback to default 50809', error);
  }

  if (port === '0') {
    console.log('port is 0, wait for agent to start');
    return { code: 0, data: [] };
  }

  const { method, url } = config;
  if (import.meta.env.VITE_APP_MOCK === 'true') {
    console.warn('Mock mode enabled but no mock handler is defined. Returning empty response.');
    return Promise.resolve({ code: 0, data: [] });
  }

  const querySuffix = buildQuery(config.params);
  const queryUrl = `http://localhost:${port}${url}${querySuffix}`;

  const headers = { ...(config.headers || {}) };
  if (shouldSetJsonContentType(config)) {
    headers['Content-Type'] = 'application/json';
  }

  const options = {
    method: method || 'GET',
    headers,
    body: buildBody(config),
    responseType: config.responseType || ResponseType.JSON,
  };

  if (config.timeout) {
    options.timeout = config.timeout;
  }

  console.log(`request: ${queryUrl} options: ${JSON.stringify({ ...options, body: options.body ? '[Body]' : undefined })}`)
  const response = await fetch(`${queryUrl}`, options);
  console.log(`response status: ${response.status}`)
  if (response.status >= 400) {
    await emit('NOTIFY', {
      type: 'error',
      message: `url: ${queryUrl}, code: ${response.status}, message: ${response.data}`,
      timeout: 2000
    });
    return config.rawResponse ? response : { code: response.status, data: response.data, error: response.data }
  }
  return config.rawResponse ? response : response.data
}
export default request
