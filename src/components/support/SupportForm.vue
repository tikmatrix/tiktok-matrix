<template>
  <div class="support-form" v-if="!submittedTicket">
    <div class="intro">
      <h2 class="title">{{ $t('supportFormTitle') }}</h2>
      <p class="description">{{ $t('supportFormDescription') }}</p>
      <p class="description note">{{ $t('supportLogNote') }}</p>
    </div>

    <form class="support-form-body" @submit.prevent>
      <div class="form-row">
        <label class="form-label">{{ $t('supportSubject') }}</label>
        <div class="input-wrapper">
          <input v-model="form.subject" type="text" class="input input-bordered w-full"
            :placeholder="$t('supportSubjectPlaceholder')" maxlength="120" />
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">{{ $t('supportDescriptionLabel') }}</label>
        <div class="input-wrapper">
          <textarea v-model="form.description" rows="6" class="textarea textarea-bordered w-full"
            :placeholder="$t('supportDescriptionPlaceholder')"></textarea>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">{{ $t('supportPriority') }}</label>
        <div class="input-wrapper">
          <select v-model="form.priority" class="select select-bordered w-full max-w-xs">
            <option value="p3">{{ $t('supportPriorityNormal') }}</option>
            <option value="p2">{{ $t('supportPriorityHigh') }}</option>
            <option value="p1">{{ $t('supportPriorityUrgent') }}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">{{ $t('supportContactEmail') }}</label>
        <div class="input-wrapper">
          <input v-model="form.email" type="email" class="input input-bordered w-full"
            :placeholder="$t('supportContactEmailPlaceholder')" />
        </div>
      </div>

    </form>

    <div class="devices-section">
      <div class="section-header">
        <div>
          <h3 class="m-0">{{ $t('supportDeviceSelection') }}</h3>
          <div class="selected-summary">
            <span class="summary-text">{{ $t('selectedDevices') }}: {{ selectedSerials.length }} {{ $t('units')
            }}</span>
            <div class="summary-badges">
              <span v-for="serial in selectedSerials" :key="serial" class="badge badge-outline">
                {{ getDeviceNo(serial) }}
              </span>
              <span v-if="!selectedSerials.length" class="text-error text-sm">
                {{ $t('noDevicesSelected') }}
              </span>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" @click="selectAllDevices">
          {{ $t('supportSelectAllDevices') }}
        </button>
      </div>

      <div class="device-list">
        <div v-for="device in deviceRows" :key="device.real_serial" class="device-item"
          :class="{ 'is-selected': deviceSelected(device.real_serial) }" role="button" tabindex="0"
          @click="toggleDevice(device.real_serial)" @keydown.enter.prevent="toggleDevice(device.real_serial)"
          @keydown.space.prevent="toggleDevice(device.real_serial)">
          <div class="device-content">
            <span class="device-no">{{ getDeviceNo(device.real_serial) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="actions-bar">
      <button type="button" class="btn btn-primary" :disabled="submitting || collecting || uploading"
        @click="submitSupport">
        <span v-if="submitting || collecting || uploading" class="loading loading-spinner loading-sm"></span>
        <span>{{ $t('supportSubmitButton') }}</span>
      </button>
      <button type="button" class="btn btn-outline" @click="closeDialog">{{ $t('supportCancelButton') }}</button>
    </div>
  </div>

  <div class="support-success" v-else>
    <div class="success-card">
      <svg class="success-icon" viewBox="0 0 24 24" role="img" aria-hidden="true">
        <path fill="currentColor"
          d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm4.707 8.293-5.334 5.334a1 1 0 0 1-1.414 0l-2.666-2.667a1 1 0 1 1 1.414-1.414l1.959 1.96 4.627-4.627a1 1 0 0 1 1.414 1.414Z" />
      </svg>
      <h3 class="success-title">{{ $t('supportSuccessTitle') }}</h3>
      <p class="success-subtitle">
        {{ $t('supportSuccessSubtitle', { ticket: submittedTicket.ticketNo || submittedTicket.ticket_no }) }}
      </p>
      <div class="success-actions">
        <button type="button" class="btn btn-primary" @click="closeDialog">{{ $t('supportSuccessClose') }}</button>
        <button type="button" class="btn btn-outline" @click="createAnother">{{ $t('supportSuccessAnother') }}</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SupportForm',
  props: {
    devices: {
      type: Array,
      default: () => []
    },
    selecedDevices: {
      type: Array,
      default: () => []
    },
    clientInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      form: {
        subject: '',
        description: '',
        priority: 'p3',
        email: ''
      },
      selectedSerials: [...this.selecedDevices],
      logPackage: null,
      uploadedAttachment: null,
      messageTail: '',
      collecting: false,
      uploading: false,
      submitting: false,
      submittedTicket: null
    }
  },
  computed: {
    deviceRows() {
      return (this.devices || []).map(device => ({
        ...device,
        group: device.group_name || device.group_id || '-',
        last_seen: device.updated_at || device.last_seen || '-'
      }))
    },
    clientInfoNormalized() {
      const info = this.clientInfo || {}
      return {
        app_name: info.app_name || info.appName || info.name || 'TikMatrix',
        client_version: info.client_version || info.clientVersion || info.version || '',
        app_version: info.app_version || info.appVersion || info.clientVersion || '',
      }
    }
  },
  mounted() {
    this.resetSubject()
  },
  watch: {
    selecedDevices: {
      immediate: true,
      handler(newVal) {
        this.selectedSerials = Array.isArray(newVal) ? [...newVal] : []
      }
    }
  },
  methods: {
    formatSize(size) {
      if (!size) return '0 B'
      if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
      if (size > 1024) return `${(size / 1024).toFixed(2)} KB`
      return `${size} B`
    },
    async notify(type, message) {
      if (typeof this.$emiter === 'function') {
        await this.$emiter('NOTIFY', {
          type,
          message,
          timeout: 2000
        })
      } else {
        const logger = type === 'error' ? console.error : type === 'warning' ? console.warn : console.log
        logger(message)
      }
    },
    resetSubject() {
      const today = new Date().toISOString().slice(0, 10)
      this.form.subject = `${this.$t('supportSubjectDefault')} ${today}`
    },
    resetForm() {
      this.form = {
        subject: '',
        description: '',
        priority: 'p3',
        email: ''
      }
      this.resetSubject()
      this.selectedSerials = [...this.selecedDevices]
      this.logPackage = null
      this.uploadedAttachment = null
      this.messageTail = ''
    },
    selectAllDevices() {
      this.selectedSerials = this.deviceRows.map(device => device.real_serial)
    },
    deviceSelected(serial) {
      return this.selectedSerials.includes(serial)
    },
    toggleDevice(serial) {
      if (this.selectedSerials.includes(serial)) {
        this.selectedSerials = this.selectedSerials.filter(item => item !== serial)
      } else {
        this.selectedSerials = [...this.selectedSerials, serial]
      }
    },
    getDeviceNo(serial) {
      const device = (this.devices || []).find(item => item.real_serial === serial)
      if (device?.key) {
        return device.key
      }
      const fallbackIndex = this.deviceRows.findIndex(item => item.real_serial === serial)
      return fallbackIndex !== -1 ? fallbackIndex + 1 : serial
    },
    async prepareLogs() {
      this.emitSelection()
      if (!this.selectedSerials.length) {
        await this.notify('warning', this.$t('supportNeedDeviceWarning'))
        throw new Error('NO_SELECTED_DEVICES')
      }
      this.collecting = true
      try {
        const response = await this.$service.support_generate_logs({ serials: this.selectedSerials })
        this.logPackage = response
        this.messageTail = response.message_tail || ''
        this.uploadedAttachment = null
        await this.notify('success', this.$t('supportCollectSuccess'))
        return this.logPackage
      } catch (error) {
        console.error('prepareLogs error', error)
        await this.notify('error', this.$t('supportCollectFailed'))
        throw error
      } finally {
        this.collecting = false
      }
    },
    async uploadLogs() {
      if (!this.logPackage) {
        await this.prepareLogs()
      }
      if (!this.logPackage) {
        throw new Error('LOG_PACKAGE_MISSING')
      }
      if (this.uploadedAttachment) {
        return this.uploadedAttachment
      }
      this.uploading = true
      try {
        const getField = (source, names) => {
          if (!source || typeof source !== 'object') return undefined
          const entries = Object.keys(source)
          for (const name of names) {
            if (Object.prototype.hasOwnProperty.call(source, name)) {
              return source[name]
            }
            const lower = name.toLowerCase()
            const matchKey = entries.find(key => key.toLowerCase() === lower)
            if (matchKey) {
              return source[matchKey]
            }
          }
          return undefined
        }

        const uploadResponse = await this.$service.support_upload({
          file_path: this.logPackage.zip_path,
          file_name: this.logPackage.zip_name,
          file_size: this.logPackage.zip_size,
          content_type: 'application/zip',
          serials: this.selectedSerials,
          client_app: this.clientInfoNormalized.app_name,
          client_version: this.clientInfoNormalized.client_version
        })

        console.debug('support_upload response raw', uploadResponse)

        const unwrapKeys = ['data', 'result', 'payload']
        let body = uploadResponse ?? {}
        for (let depth = 0; depth < 4; depth += 1) {
          if (body && typeof body === 'object') {
            const key = unwrapKeys.find(candidate => Object.prototype.hasOwnProperty.call(body, candidate))
            if (key && body[key] != null) {
              body = body[key]
              continue
            }
          }
          break
        }
        body = body ?? {}

        let uploadInfo =
          getField(body, ['upload', 'uploadInfo', 'upload_info', 'result', 'payload', 'data']) || body
        if (Array.isArray(uploadInfo)) {
          uploadInfo = uploadInfo[0] || {}
        }

        console.debug('support_upload normalized body', body)
        console.debug('support_upload info', uploadInfo)

        const responseCode = Number(
          getField(body, ['code', 'status', 'statusCode', 'status_code', 'errorCode']) ??
          getField(uploadInfo, ['code', 'status', 'statusCode', 'status_code', 'errorCode'])
        )
        if (Number.isFinite(responseCode) && ![0, 200, 201, 20000].includes(responseCode)) {
          const responseMessage =
            getField(body, ['message', 'error', 'msg', 'errorMessage']) ||
            getField(uploadInfo, ['message', 'error', 'msg', 'errorMessage']) ||
            'Unknown error'
          throw new Error(responseMessage)
        }

        const storageKey =
          getField(uploadInfo, ['key', 'storageKey', 'storage_key']) ||
          getField(body, ['storageKey', 'storage_key', 'key']) ||
          ''
        if (!storageKey) {
          throw new Error('MISSING_STORAGE_KEY')
        }

        const bucket = getField(uploadInfo, ['bucket']) || getField(body, ['bucket']) || ''
        const returnedFileName =
          getField(uploadInfo, ['fileName', 'file_name']) ||
          getField(body, ['fileName', 'file_name']) ||
          this.logPackage.zip_name
        const contentType =
          getField(uploadInfo, ['contentType', 'content_type']) ||
          getField(body, ['contentType', 'content_type']) ||
          'application/zip'
        const sizeValue = Number(
          getField(uploadInfo, ['size', 'fileSize', 'file_size']) ||
          getField(body, ['size', 'fileSize', 'file_size'])
        )
        const checksum = getField(uploadInfo, ['checksum']) || getField(body, ['checksum']) || ''
        const etag = getField(uploadInfo, ['etag']) || getField(body, ['etag'])

        const normalizedSize = Number.isFinite(sizeValue) ? sizeValue : this.logPackage.zip_size
        const attachmentMeta = {}
        if (etag) {
          attachmentMeta.etag = etag
        }

        const payload = {
          storageKey,
          bucket,
          file_name: returnedFileName,
          file_size: normalizedSize,
          content_type: contentType,
          checksum
        }
        if (Object.keys(attachmentMeta).length) {
          payload.metadata = attachmentMeta
        }
        this.uploadedAttachment = payload
        await this.notify('success', this.$t('supportUploadSuccess'))
        return this.uploadedAttachment
      } catch (error) {
        console.error('uploadLogs error', error)
        const hint = error?.message ? `: ${error.message}` : ''
        await this.notify('error', `${this.$t('supportUploadFailed')}${hint}`)
        throw error
      } finally {
        this.uploading = false
      }
    },
    async ensureAttachment() {
      if (!this.logPackage) {
        await this.prepareLogs()
      }
      return this.uploadLogs()
    },
    buildSerialPayload() {
      return this.selectedSerials.map(serial => {
        const device = this.deviceRows.find(item => item.real_serial === serial) || {}
        const rawMeta = (device.metadata && typeof device.metadata === 'object' ? device.metadata : {}) || {}

        const metadata = {}
        const name = this.normalizeMetadataField(rawMeta.name, rawMeta.displayName, rawMeta.display_name, device.name)
        if (name) metadata.name = name

        const product = this.normalizeMetadataField(rawMeta.product, device.product)
        if (product) metadata.product = product

        const model = this.normalizeMetadataField(rawMeta.model, rawMeta.mode, device.mode, device.model)
        if (model) metadata.model = model

        const status = this.normalizeMetadataField(rawMeta.status, device.status)
        if (status) metadata.status = status

        const group = this.normalizeMetadataField(rawMeta.group, device.group, device.group_id)
        if (group) metadata.group = group

        const forwardPort = this.normalizeMetadataField(rawMeta.forwardPort, device.forward_port)
        if (forwardPort) metadata.forwardPort = forwardPort

        const transport = this.normalizeMetadataField(rawMeta.transport, device.transport_id)
        if (transport) metadata.transport = transport



        const taskStatus = this.normalizeMetadataField(rawMeta.taskStatus, device.task_status)
        if (taskStatus) metadata.taskStatus = taskStatus

        const connection = this.resolveConnectionType(
          this.normalizeMetadataField(
            rawMeta.connection,
            rawMeta.connectionType,
            rawMeta.connection_type,
            rawMeta.connectType,
            rawMeta.connect_type,
            device.connection_type,
            device.connect_type
          )
        )
        if (connection) metadata.connection = connection

        const proxyRotation = this.sanitizeProxyRotation(
          rawMeta.proxyRotation || rawMeta.proxy_rotation || device.proxyRotation || device.proxy_rotation
        )
        if (proxyRotation) metadata.proxyRotation = proxyRotation

        return {
          realSerial: serial,
          displayName: this.normalizeMetadataField(
            device.display_name,
            device.displayName,
            device.name,
            rawMeta.name
          ),

          metadata
        }
      })
    },
    resolveConnectionType(value) {
      if (value === null || value === undefined) {
        return ''
      }
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (!normalized) {
          return ''
        }
        if (normalized === 'usb') {
          return 'USB'
        }
        if (normalized === 'tcp') {
          return 'TCP'
        }
        if (!Number.isNaN(Number(normalized))) {
          return this.resolveConnectionType(Number(normalized))
        }
        if (normalized === 'unknown') {
          return 'Unknown'
        }
        return value.trim().toUpperCase()
      }
      const numeric = Number(value)
      if (!Number.isNaN(numeric)) {
        if (numeric === 0) return 'USB'
        if (numeric === 1) return 'TCP'
        return String(numeric)
      }
      return String(value)
    },
    sanitizeProxyRotation(raw) {
      if (!raw || typeof raw !== 'object') {
        return null
      }
      const cleaned = {}
      const endpoint = this.normalizeMetadataField(raw.rotation_url, raw.url, raw.endpoint)
      if (endpoint) cleaned.endpoint = endpoint
      const method = this.normalizeMetadataField(raw.method)
      if (method) cleaned.method = method
      const lastStatus = this.normalizeMetadataField(raw.last_status, raw.status)
      if (lastStatus) cleaned.lastStatus = lastStatus
      const lastMessage = this.normalizeMetadataField(raw.last_message, raw.message)
      if (lastMessage) cleaned.lastMessage = lastMessage
      const lastRotatedAt = this.normalizeMetadataField(raw.last_rotated_at, raw.lastRotatedAt)
      if (lastRotatedAt) cleaned.lastRotatedAt = lastRotatedAt
      const timeoutMs = this.normalizeMetadataField(raw.timeout_ms, raw.timeout)
      if (timeoutMs) cleaned.timeoutMs = timeoutMs
      return Object.keys(cleaned).length ? cleaned : null
    },
    normalizeMetadataField(...candidates) {
      for (const candidate of candidates) {
        if (candidate === null || candidate === undefined) {
          continue
        }
        if (typeof candidate === 'string') {
          const text = candidate.trim()
          if (text !== '') {
            return text
          }
          continue
        }
        if (typeof candidate === 'number' && Number.isFinite(candidate)) {
          return String(candidate)
        }
        if (typeof candidate === 'boolean') {
          return candidate ? 'true' : 'false'
        }
        try {
          const text = String(candidate).trim()
          if (text) {
            return text
          }
        } catch (error) {
          continue
        }
      }
      return ''
    },
    async submitSupport() {
      this.emitSelection()
      if (!this.form.subject.trim() || !this.form.description.trim()) {
        await this.notify('warning', this.$t('supportValidationMessage'))
        return
      }
      if (!this.selectedSerials.length) {
        await this.notify('warning', this.$t('supportNeedDeviceWarning'))
        return
      }
      this.submitting = true
      try {
        let attachment
        try {
          attachment = await this.ensureAttachment()
        } catch (error) {
          return
        }
        const messageBody = `${this.form.description}\n\n${this.$t('supportLogNote')}`
        const payload = {
          subject: this.form.subject,
          message: messageBody,
          message_tail: this.messageTail || '',
          priority: this.form.priority,
          locale: this.$i18n.locale || 'en',
          contact_email: this.form.email,
          serials: this.buildSerialPayload(),
          attachments: attachment ? [attachment] : [],
          client: this.clientInfoNormalized,
          app: this.clientInfoNormalized.app_name
        }
        const response = await this.$service.support_create_ticket(payload)
        const createdTicket = response?.data || response
        await this.notify('success', this.$t('supportSubmitSuccess'))
        this.$emit('submitted', createdTicket)
        this.submittedTicket = null
        this.resetForm()
        this.emitSelection()
      } catch (error) {
        console.error('submitSupport error', error)
        await this.notify('error', this.$t('supportSubmitFailed'))
      } finally {
        this.submitting = false
      }
    },
    closeDialog() {
      this.resetForm()
      this.$emiter('closeDialog', {})
      this.$emit('cancel')
    },
    createAnother() {
      this.submittedTicket = null
      this.resetForm()
      this.emitSelection()
    },
    emitSelection() {
      this.$emit('update:selected', this.selectedSerials)
    }
  }
}
</script>

