<template>
  <div class="support-form" v-if="!submittedTicket">
    <div class="intro">
      <h2 class="title">{{ $t('supportFormTitle') }}</h2>
      <p class="description">{{ $t('supportFormDescription') }}</p>
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
          <input v-model="form.email" type="email"
            :class="['input input-bordered w-full', { 'input-error': emailError }]"
            :placeholder="$t('supportContactEmailPlaceholder')" @blur="validateEmail" />
          <!-- inline validation / hint -->
          <p v-if="emailError" class="text-sm text-error">{{ emailError }}</p>
          <p v-else class="text-sm text-base-content">{{ $t('supportContactEmailHint') }}</p>
        </div>
      </div>

      <div class="form-row attachments-row">
        <label class="form-label">{{ $t('supportAttachmentsLabel') }}</label>
        <div class="input-wrapper attachments-wrapper">
          <div class="attachment-toolbar">
            <button type="button" class="btn btn-outline btn-sm" @click="pickAttachments">
              {{ $t('supportAttachmentsSelect') }}
            </button>
            <span class="text-sm text-base-content">
              {{ $t('supportAttachmentsHint', { size: formatBytes(attachmentSizeLimit), count: attachmentCountLimit })
              }}
            </span>
          </div>

          <div v-if="attachments.length" class="attachment-list">
            <div v-for="item in attachments" :key="item.id" class="attachment-card">
              <div class="attachment-preview" :class="`type-${item.type}`">
                <img v-if="item.previewUrl" :src="item.previewUrl" :alt="item.fileName" />
                <span v-else class="preview-icon">{{ item.type === 'video' ? '🎬' : '📎' }}</span>
              </div>
              <div class="attachment-info">
                <div class="attachment-name">{{ item.fileName }}</div>
                <div class="attachment-meta">
                  {{ formatBytes(item.size) }} · {{ item.type.toUpperCase() }}
                  <span v-if="item.uploading">· {{ $t('supportAttachmentUploading') }}</span>
                  <span v-else-if="item.error" class="text-error">· {{ $t('supportAttachmentFailed') }}</span>
                </div>
                <div class="attachment-actions">
                  <button type="button" class="btn btn-ghost btn-xs" @click="removeAttachment(item.id)">
                    {{ $t('supportAttachmentRemove') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-base-content">{{ $t('supportAttachmentsEmpty') }}</p>
        </div>
      </div>

    </form>

    <div class="devices-section">
      <div class="section-header">
        <div>
          <h3 class="m-0">{{ $t('supportDeviceSelection') }}</h3>
          <div class="selected-summary">
            <span class="summary-text">{{ $t('selectedDevices') }}: {{ selectedSerials.length }} /
              {{ deviceSelectionLimit }} {{ $t('units') }}</span>
            <div class="summary-badges">
              <span v-for="serial in selectedSerials" :key="serial" class="badge badge-outline">
                {{ getDeviceNo(serial) }}
              </span>
              <span v-if="!selectedSerials.length" class="selection-empty">
                {{ $t('supportDeviceSelectionOptional') }}
              </span>
            </div>
            <p class="selection-hint">
              {{ $t('supportDeviceSelectionHint', { count: deviceSelectionLimit }) }}
            </p>
          </div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" @click="selectAllDevices">
          {{ $t('supportSelectAllDevices', { count: deviceSelectionLimit }) }}
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
      <button type="button" class="btn btn-primary" :disabled="submitting" @click="submitSupport">
        <span v-if="submitting" class="loading loading-spinner loading-sm"></span>
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
import { open } from '@tauri-apps/api/dialog'
import { readBinaryFile } from '@tauri-apps/api/fs'
import { convertFileSrc } from '@tauri-apps/api/tauri'

const MAX_CUSTOM_ATTACHMENTS = 6
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024
const MAX_SELECTED_DEVICES = 5
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'heic']
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm']
const MEDIA_FILTERS = [
  {
    name: 'Images & Videos',
    extensions: [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]
  }
]

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
      emailError: '',
      selectedSerials: [],
      messageTail: '',
      submitting: false,
      submittedTicket: null,
      preparedPackage: null,
      preparedAttachment: null,
      logPreparationTask: null,
      logPreparationToken: 0,
      logPreparationError: null,
      lastPreparedSerials: [],
      attachments: []
    }
  },
  computed: {
    attachmentSizeLimit() {
      return MAX_ATTACHMENT_SIZE
    },
    attachmentCountLimit() {
      return MAX_CUSTOM_ATTACHMENTS
    },
    deviceSelectionLimit() {
      return MAX_SELECTED_DEVICES
    },
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
    // Always schedule log preparation on mount, even with no devices selected
    // This ensures app/agent logs and data directory are prepared
    this.scheduleLogPreparation()
  },
  watch: {
    selecedDevices: {
      immediate: true,
      handler(newVal) {
        const sanitized = this.sanitizeSelection(Array.isArray(newVal) ? [...newVal] : [], { silent: true })
        this.selectedSerials = sanitized
      }
    },
    selectedSerials(newVal) {
      const sanitized = this.sanitizeSelection(newVal, { silent: true })
      if (sanitized.length !== newVal.length || sanitized.some((value, index) => value !== newVal[index])) {
        this.selectedSerials = sanitized
        return
      }
      this.handleSelectedSerialsChanged(newVal)
    }
  },
  methods: {
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
    // simple email format check
    isValidEmail(value) {
      if (!value || typeof value !== 'string') return false
      const trimmed = value.trim()
      // basic RFC-like email regex (practical for form validation)
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    },
    validateEmail() {
      this.emailError = ''
      if (this.form.email) {
        const v = this.form.email.trim()
        if (v && !this.isValidEmail(v)) {
          this.emailError = this.$t('supportContactEmailInvalid')
        }
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
      this.clearLogPreparation()
      const initialSelection = Array.isArray(this.selecedDevices) ? [...this.selecedDevices] : []
      this.selectedSerials = this.sanitizeSelection(initialSelection, { silent: true })
      this.attachments = []
    },
    async pickAttachments() {
      try {
        if (this.attachments.length >= MAX_CUSTOM_ATTACHMENTS) {
          await this.notify('warning', this.$t('supportAttachmentLimitReached', { count: MAX_CUSTOM_ATTACHMENTS }))
          return
        }
        const selection = await open({
          multiple: true,
          directory: false,
          filters: MEDIA_FILTERS
        })
        const paths = Array.isArray(selection) ? selection : selection ? [selection] : []
        if (!paths.length) {
          return
        }
        for (const filePath of paths) {
          if (this.attachments.length >= MAX_CUSTOM_ATTACHMENTS) {
            await this.notify('warning', this.$t('supportAttachmentLimitReached', { count: MAX_CUSTOM_ATTACHMENTS }))
            break
          }
          await this.addAttachmentFromPath(filePath)
        }
      } catch (error) {
        console.error('pickAttachments error', error)
        await this.notify('error', this.$t('supportAttachmentSelectFailed'))
      }
    },
    async fetchAttachmentMetadata(path) {
      const result = {
        filePath: path,
        fileName: this.extractFileName(path),
        fileExtension: null,
        size: NaN,
        source: 'unknown'
      }
      if (!path) {
        return result
      }

      if (this.$service && typeof this.$service.support_file_info === 'function') {
        try {
          const response = await this.$service.support_file_info({ file_path: path })
          const data = response?.data ?? response
          if (data && typeof data === 'object') {
            if (typeof data.file_name === 'string' && data.file_name.trim()) {
              result.fileName = data.file_name.trim()
            }
            const size = Number(data.file_size ?? data.size)
            if (Number.isFinite(size) && size >= 0) {
              result.size = size
            }
            const extension = (data.file_extension ?? data.extension ?? '').toString().trim()
            if (extension) {
              result.fileExtension = extension.replace(/^\./, '').toLowerCase()
            }
            result.source = 'agent'
          }
        } catch (error) {
          console.warn('support_file_info metadata error', error)
        }
      }

      if (!Number.isFinite(result.size) || result.size <= 0) {
        try {
          const bytes = await readBinaryFile(path)
          const size = Number(bytes?.length ?? bytes?.byteLength ?? 0)
          if (Number.isFinite(size) && size > 0) {
            result.size = size
            result.source = result.source === 'agent' ? 'agent-fallback' : 'tauri'
          }
        } catch (error) {
          console.warn('fallback readBinaryFile metadata error', error)
        }
      }

      return result
    },
    async addAttachmentFromPath(path) {
      const normalizedPath = typeof path === 'string' ? path : ''
      if (!normalizedPath) {
        return
      }
      if (this.attachments.some(item => item.path === normalizedPath)) {
        await this.notify('warning', this.$t('supportAttachmentDuplicate'))
        return
      }
      try {
        const metadata = await this.fetchAttachmentMetadata(normalizedPath)
        const size = Number(metadata?.size)
        if (!Number.isFinite(size) || size <= 0) {
          await this.notify('warning', this.$t('supportAttachmentInvalid'))
          return
        }
        if (size > MAX_ATTACHMENT_SIZE) {
          await this.notify('warning', this.$t('supportAttachmentTooLarge', { size: this.formatBytes(MAX_ATTACHMENT_SIZE) }))
          return
        }
        let fileName = (metadata?.fileName || '').trim() || this.extractFileName(normalizedPath)
        const extension = (metadata?.fileExtension || '').toLowerCase()
        if (extension && !fileName.toLowerCase().endsWith(`.${extension}`)) {
          fileName = `${fileName}.${extension}`
        }
        const contentType = this.guessContentType(fileName)
        const attachmentType = this.classifyAttachmentType(contentType, fileName)
        if (attachmentType === 'other') {
          await this.notify('warning', this.$t('supportAttachmentUnsupported'))
          return
        }
        const attachmentId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `att-${Date.now()}-${Math.random().toString(16).slice(2)}`
        this.attachments = [
          ...this.attachments,
          {
            id: attachmentId,
            path: normalizedPath,
            fileName,
            size,
            contentType,
            type: attachmentType,
            previewUrl: this.buildPreviewUrl(normalizedPath, attachmentType),
            uploading: false,
            uploadResult: null,
            error: null,
            metadataSource: metadata?.source || 'unknown'
          }
        ]
      } catch (error) {
        console.error('addAttachmentFromPath error', error)
        await this.notify('error', this.$t('supportAttachmentReadFailed'))
      }
    },
    removeAttachment(id) {
      this.attachments = this.attachments.filter(item => item.id !== id)
    },
    buildPreviewUrl(path, type) {
      if (type !== 'image') {
        return null
      }
      try {
        return typeof convertFileSrc === 'function' ? convertFileSrc(path) : null
      } catch (error) {
        console.warn('buildPreviewUrl convertFileSrc error', error)
        return null
      }
    },
    extractFileName(path) {
      if (!path) {
        return 'attachment.bin'
      }
      const segments = path.split(/[/\\]/)
      const name = segments[segments.length - 1] || 'attachment.bin'
      return name
    },
    guessContentType(fileName) {
      if (!fileName) {
        return 'application/octet-stream'
      }
      const ext = fileName.split('.').pop()?.toLowerCase()
      if (!ext) {
        return 'application/octet-stream'
      }
      if (IMAGE_EXTENSIONS.includes(ext)) {
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
        if (ext === 'png') return 'image/png'
        if (ext === 'gif') return 'image/gif'
        if (ext === 'webp') return 'image/webp'
        if (ext === 'bmp') return 'image/bmp'
        if (ext === 'heic') return 'image/heic'
        return `image/${ext}`
      }
      if (VIDEO_EXTENSIONS.includes(ext)) {
        if (ext === 'mp4' || ext === 'm4v') return 'video/mp4'
        if (ext === 'mov') return 'video/quicktime'
        if (ext === 'avi') return 'video/x-msvideo'
        if (ext === 'webm') return 'video/webm'
        if (ext === 'mkv') return 'video/x-matroska'
        return `video/${ext}`
      }
      return 'application/octet-stream'
    },
    classifyAttachmentType(contentType, fileName) {
      const normalized = (contentType || '').toLowerCase()
      if (normalized.startsWith('image/')) {
        return 'image'
      }
      if (normalized.startsWith('video/')) {
        return 'video'
      }
      const ext = fileName?.split('.').pop()?.toLowerCase()
      if (ext && IMAGE_EXTENSIONS.includes(ext)) {
        return 'image'
      }
      if (ext && VIDEO_EXTENSIONS.includes(ext)) {
        return 'video'
      }
      return 'other'
    },
    async ensureCustomAttachmentUpload(item, serials) {
      if (!item) {
        return null
      }
      if (item.uploadResult) {
        return item.uploadResult
      }
      item.uploading = true
      item.error = null
      try {
        const response = await this.$service.support_upload({
          file_path: item.path,
          file_name: item.fileName,
          content_type: item.contentType,
          file_size: item.size,
          serials,
          attachment_meta: {
            type: item.type,
            originalName: item.fileName
          },
          client_app: this.clientInfoNormalized.app_name,
          client_version: this.clientInfoNormalized.client_version,
          skip_cache: true
        })
        const attachment = this.parseUploadResponse(response, {
          fileName: item.fileName,
          fileSize: item.size,
          contentType: item.contentType,
          serials,
          type: item.type
        })
        item.uploadResult = attachment
        return attachment
      } catch (error) {
        item.error = error
        throw error
      } finally {
        item.uploading = false
      }
    },
    async uploadCustomAttachments(serials) {
      if (!Array.isArray(this.attachments) || !this.attachments.length) {
        return []
      }
      const uploads = []
      for (const item of this.attachments) {
        try {
          const result = await this.ensureCustomAttachmentUpload(item, serials)
          if (result) {
            uploads.push(result)
          }
        } catch (error) {
          console.error('uploadCustomAttachments error', error)
          const message = error?.message || this.$t('supportAttachmentUploadFailed')
          await this.notify('error', message)
          throw error
        }
      }
      return uploads
    },
    formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B'
      }
      const units = ['B', 'KB', 'MB', 'GB']
      const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
      const value = bytes / 1024 ** exp
      return `${value.toFixed(exp === 0 ? 0 : 1)} ${units[exp]}`
    },
    selectAllDevices() {
      const allSerials = this.deviceRows.map(device => device.real_serial)
      this.selectedSerials = this.sanitizeSelection(allSerials, { silent: false })
    },
    deviceSelected(serial) {
      return this.selectedSerials.includes(serial)
    },
    toggleDevice(serial) {
      const normalized = typeof serial === 'string' ? serial : serial != null ? String(serial) : ''
      if (!normalized.trim()) {
        return
      }
      const cleanedSerial = normalized.trim()
      if (this.selectedSerials.includes(cleanedSerial)) {
        this.selectedSerials = this.selectedSerials.filter(item => item !== cleanedSerial)
      } else {
        if (this.selectedSerials.length >= this.deviceSelectionLimit) {
          this.notify('warning', this.$t('supportDeviceLimitWarning', { count: this.deviceSelectionLimit }))
          return
        }
        this.selectedSerials = [...this.selectedSerials, cleanedSerial]
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
    handleSelectedSerialsChanged(newSerials) {
      // Always prepare logs even when no devices are selected (for app/agent logs)
      const normalized = this.normalizeSerialList(newSerials)
      if (!this.areSameSerialSet(normalized, this.lastPreparedSerials)) {
        this.clearLogPreparation()
      }
      this.scheduleLogPreparation(normalized)
    },
    clearLogPreparation() {
      this.logPreparationToken += 1
      this.logPreparationTask = null
      this.preparedPackage = null
      this.preparedAttachment = null
      this.logPreparationError = null
      this.lastPreparedSerials = []
      this.messageTail = ''
    },
    normalizeSerialList(list) {
      if (!Array.isArray(list)) {
        return []
      }
      const unique = new Set()
      const normalized = []
      list.forEach(value => {
        if (value === null || value === undefined) {
          return
        }
        const text = String(value).trim()
        if (!text || unique.has(text)) {
          return
        }
        unique.add(text)
        normalized.push(text)
      })
      normalized.sort()
      return normalized
    },
    areSameSerialSet(listA, listB) {
      if (!Array.isArray(listA) || !Array.isArray(listB)) {
        return false
      }
      if (listA.length !== listB.length) {
        return false
      }
      for (let i = 0; i < listA.length; i += 1) {
        if (listA[i] !== listB[i]) {
          return false
        }
      }
      return true
    },
    sanitizeSelection(list, options = {}) {
      const { silent = false } = options
      if (!Array.isArray(list)) {
        return []
      }
      const unique = []
      let exceeded = false
      list.forEach(value => {
        if (value === null || value === undefined) {
          return
        }
        const text = String(value).trim()
        if (!text || unique.includes(text)) {
          return
        }
        if (unique.length >= MAX_SELECTED_DEVICES) {
          exceeded = true
          return
        }
        unique.push(text)
      })
      if (exceeded && !silent) {
        this.notify('warning', this.$t('supportDeviceLimitWarning', { count: MAX_SELECTED_DEVICES }))
      }
      return unique
    },
    scheduleLogPreparation(serialsOverride) {
      // Always allow scheduling even with empty serials to upload app/agent logs
      const serials = this.normalizeSerialList(
        Array.isArray(serialsOverride) && serialsOverride.length
          ? serialsOverride
          : this.selectedSerials
      )
      const hasPreparedForSerials = this.areSameSerialSet(serials, this.lastPreparedSerials)
      if (
        (this.preparedAttachment && hasPreparedForSerials) ||
        (this.preparedPackage && hasPreparedForSerials)
      ) {
        return
      }
      if (this.logPreparationTask) {
        return
      }
      this.startLogPreparation(serials)
    },
    startLogPreparation(serials) {
      // Always allow log preparation even with empty serials
      const normalizedSerials = this.normalizeSerialList(serials)
      this.logPreparationToken += 1
      const currentToken = this.logPreparationToken
      const task = (async () => {
        try {
          const response = await this.$service.support_generate_logs({ serials: normalizedSerials })
          if (this.logPreparationToken !== currentToken) {
            return null
          }
          if (!response || !response.zip_path) {
            throw new Error('LOG_PACKAGE_MISSING')
          }
          this.messageTail = response?.message_tail || ''
          this.preparedPackage = response
          this.preparedAttachment = null
          this.lastPreparedSerials = normalizedSerials
          this.logPreparationError = null
          return response
        } catch (error) {
          if (this.logPreparationToken === currentToken) {
            this.logPreparationError = error
            this.preparedPackage = null
            this.preparedAttachment = null
            this.messageTail = ''
            this.lastPreparedSerials = []
          }
          throw error
        } finally {
          if (this.logPreparationToken === currentToken && this.logPreparationTask === task) {
            this.logPreparationTask = null
          }
        }
      })()
      this.logPreparationTask = task
      task.catch(err => {
        console.error('support startLogPreparation error', err)
      })
      return task
    },
    parseUploadResponse(uploadResponse, context = {}) {
      const getField = (source, names) => {
        if (!source || typeof source !== 'object') return undefined
        const keys = Object.keys(source)
        for (const name of names) {
          if (Object.prototype.hasOwnProperty.call(source, name)) {
            return source[name]
          }
          const lower = name.toLowerCase()
          const matchKey = keys.find(key => key.toLowerCase() === lower)
          if (matchKey) {
            return source[matchKey]
          }
        }
        return undefined
      }
      const parseMaybeJson = value => {
        if (!value) return null
        if (typeof value === 'object') return value
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch (error) {
            return null
          }
        }
        return null
      }

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
        context.fileName || ''
      const contentType =
        getField(uploadInfo, ['contentType', 'content_type']) ||
        getField(body, ['contentType', 'content_type']) ||
        context.contentType || 'application/zip'
      const sizeValue = Number(
        getField(uploadInfo, ['size', 'fileSize', 'file_size']) ||
        getField(body, ['size', 'fileSize', 'file_size']) ||
        context.fileSize
      )
      const checksum =
        getField(uploadInfo, ['checksum']) ||
        getField(body, ['checksum']) ||
        context.checksum || ''
      const etag = getField(uploadInfo, ['etag']) || getField(body, ['etag'])

      const normalizedSize = Number.isFinite(sizeValue)
        ? sizeValue
        : Number(context.fileSize || 0) || 0

      const attachmentMeta = {}
      const responseMeta =
        parseMaybeJson(uploadInfo.metadata) ||
        parseMaybeJson(uploadInfo.meta) ||
        parseMaybeJson(getField(body, ['metadata', 'meta']))
      if (responseMeta && typeof responseMeta === 'object') {
        Object.assign(attachmentMeta, responseMeta)
      }
      if (Array.isArray(context.serials) && context.serials.length) {
        attachmentMeta.serials = context.serials.join(',')
      }
      if (context.type) {
        attachmentMeta.type = context.type
      }
      if (etag) {
        attachmentMeta.etag = etag
      }

      const attachment = {
        storageKey,
        bucket,
        file_name: returnedFileName,
        fileName: returnedFileName,
        file_size: normalizedSize,
        fileSize: normalizedSize,
        content_type: contentType,
        contentType,
        checksum
      }
      if (Object.keys(attachmentMeta).length) {
        attachment.metadata = attachmentMeta
      }

      return attachment
    },
    async uploadLogsPackage(logPackage, serials) {
      if (!logPackage || !logPackage.zip_path) {
        throw new Error('LOG_PACKAGE_MISSING')
      }
      const uploadResponse = await this.$service.support_upload({
        file_path: logPackage.zip_path,
        file_name: logPackage.zip_name,
        file_size: logPackage.zip_size,
        content_type: 'application/zip',
        serials,
        client_app: this.clientInfoNormalized.app_name,
        client_version: this.clientInfoNormalized.client_version
      })
      return this.parseUploadResponse(uploadResponse, {
        fileName: logPackage.zip_name,
        fileSize: logPackage.zip_size,
        checksum: logPackage.checksum,
        serials,
        type: 'logs'
      })
    },
    async ensureLogsAttachment(serialsOverride) {
      // Always allow log preparation even with empty serials to upload app/agent logs and data directory
      const serials = this.normalizeSerialList(serialsOverride || this.selectedSerials)
      const isPreparedForSerials = () => this.areSameSerialSet(serials, this.lastPreparedSerials)

      if (!isPreparedForSerials()) {
        this.clearLogPreparation()
      }

      if (this.preparedAttachment && isPreparedForSerials()) {
        return this.preparedAttachment
      }

      const attemptUpload = async () => {
        if (!isPreparedForSerials()) {
          return null
        }
        if (this.preparedAttachment && isPreparedForSerials()) {
          return this.preparedAttachment
        }
        const packageInfo = this.preparedPackage
        if (!packageInfo || !packageInfo.zip_path) {
          return null
        }
        try {
          const attachment = await this.uploadLogsPackage(packageInfo, serials)
          if (isPreparedForSerials()) {
            this.preparedAttachment = attachment
          }
          return this.preparedAttachment && isPreparedForSerials()
            ? this.preparedAttachment
            : attachment
        } catch (error) {
          console.error('ensureLogsAttachment upload failed', error)
          this.logPreparationError = error
          return null
        }
      }

      if (this.preparedPackage && isPreparedForSerials()) {
        const uploaded = await attemptUpload()
        if (uploaded) {
          return uploaded
        }
      }

      if (this.logPreparationTask) {
        try {
          await this.logPreparationTask
        } catch (error) {
          console.error('ensureLogsAttachment pending task error', error)
        }
        if (this.preparedAttachment && isPreparedForSerials()) {
          return this.preparedAttachment
        }
        const uploaded = await attemptUpload()
        if (uploaded) {
          return uploaded
        }
      }

      const task = this.startLogPreparation(serials)
      if (!task) {
        return null
      }
      try {
        await task
      } catch (error) {
        console.error('ensureLogsAttachment task error', error)
        return null
      }
      return attemptUpload()
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
      // validate email format if provided
      if (this.form.email && !this.isValidEmail(this.form.email)) {
        await this.notify('warning', this.$t('supportContactEmailInvalid'))
        return
      }
      this.submitting = true
      try {
        const serialPayload = this.buildSerialPayload()
        const normalizedSerials = this.normalizeSerialList(this.selectedSerials)
        // Always try to upload logs attachment, even with empty serials (for app/agent logs)
        let attachment = null
        try {
          attachment = await this.ensureLogsAttachment(normalizedSerials)
        } catch (error) {
          console.error('submitSupport ensureLogsAttachment error', error)
        }
        const messageBody = this.form.description
        const mediaAttachments = await this.uploadCustomAttachments(normalizedSerials)
        const payload = {
          subject: this.form.subject,
          message: messageBody,
          message_tail: attachment ? this.messageTail || '' : '',
          priority: this.form.priority,
          locale: this.$i18n.locale || 'en',
          contact_email: this.form.email,
          serials: serialPayload,
          attachments: [...mediaAttachments, ...(attachment ? [attachment] : [])],
          client: this.clientInfoNormalized,
          app: this.clientInfoNormalized.app_name
        }
        const response = await this.$service.support_create_ticket(payload)
        const createdTicket = response?.data || response
        await this.notify('success', this.$t('supportSubmitSuccess'))
        this.$emit('submitted', createdTicket)
        this.submittedTicket = null
        this.resetForm()
        // Always schedule log preparation after submission (for app/agent logs)
        this.scheduleLogPreparation()
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

.selection-empty {
  font-size: 12px;
  color: var(--color-base-content);
  opacity: 0.8;
}

.selection-hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-base-content);
  opacity: 0.8;
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

.attachments-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.attachment-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--color-base-300);
  border-radius: 10px;
  background: var(--color-base-100);
  min-width: 220px;
  max-width: 320px;
}

.attachment-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: var(--color-base-200);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.attachment-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-icon {
  font-size: 20px;
}

.attachment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.attachment-name {
  font-weight: 600;
  word-break: break-all;
}

.attachment-meta {
  font-size: 12px;
  color: var(--color-base-content);
}

.attachment-actions {
  display: flex;
  gap: 6px;
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
