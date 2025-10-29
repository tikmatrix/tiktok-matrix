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
            <tr v-for="ticket in tickets" :key="ticket.id || ticket.ticket_no" :class="['ticket-row', {
              'ticket-row--highlight': highlightTicketNo && highlightTicketNo === (ticket.ticket_no || ticket.ticketNo),
              'ticket-row--unread': isTicketUnread(ticket)
            }]" role="button" tabindex="0" @click="openDetail(ticket)" @keydown.enter.prevent="openDetail(ticket)"
              @keydown.space.prevent="openDetail(ticket)">
              <td>#{{ ticket.ticket_no }}</td>
              <td class="subject-cell">
                <span v-if="isTicketUnread(ticket)"
                  class="mr-2 inline-block h-2 w-2 rounded-full bg-error align-middle"></span>
                <span :class="isTicketUnread(ticket) ? 'font-semibold' : ''">{{ ticket.subject }}</span>
              </td>
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
          <button class="btn btn-outline btn-sm back-button" @click="backToList">
            <svg class="back-button-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M9.78 3.22a.75.75 0 0 1 0 1.06L6.56 7.5H13a.75.75 0 0 1 0 1.5H6.56l3.22 3.22a.75.75 0 0 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0z"
                fill="currentColor" />
            </svg>
            <span>{{ $t('supportBackToList') }}</span>
          </button>
          <span class="detail-header-title">{{ currentTicket?.subject || '-' }}</span>
        </div>
        <div class="detail-header-actions">
          <button class="btn btn-outline btn-sm" :disabled="detailLoading" @click="refreshDetail">
            <span v-if="detailLoading" class="loading loading-spinner loading-xs mr-1"></span>
            {{ $t('supportDetailRefresh') }}
          </button>
          <button class="btn btn-error btn-sm" :disabled="closingTicket || isTicketClosed" @click="closeTicket">
            <span v-if="closingTicket" class="loading loading-spinner loading-xs mr-1"></span>
            {{ $t('supportDetailCloseTicket') }}
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

        <section class="detail-card">
          <h4>{{ $t('supportDetailDevices') }}</h4>
          <div v-if="!detailDevices.length" class="empty-cell compact">{{ $t('supportDetailNoDevices') }}</div>
          <div v-else class="device-number-list">
            <span v-for="device in detailDevices" :key="device.id || device.real_serial || device.realSerial"
              class="badge badge-outline device-number-badge" :title="device.real_serial || device.realSerial || ''">
              {{ formatDeviceBadge(device) }}
            </span>
          </div>
        </section>

        <section class="detail-card conversation-card">
          <h4>{{ $t('supportDetailConversation') }}</h4>
          <div v-if="!messages.length" class="empty-cell compact">{{ $t('supportDetailNoMessages') }}</div>
          <div v-else class="conversation-list">
            <article v-for="message in messages" :key="message.id" class="conversation-item">
              <header class="conversation-header">
                <span class="message-role" :class="`role-${message.role}`">{{ formatRole(message.role) }}</span>
                <span class="message-time">{{ message.created_at_display }}</span>
              </header>
              <div class="conversation-body">{{ message.body }}</div>
              <pre v-if="message.message_tail" class="conversation-tail">{{ message.message_tail }}</pre>
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
        <button class="btn btn-outline btn-sm back-button" @click="backToList">
          <svg class="back-button-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M9.78 3.22a.75.75 0 0 1 0 1.06L6.56 7.5H13a.75.75 0 0 1 0 1.5H6.56l3.22 3.22a.75.75 0 0 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0z"
              fill="currentColor" />
          </svg>
          <span>{{ $t('supportBackToList') }}</span>
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
import { getSupportUnreadState, extractTicketKey } from '../../utils/supportNotifications.js'

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
        includeLogs: false,
        logsPackage: null,
        messageTail: '',
        uploadedAttachment: null,
        preparing: false,
        sending: false
      },
      detailRetryHandle: null,
      highlightTicketNo: null,
      highlightTimerHandle: null,
      closingTicket: false,
      listeners: [],
      unreadTicketMap: {}
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
    },
    isTicketClosed() {
      const status = this.currentTicket?.status || this.currentTicket?.statusDb
      if (!status) return false
      return String(status).toLowerCase() === 'closed'
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
  async created() {
    await this.initialize()
    await this.setupUnreadState()
    await this.registerSupportListeners()
  },
  beforeUnmount() {
    this.destroyListeners()
  },
  beforeDestroy() {
    this.destroyListeners()
  },
  methods: {
    async setupUnreadState() {
      try {
        const state = await getSupportUnreadState()
        this.unreadTicketMap = { ...state.map }
        this.applyUnreadFlags()
      } catch (error) {
        console.error('support setupUnreadState error', error)
        this.unreadTicketMap = {}
      }
    },
    async registerSupportListeners() {
      if (typeof this.$listen !== 'function') {
        return
      }
      const unsubscribe = await this.$listen('supportUnreadChanged', async (event) => {
        const payload = event?.payload || {}
        if (payload.unreadMap && typeof payload.unreadMap === 'object') {
          this.unreadTicketMap = { ...payload.unreadMap }
          this.applyUnreadFlags()
        }
        if (Array.isArray(payload.updates) && payload.updates.length) {
          const ticketNo = payload.highlightTicketNo || extractTicketKey(payload.updates[0])
          if (ticketNo) {
            this.highlightTicket(ticketNo)
          }
        } else if (Array.isArray(payload.ticketNos) && payload.ticketNos.length) {
          this.applyUnreadFlags()
        }
      })
      this.listeners.push(unsubscribe)
    },
    destroyListeners() {
      if (!Array.isArray(this.listeners)) {
        this.listeners = []
        return
      }
      this.listeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
        }
      })
      this.listeners = []
    },
    applyUnreadFlags() {
      if (!Array.isArray(this.tickets)) {
        return
      }
      const unread = this.unreadTicketMap || {}
      this.tickets = this.tickets.map(ticket => {
        const key = extractTicketKey(ticket)
        if (!key) {
          return { ...ticket, __unread: false }
        }
        const isUnread = Boolean(unread[key])
        if (ticket.__unread === isUnread) {
          return ticket
        }
        return { ...ticket, __unread: isUnread }
      })
    },
    isTicketUnread(ticket) {
      if (!ticket) return false
      if (typeof ticket.__unread === 'boolean') {
        return ticket.__unread
      }
      const key = extractTicketKey(ticket)
      return Boolean(key && this.unreadTicketMap[key])
    },
    async markTicketAsRead(ticket) {
      if (typeof this.$emiter !== 'function') {
        return
      }
      const key = extractTicketKey(ticket)
      if (!key) {
        return
      }
      await this.$emiter('supportMarkRead', { ticketNos: [key] })
    },
    highlightTicket(ticketNo) {
      if (!ticketNo) {
        return
      }
      this.highlightTicketNo = ticketNo
      if (this.highlightTimerHandle) {
        clearTimeout(this.highlightTimerHandle)
      }
      this.highlightTimerHandle = setTimeout(() => {
        this.highlightTicketNo = null
        this.highlightTimerHandle = null
      }, 5000)
    },
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
          app_version: appVersion
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
        this.applyUnreadFlags()
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
    parseMaybeJson(value) {
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
    },
    toArray(value) {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.filter(item => item !== undefined && item !== null)
      }
      if (typeof value === 'object') {
        return Object.keys(value)
          .map(key => value[key])
          .filter(item => item !== undefined && item !== null)
      }
      return []
    },
    normalizeDetailDevices(detail) {
      const ticketData = detail?.ticket || this.currentTicket || {}
      const ticketMeta = this.parseMaybeJson(ticketData.metadata) || ticketData.metadata || {}
      const detailMeta = this.parseMaybeJson(detail?.metadata) || detail?.metadata || {}
      const primary = this.toArray(detail?.devices)
        .map(device => this.decorateDeviceEntry(device, ticketData))
        .filter(Boolean)
      if (primary.length) {
        return primary
      }
      const candidateSources = [
        ticketData?.devices,
        ticketMeta?.devices,
        detailMeta?.devices
      ]
      for (const source of candidateSources) {
        const list = this.toArray(source)
          .map(device => this.decorateMetadataDevice(device, ticketData))
          .filter(Boolean)
        if (list.length) {
          return list
        }
      }
      return []
    },
    buildDeviceMetadata(device) {
      if (!device || typeof device !== 'object') {
        return {}
      }
      const metaSource =
        this.parseMaybeJson(device.metadata) ||
        this.parseMaybeJson(device.meta) ||
        (device.metadata && typeof device.metadata === 'object' ? device.metadata : {}) ||
        {}
      const metadata = {}
      const pick = (...keys) => this.normalizeMetadataField(
        ...keys.map(key => metaSource[key]),
        ...keys.map(key => device[key])
      )

      const name = pick('name', 'displayName', 'display_name')
      if (name) metadata.name = name

      const product = pick('product')
      if (product) metadata.product = product

      const model = pick('model', 'mode')
      if (model) metadata.model = model

      const status = pick('status')
      if (status) metadata.status = status

      const group = pick('group', 'group_id', 'groupId')
      if (group) metadata.group = group

      const forwardPort = pick('forwardPort', 'forward_port')
      if (forwardPort) metadata.forwardPort = forwardPort

      const transport = pick('transport', 'transport_id', 'transportId')
      if (transport) metadata.transport = transport

      const lastSeen = pick('lastSeen', 'last_seen', 'lastActiveAt', 'last_active_at')
      if (lastSeen) metadata.lastSeen = lastSeen

      const taskStatus = pick('taskStatus', 'task_status')
      if (taskStatus) metadata.taskStatus = taskStatus

      const connectionCandidate = this.normalizeMetadataField(
        metaSource.connection,
        metaSource.connectionType,
        metaSource.connection_type,
        metaSource.connectType,
        metaSource.connect_type,
        device.connection,
        device.connection_type,
        device.connect_type
      )
      const connection = this.resolveConnectionType(connectionCandidate)
      if (connection) metadata.connection = connection

      const proxyRotation = this.sanitizeProxyRotation(
        metaSource.proxyRotation || metaSource.proxy_rotation || device.proxyRotation || device.proxy_rotation
      )
      if (proxyRotation) metadata.proxyRotation = proxyRotation

      return metadata
    },
    decorateDeviceEntry(device, ticketData = {}) {
      if (!device || typeof device !== 'object') {
        return null
      }
      const realSerial =
        device.real_serial ||
        device.realSerial ||
        device.serial ||
        device.id ||
        null
      if (!realSerial) {
        return null
      }
      const metadata = this.buildDeviceMetadata(device)
      return {
        id: device.id || device.device_id || realSerial,
        ticket_id: device.ticket_id || device.ticketId || ticketData.id || ticketData.ticket_id || null,
        real_serial: String(realSerial),
        display_name:
          this.normalizeMetadataField(
            device.display_name,
            device.displayName,
            device.name,
            metadata.name
          ),
        last_active_at: this.normalizeMetadataField(
          device.last_active_at,
          device.lastActiveAt,
          device.last_seen,
          metadata.lastSeen
        ),
        metadata
      }
    },
    decorateMetadataDevice(device, ticketData = {}) {
      if (!device || typeof device !== 'object') {
        return null
      }
      const realSerial =
        device.real_serial ||
        device.realSerial ||
        device.serial ||
        device.id
      if (!realSerial) {
        return null
      }
      const baseMetadata = this.buildDeviceMetadata(device)
      return {
        id: device.id || `meta-${realSerial}`,
        ticket_id: ticketData.id || ticketData.ticket_id || null,
        real_serial: String(realSerial),
        display_name:
          this.normalizeMetadataField(
            device.display_name,
            device.displayName,
            baseMetadata.name,
            device.name
          ),
        last_active_at: this.normalizeMetadataField(
          device.last_active_at,
          device.lastActiveAt,
          device.last_seen,
          baseMetadata.lastSeen
        ),
        metadata: baseMetadata
      }
    },
    normalizeDetailMessages(detail) {
      const candidateSources = [
        detail?.messages,
        detail?.conversation,
        detail?.ticket?.messages
      ]
      for (const source of candidateSources) {
        const list = this.toArray(source)
          .map(message => this.decorateMessageEntry(message))
          .filter(Boolean)
        if (list.length) {
          return list
        }
      }
      return []
    },
    decorateMessageEntry(message) {
      if (!message || typeof message !== 'object') {
        return null
      }
      const body = message.body || message.content || message.message || ''
      const createdValue =
        message.created_at ||
        message.createdAt ||
        message.timestamp ||
        message.created_at_display
      const numeric = Number(createdValue)
      let createdAt = createdValue
      if (Number.isFinite(numeric) && numeric > 0) {
        createdAt = numeric
      }
      const createdDisplay = this.formatDate(createdAt)
      const attachments = this.toArray(
        message.attachments ||
        message.attachment_list ||
        message.files
      )
        .map(item => (item && typeof item === 'object' ? item : null))
        .filter(Boolean)
      return {
        ...message,
        body,
        content: body,
        created_at: createdAt,
        created_at_display: createdDisplay,
        attachments
      }
    },
    getDeviceNo(serial) {
      if (!serial) return '-'
      const normalized = String(serial)
      const fromDetailIndex = this.detailDevices.findIndex(item => {
        const value = item?.real_serial || item?.realSerial
        return value != null && String(value) === normalized
      })
      if (fromDetailIndex !== -1) {
        return fromDetailIndex + 1
      }
      const fromSource = (this.devices || []).findIndex(device => {
        const value = device?.real_serial || device?.serial || device?.id
        return value != null && String(value) === normalized
      })
      if (fromSource !== -1) {
        return fromSource + 1
      }
      return normalized
    },
    formatDeviceBadge(device) {
      if (!device || typeof device !== 'object') {
        return '-'
      }
      const serial = device.real_serial || device.realSerial || device.serial || ''
      const label = this.getDeviceNo(serial)
      return label != null && label !== '' ? label : serial || '-'
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.page = page
      this.fetchTickets()
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
    openForm() {
      this.viewMode = 'form'
      this.resetReply()
    },
    async openDetail(ticket) {
      const resolved = this.resolveTicketReference(ticket)
      if (!resolved) {
        this.notify('error', this.$t('supportDetailMissingIdentifier'))
        return
      }
      this.currentTicket = resolved
      await this.markTicketAsRead(resolved)
      this.viewMode = 'detail'
      this.resetReply()
      this.loadTicketDetail(resolved)
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
        const parsedTicketMetadata = this.parseMaybeJson(ticketData?.metadata)
        const parsedDetailMetadata = this.parseMaybeJson(detail.metadata)
        this.metadata = parsedTicketMetadata || parsedDetailMetadata || {}
        this.devicesDetail = this.normalizeDetailDevices(detail)
        this.messages = this.normalizeDetailMessages(detail)
        let serials = this.detailDevices.map(device => device.real_serial).filter(Boolean)
        if (!serials.length) {
          serials = this.toArray(this.metadata?.devices)
            .map(device => device?.real_serial || device?.realSerial)
            .filter(Boolean)
        }
        if (serials.length && typeof this.$emiter === 'function') {
          this.$emiter('selecedDevices', [...new Set(serials.map(value => String(value)))])
        }
      } catch (error) {
        console.error('support loadTicketDetail error', error)
        this.notify('error', this.$t('supportDetailLoadFailed'))
      } finally {
        this.detailLoading = false
      }
    },


    async refreshDetail() {
      if (!this.currentTicket) return
      await this.loadTicketDetail(this.currentTicket)
    },
    async closeTicket() {
      if (!this.currentTicket || this.closingTicket) {
        return
      }
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
      if (!ticketId && !ticketNo) {
        await this.notify('error', this.$t('supportDetailMissingIdentifier'))
        return
      }
      this.closingTicket = true
      try {
        const payload = {
          status: 'closed'
        }
        if (ticketNo) {
          payload.ticketNo = String(ticketNo)
        } else if (ticketId) {
          payload.ticketId = String(ticketId)
        }
        await this.$service.support_update_status(payload)
        await this.notify('success', this.$t('supportDetailCloseSuccess'))
        await this.loadTicketDetail({ ...this.currentTicket })
        await this.fetchTickets()
      } catch (error) {
        console.error('support closeTicket error', error)
        await this.notify('error', this.$t('supportDetailCloseFailed'))
      } finally {
        this.closingTicket = false
      }
    },
    clearDetailState() {
      this.currentTicket = null
      this.ticketDetail = null
      this.metadata = {}
      this.devicesDetail = []
      this.messages = []
      if (this.highlightTimerHandle) {
        clearTimeout(this.highlightTimerHandle)
        this.highlightTimerHandle = null
      }
      this.highlightTicketNo = null
      this.resetReply()
    },
    backToList() {
      this.viewMode = 'list'
      this.clearDetailState()
      this.fetchTickets()
    },
    handleFormSubmitted(ticket) {
      const resolved = this.resolveTicketReference(ticket)
      this.viewMode = 'list'
      this.clearDetailState()
      if (resolved) {
        this.insertTicketToList(resolved)
      }
      this.page = 1
      this.fetchTickets()
    },
    insertTicketToList(ticket) {
      const resolved = this.resolveTicketReference(ticket)
      if (!resolved) {
        return
      }
      const ticketNo = resolved.ticket_no || resolved.ticketNo || resolved.ticket_number
      const identifier =
        ticketNo || resolved.id || resolved.ticket_id || resolved.ticketId || resolved.ticketID
      if (!identifier) {
        return
      }

      const normalized = { ...resolved }
      if (!normalized.ticket_no && ticketNo) {
        normalized.ticket_no = ticketNo
      }
      if (!normalized.ticketNo && ticketNo) {
        normalized.ticketNo = ticketNo
      }
      if (!normalized.id && normalized.ticket_id) {
        normalized.id = normalized.ticket_id
      }
      if (!normalized.ticket_id && normalized.id) {
        normalized.ticket_id = normalized.id
      }

      const filtered = this.tickets.filter(item => {
        const value = item.ticket_no || item.ticketNo || item.id || item.ticket_id || item.ticketId
        return value !== identifier
      })

      this.tickets = [normalized, ...filtered]
      this.applyUnreadFlags()
      this.highlightTicket(normalized.ticket_no || normalized.ticketNo || null)
    },
    updateSelection(serials) {
      if (typeof this.$emiter === 'function') {
        this.$emiter('selecedDevices', Array.isArray(serials) ? [...serials] : [])
      }
    },
    resetReply() {
      this.reply.body = ''
      this.reply.includeLogs = false
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
      const sourceDevices = Array.isArray(this.devicesDetail) && this.devicesDetail.length
        ? this.devicesDetail
        : this.normalizeDetailDevices({
          ticket: this.currentTicket,
          metadata: this.metadata
        })
      if (!Array.isArray(sourceDevices)) return []
      return sourceDevices
        .map(device => {
          const realSerial = device.real_serial || device.realSerial
          if (!realSerial) return null
          const metadata = this.buildDeviceMetadata(device)
          return {
            realSerial,
            displayName: this.normalizeMetadataField(
              device.display_name,
              device.displayName,
              device.name,
              metadata.name
            ),
            lastActiveAt: this.normalizeMetadataField(
              device.last_active_at,
              device.lastActiveAt,
              device.last_seen,
              metadata.lastSeen
            ),
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

.ticket-row--unread {
  background-color: #fef2f2;
}

.ticket-row--unread:hover {
  background-color: #fee2e2;
}

.ticket-row--highlight {
  background-color: #ecfdf5;
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.ticket-row--highlight:hover {
  background-color: #d1fae5;
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

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.back-button-icon {
  width: 16px;
  height: 16px;
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
