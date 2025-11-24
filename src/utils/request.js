import { invoke } from '@tauri-apps/api/tauri';

/**
 * Simplified request wrapper using Rust backend
 * All logic moved to Rust for:
 * - Port reading
 * - URL construction
 * - Proxy selection
 * - Error notifications
 */
const request = async function request(config) {
  const { method, url, params, headers, body, form, data, timeout, rawResponse } = config;

  // Mock mode check
  if (import.meta.env.VITE_APP_MOCK === 'true') {
    console.warn('Mock mode enabled but no mock handler is defined. Returning empty response.');
    return Promise.resolve({ code: 0, data: [] });
  }

  try {
    // Call Rust backend which handles everything:
    // - Reading port.txt
    // - Building full URL with query params
    // - Intelligent proxy selection (bypasses localhost automatically)
    // - Error notifications via events
    const response = await invoke('agent_request', {
      method: method || 'GET',
      url,
      params: params || null,
      headers: headers || null,
      body: body || null,
      form: form || null,
      data: data !== undefined ? data : null,
      timeout: timeout ? Math.floor(timeout / 1000) : 30,
      rawResponse: rawResponse || false
    });

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

export default request
