<template>
  <div class="flex flex-col items-start h-screen w-screen overflow-hidden">
    <TitleBar />
    <div class="flex flex-row items-start bg-base-300 h-screen w-screen overflow-hidden mt-12">
      <Sidebar :devices="devices" v-if="showSidebar" />
      <ManageDevices :devices="devices" />
    </div>

    <dialog ref="page_dialog" class="modal">
      <div class="modal-box w-11/12 max-w-5xl">
        <h3 class="font-bold text-lg">{{ page_title }}</h3>
        <ManageDashboard v-if="selectedItem.name === 'dashboard' && $refs.page_dialog.open" />
        <ManageAccounts :devices="devices" v-if="selectedItem.name === 'accounts' && $refs.page_dialog.open" />
        <ManageAnalytics v-if="selectedItem.name === 'analytics' && $refs.page_dialog.open" />
        <ManageMaterials :group="selectedItem.group"
          v-if="selectedItem.name === 'materials' && $refs.page_dialog.open" />
        <ManageTasks :devices="devices" v-if="selectedItem.name === 'tasks' && $refs.page_dialog.open" />
        <ManageDialog v-if="selectedItem.name === 'dialogWatcher' && $refs.page_dialog.open" />
        <RegisterSettings v-if="selectedItem.name === 'registerSettings' && $refs.page_dialog.open" />
        <ProfileSettings v-if="selectedItem.name === 'profileSettings' && $refs.page_dialog.open" />
        <MessageSettings v-if="selectedItem.name === 'messageSettings' && $refs.page_dialog.open" />
        <FollowSettings v-if="selectedItem.name === 'followSettings' && $refs.page_dialog.open" />
        <PackageNameSettings v-if="selectedItem.name === 'packageNameSettings' && $refs.page_dialog.open" />
        <TrainSettings :group="selectedItem.group"
          v-if="selectedItem.name === 'trainSettings' && $refs.page_dialog.open" />
        <PublishSettings :group="selectedItem.group"
          v-if="selectedItem.name === 'publishSettings' && $refs.page_dialog.open" />
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>


  </div>
</template>

<script>
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import ManageDashboard from './components/dashboard/ManageDashboard.vue'
import ManageDevices from './components/device/ManageDevices.vue'
import ManageAccounts from './components/account/ManageAccounts.vue'
import ManageAnalytics from './components/analytics/ManageAnalytics.vue'
import ManageMaterials from './components/material/ManageMaterials.vue'
import ManageTasks from './components/tasks/ManageTasks.vue'
import ManageDialog from './components/dialog/ManageDialog.vue'
import RegisterSettings from './components/settings/RegisterSettings.vue'
import ProfileSettings from './components/settings/ProfileSettings.vue'
import PackageNameSettings from './components/settings/PackageNameSettings.vue'
import MessageSettings from './components/settings/MessageSettings.vue'
import FollowSettings from './components/settings/FollowSettings.vue'
import Login from './components/Login.vue'
import Miniremote from './components/device/Miniremote.vue'
import TrainSettings from './components/group/TrainSettings.vue'
import PublishSettings from './components/group/PublishSettings.vue'
import * as util from './utils'
import { invoke } from "@tauri-apps/api/tauri";
import { window as tauriWindow } from "@tauri-apps/api"
import { TauriEvent } from "@tauri-apps/api/event"
import { message } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { BaseDirectory } from '@tauri-apps/api/fs';
import { Command } from '@tauri-apps/api/shell'

