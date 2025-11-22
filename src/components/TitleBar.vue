<template>
  <div data-tauri-drag-region
    class="h-12 bg-base-100 select-none flex items-center justify-between fixed top-0 left-0 right-0 z-50 px-4 shadow-md">
    <!-- 左侧:应用图标、名称、版本和检查更新 -->
    <div class="flex items-center space-x-2">
      <img ref="logo" :src="currentLogoSrc" class="h-10 w-auto logo" alt="TikMatrix Logo" />
      <span class="text-2xl text-base-content font-bold" v-if="whitelabelConfig.showAppNameInTitle">{{
        whitelabelConfig.appName }}</span>
      <!-- 检查更新按钮 -->
      <button @click="check_update(true)"
        class="flex items-center space-x-1 text-md text-info ml-2 hover:underline pointer cursor-pointer">
        <font-awesome-icon icon="fa-solid fa-sync" class="h-4 w-4" />
        <span>v{{ version }}</span>
      </button>
    </div>
    <!-- 官网 -->
    <a v-if="whitelabelConfig.officialWebsite"
      class="flex items-center space-x-1 text-md text-info ml-2 hover:underline"
      :href="whitelabelConfig.officialWebsite + '/docs/intro'" target="_blank">
      <font-awesome-icon icon="fa-solid fa-file-lines" class="h-4 w-4" />
      <span>{{ $t('tutorial') }}</span>
    </a>

    <!-- 中间：灵活空间 -->
    <div class="flex-1"></div>

    <!-- 帮助区域 - 与系统控制分开 -->
    <div class="flex items-center gap-3 mr-4 pr-4 border-r-2 border-base-300/60">
      <!-- 支持工单入口 - Enhanced with text label and visual styling -->
      <button v-if="showSupportEntry" @click="openSupportDialog" :class="[
        'relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 font-medium',
        'border-2 hover:shadow-lg',
        hasSupportUnread
          ? 'border-error/40 bg-error/10 hover:bg-error/20 hover:border-error text-error'
          : 'border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 hover:border-primary hover:from-primary/10 hover:to-secondary/10 text-base-content'
      ]" :title="$t('supportEntryTitle')">
        <font-awesome-icon icon="fa-solid fa-headset"
          :class="['h-5 w-5 transition-colors', hasSupportUnread ? 'text-error animate-pulse' : '']" />
        <span class="text-sm">{{ $t('support') }}</span>
        <span v-if="hasSupportUnread"
          class="ml-1 px-2 py-0.5 rounded-full bg-error text-error-content text-xs font-bold shadow-md">
          {{ supportBadgeText }}
        </span>
      </button>
    </div>

    <!-- 右侧：功能按钮和控制按钮 -->
    <div class="flex items-center gap-2">
      <LicenseLifecycle :is-loading="isLoadingLicense" :licenseData="licenseData" @open-license="showLicenseDialog" />
      <!-- 侧边栏切换 -->
      <label class="swap swap-rotate" :title="$t('toggleSidebar')">
        <input type="checkbox" value="true" v-model="sidebarVisible" />
        <svg class="swap-off fill-current w-6 h-6 text-base-content" fill="#000000" viewBox="0 0 64 64" version="1.1"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
          xmlns:serif="http://www.serif.com/"
          style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <rect id="Icons" x="0" y="-64" width="1280" height="800" style="fill:none;"></rect>
            <g id="Icons1" serif:id="Icons">
              <g id="Strike"> </g>
              <g id="H1"> </g>
              <g id="H2"> </g>
              <g id="H3"> </g>
              <g id="list-ul"> </g>
              <g id="hamburger-1"> </g>
              <g id="hamburger-2"> </g>
              <g id="list-ol"> </g>
              <g id="list-task"> </g>
              <g id="trash"> </g>
              <g id="vertical-menu"> </g>
              <g id="horizontal-menu"> </g>
              <g id="sidebar-2"> </g>
              <g id="Pen"> </g>
              <g id="Pen1" serif:id="Pen"> </g>
              <g id="clock"> </g>
              <g id="external-link"> </g>
              <g id="hr"> </g>
              <g id="info"> </g>
              <g id="warning"> </g>
              <g id="plus-circle"> </g>
              <g id="minus-circle"> </g>
              <g id="vue"> </g>
              <g id="cog"> </g>
              <g id="logo"> </g>
              <g id="radio-check"> </g>
              <g id="eye-slash"> </g>
              <g id="eye"> </g>
              <g id="toggle-off"> </g>
              <path id="sidebar"
                d="M50.01,56.074l-35.989,0c-3.309,0 -5.995,-2.686 -5.995,-5.995l0,-36.011c0,-3.308 2.686,-5.994 5.995,-5.994l35.989,0c3.309,0 5.995,2.686 5.995,5.994l0,36.011c0,3.309 -2.686,5.995 -5.995,5.995Zm-25.984,-4l0,-40l-9.012,0c-1.65,0.001 -2.989,1.34 -2.989,2.989l0,34.022c0,1.649 1.339,2.989 2.989,2.989l9.012,0Zm24.991,-40l-20.991,0l0,40l20.991,0c1.65,0 2.989,-1.34 2.989,-2.989l0,-34.022c0,-1.649 -1.339,-2.988 -2.989,-2.989Z">
              </path>
              <g id="shredder"> </g>
              <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g>
              <g id="react"> </g>
              <g id="check-selected"> </g>
              <g id="turn-off"> </g>
              <g id="code-block"> </g>
              <g id="user"> </g>
              <g id="coffee-bean"> </g>
              <g id="coffee-beans">
                <g id="coffee-bean1" serif:id="coffee-bean"> </g>
              </g>
              <g id="coffee-bean-filled"> </g>
              <g id="coffee-beans-filled">
                <g id="coffee-bean2" serif:id="coffee-bean"> </g>
              </g>
              <g id="clipboard"> </g>
              <g id="clipboard-paste"> </g>
              <g id="clipboard-copy"> </g>
              <g id="Layer1"> </g>
            </g>
          </g>
        </svg>
        <svg class="swap-on fill-current w-6 h-6 text-base-content" fill="#000000" viewBox="0 0 64 64" version="1.1"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"
          xmlns:serif="http://www.serif.com/"
          style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <rect id="Icons" x="-128" y="-192" width="1280" height="800" style="fill:none;"></rect>
            <g id="Icons1" serif:id="Icons">
              <g id="Strike"> </g>
              <g id="H1"> </g>
              <g id="H2"> </g>
              <g id="H3"> </g>
              <g id="list-ul"> </g>
              <g id="hamburger-1"> </g>
              <g id="hamburger-2"> </g>
              <g id="list-ol"> </g>
              <g id="list-task"> </g>
              <g id="trash"> </g>
              <g id="vertical-menu"> </g>
              <g id="horizontal-menu"> </g>
              <g id="sidebar-2">
                <path
                  d="M50.008,56.043l-35.989,0c-3.309,0 -5.995,-2.686 -5.995,-5.995l0,-36.011c0,-3.308 2.686,-5.994 5.995,-5.995l35.989,0c3.309,0.001 5.995,2.687 5.995,5.995l0,36.011c0,3.309 -2.686,5.995 -5.995,5.995Zm-25.984,-4.001l0,-39.999l-9.012,0c-1.65,0 -2.989,1.339 -2.989,2.989l0,34.021c0,1.65 1.339,2.989 2.989,2.989l9.012,0Zm24.991,-39.999l-20.991,0l0,39.999l20.991,0c1.65,0 2.989,-1.339 2.989,-2.989l0,-34.021c0,-1.65 -1.339,-2.989 -2.989,-2.989Z">
                </path>
                <rect x="14.611" y="16.042" width="6.569" height="2" style="fill-rule:nonzero;"></rect>
                <rect x="14.611" y="24.042" width="6.569" height="2" style="fill-rule:nonzero;"></rect>
                <rect x="14.611" y="20.042" width="6.569" height="2" style="fill-rule:nonzero;"></rect>
              </g>
              <g id="Pen"> </g>
              <g id="Pen1" serif:id="Pen"> </g>
              <g id="clock"> </g>
              <g id="external-link"> </g>
              <g id="hr"> </g>
              <g id="info"> </g>
              <g id="warning"> </g>
              <g id="plus-circle"> </g>
              <g id="minus-circle"> </g>
              <g id="vue"> </g>
              <g id="cog"> </g>
              <g id="logo"> </g>
              <g id="radio-check"> </g>
              <g id="eye-slash"> </g>
              <g id="eye"> </g>
              <g id="toggle-off"> </g>
              <g id="shredder"> </g>
              <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g>
              <g id="react"> </g>
              <g id="check-selected"> </g>
              <g id="turn-off"> </g>
              <g id="code-block"> </g>
              <g id="user"> </g>
              <g id="coffee-bean"> </g>
              <g id="coffee-beans">
                <g id="coffee-bean1" serif:id="coffee-bean"> </g>
              </g>
              <g id="coffee-bean-filled"> </g>
              <g id="coffee-beans-filled">
                <g id="coffee-bean2" serif:id="coffee-bean"> </g>
              </g>
              <g id="clipboard"> </g>
              <g id="clipboard-paste"> </g>
              <g id="clipboard-copy"> </g>
              <g id="Layer1"> </g>
            </g>
          </g>
        </svg>
      </label>

      <!-- 白标设置按钮 - 仅在解锁后显示 -->
      <button v-if="isWhiteLabelUnlocked" @click="openWhiteLabelDialog"
        class="p-1 rounded cursor-pointer transition-colors duration-150 bg-transparent hover:bg-base-200/80 hover:text-primary dark:hover:bg-base-300/60 dark:hover:text-primary"
        :title="$t('whitelabelSettings')">
        <font-awesome-icon icon="fa-solid fa-palette" class="h-6 w-6 text-base-content" />
      </button>
      <!-- 全局设置 -->
      <button @click="$emiter('showDialog', { name: 'tiktokSettings' })"
        class="p-1 rounded cursor-pointer transition-colors duration-150 bg-transparent hover:bg-base-200/80 hover:text-primary dark:hover:bg-base-300/60 dark:hover:text-primary"
        :title="$t('settings')">
        <font-awesome-icon icon="fa-solid fa-gear" class="h-6 w-6 text-base-content" />
      </button>
      <!-- 语言选择 -->
      <select class="select select-info select-md" v-model="currentLocale" @change="changeLocale">
        <option selected value="en">English</option>
        <option value="zh-CN">简体中文</option>
        <option value="ru">Русский</option>
      </select>

      <!-- 主题切换 -->
      <label class="swap swap-rotate">
        <input type="checkbox" class="theme-controller" value="dark" v-model="darkMode" />
        <font-awesome-icon icon="fa-solid fa-sun" class="swap-off fill-current w-6 h-6 text-base-content" />
        <font-awesome-icon icon="fa-solid fa-moon" class="swap-on fill-current w-6 h-6 text-base-content" />
      </label>

      <!-- 窗口控制按钮 -->
      <div class="flex space-x-2">
        <button @click="minimizeWindow"
          class="p-1 rounded cursor-pointer transition-colors duration-150 bg-transparent hover:bg-base-200/80 hover:text-primary dark:hover:bg-base-300/60 dark:hover:text-primary"
          :title="$t('minimize')" :aria-label="$t('minimize')">
          <font-awesome-icon icon="fa-solid fa-minus" class="h-5 w-5 text-base-content" />
        </button>
        <button @click="maximizeWindow"
          class="p-1 rounded cursor-pointer transition-colors duration-150 bg-transparent hover:bg-base-200/80 hover:text-primary dark:hover:bg-base-300/60 dark:hover:text-primary"
          :title="$t('maximize')" :aria-label="$t('maximize')">
          <font-awesome-icon icon="fa-solid fa-up-right-and-down-left-from-center" class="h-5 w-5 text-base-content" />
        </button>
        <button @click="closeWindow"
          class="p-1 rounded cursor-pointer transition-colors duration-150 bg-transparent hover:bg-base-200/80 hover:text-error dark:hover:bg-base-300/60 dark:hover:text-error"
          :title="$t('close')" :aria-label="$t('close')">
          <font-awesome-icon icon="fa-solid fa-xmark" class="h-5 w-5 text-base-content" />
        </button>
      </div>
    </div>
  </div>

  <!-- 白标设置弹窗 -->
  <WhiteLabelDialog ref="whitelabelDialog" @config-updated="onWhiteLabelConfigUpdated" />

  <!-- 许可证管理弹窗 -->
  <LicenseManagementDialog ref="licenseManagementDialog" :license="licenseData"
    @update-license-code="updateLicenseCode" />


  <!-- 下载进度弹窗 -->
  <dialog ref="download_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ check_update_dialog_title }}</h3>
      <div class="modal-body">
        <div class="flex flex-row justify-between text-center items-center" v-if="download_progress.filesize > 0">
          <progress class="progress progress-success w-full" :value="download_progress.transfered"
            :max="download_progress.filesize"></progress>
          <span class="text-md ml-1">{{ (download_progress.transfered / 1024 / 1024).toFixed(2) }}Mb</span> /
          <span class="text-md">{{ (download_progress.filesize / 1024 / 1024).toFixed(2) }}Mb</span>
        </div>
        <div class="flex flex-row justify-between text-center items-center" v-else>
          <progress class="progress progress-success w-full"></progress>
        </div>

        <div class="flex justify-between">
          <div class="text-md" v-if="download_progress.transfer_rate > 0">
            {{ $t('transferRate') }}:
            <span class="text-md">{{ (download_progress.transfer_rate / 1024).toFixed(2) }} KB/s</span>
          </div>
          <div class="text-md" v-if="download_progress.percentage > 0">
            {{ $t('percentage') }}:
            <span class="text-md">{{ download_progress.percentage }} %</span>
          </div>
        </div>
      </div>
    </div>
  </dialog>

  <!-- Agent错误弹窗 -->
  <AgentErrorDialog ref="agentErrorDialog" :process-name="agentProcessName" :error-type="agentErrorType" />
