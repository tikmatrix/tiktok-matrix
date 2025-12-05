<template>
  <div class="min-h-screen w-screen bg-base-200 text-base-content overflow-hidden">
    <TitleBar :supportUnreadCount="supportUnreadCount" />
    <div class="flex flex-row items-stretch gap-3 mt-12 h-[calc(100vh-3rem)] w-full px-3 overflow-hidden">
      <Sidebar :devices="devices" :settings="settings" :groups="groups" :selecedDevices="selecedDevices"
        v-if="showSidebar" />
      <div class="flex-1 h-full overflow-hidden">
        <ManageDevices :devices="devices" :settings="settings" />
      </div>
    </div>
    <AppDialog :devices="devices" :settings="settings" :selecedDevices="selecedDevices" />
  </div>
  <Notifications />

</template>

<script>
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import AppDialog from './AppDialog.vue'
import ManageDevices from './components/device/ManageDevices.vue'
import Notifications from './components/Notifications.vue';
import { invoke } from '@tauri-apps/api/tauri'
import { getItem } from './utils/storage.js';
import {
  getSupportUnreadState,
  mergeSupportUpdates,
  markSupportTicketsRead,
  markAllSupportTicketsRead,
  extractTicketKey
} from './utils/supportNotifications.js';

export default {
  name: 'app',
  components: {
    TitleBar,
    Sidebar,
    AppDialog,
    ManageDevices,
    Notifications
  },
  data() {
    return {
      devices: [],
      settings: {},
      groups: [],
      showSidebar: true,
      running_devices: [],
      selecedDevices: [],
      listeners: [],
      supportUnreadMap: {},
      supportUnreadCount: 0,
    }
  },
  watch: {
    running_devices: {
      handler(newTasks) {
        console.log("Running devices updated:", newTasks);
        this.devices.forEach(device => {
          device.task_status = this.running_devices.includes(device.real_serial) ? 1 : device.task_status;
        });
      },
      deep: true
    },
    devices: {
      handler(newDevices) {
        console.log("Devices updated:", newDevices);
        newDevices.forEach(device => {
          device.task_status = this.running_devices.includes(device.real_serial) ? 1 : device.task_status;
        });
      },
      deep: true
    }
  },

  methods: {
    async initializeSupportUnread() {
      try {
        const state = await getSupportUnreadState();
        this.supportUnreadMap = { ...state.map };
        this.supportUnreadCount = state.count;
        await this.emitSupportUnreadChanged({ source: 'init' });
      } catch (error) {
        console.error('initializeSupportUnread error', error);
        this.supportUnreadMap = {};
        this.supportUnreadCount = 0;
        await this.emitSupportUnreadChanged({ source: 'init', error: error?.message });
      }
    },

    async emitSupportUnreadChanged(extra = {}) {
      if (typeof this.$emiter !== 'function') {
        return;
      }
      const payload = {
        unreadCount: this.supportUnreadCount,
        unreadMap: { ...this.supportUnreadMap },
        ...extra
      };
      await this.$emiter('supportUnreadChanged', payload);
    },

    async emitGenericAgentEvent(message = {}) {
      if (typeof this.$emiter !== 'function') {
        return;
      }
      const action = typeof message === 'object' ? message?.action : null;
      if (!action) {
        return;
      }
      const payload = {
        action,
        data: message?.data ?? null,
        raw: message
      };
      try {
        await this.$emiter('agentEvent', payload);
      } catch (error) {
        console.error('emitGenericAgentEvent error', error);
      }
    },

    async handleSupportUpdates(updates = []) {
      try {
        const result = await mergeSupportUpdates(updates);
        this.supportUnreadMap = { ...result.map };
        this.supportUnreadCount = result.count;
        const highlightTicketNo = updates.length ? extractTicketKey(updates[0]) : null;
        await this.emitSupportUnreadChanged({
          source: 'update',
          updates,
          highlightTicketNo,
          changed: result.changed
        });
      } catch (error) {
        console.error('handleSupportUpdates error', error);
      }
    },

    async handleSupportMarkRead(ticketNos = []) {
      if (!Array.isArray(ticketNos) || ticketNos.length === 0) {
        return;
      }
      try {
        const normalizedKeys = ticketNos
          .map(key => String(key || '').trim())
          .filter(Boolean);
        if (!normalizedKeys.length) {
          return;
        }
        const result = await markSupportTicketsRead(normalizedKeys);
        this.supportUnreadMap = { ...result.map };
        this.supportUnreadCount = result.count;
        if (result.changed) {
          await this.emitSupportUnreadChanged({
            source: 'read',
            ticketNos: normalizedKeys
          });
        }
      } catch (error) {
        console.error('handleSupportMarkRead error', error);
      }
    },

    async handleSupportMarkAllRead() {
      try {
        const result = await markAllSupportTicketsRead();
        this.supportUnreadMap = { ...result.map };
        this.supportUnreadCount = result.count;
        if (result.changed) {
          await this.emitSupportUnreadChanged({ source: 'read-all' });
        }
      } catch (error) {
        console.error('handleSupportMarkAllRead error', error);
      }
    },

    async get_settings() {
      const res = await this.$service.get_settings();
      this.settings = res.data

    },

    async get_groups() {
      this.$service.get_groups().then(async res => {
        this.groups = res.data

      })
    },
    async getRunningTasks() {
      this.$service.get_running_tasks().then(res => {
        let runningTasks = res.data
        this.running_devices = runningTasks.map(task => task.serial)

      })
    },

    // Handle agent message from Rust WebSocket manager
    async handleAgentMessage(message) {
      try {
        const json = typeof message === 'string' ? JSON.parse(message) : message;
        if (json.action === 'reload_devices') {
          let data = json.data
          if (data) {
            console.log('Received reload_devices with data:', data);
            await this.$emiter('reload_devices', {})
          }
        } else if (json.action === 'reload_license') {
          await this.$emiter('LICENSE', { reload: true })
        } else if (json.action === 'stripe_payment_success') {
          await this.$emiter('STRIPE_PAYMENT_SUCCESS', {})
        } else if (json.action === 'stripe_payment_cancel') {
          await this.$emiter('STRIPE_PAYMENT_CANCEL', {})
        } else if (json.action === 'order_payment_status') {
          await this.$emiter('ORDER_PAYMENT_STATUS', json.data || {})
        } else if (json.action === 'task_status') {
          let serial = json.serial
          let status = json.status
          if (status === 1) {
            // Avoid duplicate inserts causing infinite array growth
            if (!this.running_devices.includes(serial)) {
              this.running_devices.push(serial)
            }
          } else if (this.running_devices.length) {
            // Remove all related entries to prevent residual duplicate data
            this.running_devices = this.running_devices.filter(item => item !== serial)
          }
          this.devices.forEach(device => {
            if (device.real_serial === serial) {
              device.task_status = status
            }
          })
          await this.$emiter('reload_tasks', {})
        } else if (json.action === 'agent_status') {
          let serial = json.serial
          let status = json.status
          this.devices.forEach(device => {
            if (device.real_serial === serial) {
              if (status === -1) {
                device.task_status = -1
              } else if (status === 0 && device.task_status !== 1) {
                // Task is not running
                device.task_status = 0
              }
            }
          })
        } else if (json.action === 'support_ticket_updates') {
          const updates = Array.isArray(json.tickets) ? json.tickets : []
          await this.handleSupportUpdates(updates)
        } else if (json.action === 'heartbeat') {
          await this.$emiter('heartbeat', {})
        } else {
          await this.emitGenericAgentEvent(json)
        }
      } catch (error) {
        console.error('handleAgentMessage parse error', error);
      }
    },

    // Handle WebSocket status changes from Rust
    handleWsStatusChange(status) {
      console.log('WebSocket status changed:', status);
      if (status.state === 'Connected') {
        // WebSocket connected
      } else if (status.state === 'Disconnected') {
        // WebSocket disconnected
      }
    },

    // Connect to agent via Rust WebSocket manager
    async connectAgent() {
      try {
        console.log('Connecting to agent WebSocket...');
        await invoke('ws_connect');
      } catch (error) {
        console.error('Failed to connect agent WebSocket:', error);
      }
    },

    // Setup network monitoring for reconnection
    setupNetworkMonitoring() {
      this.handleOnline = async () => {
        console.log('Network connection restored, resetting reconnect attempts');
        try {
          await invoke('ws_reset_reconnect');
        } catch (error) {
          console.error('Failed to reset reconnect:', error);
        }
      };

      this.handleOffline = () => {
        console.log('Network connection lost');
      };

      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    },

    cleanupNetworkMonitoring() {
      if (this.handleOnline) {
        window.removeEventListener('online', this.handleOnline);
        this.handleOnline = null;
      }
      if (this.handleOffline) {
        window.removeEventListener('offline', this.handleOffline);
        this.handleOffline = null;
      }
    },
    async getDevices() {
      try {
        const res = await this.$service.get_devices();
        const newDevices = Array.isArray(res.data) ? res.data : [];

        // Build a map of existing devices by real_serial for quick lookup
        const existingDevicesMap = new Map(
          this.devices.map(d => [d.real_serial, d])
        );

        // Build the final devices list based on API response
        const finalDevices = [];

        for (const newDevice of newDevices) {
          const existingDevice = existingDevicesMap.get(newDevice.real_serial);
          if (existingDevice) {
            // Update existing device properties while preserving local state
            const updatedDevice = {
              ...newDevice,
              sort: existingDevice.sort ?? 0,
              task_status: existingDevice.task_status ?? newDevice.task_status,
            };
            finalDevices.push(updatedDevice);
          } else {
            // New device - load sort from storage
            const storedSort = await getItem(`sort_${newDevice.real_serial}`);
            newDevice.sort = Number(storedSort ?? '0');
            finalDevices.push(newDevice);
          }
        }

        // Sort the devices
        finalDevices.sort((a, b) => {
          return (a.sort - b.sort) || (a.group_id - b.group_id) || a.serial.localeCompare(b.serial);
        });

        // Update key for each device
        finalDevices.forEach((device, index) => {
          device.key = index + 1;
        });

        // Replace the devices array atomically
        this.devices.splice(0, this.devices.length, ...finalDevices);

      } catch (error) {
        console.error('获取设备列表失败:', error);
      }
    },



    disableMenu() {
      // 开发环境不禁止右键菜单
      const isDev = import.meta.env.DEV;
      if (isDev) {
        console.log("current is dev environment")
        return;
      }
      // 禁用右键菜单
      document.addEventListener('contextmenu', event => event.preventDefault());
    },



  },

  async mounted() {
    // Disable context menu
    this.disableMenu();

    await this.initializeSupportUnread();

    // Setup network status monitoring
    this.setupNetworkMonitoring();

    // Listen to agent messages from Rust WebSocket manager
    this.listeners.push(await this.$listen('agent_message', async (e) => {
      await this.handleAgentMessage(e.payload);
    }));

    // Listen to WebSocket status changes from Rust
    this.listeners.push(await this.$listen('ws_status', (e) => {
      this.handleWsStatusChange(e.payload);
    }));

    // Listen to agent startup events
    this.listeners.push(await this.$listen('INIT_STATUS', async (e) => {
      const status = e.payload;
      if (status.stage === 'completed') {
        console.log("Agent initialization completed, loading resources...");
        await this.connectAgent();
        await this.$emiter('reload_settings', {})
        await this.$emiter('reload_groups', {})
        await this.$emiter('reload_devices', {})
        await this.$emiter('reload_running_tasks', {})
        await this.$emiter('reload_tasks', {})
        await this.$emiter('LICENSE', { reload: true });

      }

    }));
    await this.$listen("AGENT_MONITOR_STATUS", async (e) => {
      const status = e.payload;
      console.log("Agent monitor status:", status);
      if (status.event === 'agent_restarted') {
        console.log("Agent has restarted, reloading resources...");
        await this.connectAgent();
        await this.$emiter('reload_settings', {})
        await this.$emiter('reload_groups', {})
        await this.$emiter('reload_devices', {})
        await this.$emiter('reload_running_tasks', {})
        await this.$emiter('reload_tasks', {})
        await this.$emiter('LICENSE', { reload: true });
      }
    });
    this.listeners.push(await this.$listen('reload_devices', async (e) => {
      if (e.payload && e.payload.force) {
        console.log("Force reloading devices as requested");
        this.devices = [];
      }
      await this.getDevices();
    }));
    // Listen to reload running tasks events
    this.listeners.push(await this.$listen('reload_running_tasks', async () => {
      await this.getRunningTasks();
    }));

    // Listen to sidebar change events
    this.listeners.push(await this.$listen('sidebarChange', (e) => {
      this.showSidebar = e.payload;
    }));


    this.listeners.push(await this.$listen('selecedDevices', (e) => {
      this.selecedDevices = e.payload;
    }))
    this.listeners.push(await this.$listen('reload_groups', async () => {
      await this.get_groups()
    }))
    // Reload settings
    this.listeners.push(await this.$listen('reload_settings', async () => {
      await this.get_settings()
    }))

    this.listeners.push(await this.$listen('supportMarkRead', async (e) => {
      const payload = e?.payload || {}
      const keys = Array.isArray(payload.ticketNos)
        ? payload.ticketNos
        : [payload.ticketNo]
      await this.handleSupportMarkRead(keys)
    }))

    this.listeners.push(await this.$listen('supportMarkAllRead', async () => {
      await this.handleSupportMarkAllRead()
    }))

  },
  unmounted() {
    this.listeners.forEach(listener => {
      if (listener) {
        listener()
      }
    })
    this.listeners = []

    // Cleanup network monitoring
    this.cleanupNetworkMonitoring();
  }
}
</script>