export default {
  name: 'app',
  components: {
    TitleBar,
    Login,
    Sidebar,
    ManageDashboard,
    ManageDevices,
    ManageAccounts,
    ManageAnalytics,
    ManageMaterials,
    ManageTasks,
    ManageDialog,
    RegisterSettings,
    ProfileSettings,
    PackageNameSettings,
    MessageSettings,
    FollowSettings,
    Miniremote,
    TrainSettings,
    PublishSettings
  },
  data() {
    return {
      devices: [],
      showSidebar: true,
      selectedItem: {},
      page_title: '',
      ws: null,
      running_devices: [],
    }
  },
  methods: {
    async getRunningTasks() {
      this.$service.get_running_tasks().then(res => {
        let running_tasks = res.data
        let running_serials = running_tasks.map(task => task.serial)
        this.devices.forEach(device => {
          device.task_status = running_serials.includes(device.real_serial) ? 1 : 0
        })
      })
    },
    async connectAgent() {
      const wsPort = await readTextFile('wssport.txt', { dir: BaseDirectory.AppData });
      if (wsPort === '0') {
        return;
      }
      const wsUrl = `ws://127.0.0.1:${wsPort}`
      console.log(wsUrl)
      this.ws = new WebSocket(wsUrl)
      this.ws.onopen = async () => {
        console.log('ws open')
      }
      this.ws.onmessage = async (e) => {
        // console.log(e.data)
        const json = JSON.parse(e.data)
        if (json.action === 'reload_devices') {
          let data = json.data
          if (data) {
            this.getDevices()
          }
        } else if (json.action === 'reload_license') {
          await this.$emiter('LICENSE', { reload: true })
        } else if (json.action === 'task_status') {
          let serial = json.serial
          let status = json.status
          if (status === 1) {
            this.running_devices.push(serial)
          } else {
            let index = this.running_devices.indexOf(serial)
            if (index > -1) {
              this.running_devices.splice(index, 1)
            }
          }
          this.devices.forEach(device => {
            if (device.real_serial === serial) {
              device.task_status = status
            }
          })
          await this.$emiter('reload_tasks', {})
        }
      }
      this.ws.onclose = async () => {
        console.log('ws close')
      }
      this.ws.onerror = async (e) => {
        console.log(e)
      }
    },
    async getDevices() {
      this.$service.get_devices().then(res => {
        this.devices.splice(0, this.devices.length, ...res.data)
        for (let i = 0; i < this.devices.length; i++) {
          this.devices[i].sort = localStorage.getItem(`sort_${this.devices[i].real_serial}`) || '0'
        }
        this.devices.sort((a, b) => {
          // fisrt: sort
          // second: group_id
          // third: real_serial
          return a.sort - b.sort || a.group_id - b.group_id || a.real_serial - b.real_serial
        });
        for (let i = 0; i < this.devices.length; i++) {
          this.devices[i].key = i + 1
        }
      })
    },
    async shutdown() {
      await invoke("kill_process", { name: "agent" });
      await invoke("kill_process", { name: "script" });
      await writeTextFile('agent.pid', '', { dir: BaseDirectory.AppData });
    },
    menu_selected(item) {
      this.selectedItem = item
      this.$refs.page_dialog.showModal()
      this.$refs.page_dialog.addEventListener('close', () => {
        this.selectedItem = {}
      })
    },
    async start_agent() {
      try {
        //check agent.exe is running
        let agent_running = await invoke("is_process_running", { processName: "agent.exe" });
        if (!agent_running) {
          //check agent.exe is exists
          let agent_exists = await exists('bin/agent.exe', { dir: BaseDirectory.AppData })
          if (!agent_exists) {
            console.log('agent.exe not found')
            return;
          }
          const command = new Command('start-agent', [])
          const child = await command.spawn();
          console.log('pid:', child.pid);
          //write pid to file
          await writeTextFile('agent.pid', `${child.pid}`, { dir: BaseDirectory.AppData });
        } else {
          console.log('agent is running')
          await this.$emiter('agent_started', {})
          await this.$emiter('reload_tasks', {})
          return;
        }
      } catch (e) {
        let error = e.toString();
        await message(error, { title: 'Agent Start Error', type: 'error' });
        tauriWindow.getCurrent().close();
      }
      console.log('waiting for agent startup')
      // wait for agent startup by listening to port
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
        if (port > 0) {
          await this.$emiter('agent_started', {})
          await this.$emiter('reload_tasks', {})
          return;
        }
      }
      await message('Agent Start Timeout', { title: 'Error', type: 'error' });
      tauriWindow.getCurrent().close();
    },
    disableMenu() {
      // 开发环境不禁止右键菜单
      if (window.location.href.includes('localhost')) {
        return;
      }
      // 禁用右键菜单
      document.addEventListener('contextmenu', event => event.preventDefault());
    },
    async closeWindow() {
      await this.shutdown();
    }
  },
  async mounted() {
    this.disableMenu();

    // 监听窗口关闭事件
    tauriWindow.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      await this.closeWindow();
    });

    // 监听显示消息事件
    await this.$listen('showToast', async (e) => {
      await message(e.payload);
    });

    // 监听关闭页面对话框事件
    await this.$listen('closePageDialog', (e) => {
      this.$refs.page_dialog.close();
    });

    // 监听菜单选择事件
    await this.$listen('menuSelected', (e) => {
      this.menu_selected(e.payload);
    });

    // 监听代理启动事件
    await this.$listen('agent_started', async () => {
      this.getDevices();
      this.connectAgent();
      this.getRunningTasks();
    });

    // 监听重新加载运行任务事件
    await this.$listen('reload_running_tasks', async () => {
      this.getRunningTasks();
    });

    // 监听侧边栏变化事件
    await this.$listen('sidebarChange', (e) => {
      this.showSidebar = e.payload;
    });

    // 监听启动代理事件
    await this.$listen('start_agent', async () => {
      await this.start_agent();
    });

    // 启动代理
    await this.start_agent();
  }
}
</script>