</template>

<script>
import { appWindow } from '@tauri-apps/api/window';
import { getAll } from '@tauri-apps/api/window';
import { ask, message } from '@tauri-apps/api/dialog';
import { invoke } from "@tauri-apps/api/tauri";
import { readTextFile, writeTextFile, exists, copyFile } from '@tauri-apps/api/fs';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { getVersion, getName } from '@tauri-apps/api/app';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { appDataDir } from '@tauri-apps/api/path';
import { os } from '@tauri-apps/api';
import LicenseManagementDialog from './LicenseManagementDialog.vue';
import WhiteLabelDialog from './WhiteLabelDialog.vue';
import { Command, open } from '@tauri-apps/api/shell'
import AgentErrorDialog from './AgentErrorDialog.vue';
import { getWhiteLabelConfig, cloneDefaultWhiteLabelConfig } from '../config/whitelabel.js';
import { isFeatureUnlocked } from '../utils/features.js';
import { getItem, setItem } from '@/utils/persistentStorage.js';
import LicenseLifecycle from './LicenseLifecycle.vue';

export default {
  name: 'TitleBar',
  components: {
    LicenseManagementDialog,
    WhiteLabelDialog,
    AgentErrorDialog,
    LicenseLifecycle
  },
  props: {
    supportUnreadCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      version: '',
      name: '',
      sidebarVisible: true,
      darkMode: false,
      currentLocale: 'en',
      licenseData: {},
      remote_version: {},
      download_progress: {
        filesize: 0,
        transfered: 0,
        transfer_rate: 0,
        percentage: 0
      },
      check_update_dialog_title: '',
      isLoadingLicense: true,
      agentProcessName: '',
      agentErrorType: 'port',
      whitelabelConfig: cloneDefaultWhiteLabelConfig(),
      isWhiteLabelUnlocked: false,
      checkLibsUrl: 'https://api.tikmatrix.com/front-api/check_libs?beta=0', // changeme
    }
  },
  watch: {
    sidebarVisible(val) {
      this.$emiter('sidebarChange', val);
    },
    async darkMode(val) {
      await setItem('isDark', val ? 'true' : 'false');
    },
    async currentLocale(val) {
      await setItem('locale', val);
      this.$i18n.locale = val;
    }
  },
  computed: {
    currentLogoSrc() {
      if (this.whitelabelConfig.logo?.main) {
        const logoPath = this.whitelabelConfig.logo.main;
        if (this.darkMode) {
          if (this.whitelabelConfig.logo?.dark) {
            return this.whitelabelConfig.logo.dark;
          }
          if (typeof logoPath === 'string') {
            return logoPath.replace(/(\.[^.]+)$/, '_dark$1');
          }
        }
        return logoPath;
      }
      if (this.darkMode) {
        return new URL('../assets/logo_dark.png', import.meta.url).href;
      }
      return new URL('../assets/logo.png', import.meta.url).href;
    },
    hasSupportUnread() {
      return Number(this.supportUnreadCount) > 0;
    },
    supportBadgeText() {
      const count = Number(this.supportUnreadCount) || 0;
      if (count > 99) {
        return '99+';
      }
      return String(count);
    },
    showSupportEntry() {
      const flag = this.whitelabelConfig?.enableSupportEntry;
      if (typeof flag === 'boolean') {
        return flag;
      }
      return true;
    }
  },
  async created() {
    const [storedDark, storedLocale, config, unlocked] = await Promise.all([
      getItem('isDark'),
      getItem('locale'),
      getWhiteLabelConfig(),
      isFeatureUnlocked('whiteLabel'),
    ]);

    if (storedDark !== null) {
      this.darkMode = storedDark === 'true' || storedDark === true;
    }

    if (storedLocale) {
      const sanitizedLocale = String(storedLocale).replace(/"/g, '').trim();
      this.currentLocale = sanitizedLocale || 'en';
      this.$i18n.locale = this.currentLocale;
    }

    if (config) {
      this.whitelabelConfig = config;
    }

    this.isWhiteLabelUnlocked = Boolean(unlocked);
  },
  methods: {
    updateLicenseCode(value) {
      this.licenseData = {
        ...this.licenseData,
        license_code: value
      }
    },
    isLicensed() {
      return this.licenseData.leftdays > 0 || this.licenseData.is_stripe_active == 1;
    },
    async startAgent(silent = false) {
      const showDialog = !silent;
      const closeDialog = () => {
        if (showDialog && this.$refs.download_dialog?.open) {
          this.$refs.download_dialog.close();
        }
      };

      try {
        if (showDialog) {
          this.$refs.download_dialog.showModal();
          this.check_update_dialog_title = 'Checking agent...';
        }

        let pname = await invoke("is_agent_running");
        console.log('agent_running:', pname)
        if (pname === '') {
          console.log('agent is not running')
          if (showDialog) {
            this.check_update_dialog_title = 'Starting agent...';
          }
          const osType = await os.type();
          const agentFilename = osType === 'Darwin' ? 'agent' : 'agent.exe';
          let agent_exists = await exists(`bin/${agentFilename}`, { dir: BaseDirectory.AppData })
          if (!agent_exists) {
            console.log(`${agentFilename} not found`)
            closeDialog();
            if (showDialog) {
              this.agentErrorType = 'notfound';
              this.$refs.agentErrorDialog.show();
            } else {
              await this.$emiter('NOTIFY', {
                type: 'error',
                message: this.$t('agentNotFound'),
                timeout: 4000
              });
            }
            return;
          }
          const command = new Command('start-agent', [])
          command.on('close', data => {
            console.log(`command exit: ${JSON.stringify(data)}`)
          });
          const child = await command.spawn();
          console.log('pid:', child.pid);
          await writeTextFile('agent.pid', `${child.pid}`, { dir: BaseDirectory.AppData });
        } else {
          console.log('50809 port is used, process name:', pname)
          closeDialog();
          if (pname === 'agent.exe' || pname === 'agent') {
            // it's ok
            await this.$emiter('agent_started', {})
            return;
          }
          if (showDialog) {
            this.agentProcessName = pname;
            this.agentErrorType = 'port';
            this.$refs.agentErrorDialog.show();
          } else {
            await this.$emiter('NOTIFY', {
              type: 'info',
              message: this.$t('agentPortOccupied', { process: pname }),
              timeout: 3000
            });
          }
        }
      } catch (e) {
        closeDialog();
        const errorMessage = e instanceof Error ? e.message : String(e);
        if (showDialog) {
          this.agentErrorType = 'start';
          this.$refs.agentErrorDialog.show();
        } else {
          console.error('Silent agent start error:', errorMessage);
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: this.$t('agentStartTimeout'),
            timeout: 4000
          });
        }
        return;
      }

      console.log('waiting for agent startup')
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
        if (port > 0) {
          console.log('agent started')
          await this.$emiter('agent_started', {})
          if (!showDialog) {
            await this.$emiter('NOTIFY', {
              type: 'success',
              message: this.$t('agentRestarted'),
              timeout: 3000
            });
          }
          closeDialog();
          return;
        }
      }
      closeDialog();
      if (showDialog) {
        this.agentErrorType = 'timeout';
        this.$refs.agentErrorDialog.show();
      } else {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('agentStartTimeout'),
          timeout: 4000
        });
      }
    },
    async minimizeWindow() {
      appWindow.minimize();
    },
    async maximizeWindow() {
      appWindow.toggleMaximize();
    },
    async closeWindow() {
      const yes = await ask(this.$t('exitConfirm'), this.$t('confirm'));
      if (yes) {
        await this.shutdown();
        getAll().forEach((win) => {
          win.close();
        });
      }
    },
    async shutdown() {
      await invoke("kill_process", { name: "agent" });
      await invoke("kill_process", { name: "script" });
      await writeTextFile('agent.pid', '', { dir: BaseDirectory.AppData });
    },
    changeLocale() {
      this.$i18n.locale = this.currentLocale;
    },
    showLicenseDialog() {
      this.$refs.licenseManagementDialog.show()
    },
    async loadLicense() {
      this.isLoadingLicense = true;
      try {
        const res = await this.$service.get_license();
        if (res.code === 0) {
          this.licenseData = JSON.parse(res.data);
          await this.$emiter('LICENSE_STATUS_CHANGED', this.licenseData);
        } else {
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: res.data,
            timeout: 2000
          });
        }
      } catch (error) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: error,
          timeout: 2000
        });
      } finally {
        this.isLoadingLicense = false;
      }
    },
    async check_update(force = false, silent = false) {
      const skipUpdateCheck = sessionStorage.getItem('skipUpdateCheck');
      if (skipUpdateCheck && !force) {
        await this.startAgent();
        return;
      }
      if (!silent) {
        this.check_update_dialog_title = 'Checking update...';
        this.$refs.download_dialog.showModal();
      }

      let platform = await this.getPlatform();

      // Check for Tauri updates (Windows auto-updates, Mac manual download)
      if (!silent) {
        try {
          const { shouldUpdate, manifest } = await checkUpdate();
          if (shouldUpdate) {
            console.log(
              `Update available ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
            );

            if (platform === 'windows') {
              // Windows: Auto-update via Tauri
              const yes = await ask(`${manifest?.body}`, this.$t('updateConfirm'));
              if (yes) {
                this.check_update_dialog_title = 'Downloading update...';
                await this.shutdown();
                await installUpdate();
                await relaunch();
                return;
              }
            } else {
              // macOS: Prompt user to download manually
              const downloadUrl = this.whitelabelConfig.targetApp === 'instagram'
                ? `${this.whitelabelConfig.officialWebsite}/Download-IgMatrix`
                : `${this.whitelabelConfig.officialWebsite}/Download`;

              const yes = await ask(
                this.$t('macUpdatePrompt', { version: manifest?.version }),
                this.$t('macUpdateAvailable')
              );

              if (yes) {
                console.log('Opening download page:', downloadUrl);
                await open(downloadUrl);
              }
              this.$refs.download_dialog.close();
              // Continue to check library updates and start agent
            }
          } else {
            console.log('No update available');
          }
        } catch (e) {
          console.error('Update check failed:', e);
          this.$emiter('NOTIFY', {
            type: 'error',
            message: this.$t('updateCheckFailed'),
            timeout: 4000
          });
          this.$refs.download_dialog.close();
          return;
        }
      }

      try {
        let response = await fetch(`${this.checkLibsUrl}&time=${new Date().getTime()}`, {
          method: 'GET',
          timeout: 10,
          responseType: ResponseType.JSON,
          headers: {
            'User-Agent': platform,
            'X-App-Id': this.name
          }
        });
        if (response?.ok && response?.data?.code === 20000) {
          const libs = response.data.data.libs;
          let agentUpdated = false;
          let scriptUpdated = false;

          for (const lib of libs) {
            if (lib.name === 'platform-tools') {
              await this.download_and_update_lib(lib, 'platform-tools');
            } else if (lib.name === 'PaddleOCR') {
              await this.download_and_update_lib(lib, 'PaddleOCR');
            } else if (lib.name === 'apk') {
              await this.download_and_update_lib(lib, 'apk');
            } else if (lib.name === 'test-apk') {
              await this.download_and_update_lib(lib, 'test-apk');
            } else if (lib.name === 'scrcpy') {
              await this.download_and_update_lib(lib, 'scrcpy');
            } else if (lib.name === 'script') {
              const updated = await this.download_and_update_lib(lib, 'script');
              if (updated) scriptUpdated = true;
            } else if (lib.name === 'agent') {
              const updated = await this.download_and_update_lib(lib, 'agent');
              if (updated) agentUpdated = true;
            }
          }
          if (!force || agentUpdated || scriptUpdated) {
            await this.startAgent();
          }

          // Set flag to true to avoid repetitive checks, It will be cleared when UI is restarted
          sessionStorage.setItem('skipUpdateCheck', 'true');
          this.$refs.download_dialog.close();
        } else {
          console.error('Fetch libs update failed:', response);
          this.$emiter('NOTIFY', {
            type: 'error',
            message: this.$t('updateCheckFailed'),
            timeout: 4000
          });
          this.$refs.download_dialog.close();
        }
      } catch (e) {
        console.error('Fetch libs update failed:', e);
        this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('updateCheckFailed'),
          timeout: 4000
        });
        this.$refs.download_dialog.close();
      }


    },

    async download_and_update_lib(lib, localStorageKey) {
      try {
        let updated = false;
        this.check_update_dialog_title = `Checking ${lib.name} update...`;
        const storedVersion = await getItem(localStorageKey);
        let localversion = this.sanitizeVersion(storedVersion) || '0';
        let url = lib.downloadUrl;
        let work_path = await appDataDir();
        let name = url.split('/').pop();
        let path = work_path + 'tmp/' + name;
        let downloaded = await exists('tmp/' + name, { dir: BaseDirectory.AppData });
        console.log(`check_file_update: ${lib.name} localversion: ${localversion} remoteVersion: ${lib.version}`);

        if (!downloaded || localversion !== lib.version) {
          console.log(`downloading ${lib.name} from ${url} to ${path}`);
          await invoke('download_file_with_version', {
            url,
            path,
            version: lib.version
          }).catch(async (e) => {
            console.error(e);
            await message('Download Error', { title: 'Error', type: 'error' });
            return;
          });
          updated = true;
        } else {
          console.log(`${lib.name} no need to update`);
          this.check_update_dialog_title = `${lib.name} is up to date`;
        }

        await setItem(localStorageKey, lib.version);

        let result = updated;
        if (lib.name === 'platform-tools') {
          const osType = await os.type();
          const adbFileName = osType === 'Darwin' ? 'adb' : 'adb.exe';
          let adb_exists = await exists(`platform-tools/${adbFileName}`, { dir: BaseDirectory.AppData });
          if (updated || !adb_exists) {
            this.check_update_dialog_title = 'Uziping platform-tools.zip';
            await invoke("kill_process", { name: "adb" });
            await new Promise(r => setTimeout(r, 3000));
            await invoke("unzip_file", { zipPath: path, destDir: work_path });
            await invoke("grant_permission", { path: "platform-tools/adb" });
          }
        } else if (lib.name === 'PaddleOCR') {
          const osType = await os.type();
          const paddleFileName = osType === 'Darwin' ? 'PaddleOCR-json' : 'PaddleOCR-json.exe';
          let paddle_exists = await exists(`PaddleOCR-json/${paddleFileName}`, { dir: BaseDirectory.AppData });
          if (updated || !paddle_exists) {
            this.check_update_dialog_title = 'Uziping PaddleOCR-json.zip';
            await invoke("kill_process", { name: "PaddleOCR-json" });
            await invoke("unzip_file", { zipPath: path, destDir: work_path });
          } else {
            this.check_update_dialog_title = 'PaddleOCR-json is exists';
          }
        } else if (lib.name === 'apk' || lib.name === 'test-apk' || lib.name === 'scrcpy') {
          if (updated) {
            await copyFile(path, path.replace('tmp', 'bin'));
            if (lib.name === 'apk' || lib.name === 'test-apk') {
              await invoke("set_env", { key: "agent_version", value: lib.version });
            }
          }
        } else if (lib.name === 'script' || lib.name === 'agent') {
          if (updated) {
            await invoke("kill_process", { name: lib.name });
            await new Promise(r => setTimeout(r, 3000));
            await copyFile(path, path.replace('tmp', 'bin'));
            await invoke("grant_permission", { path: `bin/${lib.name}` });
          }
        }
        return result;
      } catch (e) {
        console.error(e);
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: `Download and Update Lib Error: ${e.message}`,
          timeout: 2000
        });
        return false;
      }
    },

    sanitizeVersion(version) {
      console.log('sanitizeVersion', version);
      if (version === undefined || version === null) {
        return '';
      }
      return String(version).replace(/"/g, '').trim();
    },

    openWhiteLabelDialog() {
      this.$refs.whitelabelDialog.showDialog();
    },

    openSupportDialog() {
      this.$emiter('showDialog', { name: 'support' })
    },

    onWhiteLabelConfigUpdated(config) {
      this.whitelabelConfig = config;
      document.title = config.appName || 'TikMatrix';
      this.$emit('whitelabel-updated', config);
    },
    async getPlatform() {
      const osType = await os.type();
      const arch = await os.arch();
      let platform = 'windows';
      if (osType === 'Darwin') {
        if (arch === 'aarch64') {
          platform = 'mac-arm';
        } else {
          platform = 'mac-intel';
        }
      }
      return platform;
    },



    getLibStorageKey(libName) {
      const libKeyMap = {
        'platform-tools': 'platform-tools',
        'PaddleOCR': 'PaddleOCR',
        'apk': 'apk',
        'test-apk': 'test-apk',
        'scrcpy': 'scrcpy',
        'script': 'script',
        'agent': 'agent',
      };
      return libKeyMap[libName] || libName;
    },
  },
  async mounted() {
    // Version & Name
    this.version = await getVersion();
    this.name = await getName();

    // Language
    this.$i18n.locale = this.currentLocale;
    console.log('currentLocale:', this.currentLocale);

    // Check whitelabel feature
    this.isWhiteLabelUnlocked = await isFeatureUnlocked('whiteLabel');

    await this.$listen("DOWNLOAD_PROGRESS", async (e) => {
      this.download_progress = e.payload;
    });

    await this.$listen("DOWNLOAD_FINISHED", async () => {
      console.log("download finished");
      this.download_progress = {
        filesize: 0,
        transfered: 0,
        transfer_rate: 0,
        percentage: 0
      };
    });

    await this.$listen("LICENSE", async (e) => {
      if (e.payload.reload) await this.loadLicense();
      if (e.payload.show) this.showLicenseDialog();
    });

    await this.$listen('agent_started', async () => {
      await this.loadLicense();
      if (!this.isLicensed()) this.showLicenseDialog();
    });

    await this.$listen('featureUnlocked', async () => {
      this.isWhiteLabelUnlocked = await isFeatureUnlocked('whiteLabel');
    });

    await this.$listen('AUTO_UPDATE_TRIGGER', async () => {
      await this.check_update(true, true);
    });

    this.check_update();
  }
}
</script>
