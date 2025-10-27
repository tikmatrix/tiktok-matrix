<template>
  <div class="support-center">
    <div v-if="viewMode === 'list'" class="support-list">
      <div class="list-header">
        <div class="titles">
          <h2 class="title">{{ $t('supportTicketsTitle') }}</h2>
          <p class="subtitle">{{ $t('supportTicketsSubtitle') }}</p>
        </div>
        <button class="btn btn-primary" @click="openForm">
          {{ $t('supportCreateTicketButton') }}
        </button>
      </div>

      <div class="table-wrapper">
        <table class="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>{{ $t('supportColumnSubject') }}</th>
              <th>{{ $t('supportColumnStatus') }}</th>
              <th>{{ $t('supportColumnPriority') }}</th>
              <th>{{ $t('supportColumnUpdated') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="loading-cell">
                <span class="loading loading-spinner loading-sm mr-2"></span>
                {{ $t('supportLoading') }}
              </td>
            </tr>
            <tr v-else-if="!tickets.length">
              <td colspan="5" class="empty-cell">
                {{ $t('supportEmptyState') }}
              </td>
            </tr>
            <tr v-for="ticket in tickets" :key="ticket.id" class="ticket-row" role="button" tabindex="0"
              @click="openDetail(ticket)" @keydown.enter.prevent="openDetail(ticket)"
              @keydown.space.prevent="openDetail(ticket)">
              <td>#{{ ticket.ticket_no }}</td>
              <td class="subject-cell">{{ ticket.subject }}</td>
              <td>
                <span class="tag" :class="`status-${ticket.status}`">{{ formatStatus(ticket.status) }}</span>
              </td>
              <td>
                <span class="tag priority" :class="`priority-${ticket.priority}`">
                  {{ formatPriority(ticket.priority) }}
                </span>
              </td>
              <td>{{ formatDate(ticket.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="total > pageSize">
        <button class="btn btn-sm" :disabled="page === 1" @click="changePage(page - 1)">
          «
        </button>
        <span class="page-indicator">{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-sm" :disabled="page >= totalPages" @click="changePage(page + 1)">
          »
        </button>
      </div>
    </div>

    <div v-else-if="viewMode === 'detail'" class="support-detail-wrapper">
      <div class="detail-header">
        <div class="detail-header-left">
          <button class="btn btn-ghost btn-sm" @click="backToList">
            {{ $t('supportBackToList') }}
          </button>
          <span class="detail-header-title">{{ currentTicket?.subject || '-' }}</span>
        </div>
        <div class="detail-header-actions">
          <button class="btn btn-outline btn-sm" :disabled="detailLoading" @click="refreshDetail">
            <span v-if="detailLoading" class="loading loading-spinner loading-xs mr-1"></span>
            {{ $t('supportDetailRefresh') }}
          </button>
          <button class="btn btn-primary btn-sm" @click="openForm">
            {{ $t('supportCreateTicketButton') }}
          </button>
        </div>
      </div>

      <div v-if="detailLoading" class="detail-loading">
        <span class="loading loading-spinner loading-sm mr-2"></span>
        {{ $t('supportLoading') }}
      </div>
      <div v-else-if="!currentTicket" class="empty-cell">
        {{ $t('supportDetailMissing') }}
      </div>
      <div v-else class="detail-content">
        <section class="detail-card summary-card">
          <div class="summary-top">
            <div>
              <h3 class="summary-subject">{{ currentTicket.subject }}</h3>
              <p class="summary-meta">
                #{{ currentTicket.ticket_no }} · {{ formatDate(currentTicket.updated_at) }}
              </p>
            </div>
            <div class="summary-tags">
              <span class="tag" :class="`status-${currentTicket.status}`">{{ formatStatus(currentTicket.status)
              }}</span>
              <span class="tag priority" :class="`priority-${currentTicket.priority}`">{{
                formatPriority(currentTicket.priority) }}</span>
            </div>
          </div>
          <div class="summary-footer">
            <span class="summary-source">{{ formatSource(currentTicket.source, currentTicket.client_app) }}</span>
            <span class="summary-updated">
              {{ $t('supportDetailLastMessage', { time: formatDate(currentTicket.last_message_at) }) }}
            </span>
          </div>
        </section>

        <div class="detail-grid">
          <section class="detail-card">
            <h4>{{ $t('supportDetailContact') }}</h4>
            <ul class="info-list">
              <li>
                <span>{{ $t('supportContactName') }}</span>
                <span>{{ currentTicket.contact_name || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportContactEmail') }}</span>
                <span>{{ currentTicket.contact_email || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportContactTelegram') }}</span>
                <span>{{ currentTicket.contact_telegram || currentTicket.contact_tele || currentTicket.telegram_username
                  || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailTicketStatus') }}</span>
                <span>{{ formatStatus(currentTicket.status) }}</span>
              </li>
            </ul>
          </section>
          <section class="detail-card">
            <h4>{{ $t('supportDetailEnvironment') }}</h4>
            <ul class="info-list">
              <li>
                <span>{{ $t('supportDetailAppName') }}</span>
                <span>{{ environmentClient.appName || currentTicket.client_app || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailClientVersion') }}</span>
                <span>{{ currentTicket.client_version || environmentClient.clientVersion || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailUiVersion') }}</span>
                <span>{{ environmentClient.uiVersion || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailWebview2') }}</span>
                <span>{{ formatBoolean(environmentClient.webview2Installed) }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailHostOs') }}</span>
                <span>{{ environmentHost.hostOS || '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailCpu') }}</span>
                <span>{{ environmentHost.cpuModel ? `${environmentHost.cpuModel} · ${environmentHost.cpuCores || '-'}`
                  : '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailMemory') }}</span>
                <span>{{ environmentHost.memoryTotalMB ? `${environmentHost.memoryTotalMB} MB` : '-' }}</span>
              </li>
              <li>
                <span>{{ $t('supportDetailLanIps') }}</span>
                <span>{{ formatList(environmentNetwork.lanIPs) }}</span>
              </li>
            </ul>
          </section>
        </div>

        <section class="detail-card">
          <h4>{{ $t('supportDetailDevices') }}</h4>
          <div v-if="!detailDevices.length" class="empty-cell compact">{{ $t('supportDetailNoDevices') }}</div>
          <div v-else class="device-grid">
            <div class="device-card" v-for="device in detailDevices" :key="device.id || device.real_serial">
              <div class="device-card-header">
                <span class="device-name">{{ device.display_name || getDeviceNo(device.real_serial) }}</span>
                <span class="device-serial">#{{ device.real_serial }}</span>
              </div>
              <div class="device-meta-row">
                <span>{{ $t('supportDetailConnection') }}: {{ formatConnection(device.metadata?.connectionType)
                }}</span>
                <span>{{ $t('supportDetailLastActive') }}: {{ formatDate(device.last_active_at) }}</span>
              </div>
              <div class="device-meta-row">
                <span>{{ $t('supportDetailAndroid') }}: {{ device.metadata?.androidVersion || '-' }}</span>
                <span>{{ $t('supportDetailLocale') }}: {{ device.metadata?.appLocale || '-' }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-card conversation-card">
          <h4>{{ $t('supportDetailConversation') }}</h4>
          <div v-if="!messages.length" class="empty-cell compact">{{ $t('supportDetailNoMessages') }}</div>
          <div v-else class="conversation-list">
            <article v-for="message in messages" :key="message.id" class="conversation-item">
              <header class="conversation-header">
                <span class="message-role" :class="`role-${message.role}`">{{ formatRole(message.role) }}</span>
                <span class="message-author">{{ message.author_name || message.author_id || '-' }}</span>
                <span class="message-time">{{ formatDate(message.created_at) }}</span>
              </header>
              <div class="conversation-body">{{ message.body }}</div>
              <pre v-if="message.message_tail" class="conversation-tail">{{ message.message_tail }}</pre>
              <div v-if="message.attachments && message.attachments.length" class="conversation-attachments">
                <div v-for="attachment in message.attachments" :key="attachment.id || attachment.storage_key"
                  class="attachment-item">
                  <span class="attachment-name">{{ attachment.file_name || attachment.filename }}</span>
                  <span class="attachment-size">{{ formatSize(attachment.file_size || attachment.size) }}</span>
                  <button type="button" class="btn btn-link btn-xs" :disabled="isAttachmentLoading(attachment)"
                    @click="copyAttachmentLink(attachment)">
                    <span v-if="isAttachmentLoading(attachment)"
                      class="loading loading-spinner loading-2xs mr-1"></span>
                    {{ $t('supportDetailCopyLink') }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="detail-card reply-card">
          <h4>{{ $t('supportDetailReply') }}</h4>
          <textarea v-model="reply.body" class="textarea textarea-bordered w-full" rows="5"
            :placeholder="$t('supportDetailReplyPlaceholder')"></textarea>
          <div class="reply-options">
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm" v-model="reply.includeLogs" />
              <span class="label-text ml-2">{{ $t('supportDetailAttachLogs') }}</span>
            </label>
            <span v-if="reply.logsPackage" class="reply-attachment-meta">
              {{ reply.logsPackage.zip_name }} · {{ formatSize(reply.logsPackage.zip_size) }}
            </span>
            <span v-if="reply.preparing" class="reply-preparing">
              <span class="loading loading-spinner loading-2xs mr-1"></span>
              {{ $t('supportDetailPreparingLogs') }}
            </span>
          </div>
          <div class="reply-actions">
            <button type="button" class="btn btn-primary btn-sm" :disabled="reply.sending || !reply.body.trim()"
              @click="submitReply">
              <span v-if="reply.sending" class="loading loading-spinner loading-xs mr-1"></span>
              {{ $t('supportDetailReplySubmit') }}
            </button>
            <button type="button" class="btn btn-outline btn-sm" :disabled="reply.sending" @click="resetReply">
              {{ $t('supportDetailReplyReset') }}
            </button>
          </div>
        </section>
      </div>
    </div>

    <div v-else class="support-form-wrapper">
      <div class="form-header">
        <button class="btn btn-ghost" @click="backToList">
          {{ $t('supportBackToList') }}
        </button>
        <span>{{ $t('supportCreateTicketButton') }}</span>
      </div>
      <SupportForm :devices="devices" :seleced-devices="selecedDevices" :client-info="clientInfo"
        @submitted="handleFormSubmitted" @cancel="backToList" @update:selected="updateSelection" />
    </div>
  </div>
</template>

<script>
import SupportForm from './SupportForm.vue'
import { getName, getVersion } from '@tauri-apps/api/app'

export default {
  name: 'SupportCenter',
  components: { SupportForm },
  props: {
    devices: {
      type: Array,
      default: () => []
    },
    selecedDevices: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      viewMode: 'list',
      tickets: [],
      loading: false,
      clientInfo: {},
      page: 1,
      pageSize: 10,
      total: 0,
      detailLoading: false,
      currentTicket: null,
      ticketDetail: null,
      messages: [],
      devicesDetail: [],
      metadata: {},
      reply: {
        body: '',
        includeLogs: true,
        logsPackage: null,
        messageTail: '',
        uploadedAttachment: null,
        preparing: false,
        sending: false
      },
      attachmentLoading: {},
      detailPollingTimer: null,
      detailPollingIntervalMs: 15000
    }
  },
  computed: {
    totalPages() {
      if (!this.total) return 1
      return Math.ceil(this.total / this.pageSize)
    },
    clientInfoNormalized() {
      const info = this.clientInfo || {}
      return {
        app_name: info.app_name || info.appName || info.name || 'TikMatrix',
        client_version: info.client_version || info.clientVersion || info.version || '',
        app_version: info.app_version || info.appVersion || info.clientVersion || '',
        ui_version: info.ui_version || info.uiVersion || info.clientVersion || '',
        webview2_installed: info.webview2_installed ?? info.webview2Installed ?? null
      }
    },
    environmentClient() {
      return (this.metadata && this.metadata.client) || {}
    },
    environmentHost() {
      return (this.metadata && this.metadata.host) || {}
    },
    environmentNetwork() {
      return (this.metadata && this.metadata.network) || { lanIPs: [] }
    },
    detailDevices() {
      return Array.isArray(this.devicesDetail) ? this.devicesDetail : []
    }
  },
  watch: {
    'reply.includeLogs'(newVal) {
      if (!newVal) {
        this.reply.logsPackage = null
        this.reply.uploadedAttachment = null
        this.reply.messageTail = ''
      }
    }
  },
  created() {
    this.initialize()
  },
  beforeUnmount() {
    this.stopDetailPolling()
  },
  beforeDestroy() {
    this.stopDetailPolling()
  },
  methods: {
    async initialize() {
      await this.loadClientInfo()
      await this.fetchTickets()
    },
    async loadClientInfo() {
      try {
        const [appName, appVersion] = await Promise.all([getName(), getVersion()])
        this.clientInfo = {
          app_name: appName,
          client_version: appVersion,
          app_version: appVersion,
          ui_version: appVersion
        }
      } catch (error) {
        console.warn('Failed to load client info', error)
        this.clientInfo = {}
      }
    },
    async fetchTickets() {
      this.loading = true
      try {
        const res = await this.$service.support_fetch_tickets({
          page: this.page,
          limit: this.pageSize
        })
        const payload = res?.data || res
        const data = payload?.data || payload
        this.tickets = data?.items || []
        this.total = data?.total || 0
      } catch (error) {
        console.error('support fetchTickets error', error)
        this.tickets = []
        this.total = 0
      } finally {
        this.loading = false
      }
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
    formatStatus(value) {
      switch ((value || '').toLowerCase()) {
        case 'open':
          return this.$t('supportStatusOpen')
        case 'pending':
          return this.$t('supportStatusPending')
        case 'closed':
          return this.$t('supportStatusClosed')
        default:
          return value || '-'
      }
    },
    formatPriority(value) {
      switch ((value || '').toLowerCase()) {
        case 'p1':
        case 'urgent':
          return this.$t('supportPriorityUrgent')
        case 'p2':
        case 'high':
          return this.$t('supportPriorityHigh')
        case 'p3':
        case 'normal':
          return this.$t('supportPriorityNormal')
        default:
          return value || '-'
      }
    },
    formatDate(value) {
      if (value === null || value === undefined || value === '') return '-'
      const numeric = Number(value)
      if (Number.isFinite(numeric)) {
        const date = new Date(numeric)
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleString()
        }
      }
      if (typeof value === 'string') {
        return value
      }
      return '-'
    },
    formatSource(source, clientApp) {
      if (clientApp && clientApp.trim()) {
        return clientApp
      }
      switch ((source || '').toLowerCase()) {
        case 'telegram':
          return 'Telegram'
        case 'email':
          return 'Email'
        case 'admin':
          return this.$t('supportDetailSourceAdmin')
        case 'app':
        case 'client':
          return this.$t('supportDetailSourceApp')
        default:
          return source || '-'
      }
    },
    formatRole(role) {
      switch ((role || '').toLowerCase()) {
        case 'agent':
        case 'support':
          return this.$t('supportDetailRoleAgent')
        case 'customer':
        case 'user':
          return this.$t('supportDetailRoleCustomer')
        default:
          return role || this.$t('supportDetailRoleUnknown')
      }
    },
    formatBoolean(value) {
      if (value === true) return this.$t('supportDetailYes')
      if (value === false) return this.$t('supportDetailNo')
      return '-'
    },
    formatList(list) {
      if (!list || (Array.isArray(list) && list.length === 0)) {
        return '-'
      }
      if (Array.isArray(list)) {
        return list.join(', ')
      }
      return String(list)
    },
    formatConnection(value) {
      if (!value) return '-'
      const normalized = String(value).trim().toUpperCase()
      if (normalized === 'USB') return 'USB'
      if (normalized === 'TCP') return 'TCP'
      return value
    },
    formatSize(size) {
      const numeric = Number(size)
      if (!Number.isFinite(numeric) || numeric <= 0) return '0 B'
      if (numeric >= 1024 * 1024 * 1024) {
        return `${(numeric / (1024 * 1024 * 1024)).toFixed(2)} GB`
      }
      if (numeric >= 1024 * 1024) {
        return `${(numeric / (1024 * 1024)).toFixed(2)} MB`
      }
      if (numeric >= 1024) {
        return `${(numeric / 1024).toFixed(2)} KB`
      }
      return `${numeric} B`
    },
    getDeviceNo(serial) {
      if (!serial) return '-'
      const index = this.detailDevices.findIndex(item => item.real_serial === serial)
      return index !== -1 ? index + 1 : serial
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.page = page
      this.fetchTickets()
    },
    openForm() {
      this.stopDetailPolling()
      this.viewMode = 'form'
      this.resetReply()
    },
    openDetail(ticket) {
      const resolved = this.resolveTicketReference(ticket)
      if (!resolved) {
        this.notify('error', this.$t('supportDetailMissingIdentifier'))
        return
      }
      this.stopDetailPolling()
      this.currentTicket = resolved
      this.viewMode = 'detail'
      this.resetReply()
      this.loadTicketDetail(resolved)
      this.startDetailPolling()
    },
    resolveTicketReference(ticket) {
      if (!ticket || typeof ticket !== 'object') return null
      const unwrapKeys = ['ticket', 'data', 'result', 'payload']
      const queue = [ticket]
      const visited = new Set()
      let merged = {}
      while (queue.length) {
        const current = queue.shift()
        if (!current || typeof current !== 'object' || visited.has(current)) {
          continue
        }
        visited.add(current)
        merged = { ...merged, ...current }
        unwrapKeys.forEach(key => {
          const next = current[key]
          if (next && typeof next === 'object') {
            queue.push(next)
          }
        })
      }
      const idCandidate =
        merged.id || merged.ticket_id || merged.ticketId || merged.ticketID
      const ticketNoCandidate =
        merged.ticket_no ||
        merged.ticketNo ||
        merged.ticketNO ||
        merged.ticket_number
      if (!idCandidate && !ticketNoCandidate) {
        return null
      }
      const normalized = { ...merged }
      if (idCandidate) {
        const idString = String(idCandidate)
        normalized.id = idString
        normalized.ticket_id = idString
        normalized.ticketId = idString
      }
      if (ticketNoCandidate) {
        const ticketNoString = String(ticketNoCandidate)
        normalized.ticket_no = ticketNoString
        normalized.ticketNo = ticketNoString
      }
      return normalized
    },
    async loadTicketDetail(ticket) {
      if (!ticket) return
      this.detailLoading = true
      try {
        const params = {}
        const ticketId =
          ticket.id ||
          ticket.ticket_id ||
          ticket.ticketId ||
          ticket.ticketID ||
          ticket.ticket?.id
        const ticketNo =
          ticket.ticket_no ||
          ticket.ticketNo ||
          ticket.ticketNO ||
          ticket.ticket_number ||
          ticket.ticket?.ticket_no

        if (ticketNo) {
          params.ticket_no = String(ticketNo)
        }
        if (ticketId) {
          params.id = String(ticketId)
        }

        if (!params.ticket_no && !params.id) {
          console.warn('support loadTicketDetail missing identifiers', ticket)
          await this.notify('error', this.$t('supportDetailMissingIdentifier'))
          this.detailLoading = false
          return
        }
        const res = await this.$service.support_ticket_detail(params)
        const detail = res?.data || res || {}
        const ticketData = detail.ticket || ticket
        this.currentTicket = ticketData
        this.ticketDetail = detail
        this.metadata = ticketData?.metadata || detail.metadata || {}
        this.devicesDetail = Array.isArray(detail.devices) ? detail.devices : []
        this.messages = Array.isArray(detail.messages) ? detail.messages : []
        this.attachmentLoading = {}
        const serials = this.detailDevices.map(device => device.real_serial).filter(Boolean)
        if (serials.length && typeof this.$emiter === 'function') {
          this.$emiter('selecedDevices', [...serials])
        }
      } catch (error) {
        console.error('support loadTicketDetail error', error)
        this.notify('error', this.$t('supportDetailLoadFailed'))
      } finally {
        this.detailLoading = false
      }
    },
    startDetailPolling() {
      this.stopDetailPolling()
      const interval = Number(this.detailPollingIntervalMs)
      if (!interval || interval <= 0) {
        return
      }
      this.detailPollingTimer = setInterval(() => {
        if (this.viewMode !== 'detail' || this.detailLoading || !this.currentTicket) {
          return
        }
        this.loadTicketDetail(this.currentTicket)
      }, interval)
    },
    stopDetailPolling() {
      if (this.detailPollingTimer) {
        clearInterval(this.detailPollingTimer)
        this.detailPollingTimer = null
      }
    },
    async refreshDetail() {
      if (!this.currentTicket) return
      await this.loadTicketDetail(this.currentTicket)
    },
    clearDetailState() {
      this.stopDetailPolling()
      this.currentTicket = null
      this.ticketDetail = null
      this.metadata = {}
      this.devicesDetail = []
      this.messages = []
      this.attachmentLoading = {}
      this.resetReply()
    },
    backToList() {
      this.viewMode = 'list'
      this.clearDetailState()
      this.fetchTickets()
    },
    handleFormSubmitted(ticket) {
      const resolved = this.resolveTicketReference(ticket)
      if (resolved) {
        this.stopDetailPolling()
        this.currentTicket = resolved
        this.viewMode = 'detail'
        this.resetReply()
        this.loadTicketDetail(resolved)
        this.startDetailPolling()
        const ticketNo = resolved.ticket_no || resolved.ticketNo
        if (
          ticketNo &&
          !this.tickets.some(item => (item.ticket_no || item.ticketNo) === ticketNo)
        ) {
          this.tickets = [resolved, ...this.tickets]
        }
      } else {
        this.viewMode = 'list'
        this.fetchTickets()
      }
    },
    updateSelection(serials) {
      if (typeof this.$emiter === 'function') {
        this.$emiter('selecedDevices', Array.isArray(serials) ? [...serials] : [])
      }
    },
    resetReply() {
      this.reply.body = ''
      this.reply.includeLogs = true
      this.reply.logsPackage = null
      this.reply.messageTail = ''
      this.reply.uploadedAttachment = null
      this.reply.preparing = false
      this.reply.sending = false
    },
    async prepareReplyAttachments() {
      if (!this.reply.includeLogs) {
        this.reply.logsPackage = null
        this.reply.messageTail = ''
        this.reply.uploadedAttachment = null
        return []
      }
      const serialPayload = this.buildReplySerialPayload()
      const serials = serialPayload.map(device => device.realSerial).filter(Boolean)
      if (!serials.length) {
        await this.notify('warning', this.$t('supportDetailNoDeviceForLogs'))
        return []
      }
      if (this.reply.uploadedAttachment) {
        return [this.reply.uploadedAttachment]
      }
      try {
        this.reply.preparing = true
        const response = await this.$service.support_generate_logs({ serials })
        this.reply.logsPackage = response
        this.reply.messageTail = response?.message_tail || ''
        const attachment = await this.uploadReplyLogs(serials)
        if (attachment) {
          this.reply.uploadedAttachment = attachment
          return [attachment]
        }
        return []
      } catch (error) {
        console.error('prepareReplyAttachments error', error)
        await this.notify('error', this.$t('supportDetailPreparingFailed'))
        throw error
      } finally {
        this.reply.preparing = false
      }
    },
    buildReplySerialPayload() {
      if (!Array.isArray(this.devicesDetail)) return []
      return this.devicesDetail
        .map(device => {
          const realSerial = device.real_serial || device.realSerial
          if (!realSerial) return null
          const metadata =
            (device.metadata && typeof device.metadata === 'object' && device.metadata) ||
            (device.meta && typeof device.meta === 'object' && device.meta) ||
            {}
          return {
            realSerial,
            displayName: device.display_name || device.displayName || device.name || '',
            lastActiveAt: device.last_active_at || device.lastActiveAt || '',
            metadata
          }
        })
        .filter(Boolean)
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
          const key = unwrapKeys.find(candidate =>
            Object.prototype.hasOwnProperty.call(body, candidate)
          )
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
        context.fileName ||
        ''
      const contentType =
        getField(uploadInfo, ['contentType', 'content_type']) ||
        getField(body, ['contentType', 'content_type']) ||
        context.contentType ||
        'application/zip'
      const sizeValue = Number(
        getField(uploadInfo, ['size', 'fileSize', 'file_size']) ||
        getField(body, ['size', 'fileSize', 'file_size']) ||
        context.fileSize
      )
      const checksum =
        getField(uploadInfo, ['checksum']) ||
        getField(body, ['checksum']) ||
        context.checksum ||
        ''
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
    async uploadReplyLogs(serials) {
      if (!this.reply.logsPackage || !this.reply.logsPackage.zip_path) {
        throw new Error('LOG_PACKAGE_MISSING')
      }
      try {
        const uploadResponse = await this.$service.support_upload({
          file_path: this.reply.logsPackage.zip_path,
          file_name: this.reply.logsPackage.zip_name,
          file_size: this.reply.logsPackage.zip_size,
          content_type: 'application/zip',
          serials,
          client_app: this.clientInfoNormalized.app_name,
          client_version: this.clientInfoNormalized.client_version
        })
        const attachment = this.parseUploadResponse(uploadResponse, {
          fileName: this.reply.logsPackage.zip_name,
          fileSize: this.reply.logsPackage.zip_size,
          checksum: this.reply.logsPackage.checksum,
          serials,
          type: 'logs'
        })
        await this.notify('success', this.$t('supportUploadSuccess'))
        return attachment
      } catch (error) {
        console.error('uploadReplyLogs error', error)
        const hint = error?.message ? `: ${error.message}` : ''
        await this.notify('error', `${this.$t('supportUploadFailed')}${hint}`)
        throw error
      }
    },
    async submitReply() {
      if (!this.currentTicket) {
        await this.notify('warning', this.$t('supportDetailNoTicket'))
        return
      }
      const message = this.reply.body.trim()
      if (!message) {
        await this.notify('warning', this.$t('supportDetailReplyRequired'))
        return
      }
      this.reply.sending = true
      try {
        let attachments = []
        if (this.reply.includeLogs) {
          try {
            attachments = await this.prepareReplyAttachments()
          } catch (error) {
            this.reply.sending = false
            return
          }
        }
        const serialPayload = this.buildReplySerialPayload()
        const ticketId =
          this.currentTicket.id ||
          this.currentTicket.ticket_id ||
          this.currentTicket.ticketId ||
          this.currentTicket.ticketID
        const ticketNo =
          this.currentTicket.ticket_no ||
          this.currentTicket.ticketNo ||
          this.currentTicket.ticketNO ||
          this.currentTicket.ticket_number
        const payload = {
          ticketId: ticketId ? String(ticketId) : undefined,
          ticketNo: ticketNo ? String(ticketNo) : undefined,
          message,
          message_tail: this.reply.messageTail || '',
          source: 'app',
          role: 'customer',
          serials: serialPayload,
          attachments
        }
        await this.$service.support_append_message(payload)
        await this.notify('success', this.$t('supportDetailReplySuccess'))
        this.reply.body = ''
        this.reply.logsPackage = null
        this.reply.messageTail = ''
        this.reply.uploadedAttachment = null
        await this.loadTicketDetail(this.currentTicket)
      } catch (error) {
        console.error('support submitReply error', error)
        await this.notify('error', this.$t('supportDetailReplyFailed'))
      } finally {
        this.reply.sending = false
      }
    },
    getAttachmentKey(attachment) {
      return (
        attachment?.id ||
        attachment?.storage_key ||
        attachment?.r2_key ||
        attachment?.file_name ||
        attachment?.filename ||
        Math.random().toString(36).slice(2)
      )
    },
    isAttachmentLoading(attachment) {
      const key = this.getAttachmentKey(attachment)
      return Boolean(this.attachmentLoading[key])
    },
    setAttachmentLoading(key, value) {
      if (!key) return
      this.$set(this.attachmentLoading, key, value)
    },
    async copyAttachmentLink(attachment) {
      const key = this.getAttachmentKey(attachment)
      this.setAttachmentLoading(key, true)
      try {
        const params = {}
        if (attachment?.id) {
          params.attachment_id = attachment.id
        } else if (attachment?.storage_key || attachment?.r2_key) {
          params.storage_key = attachment.storage_key || attachment.r2_key
        } else if (this.currentTicket?.ticket_no) {
          params.ticket_no = this.currentTicket.ticket_no
          params.file_name = attachment?.file_name || attachment?.filename
        }
        const response = await this.$service.support_presign_attachment(params)
        const data = response?.data || response || {}
        const url = data.url || data.downloadUrl || data.link
        if (!url) {
          throw new Error('missing_url')
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url)
          await this.notify('success', this.$t('supportDetailCopySuccess'))
        } else {
          await this.notify('success', url)
        }
      } catch (error) {
        console.error('copyAttachmentLink error', error)
        await this.notify('error', this.$t('supportDetailCopyFailed'))
      } finally {
        this.setAttachmentLoading(key, false)
      }
    }
  }
}
</script>

<style scoped>
.support-center {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.support-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}

.table thead th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.subject-cell {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.ticket-row:hover {
  background-color: #f3f4f6;
}

.ticket-row:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-open {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.status-pending {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.status-closed {
  background: rgba(156, 163, 175, 0.12);
  color: #4b5563;
}

.priority-p1 {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.priority-p2 {
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
}

.priority-p3 {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.loading-cell,
.empty-cell {
  text-align: center;
  color: #6b7280;
  padding: 24px 12px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.page-indicator {
  font-size: 14px;
  color: #4b5563;
}

.support-form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.support-detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-header-title {
  font-size: 18px;
  font-weight: 600;
}

.detail-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-loading {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 16px;
  border-radius: 10px;
  background: #f9fafb;
  color: #4b5563;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-card {
  gap: 10px;
}

.summary-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-subject {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.summary-meta {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.summary-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #4b5563;
  flex-wrap: wrap;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.info-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #374151;
  gap: 12px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.device-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  padding: 12px;
  background: #f9fafb;
}

.device-card-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  color: #111827;
}

.device-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.conversation-card {
  gap: 16px;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  border: 1px solid rgba(59, 130, 246, 0.12);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.conversation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.message-role {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.role-agent {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.role-customer {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.role-unknown {
  background: rgba(156, 163, 175, 0.12);
  color: #4b5563;
}

.message-author {
  font-weight: 600;
  color: #1f2937;
}

.message-time {
  color: #6b7280;
  font-size: 13px;
}

.conversation-body {
  white-space: pre-wrap;
  font-size: 14px;
  color: #111827;
}

.conversation-tail {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  color: #374151;
  max-height: 160px;
  overflow-y: auto;
}

.conversation-attachments {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1f2937;
}

.attachment-name {
  font-weight: 500;
}

.attachment-size {
  color: #6b7280;
  font-size: 12px;
}

.reply-card {
  gap: 10px;
}

.reply-options {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.reply-attachment-meta {
  font-size: 12px;
  color: #4b5563;
}

.reply-preparing {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: #2563eb;
}

.reply-actions {
  display: flex;
  gap: 8px;
}

.empty-cell.compact {
  padding: 16px;
  font-size: 14px;
}
</style>
