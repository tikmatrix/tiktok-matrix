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
      <ManageGroups v-if="selectedItem.name === 'groups' && $refs.page_dialog.open" />
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
        <div class="flex flex-row justify-between text-center items-center">
          <progress class="progress progress-success w-full" :value="download_progress.transfered"
            :max="download_progress.filesize"></progress>
          <span class="text-sm ml-1">{{ (download_progress.transfered / 1024 / 1024).toFixed(2) }}Mb</span> /
          <span class="text-sm">{{ (download_progress.filesize / 1024 / 1024).toFixed(2) }}Mb</span>
        </div>

        <div class="flex justify-between">
          <div class="text-md">
            {{ $t('transferRate') }}:
            <span class="text-sm">{{ (download_progress.transfer_rate / 1024).toFixed(2) }} KB/s</span>
          </div>
          <div class="text-md">
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
import ManageGroups from './components/group/ManageGroups.vue'
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
    ManageGroups,
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
      is_updating: false,
    }
  },
  methods: {
    stop_agent() {
      invoke("stop_agent");
    },

    open_dir(name) {
      invoke("open_dir", {
        name
      });
    },
    menu_selected(item) {
      this.selectedItem = item
      this.$refs.page_dialog.showModal()
      this.$refs.page_dialog.addEventListener('close', () => {
        this.selectedItem = {}

      })
    },
    check_update() {
      this.is_updating = true
      axios.get('https://api.tikmatrix.com/coreVersion.json?time=' + new Date().getTime()).then(async (res) => {
        this.remote_version = res.data;
        console.log("remote_version", this.remote_version)
        this.check_platform_tools((updated) => {
          if (updated) {
            invoke("grant_adb_permission");
          }
          this.check_apk(() => {
            this.check_test_apk(() => {
              this.check_scrcpy(() => {
                this.check_script((updated) => {
                  if (updated) {
                    invoke("grant_script_permission");
                  }
                  this.check_agent_update()
                })
              })
            })
          })
        })
      })

    },

    async download_ocr() {
      let filename = 'PaddleOCR'
      this.download_filename = 'PaddleOCR'
      let url = "https://r2.tikmatrix.com/PaddleOCR-json.zip"
      let work_path = await appDataDir();
      console.log("work_path", work_path)
      let name = url.split('/').pop()
      let path = work_path + 'bin/' + url.split('/').pop()
      let downloaded = await exists('bin/' + name, { dir: BaseDirectory.AppData })
      console.log("downloaded", downloaded, "path", path)
      if (downloaded) {
        alert("Already downloaded")
        return;
      }
      this.$refs.download_dialog.showModal()
      console.log("download " + filename + " from " + url + " to " + path)
      invoke('download_file', { url, path });
      const unlistenProgress = await listen("DOWNLOAD_PROGRESS", (e) => {
        this.download_progress = e.payload;
      });
      const unlistenFinished = await listen("DOWNLOAD_FINISHED", (e) => {
        console.log("download finished")
        if (path.endsWith('.zip')) {
          invoke("unzip_file", { zipPath: path, destDir: work_path });
        }

        this.$refs.download_dialog.close()
        unlistenProgress()
        unlistenFinished()
      })
    },


    async check_platform_tools(callback) {
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
      this.check_file_update('platform_tools(1/6)', this.remote_version.platform_tools_version, url, callback);
    },

    async check_apk(callback) {
      let url = this.remote_version.apk_url
      this.check_file_update('apk(2/6)', this.remote_version.apk_version, url, callback);
    },

    async check_test_apk(callback) {
      let url = this.remote_version.test_apk_url
      this.check_file_update('test_apk(3/6)', this.remote_version.test_apk_version, url, callback);
    },

    async check_scrcpy(callback) {
      let url = this.remote_version.scrcpy_url
      this.check_file_update('scrcpy(4/6)', this.remote_version.scrcpy_version, url, callback);
    },
    async check_script(callback) {
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
      this.check_file_update('script(5/6)', this.remote_version.script_version, url, callback, () => {
        invoke("stop_agent");
      });
    },
    async check_agent_update() {
      let url = ""
      const osType = await os.type();
      if (osType === 'Darwin') {
        url = this.remote_version.agent_mac_url;
      } else if (osType === 'Windows_NT') {
        url = this.remote_version.agent_windows_url;
      } else {
        console.log('Unknown OS type');
        this.is_updating = false
        return;
      }
      this.check_file_update('tiktok-agent(6/6)', this.remote_version.agent_version, url, async (updated) => {
        this.is_updating = false
        if (updated) {
          invoke("grant_agent_permission");
          invoke("start_agent");
        }
        await message(this.$t('updateServiceSuccess'));
      }, () => {
        invoke("stop_agent");
      });
    },

    async check_file_update(filename, remoteVersion, downloadUrl, callback, before) {
      this.download_filename = filename
      console.log("check_file_update", filename, remoteVersion, downloadUrl)
      let localversion = util.getData(filename);
      if (!localversion) {
        localversion = 0
      }
      console.log("localversion", localversion)
      let url = downloadUrl
      let work_path = await appDataDir();
      console.log("work_path", work_path)

      let name = url.split('/').pop()
      let path = work_path + 'bin/' + url.split('/').pop()
      let downloaded = await exists('bin/' + name, { dir: BaseDirectory.AppData })

      console.log("downloaded", downloaded, "path", path)
      if (!downloaded || localversion !== remoteVersion) {
        if (before) {
          before()
        }
        this.$refs.download_dialog.showModal()
        console.log("download " + filename + " from " + downloadUrl + " to " + path)
        invoke('download_file', { url, path });
        const unlistenProgress = await listen("DOWNLOAD_PROGRESS", (e) => {
          this.download_progress = e.payload;
        });
        const unlistenFinished = await listen("DOWNLOAD_FINISHED", (e) => {
          console.log("download finished")
          if (path.endsWith('.zip')) {
            invoke("unzip_file", { zipPath: path, destDir: work_path });
          }

          util.setData(filename, remoteVersion)
          this.$refs.download_dialog.close()
          if (callback) {
            unlistenProgress()
            unlistenFinished()
            callback(true)
          }
        })
      } else {
        if (callback) {
          callback(false)
        }
      }
    },
  },
  mounted() {
    tauriWindow.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      const yes = await ask(this.$t('exitConfirm'), this.$t('confirm'));
      if (yes) {
        this.stop_agent();
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
    this.$emitter.on('downloadOcr', () => {
      this.download_ocr()
    });
    this.$emitter.on('updateService', () => {
      this.check_update()
    });

  }
}
</script>
