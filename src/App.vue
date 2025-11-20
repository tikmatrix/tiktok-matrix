<template>
  <div class="min-h-screen w-screen bg-base-200 text-base-content overflow-hidden">
    <TitleBar :supportUnreadCount="supportUnreadCount" :wsStatus="wsStatus" />
    <div class="flex flex-row items-stretch gap-3 mt-12 h-[calc(100vh-3rem)] w-full px-3 overflow-hidden">
      <Sidebar :devices="devices" :settings="settings" :groups="groups" :selecedDevices="selecedDevices"
        v-if="showSidebar" />
      <div class="flex-1 h-full overflow-hidden">
        <ManageDevices :devices="devices" :settings="settings" :groups="groups" />
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
import { writeTextFile, exists, createDir, BaseDirectory } from '@tauri-apps/api/fs'
import { invoke } from '@tauri-apps/api/tauri'
import { getItem } from './utils/persistentStorage.js';
import {
  getSupportUnreadState,
  mergeSupportUpdates,
  markSupportTicketsRead,
  markAllSupportTicketsRead,
  extractTicketKey
} from './utils/supportNotifications.js';
import * as settingsWsService from './service/settingsWebSocketService';
import * as taskWsService from './service/taskWebSocketService';
import * as groupWsService from './service/groupWebSocketService';
import * as deviceWsService from './service/deviceWebSocketService';
import * as utilsWsService from './service/utilsWebSocketService';
import wsConnectionState from './utils/wsConnectionState';

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
      wsStatus: {
        status: 'initial',
        timestamp: Date.now(),
        extra: null,
        raw: null
      },
      userActivityCleanup: null
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

    async requestDevices(source = 'manual', extra = {}) {
      try {
        console.log('[App] Requesting devices via WebSocket service')
        const result = await deviceWsService.ws_list_devices(source, extra)
        // If the server returned device list in response (device.list.response),
        // apply the snapshot directly. Otherwise, we expect a broadcast
        // 'device_snapshot' to be received and handled elsewhere.
        if (Array.isArray(result)) {
          await this.applyDeviceSnapshot(result, { source, generatedAt: Date.now() })
        }
        return result
      } catch (error) {
        console.error('[App] Request devices failed:', error)
        return null
      }
    },

    async updateWsStatus(status = 'unknown', payload = {}) {
      const nextStatus = status || 'unknown';
      const timestamp = payload?.timestamp ?? Date.now();
      const extra = payload?.extra ?? null;
      this.wsStatus = {
        status: nextStatus,
        timestamp,
        extra,
        raw: payload || null
      };

      // Update global WebSocket connection state
      const isConnected = nextStatus === 'connected';
      wsConnectionState.setConnected(isConnected);
      console.log(`[App.vue] WebSocket status updated: ${nextStatus}, connected: ${isConnected}`);

      if (typeof this.$emiter === 'function') {
        try {
          await this.$emiter('wsStatusChanged', { ...this.wsStatus });
        } catch (error) {
          console.error('emit wsStatusChanged error', error);
        }
      }
    },

    async get_settings() {
      // 使用 WebSocket 获取设置
      try {
        const res = await settingsWsService.ws_get_settings()
        this.settings = res.data
      } catch (error) {
        console.error('Failed to get settings:', error)
      }
    },

    async get_groups() {
      try {
        const res = await groupWsService.ws_get_groups()
        this.groups = res.data
      } catch (error) {
        console.error('Failed to get groups:', error)
      }
    },
    async getRunningTasks() {
      // 使用 WebSocket 获取运行中的任务
      try {
        const res = await taskWsService.ws_get_running_tasks()
        let running_tasks = res.data
        let running_serials = running_tasks.map(task => task.serial)
        this.devices.forEach(device => {
          device.task_status = running_serials.includes(device.real_serial) ? 1 : 0
        })
      } catch (error) {
        console.error('Failed to get running tasks:', error)
      }
    },
    async setupAgentBridgeListeners() {
      try {
        // 先尝试获取当前状态
        try {
          const currentStatus = await invoke('agent_ws_get_status');
          if (currentStatus && typeof currentStatus === 'object' && currentStatus.status) {
            console.log('Retrieved current WS status:', currentStatus);
            await this.updateWsStatus(currentStatus.status, currentStatus);
          } else {
            // 如果没有有效状态，设置为 connecting
            await this.updateWsStatus('connecting');
          }
        } catch (err) {
          console.warn('Failed to get current WS status, setting to connecting:', err);
          await this.updateWsStatus('connecting');
        }

        this.listeners.push(await this.$listen('agent://ws/status', async (event) => {
          const payload = event?.payload || {};
          const status = payload.status || 'unknown';
          await this.updateWsStatus(status, payload);
          if (status === 'connected') {
            await this.requestDevices('ws-status-connected');
          }
          if (status === 'error') {
            console.warn('Agent WS reported error', payload?.extra);
          }
        }));
        this.listeners.push(await this.$listen('agent://ws/message', async (event) => {
          const payload = event?.payload;
          await this.handleAgentMessage(payload);
        }));
      } catch (error) {
        console.error('setupAgentBridgeListeners error', error);
      }
    },

    async handleAgentMessage(json) {
      if (!json || typeof json !== 'object') {
        return;
      }
      if (json.action === 'device_snapshot') {
        const snapshot = json.data || {};
        const devices = Array.isArray(snapshot.devices) ? snapshot.devices : [];
        await this.applyDeviceSnapshot(devices, {
          source: snapshot.source || 'ws',
          generatedAt: snapshot.generated_at || Date.now(),
        });
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
          // 避免重复插入导致数组无限增长
          if (!this.running_devices.includes(serial)) {
            this.running_devices.push(serial)
          }
        } else if (this.running_devices.length) {
          // 移除所有相关条目，防止残留重复数据
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
              //task is not running
              device.task_status = 0
            }
          }
        })
      } else if (json.action === 'support_ticket_updates') {
        const updates = Array.isArray(json.tickets) ? json.tickets : []
        await this.handleSupportUpdates(updates)
      } else if (json.action === 'support_mark_read') {
        const ticketNos = Array.isArray(json.ticketNos) ? json.ticketNos : []
        await this.handleSupportMarkRead(ticketNos)
      } else if (json.action === 'support_mark_all_read') {
        await this.handleSupportMarkAllRead()
      } else {
        await this.emitGenericAgentEvent(json)
      }
    },
    async getDevices() {
      return this.requestDevices('manual');
    },

    async applyDeviceSnapshot(newDevices = [], meta = {}) {
      try {
        const normalizedDevices = Array.isArray(newDevices) ? newDevices : [];
        const currentDevices = this.devices;

        const devicesToRemove = currentDevices.filter(current =>
          !normalizedDevices.some(newDevice => newDevice.real_serial === current.real_serial)
        );

        const devicesToAddOrUpdate = normalizedDevices.filter(newDevice => {
          const existingDevice = currentDevices.find(current =>
            current.real_serial === newDevice.real_serial
          );
          return !existingDevice || JSON.stringify(existingDevice) !== JSON.stringify(newDevice);
        });

        devicesToRemove.forEach(device => {
          const index = currentDevices.findIndex(d => d.real_serial === device.real_serial);
          if (index !== -1) {
            currentDevices.splice(index, 1);
          }
        });

        for (const newDevice of devicesToAddOrUpdate) {
          const existingIndex = currentDevices.findIndex(d => d.real_serial === newDevice.real_serial);
          if (existingIndex === -1) {
            const storedSort = await getItem(`sort_${newDevice.real_serial}`);
            newDevice.sort = Number(storedSort ?? '0');
            currentDevices.push(newDevice);
          } else {
            Object.assign(currentDevices[existingIndex], newDevice);
          }
        }

        const sortedDevices = [...currentDevices].sort((a, b) => {
          return a.sort - b.sort || a.group_id - b.group_id || a.serial.localeCompare(b.serial);
        });

        this.devices.splice(0, this.devices.length, ...sortedDevices);

        this.devices.forEach((device, index) => {
          device.key = index + 1;
        });

        await this.saveDevicesInfo();

        if (typeof this.$emiter === 'function') {
          await this.$emiter('devicesUpdated', {
            source: meta.source || 'snapshot',
            total: this.devices.length,
            generatedAt: meta.generatedAt || Date.now()
          });
        }
      } catch (error) {
        console.error('applyDeviceSnapshot error:', error);
      }
    },

    async saveDevicesInfo() {
      try {
        // 检查data目录是否存在，如果不存在则创建
        const dataExists = await exists('data', { dir: BaseDirectory.AppData });
        if (!dataExists) {
          await createDir('data', { dir: BaseDirectory.AppData, recursive: true });
        }

        // 将设备信息保存到JSON文件
        await writeTextFile('data/devices_info.json', JSON.stringify(this.devices, null, 2), {
          dir: BaseDirectory.AppData
        });

      } catch (error) {
        console.error('保存设备信息失败:', error);
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

    hasRunningTasks() {
      return this.running_devices.length > 0 ||
        this.devices.some(device => device.task_status === 1);
    },

    async updateBackendState() {
      // Update the backend about running tasks and auto-update settings
      try {
        const hasTask = this.hasRunningTasks();
        await invoke('update_manager_set_running_tasks', { hasTasks: hasTask });

        if (this.settings.auto_update_enabled !== undefined) {
          await invoke('update_manager_set_auto_update_enabled', {
            enabled: this.settings.auto_update_enabled
          });
        }
      } catch (error) {
        console.error('Failed to update backend state:', error);
      }
    },

    // 初始化分发商绑定
    async initDistributor() {
      try {

        // 动态导入 Tauri API
        const { getVersion } = await import('@tauri-apps/api/app');
        const { type, version, arch } = await import('@tauri-apps/api/os');

        // 获取分发商代码 - 从环境变量读取(编译时注入)
        const distributorCode = await invoke('get_env', { key: 'DISTRIBUTOR_CODE' }) || 'OFFICIAL';

        // 获取机器ID
        const machineId = await invoke('get_env', { key: 'MACHINE_ID' }) || 'UNKNOWN';

        // 获取应用版本 - 使用 Tauri API
        const appVersion = await getVersion();

        // 获取操作系统信息 - 使用 Tauri OS API
        const osType = await type();      // 'Windows_NT', 'Darwin', 'Linux'
        const osVersion = await version(); // 操作系统版本
        const osArch = await arch();       // 'x86_64', 'aarch64'
        const osFullVersion = `${osType} ${osVersion} (${osArch})`;


        // 上报安装信息
        await utilsWsService.ws_report_distributor_install({
          distributor_code: distributorCode,
          app_version: appVersion,
          os_version: osFullVersion,
          machine_id: machineId
        });
      } catch (error) {
        console.error('Failed to initialize distributor:', error);
      }
    },


  },

  async mounted() {
    // 禁止右键菜单
    this.disableMenu();

    await this.initializeSupportUnread();
    await this.setupAgentBridgeListeners();



    // 监听代理启动事件
    this.listeners.push(await this.$listen('agent_started', async () => {
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('agentStarted'),
        timeout: 2000
      });
      // 初始化分发商绑定
      await this.initDistributor();
      await this.get_settings()
      await this.get_groups()
      await this.requestDevices('event:agent_started');

      await this.getRunningTasks();
      await this.$emiter('reload_tasks', {})

      // Update backend state
      await this.updateBackendState();
    }));
    this.listeners.push(await this.$listen('reload_devices', async () => {
      await this.requestDevices('event:reload_devices');
    }));
    // 监听重新加载运行任务事件
    this.listeners.push(await this.$listen('reload_running_tasks', async () => {
      await this.getRunningTasks();
      await this.updateBackendState();
    }));

    // 监听侧边栏变化事件
    this.listeners.push(await this.$listen('sidebarChange', (e) => {
      this.showSidebar = e.payload;
    }));


    this.listeners.push(await this.$listen('selecedDevices', (e) => {
      this.selecedDevices = e.payload;
    }))
    this.listeners.push(await this.$listen('reload_group', async () => {
      await this.get_groups()
    }))
    //reload_settings
    this.listeners.push(await this.$listen('reload_settings', async () => {
      await this.get_settings()
      // Update backend with new settings
      await this.updateBackendState();
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

    // Setup user activity tracking for backend
    const userActivityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const onUserActivity = async () => {
      try {
        await invoke('update_manager_set_user_activity');
      } catch (error) {
        // Silently ignore errors
      }
    };
    userActivityEvents.forEach(event => {
      document.addEventListener(event, onUserActivity, { passive: true });
    });
    this.userActivityCleanup = () => {
      userActivityEvents.forEach(event => {
        document.removeEventListener(event, onUserActivity, { passive: true });
      });
    };


  },
  unmounted() {
    this.listeners.forEach(listener => {
      if (listener) {
        listener()
      }
    })
    this.listeners = []
    if (typeof this.userActivityCleanup === 'function') {
      this.userActivityCleanup()
      this.userActivityCleanup = null
    }
  }
}
</script>
