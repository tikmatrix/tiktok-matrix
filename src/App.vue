<template>

  <div class="flex flex-row items-start bg-base-300 h-screen w-screen">
    <Sidebar />
    <ManageDevices />
  </div>

  <vue-draggable-resizable v-if="device && device.serial" :w="`auto`" :h="`auto`" :resizable="false" :parent="false"
    :z="20" drag-handle=".drag"
    class="bg-base-100 fixed top-16 right-16 border-1 border-base-300 justify-center items-center flex flex-col">
    <Miniremote :device="device" :index="device.index" :big="true" :key="device.serial + '_big'" />
  </vue-draggable-resizable>
  <dialog ref="page_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg">{{ page_title }}</h3>
      <ManageDashboard v-if="selectedItem.name === 'dashboard' && $refs.page_dialog.open" />
      <ManageAccounts v-if="selectedItem.name === 'accounts' && $refs.page_dialog.open" />
      <ManageAnalytics v-if="selectedItem.name === 'analytics' && $refs.page_dialog.open" />
      <ManageMaterials :group="selectedItem.group" v-if="selectedItem.name === 'materials' && $refs.page_dialog.open" />
      <ManageComments v-if="selectedItem.name === 'comments' && $refs.page_dialog.open" />
      <ManageProxys v-if="selectedItem.name === 'proxys' && $refs.page_dialog.open" />
      <ManageMusics v-if="selectedItem.name === 'musics' && $refs.page_dialog.open" />
      <ManagePublishJobs v-if="selectedItem.name === 'publishJobs' && $refs.page_dialog.open" />
      <ManageTrainJobs v-if="selectedItem.name === 'trainJobs' && $refs.page_dialog.open" />
      <ManageMessageJobs v-if="selectedItem.name === 'messageJobs' && $refs.page_dialog.open" />
      <ManageShareJobs v-if="selectedItem.name === 'shareJobs' && $refs.page_dialog.open" />
      <ManageInstallJobs v-if="selectedItem.name === 'installJobs' && $refs.page_dialog.open" />
      <ManageFollowJobs v-if="selectedItem.name === 'followJobs' && $refs.page_dialog.open" />
      <ManageScrapeJobs v-if="selectedItem.name === 'scrapeFansJobs' && $refs.page_dialog.open" />
      <ManageDialog v-if="selectedItem.name === 'dialogWatcher' && $refs.page_dialog.open" />
      <RegisterSettings v-if="selectedItem.name === 'registerSettings' && $refs.page_dialog.open" />
      <MessageSettings v-if="selectedItem.name === 'messageSettings' && $refs.page_dialog.open" />
      <PackageNameSettings v-if="selectedItem.name === 'packageNameSettings' && $refs.page_dialog.open" />
      <ManagePostBots v-if="selectedItem.name === 'postBots' && $refs.page_dialog.open" />
      <ManageEditBots v-if="selectedItem.name === 'editBots' && $refs.page_dialog.open" />
      <BuyLicense v-if="selectedItem.name === 'buyLicense' && $refs.page_dialog.open" />
      <TrainSettings :group="selectedItem.group"
        v-if="selectedItem.name === 'trainSettings' && $refs.page_dialog.open" />
      <PublishSettings :group="selectedItem.group"
        v-if="selectedItem.name === 'publishSettings' && $refs.page_dialog.open" />
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
<style>
@import "vue-draggable-resizable/style.css";
</style>
<script>
import Sidebar from './components/Sidebar.vue'
import ManageDashboard from './components/dashboard/ManageDashboard.vue'
import ManageDevices from './components/device/ManageDevices.vue'
import ManageAccounts from './components/account/ManageAccounts.vue'
import ManageAnalytics from './components/analytics/ManageAnalytics.vue'
import ManageMaterials from './components/material/ManageMaterials.vue'
import ManagePublishJobs from './components/jobs/ManagePublishJobs.vue'
import ManageMessageJobs from './components/jobs/ManageMessageJobs.vue'
import ManageShareJobs from './components/jobs/ManageShareJobs.vue'
import ManageFollowJobs from './components/jobs/ManageFollowJobs.vue'
import ManageScrapeJobs from './components/jobs/ManageScrapeJobs.vue'
import ManageInstallJobs from './components/jobs/ManageInstallJobs.vue'
import ManageDialog from './components/dialog/ManageDialog.vue'
import ManageTrainJobs from './components/jobs/ManageTrainJobs.vue'
import ManageMusics from './components/music/ManageMusics.vue'
import RegisterSettings from './components/settings/RegisterSettings.vue'
import PackageNameSettings from './components/settings/PackageNameSettings.vue'
import MessageSettings from './components/settings/MessageSettings.vue'
import ManageComments from './components/comment/ManageComments.vue'
import ManageProxys from './components/proxy/ManageProxys.vue'
import ManagePostBots from './components/virtualHost/ManagePostBots.vue'
import ManageEditBots from './components/virtualHost/ManageEditBots.vue'
import Login from './components/Login.vue'
import RunAgentTips from './components/RunAgentTips.vue'
import Miniremote from './components/device/Miniremote.vue'
import TrainSettings from './components/group/TrainSettings.vue'
import PublishSettings from './components/group/PublishSettings.vue'
import { inject } from 'vue'
import * as util from './utils'
import { invoke } from "@tauri-apps/api/tauri";
import { window as tauriWindow } from "@tauri-apps/api"
import { TauriEvent } from "@tauri-apps/api/event"
import { ask, message } from '@tauri-apps/api/dialog';
import BuyLicense from './components/settings/BuyLicense.vue'
import { listen } from '@tauri-apps/api/event';
import axios from 'axios'
import { os } from '@tauri-apps/api';
import { appDataDir } from '@tauri-apps/api/path';
import { exists, BaseDirectory } from '@tauri-apps/api/fs'
import {
  checkUpdate,
  installUpdate,
  onUpdaterEvent,
} from '@tauri-apps/api/updater'
import { exit, relaunch } from '@tauri-apps/api/process'