<style scoped>
.support-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;
}

.support-form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--color-base-100);
  border-radius: 12px;
  border: 1px solid var(--color-base-300);
  padding: 20px;
}

.intro .title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.intro .description {
  color: var(--color-base-content);
  margin: 0;
}

.intro .note {
  margin-top: 6px;
  font-size: 14px;
  color: var(--color-base-content);
}

.devices-section {
  background: var(--color-base-200);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--color-base-300);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.selected-summary {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-text {
  font-weight: 500;
}

.summary-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.form-label {
  width: 140px;
  font-weight: 600;
  color: var(--color-base-content);
  padding-top: 10px;
}

.input-wrapper {
  flex: 1 1 260px;
}

.input-wrapper .input,
.input-wrapper .textarea,
.input-wrapper .select {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--color-base-300);
  background: var(--color-base-100);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper .input:focus,
.input-wrapper .textarea:focus,
.input-wrapper .select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
}

.device-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.device-item {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--color-base-100);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  user-select: none;
  outline: none;
}

.device-item.is-selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.12);
  background: var(--color-base-200);
}

.device-item:focus-visible {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.28);
}

.device-content {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.device-no {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-base-content);
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.support-success {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.success-card {
  text-align: center;
  background: var(--color-base-100);
  border-radius: 16px;
  padding: 32px 40px;
  border: 1px solid var(--color-base-300);
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.06);
}

.success-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto;
  color: var(--color-success);
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.success-subtitle {
  margin: 0;
  color: var(--color-base-content);
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.mb-10 {
  margin-bottom: 10px;
}
</style>
