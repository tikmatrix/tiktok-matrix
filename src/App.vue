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
        <RegisterDialog v-if="selectedItem.name === 'registerDialog' && $refs.page_dialog.open" />
        <ProfileDialog v-if="selectedItem.name === 'profileDialog' && $refs.page_dialog.open" />
        <MassDMDialog v-if="selectedItem.name === 'massDMDialog' && $refs.page_dialog.open" />
        <FollowDialog v-if="selectedItem.name === 'followDialog' && $refs.page_dialog.open" />
        <TikTokSettingsDialog v-if="selectedItem.name === 'tiktokSettingsDialog' && $refs.page_dialog.open" />
        <TrainDialog :group="selectedItem.group"
          v-if="selectedItem.name === 'trainDialog' && $refs.page_dialog.open" />
        <PublishDialog :group="selectedItem.group"
          v-if="selectedItem.name === 'publishDialog' && $refs.page_dialog.open" />
        <LoginDialog v-if="selectedItem.name === 'loginDialog' && $refs.page_dialog.open" />
        <ScrapeFollowersDialog v-if="selectedItem.name === 'scrapeFollowersDialog' && $refs.page_dialog.open" />
        <DeletePostDialog v-if="selectedItem.name === 'deletePostDialog' && $refs.page_dialog.open" />
        <BoostUsersDialog v-if="selectedItem.name === 'boostUsersDialog' && $refs.page_dialog.open" />
        <BoostPostsDialog v-if="selectedItem.name === 'boostPostsDialog' && $refs.page_dialog.open" />
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
import RegisterDialog from './components/dialogs/RegisterDialog.vue'
import ProfileDialog from './components/dialogs/ProfileDialog.vue'
import TikTokSettingsDialog from './components/dialogs/TikTokSettingsDialog.vue'
import MassDMDialog from './components/dialogs/MassDMDialog.vue'
import FollowDialog from './components/dialogs/FollowDialog.vue'
import LoginDialog from './components/dialogs/LoginDialog.vue'
import Miniremote from './components/device/Miniremote.vue'
import TrainDialog from './components/dialogs/TrainDialog.vue'
import PublishDialog from './components/dialogs/PublishDialog.vue'
import ScrapeFollowersDialog from './components/dialogs/ScrapeFollowersDialog.vue'
import { message } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs'
import { BaseDirectory } from '@tauri-apps/api/fs';
import DeletePostDialog from './components/dialogs/DeletePostDialog.vue'
import BoostUsersDialog from './components/dialogs/BoostUsersDialog.vue'
import BoostPostsDialog from './components/dialogs/BoostPostsDialog.vue'
export default {
  name: 'app',
  components: {
    TitleBar,
    Sidebar,
    ManageDashboard,
    ManageDevices,
    ManageAccounts,
    ManageAnalytics,
    ManageMaterials,
    ManageTasks,
    RegisterDialog,
    ProfileDialog,
    TikTokSettingsDialog,
    MassDMDialog,
    FollowDialog,
    Miniremote,
    TrainDialog,
    PublishDialog,
    LoginDialog,
    ScrapeFollowersDialog,
    DeletePostDialog,
    BoostUsersDialog,
    BoostPostsDialog
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