export default {
  name: 'app',
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  components: {
    Login,
    RunAgentTips,
    Sidebar,
    ManageDashboard,
    ManageDevices,
    ManageAccounts,
    ManageAnalytics,
    ManageMaterials,
    ManagePublishJobs,
    ManageMessageJobs,
    ManageShareJobs,
    ManageInstallJobs,
    ManageFollowJobs,
    ManageScrapeJobs,
    ManageDialog,
    ManageTrainJobs,
    ManageMusics,
    RegisterSettings,
    PackageNameSettings,
    MessageSettings,
    ManageComments,
    ManageProxys,
    ManagePostBots,
    ManageEditBots,
    Miniremote,
    BuyLicense,
    TrainSettings,
    PublishSettings
  },
  data() {
    return {
      device: null,
      isDark: false,
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
    }
  },
  methods: {

    menu_selected(item) {
      this.selectedItem = item
      this.$refs.page_dialog.showModal()
      this.$refs.page_dialog.addEventListener('close', () => {
        this.selectedItem = {}

      })
    },
    async check_update() {
      try {
        const unlisten = await onUpdaterEvent(({ error, status }) => {
          // This will log all updater events, including status updates and errors.
          console.log('Updater event', error, status)
        })
        const { shouldUpdate, manifest } = await checkUpdate()
        if (shouldUpdate) {
          console.log(
            `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
          )
          const yes = await ask(`${manifest?.body}`, this.$t('updateConfirm'));
          if (yes) {
            await installUpdate()
            await invoke("stop_agent");
            await relaunch()
            return;
          }
        } else {
          console.log('No update available')
        }
      } catch (error) {
        console.error(error)
      }
      this.download_filename = 'Checking update'
      this.$refs.download_dialog.showModal()
      axios.get('https://api.tikmatrix.com/coreVersion.json?time=' + new Date().getTime()).then(async (res) => {
        const unlistenProgress = await listen("DOWNLOAD_PROGRESS", async (e) => {
          this.download_progress = e.payload;
        });
        const unlistenFinished = await listen("DOWNLOAD_FINISHED", async (e) => {
          console.log("download finished")
          this.download_progress = {
            filesize: 0,
            transfered: 0,
            transfer_rate: 0,
            percentage: 0
          }
        })
        this.remote_version = res.data;
        await invoke("stop_agent");
        await this.check_platform_tools();
        await this.check_yt_dlp();
        await this.check_ocr();
        await this.check_apk();
        await this.check_test_apk();
        await this.check_scrcpy();
        await this.check_script();
        await this.check_agent();
        this.$refs.download_dialog.close();
        let result = await invoke("start_agent");
        if (result.indexOf('pid') === -1) {
          await message(result, { title: 'Error', type: 'error' });
          tauriWindow.getCurrent().close();
        }
      })

    },
    async check_yt_dlp() {
      let url = "https://r2.tikmatrix.com/yt-dlp.exe"
      await this.check_file_update('yt-dlp', "v1.0", url);
    },

    async check_ocr() {
      let work_path = await appDataDir();
      let url = "https://r2.tikmatrix.com/PaddleOCR-json.zip"
      let path = await this.check_file_update('PaddleOCR', "v1.0", url);
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
        await invoke("grant_adb_permission");
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
      await invoke("grant_script_permission");
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
      await this.check_file_update('tiktok-agent', this.remote_version.agent_version, url);
      await invoke("grant_agent_permission");
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
        await invoke('download_file', { url, path });
      } else {
        console.log(filename + " no need to update")
      }
      util.setData(filename, remoteVersion)
      return path;
    },
  },
  mounted() {
    const hasCheckedUpdate = localStorage.getItem('hasCheckedUpdate')
    console.log('hasCheckedUpdate:', hasCheckedUpdate)
    if (!hasCheckedUpdate) {
      this.check_update()
      localStorage.setItem('hasCheckedUpdate', 1)
    }
    tauriWindow.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      const yes = await ask(this.$t('exitConfirm'), this.$t('confirm'));
      if (yes) {
        await invoke("stop_agent");
        tauriWindow.getCurrent().close();
      }
    });


    this.$emitter.on('showToast', async (text) => {
      await message(text);
    });

    this.$emitter.on('openDevice', (device) => {
      this.device = device
    });
    this.$emitter.on('closeDevice', (device) => {
      this.device = null
    });
    this.$emitter.on('closePageDialog', (data) => {
      this.$refs.page_dialog.close()
    });
    this.$emitter.on('menuSelected', (item) => {
      this.menu_selected(item)
    });

    this.$emitter.on('updateService', () => {
      this.check_update()
    });
  }
}
</script>
