<template>
  <div class="flex flex-col items-start h-screen w-screen overflow-hidden">
    <TitleBar />
    <div class="flex flex-row items-start bg-base-300 h-screen w-screen overflow-hidden mt-12">
      <Sidebar :devices="devices" v-if="showSidebar" />
      <ManageDevices :devices="devices" />
    </div>

    <dialog ref="page_dialog" class="modal">
      <div class="modal-box w-11/12 max-w-6xl">
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
import { message } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { BaseDirectory } from '@tauri-apps/api/fs';


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

    menu_selected(item) {
      this.selectedItem = item
      this.$refs.page_dialog.showModal()
      this.$refs.page_dialog.addEventListener('close', () => {
        this.selectedItem = {}
      })
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
    this.disableMenu();

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
    await this.$listen('reload_devices', async () => {
      this.getDevices();
    });
    // 监听重新加载运行任务事件
    await this.$listen('reload_running_tasks', async () => {
      this.getRunningTasks();
    });

    // 监听侧边栏变化事件
    await this.$listen('sidebarChange', (e) => {
      this.showSidebar = e.payload;
    });
  }
}
</script>
