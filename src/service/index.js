import request from '../utils/request'
import api from '../api'
import { ResponseType } from '@tauri-apps/api/http'

// Note: WebSocket services should be imported directly in components
// This service layer is now only for HTTP API calls

export function tiktok_query(data) {
  return request({
    method: 'post',
    url: api.tiktok_query,
    data: data
  })
}

export function list_super_marketing_datasets({ data_type } = {}) {
  const params = {}
  if (data_type) {
    params.data_type = data_type
  }
  return request({
    method: 'get',
    url: api.super_marketing_dataset,
    params
  })
}

export function import_super_marketing_dataset(data) {
  return request({
    method: 'post',
    url: api.super_marketing_dataset_import,
    data
  })
}

export function get_super_marketing_dataset({ dataset_id, limit = 50, offset = 0 }) {
  return request({
    method: 'get',
    url: `${api.super_marketing_dataset}/${dataset_id}`,
    params: { limit, offset }
  })
}

export function clear_super_marketing_dataset({ dataset_id }) {
  return request({
    method: 'delete',
    url: `${api.super_marketing_dataset}/${dataset_id}`
  })
}

export function update_super_marketing_dataset({ dataset_id, strategy, label }) {
  const payload = {}
  if (typeof strategy !== 'undefined') {
    payload.strategy = strategy
  }
  if (typeof label !== 'undefined') {
    payload.label = label
  }
  return request({
    method: 'put',
    url: `${api.super_marketing_dataset}/${dataset_id}`,
    data: payload
  })
}

export function update_super_marketing_dataset_entry({ dataset_id, entry_id, value, limit = 50, offset = 0 }) {
  return request({
    method: 'put',
    url: `${api.super_marketing_dataset}/${dataset_id}/entries/${entry_id}`,
    data: { value },
    params: { limit, offset }
  })
}

