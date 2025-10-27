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
            <tr v-for="ticket in tickets" :key="ticket.id">
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

    <div v-else class="support-form-wrapper">
      <div class="form-header">
        <button class="btn btn-ghost" @click="backToList">
          {{ $t('supportBackToList') }}
        </button>
        <span>{{ $t('supportCreateTicketButton') }}</span>
      </div>
      <SupportForm
        :devices="devices"
        :seleced-devices="selecedDevices"
        :client-info="clientInfo"
        @submitted="handleFormSubmitted"
        @cancel="backToList"
        @update:selected="updateSelection"
      />
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
      total: 0
    }
  },
  computed: {
    totalPages() {
      if (!this.total) return 1
      return Math.ceil(this.total / this.pageSize)
    }
  },
  created() {
    this.initialize()
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
    formatStatus(value) {
      switch (value) {
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
      switch (value) {
        case 'p1':
          return this.$t('supportPriorityUrgent')
        case 'p2':
          return this.$t('supportPriorityHigh')
        case 'p3':
          return this.$t('supportPriorityNormal')
        default:
          return value || '-'
      }
    },
    formatDate(value) {
      if (!value && value !== 0) return '-'
      const numeric = Number(value)
      if (Number.isFinite(numeric)) {
        return new Date(numeric).toLocaleString()
      }
      return value || '-'
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.page = page
      this.fetchTickets()
    },
    openForm() {
      this.viewMode = 'form'
    },
    backToList() {
      this.viewMode = 'list'
      this.fetchTickets()
    },
    handleFormSubmitted() {
      this.viewMode = 'list'
      this.fetchTickets()
    },
    updateSelection(serials) {
      this.$emiter('selecedDevices', Array.isArray(serials) ? [...serials] : [])
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
</style>
