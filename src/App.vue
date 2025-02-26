<template>
  <div data-tauri-drag-region
    class="h-12 bg-base-100 select-none flex items-center justify-between fixed top-0 left-0 right-0 z-50 px-4 shadow-md">
    <!-- 左侧：应用图标、名称、版本和检查更新 -->
    <div class="flex items-center space-x-2">
      <font-awesome-icon icon="fa-brands fa-tiktok" class="text-base-content h-10 w-10" />
      <span class="text-2xl text-base-content font-bold">{{ $t('siteName') }}</span>
      <span class="text-sm text-base-content">v{{ version }}</span>
      <!-- 检查更新按钮 -->
      <button @click="$emiter('updateService')"
        class="flex items-center space-x-1 text-sm text-info ml-2 hover:underline">
        <font-awesome-icon icon="fa-solid fa-sync" class="h-4 w-4" />
        <span>{{ $t('checkUpdate') }}</span>
      </button>
    </div>
    <!-- 教程链接 -->
    <a class="flex items-center space-x-1 text-sm text-info ml-2" :href="$t('siteUrl') + '/docs/intro'" target="_blank">
      <font-awesome-icon icon="fa-solid fa-file-lines" class="h-4 w-4" />
      <span>{{ $t('tutorial') }}</span>
    </a>
    <!-- 中间：灵活空间 -->
    <div class="flex-1"></div>

    <!-- 右侧：功能按钮和控制按钮 -->
    <div class="flex items-center space-x-4">
      <!-- 侧边栏切换 -->
      <label class="swap swap-rotate">
        <input type="checkbox" value="true" v-model="showSidebar" />
        <font-awesome-icon icon="fa fa-bars" class="swap-off fill-current w-6 h-6 text-base-content" />
        <font-awesome-icon icon="fa fa-bars" class="swap-on fill-current w-6 h-6 text-base-content" />
      </label>
      <!-- 许可证状态 -->
      <button
        class="flex items-center space-x-1 text-sm px-3 py-1 rounded-full transition-transform duration-300 transform hover:scale-105"
        :class="license.leftdays > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
        @click="$refs.buyLiscenseDialog.show()"
        :title="license.leftdays > 0 ? $t('licenseValid', { days: license.leftdays }) : $t('activateLicense')">
        <font-awesome-icon :icon="license.leftdays > 0 ? 'fa fa-key' : 'fa fa-lock'" class="h-4 w-4" />
        <span v-if="license.leftdays > 0">{{ $t('licensed') }} ({{ license.leftdays }} {{ $t('days') }})</span>
        <span v-else>{{ $t('unlicensed') }}</span>
      </button>
      <!-- 语言选择 -->
      <select class="select select-info select-sm" v-model="locale">
        <option selected value="en">English</option>
        <option value="zh-CN">简体中文</option>
      </select>

      <!-- 主题切换 -->
      <label class="swap swap-rotate">
        <input type="checkbox" class="theme-controller" value="dark" v-model="isDark" />
        <font-awesome-icon icon="fa-solid fa-sun" class="swap-off fill-current w-6 h-6 text-base-content" />
        <font-awesome-icon icon="fa-solid fa-moon" class="swap-on fill-current w-6 h-6 text-base-content" />
      </label>

      <!-- 窗口控制按钮 -->
      <div class="flex space-x-2">
        <button @click="minimizeWindow" class="p-1 hover:bg-gray-200 rounded">
          <font-awesome-icon icon="fa-solid fa-minus" class="h-5 w-5 text-base-content" />
        </button>
        <button @click="maximizeWindow" class="p-1 hover:bg-gray-200 rounded">
          <font-awesome-icon icon="fa fa-window-restore" class="h-5 w-5 text-base-content" />
        </button>
        <button @click="closeWindow" class="p-1 hover:bg-gray-200 rounded">
          <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5 text-base-content" />
        </button>
      </div>
    </div>
  </div>
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
      <ManageMaterials :group="selectedItem.group" v-if="selectedItem.name === 'materials' && $refs.page_dialog.open" />
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
      <BuyLicense ref="buyLiscenseDialog" :license="license" />
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog ref="download_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ download_filename }}</h3>
      <div class="modal-body">
        <div class="flex flex-row justify-between text-center items-center" v-if="download_progress.filesize > 0">
          <progress class="progress progress-success w-full" :value="download_progress.transfered"
            :max="download_progress.filesize"></progress>
          <span class="text-sm ml-1">{{ (download_progress.transfered / 1024 / 1024).toFixed(2) }}Mb</span> /
          <span class="text-sm">{{ (download_progress.filesize / 1024 / 1024).toFixed(2) }}Mb</span>
        </div>
        <div class="flex flex-row justify-between text-center items-center" v-else>
          <progress class="progress progress-success w-full"></progress>
        </div>

        <div class="flex justify-between">
          <div class="text-md" v-if="download_progress.transfer_rate > 0">
            {{ $t('transferRate') }}:
            <span class="text-sm">{{ (download_progress.transfer_rate / 1024).toFixed(2) }} KB/s</span>
          </div>
          <div class="text-md" v-if="download_progress.percentage > 0">
            {{ $t('percentage') }}:
            <span class="text-sm">{{ download_progress.percentage }} %</span>
          </div>
        </div>
      </div>

    </div>
  </dialog>