export function delete_super_marketing_dataset_entry({ dataset_id, entry_id, limit = 50, offset = 0 }) {
  return request({
    method: 'delete',
    url: `${api.super_marketing_dataset}/${dataset_id}/entries/${entry_id}`,
    params: { limit, offset }
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

export function get_alipay_checkout_url(data) {
  return request({
    method: 'post',
    data,
    url: api.get_alipay_checkout_url
  })
}


export function get_stripe_price_table_info() {
  return request({
    method: 'get',
    url: api.get_stripe_price_table_info
  })
}
export function get_plans() {
  return request({
    method: 'get',
    url: api.plan
  })
}
export function add_plan(data) {
  return request({
    method: 'post',
    url: api.plan,
    data
  })
}
export function update_plan(data) {
  return request({
    method: 'put',
    url: api.plan,
    data
  })
}
export function delete_plan({ id }) {
  return request({
    method: 'delete',
    url: api.plan,
    params: { id }
  })
}



const SUPPORT_RESPONSE_KEYS = ['data', 'result', 'payload'];

function unwrapSupportResponse(response) {
  if (!response || typeof response !== 'object') {
    return response;
  }
  let current = response;
  const visited = new Set();
  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== 'object') {
      return current;
    }
    const key = SUPPORT_RESPONSE_KEYS.find(candidate =>
      Object.prototype.hasOwnProperty.call(current, candidate)
    );
    if (!key) {
      return current;
    }
    const next = current[key];
    if (visited.has(next)) {
      return current;
    }
    visited.add(next);
    if (next === undefined) {
      return current;
    }
    current = next;
  }
  return current;
}

function normalizeSupportResponse(response) {
  const data = unwrapSupportResponse(response);
  const code = typeof response?.code === 'number' ? response.code : undefined;
  const status = typeof response?.status === 'number' ? response.status : undefined;
  return { data, raw: response, code, status };
}

function toArray(value) {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function toSupportFilePart(file, index) {
  if (!file) {
    return null;
  }
  const path = file.path || file.filePath || file.file_path;
  if (!path) {
    return null;
  }
  const field = file.field || `attachment${index}`;
  const fileName = file.fileName || file.file_name || file.name || `attachment-${index + 1}.bin`;
  const mimeType = file.mimeType || file.contentType || file.content_type || 'application/octet-stream';
  const metadata = file.metadata || file.meta || null;
  const metaEntry = {
    field,
    fileName,
    filename: fileName,
    metadata,
    checksum: file.checksum,
    contentType: mimeType
  };
  return {
    field,
    formPart: {
      file: path,
      fileName,
      mime: mimeType,
      mimeType
    },
    metaEntry
  };
}

function buildSupportFormParts(payload, attachmentParts, options = {}) {
  const { attachmentsMeta = [], extraFields } = options;
  const form = {
    payload: JSON.stringify(payload || {})
  };

  if (extraFields && typeof extraFields === 'object') {
    Object.keys(extraFields).forEach(key => {
      const value = extraFields[key];
      if (value !== undefined && value !== null) {
        form[key] = value;
      }
    });
  }

  const metaList = Array.isArray(attachmentsMeta) ? [...attachmentsMeta] : [];
  toArray(attachmentParts).forEach(info => {
    if (!info) {
      return;
    }
    const { field, formPart, metaEntry } = info;
    if (!field || !formPart) {
      return;
    }
    form[field] = formPart;
    if (metaEntry && !metaList.some(item => item && item.field === field)) {
      metaList.push(metaEntry);
    }
  });

  if (metaList.length) {
    form.attachments_meta = JSON.stringify(metaList);
  }

  return form;
}

export function support_generate_logs(data) {
  return request({
    method: 'post',
    url: api.support_logs,
    data
  })
}

export function support_upload(data) {
  return request({
    method: 'post',
    url: api.support_upload,
    data
  })
}

export async function support_file_info(data) {
  const response = await request({
    method: 'post',
    url: api.support_file_info,
    data
  })
  return normalizeSupportResponse(response)
}

export async function support_create_ticket(input, options = {}) {
  const payload = input?.payload ? input.payload : input;
  const attachmentsInput = options.attachments ?? input?.attachmentsFiles ?? input?.attachments;
  const attachments = toArray(attachmentsInput);
  const attachmentParts = attachments
    .map((file, index) => toSupportFilePart(file, index))
    .filter(info => Boolean(info));
  const attachmentsMeta = options.attachmentsMeta ?? input?.attachmentsMeta;
  const extraFields = options.extraForm ?? input?.extraForm;
  const headers = options.headers ?? input?.headers;
  const forceForm = options.forceForm ?? input?.forceForm;

  const shouldUseForm =
    forceForm ||
    attachmentParts.length > 0 ||
    (Array.isArray(attachmentsMeta) && attachmentsMeta.length > 0);

  if (shouldUseForm) {
    const form = buildSupportFormParts(payload, attachmentParts, {
      attachmentsMeta,
      extraFields
    });
    const response = await request({
      method: 'post',
      url: api.support_ticket,
      form,
      headers
    });
    return normalizeSupportResponse(response);
  }

  const response = await request({
    method: 'post',
    url: api.support_ticket,
    data: payload,
    headers
  });
  return normalizeSupportResponse(response);
}

export async function support_fetch_summary(params) {
  const response = await request({
    method: 'get',
    url: api.support_summary,
    params
  });
  return normalizeSupportResponse(response);
}

export async function support_fetch_tickets(params) {
  const response = await request({
    method: 'get',
    url: api.support_tickets_list,
    params
  });
  return normalizeSupportResponse(response);
}

export async function support_ticket_detail(params) {
  const response = await request({
    method: 'get',
    url: api.support_ticket_detail,
    params
  });
  return normalizeSupportResponse(response);
}

export async function support_append_message(input, options = {}) {
  const payload = input?.payload ? input.payload : input;
  const attachmentsInput = options.attachments ?? input?.attachmentsFiles ?? input?.attachments;
  const attachments = toArray(attachmentsInput);
  const attachmentParts = attachments
    .map((file, index) => toSupportFilePart(file, index))
    .filter(info => Boolean(info));
  const attachmentsMeta = options.attachmentsMeta ?? input?.attachmentsMeta;
  const extraFields = options.extraForm ?? input?.extraForm;
  const headers = options.headers ?? input?.headers;
  const forceForm = options.forceForm ?? input?.forceForm;

  const shouldUseForm =
    forceForm ||
    attachmentParts.length > 0 ||
    (Array.isArray(attachmentsMeta) && attachmentsMeta.length > 0);

  if (shouldUseForm) {
    const form = buildSupportFormParts(payload, attachmentParts, {
      attachmentsMeta,
      extraFields
    });
    const response = await request({
      method: 'post',
      url: api.support_append_message,
      form,
      headers
    });
    return normalizeSupportResponse(response);
  }

  const response = await request({
    method: 'post',
    url: api.support_append_message,
    data: payload,
    headers
  });
  return normalizeSupportResponse(response);
}

export async function support_update_status(data) {
  const response = await request({
    method: 'post',
    url: api.support_update_status,
    data
  });
  return normalizeSupportResponse(response);
}

export async function support_download_attachment(params) {
  return request({
    method: 'get',
    url: api.support_download,
    params,
    responseType: ResponseType.Binary,
    rawResponse: true
  })
}
