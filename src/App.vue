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
      // 自动更新相关
      lastUserActivity: Date.now(),
      autoUpdateTimer: null,
      userActivityEvents: ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'],
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

    async requestDevices(source = 'manual', options = {}) {
      const { fallbackOnError = true, extra = {} } = options || {};
      const payload = {
        action: 'device.fetch',
        data: {
          source,
          ...extra
        }
      };
      try {
        await invoke('agent_ws_send', { payload });
      } catch (error) {
        console.error('requestDevices via WS failed:', error);
        if (fallbackOnError) {
          await this.fetchDevicesViaHttp({ source: `fallback:${source}` });
        }
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
        let running_tasks = res.data
        let running_serials = running_tasks.map(task => task.serial)
        this.devices.forEach(device => {
          device.task_status = running_serials.includes(device.real_serial) ? 1 : 0
        })
      })
    },
    async setupAgentBridgeListeners() {
      try {
        this.listeners.push(await this.$listen('agent://ws/status', async (event) => {
          const payload = event?.payload || {};
          const status = payload.status;
          if (status === 'connected') {
            await this.requestDevices('ws-status-connected', { fallbackOnError: true });
            await this.$emiter('heartbeat', { source: 'ws-status' });
          }
          if (status === 'error') {
            console.warn('Agent WS reported error', payload?.extra);
            await this.fetchDevicesViaHttp({ source: 'ws-status-error' });
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
      if (json.action === 'reload_devices') {
        const data = json.data;
        if (data) {
          await this.requestDevices('agent-action:reload_devices', { fallbackOnError: true });
        }
      } else if (json.action === 'device_snapshot') {
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
      } else if (json.action === 'heartbeat') {
        await this.$emiter('heartbeat', {})
      } else {
        await this.emitGenericAgentEvent(json)
      }
    },
    async getDevices() {
      return this.fetchDevicesViaHttp({ source: 'legacy-http-call' });
    },

    async fetchDevicesViaHttp(meta = {}) {
      try {
        const res = await this.$service.get_devices();
        const newDevices = Array.isArray(res.data) ? res.data : [];
        await this.applyDeviceSnapshot(newDevices, { source: meta.source || 'http' });
      } catch (error) {
        console.error('获取设备列表失败 (HTTP fallback):', error);
      }
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

    // 自动更新相关方法
    setupUserActivityListeners() {
      this.userActivityEvents.forEach(event => {
        document.addEventListener(event, this.onUserActivity, { passive: true });
      });
    },

    removeUserActivityListeners() {
      this.userActivityEvents.forEach(event => {
        document.removeEventListener(event, this.onUserActivity);
      });
    },

    onUserActivity() {
      this.lastUserActivity = Date.now();
    },

    hasRunningTasks() {
      return this.running_devices.length > 0 ||
        this.devices.some(device => device.task_status === 1);
    },

    isSystemIdle() {
      let idleThreshold = 5 * 60 * 1000; // 5分钟无用户活动
      //如果是dev环境，改为1分钟
      const isDev = import.meta.env.DEV;
      if (isDev) {
        console.log("current is dev environment, set idle threshold to 1 minute")
        idleThreshold = 1 * 60 * 1000;
      }
      return (Date.now() - this.lastUserActivity) > idleThreshold;
    },

    async triggerAutoUpdate() {
      console.log('执行自动更新检查...');
      try {
        // 通过事件通知 TitleBar 执行静默更新
        await this.$emiter('AUTO_UPDATE_TRIGGER');
      } catch (error) {
        console.error('自动更新失败:', error);
      }
    },

    startAutoUpdateTimer() {
      if (this.autoUpdateTimer) {
        clearInterval(this.autoUpdateTimer);
      }

      if (!this.settings.auto_update_enabled) {
        console.log('自动更新未启用，跳过启动定时器');
        return;
      }

      let interval = 10 * 60 * 1000; // 固定10分钟间隔
      //如果是dev环境，间隔改为1分钟
      const isDev = import.meta.env.DEV;
      if (isDev) {
        console.log("current is dev environment, set auto update interval to 1 minute")
        interval = 1 * 60 * 1000;
      }
      console.log(`启动自动更新定时器，间隔: ${interval / 1000 / 60} 分钟`);

      this.autoUpdateTimer = setInterval(() => {
        // 检查是否有正在运行的任务
        if (this.hasRunningTasks()) {
          console.log('有正在运行的任务，跳过自动更新');
          return;
        }

        // 检查系统是否空闲
        if (!this.isSystemIdle()) {
          console.log('用户最近有活动，跳过自动更新');
          return;
        }

        console.log('系统空闲且无运行任务，触发自动更新');
        this.triggerAutoUpdate();
      }, interval);
    },

    stopAutoUpdateTimer() {
      if (this.autoUpdateTimer) {
        clearInterval(this.autoUpdateTimer);
        this.autoUpdateTimer = null;
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
        await this.$service.report_distributor_install({
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
      await this.requestDevices('event:agent_started', { fallbackOnError: true });

      await this.getRunningTasks();
      await this.$emiter('reload_tasks', {})

      // 启动自动更新定时器
      this.startAutoUpdateTimer();
    }));
    this.listeners.push(await this.$listen('reload_devices', async () => {
      await this.requestDevices('event:reload_devices', { fallbackOnError: true });
    }));
    // 监听重新加载运行任务事件
    this.listeners.push(await this.$listen('reload_running_tasks', async () => {
      await this.getRunningTasks();
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
      // 重新启动自动更新定时器（设置可能已更改）
      this.startAutoUpdateTimer();
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

    // 设置用户活动监听
    this.setupUserActivityListeners();


  },
  unmounted() {
    this.listeners.forEach(listener => {
      if (listener) {
        listener()
      }
    })
    this.listeners = []

    // 清理自动更新相关资源
    this.removeUserActivityListeners();
    this.stopAutoUpdateTimer();
  }
}
</script>