</template>

<script>
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
import { ask, message } from '@tauri-apps/api/dialog';
import { os } from '@tauri-apps/api';
import { appDataDir } from '@tauri-apps/api/path';
import { readTextFile, exists, BaseDirectory, writeTextFile } from '@tauri-apps/api/fs'
import { getVersion } from '@tauri-apps/api/app';
import {
  checkUpdate,
  installUpdate,
  onUpdaterEvent,
} from '@tauri-apps/api/updater'
import { exit, relaunch } from '@tauri-apps/api/process'
import { fetch, Body, ResponseType } from '@tauri-apps/api/http';
import { Command } from '@tauri-apps/api/shell'
import { getAll, appWindow } from '@tauri-apps/api/window';
import BuyLicense from './components/settings/BuyLicense.vue'

export default {
  name: 'app',
  components: {
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
    PublishSettings,
    BuyLicense
  },
  data() {
    return {
      devices: [],
      isDark: util.getData('isDark') || '0',
      locale: util.getData('locale') || 'en',
      version: '1.0.0',
      showSidebar: true,
      selectedItem: {},
      page_title: '',
      remote_version: {},
      download_progress: {
        filesize: 0,
        transfered: 0,
        transfer_rate: 0,
        percentage: 0
      },
      download_filename: '',
      ws: null,
      running_devices: [],
      license: {},
    }
  },
  watch: {
    locale() {
      util.setData('locale', this.locale)
      this.$i18n.locale = this.locale
    },
    isDark() {
      console.log('isDark:', this.isDark)
      util.setData('isDark', this.isDark)
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
      this.download_filename = 'Connecting to agent'
      this.$refs.download_dialog.showModal()
      const wsPort = await readTextFile('wssport.txt', { dir: BaseDirectory.AppData });
      if (wsPort === '0') {
        return;
      }
      const wsUrl = `ws://127.0.0.1:${wsPort}`
      console.log(wsUrl)
      this.ws = new WebSocket(wsUrl)
      this.ws.onopen = async () => {
        console.log('ws open')
        this.$refs.download_dialog.close()
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
        this.$refs.download_dialog.close()
      }
      this.ws.onerror = async (e) => {
        console.log(e)
        this.$refs.download_dialog.close()
      }
    },
    async getDevices() {
      this.$service.get_devices().then(res => {
        //mock
        // for (let i = 0; i < 100; i++) {
        //   res.data[i] = {
        //     real_serial: `real_serial_${i + 1}`,
        //     group_id: 1,
        //     serial: `serial_${i + 1}`,
        //   }
        // }
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
    async check_update() {
      this.download_filename = 'Checking update'
      this.$refs.download_dialog.showModal()
      try {
        const { shouldUpdate, manifest } = await checkUpdate()
        if (shouldUpdate) {
          console.log(
            `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
          )
          const yes = await ask(`${manifest?.body}`, this.$t('updateConfirm'));
          if (yes) {
            await installUpdate()
            await this.shutdown()
            await relaunch()
            return;
          }
        } else {
          console.log('No update available')
        }
      } catch (error) {
        console.error(error)
      }
      let response = null
      try {
        response = await fetch('https://pro.api.tikmatrix.com/front-api/check_core_update?time=' + new Date().getTime(), {
          method: 'GET',
          timeout: 10,
          responseType: ResponseType.JSON,
        });
        console.log('response:', response)
      } catch (e) {
        console.error(e)
        await message('Check Update Error', { title: 'Error', type: 'error' });
        return;
      }

      if (response.ok) {
        this.remote_version = response.data
        await this.shutdown()
        await this.check_platform_tools();
        await this.check_ocr();
        await this.check_apk();
        await this.check_test_apk();
        await this.check_scrcpy();
        await this.check_script();
        await this.check_agent();
        this.download_filename = 'Starting agent';
        try {
          const command = new Command('start-agent', [])
          const child = await command.spawn();
          console.log('pid:', child.pid);
          //write pid to file
          await writeTextFile('agent.pid', `${child.pid}`, { dir: BaseDirectory.AppData });
        } catch (e) {
          console.error(e);
          let error = e.toString();
          await message(error, { title: 'Agent Start Error', type: 'error' });
          tauriWindow.getCurrent().close();
        }
        console.log('agent started')
        // wait for agent startup by listening to port
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
          if (port > 0) {
            await this.$emiter('agent_started')
            await this.$emiter('reload_tasks')
            break;
          }
          if (i === 9) {
            await message('Agent Start Timeout, Please Restart!', { title: 'Error', type: 'error' });
            tauriWindow.getCurrent().close();
          }
        }
        this.$refs.download_dialog.close();
      }

    },


    async check_ocr() {
      let work_path = await appDataDir();
      let url = this.remote_version.ocr_windows_url
      let path = await this.check_file_update('PaddleOCR', this.remote_version.ocr_version, url);
      //check paddle file exists
      let adb_exists = await exists('PaddleOCR-json/PaddleOCR-json.exe', { dir: BaseDirectory.AppData })
      if (!adb_exists) {
        this.download_filename = 'Uziping PaddleOCR-json.zip'
        await invoke("unzip_file", { zipPath: path, destDir: work_path });
      }
    },
    async check_platform_tools() {
      let work_path = await appDataDir();
      let url = ""
      const osType = await os.type();
      if (osType === 'Darwin') {
        url = this.remote_version.platform_tools_mac_url;
      } else if (osType === 'Windows_NT') {
        url = this.remote_version.platform_tools_windows_url;
      } else {
        console.log('Unknown OS type');
        return;
      }
      let path = await this.check_file_update('platform_tools', this.remote_version.platform_tools_version, url);
      //check adb file exists
      let adb_exists = await exists('platform-tools/adb.exe', { dir: BaseDirectory.AppData })
      if (!adb_exists) {
        this.download_filename = 'Uziping platform-tools-latest-windows.zip'
        await invoke("unzip_file", { zipPath: path, destDir: work_path });
        await invoke("grant_permission", { path: "platform-tools/adb" });
      }
    },

    async check_apk() {
      let url = this.remote_version.apk_url
      await this.check_file_update('apk', this.remote_version.apk_version, url);
    },

    async check_test_apk() {
      let url = this.remote_version.test_apk_url
      await this.check_file_update('test_apk', this.remote_version.test_apk_version, url);
    },

    async check_scrcpy() {
      let url = this.remote_version.scrcpy_url
      await this.check_file_update('scrcpy', this.remote_version.scrcpy_version, url);
    },
    async check_script() {
      let url = ""
      const osType = await os.type();
      if (osType === 'Darwin') {
        url = this.remote_version.script_mac_url;
      } else if (osType === 'Windows_NT') {
        url = this.remote_version.script_windows_url;
      } else {
        console.log('Unknown OS type');
        return;
      }
      await this.check_file_update('script', this.remote_version.script_version, url);
      await invoke("grant_permission", { path: "bin/script" });
    },

    async check_agent() {
      let url = ""
      const osType = await os.type();
      if (osType === 'Darwin') {
        url = this.remote_version.agent_mac_url;
      } else if (osType === 'Windows_NT') {
        url = this.remote_version.agent_windows_url;
      } else {
        console.log('Unknown OS type');
        return;
      }
      await this.check_file_update('agent', this.remote_version.agent_version, url);
      await invoke("grant_permission", { path: "bin/agent" });
    },

    async check_file_update(filename, remoteVersion, downloadUrl) {
      this.download_filename = `Downloading ${filename}`
      let localversion = util.getData(filename);
      if (!localversion) {
        localversion = 0
      }
      let url = downloadUrl
      let work_path = await appDataDir();
      let name = url.split('/').pop()
      let path = work_path + 'bin/' + url.split('/').pop()
      let downloaded = await exists('bin/' + name, { dir: BaseDirectory.AppData })
      console.log(`check_file_update: ${filename} localversion: ${localversion} remoteVersion: ${remoteVersion}`)
      if (!downloaded || localversion !== remoteVersion) {
        console.log("downloading " + filename + " from " + downloadUrl + " to " + path)
        url = url + '?t=' + new Date().getTime()
        await invoke('download_file', { url, path });
      } else {
        console.log(filename + " no need to update")
      }
      util.setData(filename, remoteVersion)
      return path;
    },
    async minimizeWindow() {
      appWindow.minimize()
    },
    async maximizeWindow() {
      appWindow.toggleMaximize()
    },
    async disableMenu() {

      if (window.location.hostname !== 'tauri.localhost') {
        return
      }

      document.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false;
      }, { capture: true })

    },
    async closeWindow() {
      const yes = await ask(this.$t('exitConfirm'), this.$t('confirm'));
      if (yes) {
        this.shutdown()
        getAll().forEach((win) => {
          win.close();
        });
      }
    },
    async loadLicense() {
      this.$service.get_license().then(res => {
        this.license = res.data
        if (this.license.leftdays <= 0 && !this.license.github_authorized) {
          this.$refs.buyLiscenseDialog.show()
        }
        console.log(`license: ${JSON.stringify(this.license)}`)
      })
    },
  },
  async mounted() {
    this.$i18n.locale = this.locale
    this.version = await getVersion();
    this.disableMenu()
    await this.$listen("DOWNLOAD_PROGRESS", async (e) => {
      this.download_progress = e.payload;
    });
    await this.$listen("DOWNLOAD_FINISHED", async (e) => {
      console.log("download finished")
      this.download_progress = {
        filesize: 0,
        transfered: 0,
        transfer_rate: 0,
        percentage: 0
      }
    });
    const hasCheckedUpdate = localStorage.getItem('hasCheckedUpdate')
    console.log('hasCheckedUpdate:', hasCheckedUpdate)
    if (!hasCheckedUpdate) {
      this.check_update()
      localStorage.setItem('hasCheckedUpdate', 1)
    }
    tauriWindow.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      await this.closeWindow()

    });

    await this.$listen('showToast', async (e) => {
      await message(e.payload);
    });


    await this.$listen('closePageDialog', (e) => {
      this.$refs.page_dialog.close()
    });
    await this.$listen('menuSelected', (e) => {
      this.menu_selected(e.payload)
    });

    await this.$listen('updateService', (e) => {
      this.check_update()
    });
    await this.$listen('agent_started', async () => {
      this.loadLicense()
      this.getDevices()
      this.connectAgent()
      this.getRunningTasks()
    });
    await this.$listen('reload_running_tasks', async () => {
      this.getRunningTasks()
    });
    await this.$listen("LICENSE", async (e) => {
      if (e.payload.reload) {
        await this.loadLicense()
      }

      if (e.payload.show) {
        if (this.license.leftdays <= 0 && !this.license.github_authorized) {
          this.$refs.buyLiscenseDialog.show()
        }
      }
    });
    await this.$emiter('agent_started', {})
  }
}
</script>
