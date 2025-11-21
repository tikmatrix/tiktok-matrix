<template>
  <div data-tauri-drag-region
    class="h-12 bg-base-100 select-none flex items-center justify-between fixed top-0 left-0 right-0 z-50 px-4 shadow-md">
    <!-- 左侧:应用图标、名称、版本和检查更新 -->
    <div class="flex items-center space-x-2">
      <img ref="logo" :src="currentLogoSrc" class="h-10 w-auto logo" alt="TikMatrix Logo" />
      <span class="text-2xl text-base-content font-bold" v-if="whitelabelConfig.showAppNameInTitle">{{
        whitelabelConfig.appName }}</span>
      <!-- 检查更新按钮 -->
      <button @click="check_update()"
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
    <!-- 右侧：功能按钮和控制按钮 -->
    <div class="flex items-center gap-2">
      <!-- WebSocket 状态指示器 - 优化版 -->
      <div
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap"
        :class="wsStatusMeta.containerClass" :title="wsStatusMeta.tooltip">
        <span class="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" :class="wsStatusMeta.dotClass"></span>
        <span class="leading-none">{{ wsStatusMeta.label }}</span>
      </div>
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
      <!-- 支持工单入口 -->
      <button v-if="showSupportEntry" @click="openSupportDialog" :class="[
        'relative p-1 rounded cursor-pointer transition-colors duration-150 bg-transparent hover:bg-base-200/80 hover:text-primary dark:hover:bg-base-300/60 dark:hover:text-primary',
        hasSupportUnread ? 'text-error' : 'text-base-content'
      ]" :title="$t('supportEntryTitle')">
        <font-awesome-icon icon="fa-solid fa-headset"
          :class="['h-6 w-6 transition-colors', hasSupportUnread ? 'text-error' : 'text-base-content']" />
        <span v-if="hasSupportUnread"
          class="absolute -top-1.5 -right-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-error px-1 text-xs font-semibold text-error-content shadow-lg">
          {{ supportBadgeText }}
        </span>
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
</template>

<script>
import { appWindow } from '@tauri-apps/api/window';
import { getAll } from '@tauri-apps/api/window';
import { ask } from '@tauri-apps/api/dialog';
import { invoke } from "@tauri-apps/api/tauri";
import { writeTextFile } from '@tauri-apps/api/fs';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { getVersion, getName } from '@tauri-apps/api/app';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { os } from '@tauri-apps/api';
import LicenseManagementDialog from './LicenseManagementDialog.vue';
import WhiteLabelDialog from './WhiteLabelDialog.vue';
import { open } from '@tauri-apps/api/shell'
import { getWhiteLabelConfig, cloneDefaultWhiteLabelConfig } from '../config/whitelabel.js';
import { isFeatureUnlocked } from '../utils/features.js';
import { getItem, setItem } from '@/utils/persistentStorage.js';
import LicenseLifecycle from './LicenseLifecycle.vue';
import * as licenseWsService from '../service/licenseWebSocketService';

export default {
  name: 'TitleBar',
  components: {
    LicenseManagementDialog,
    WhiteLabelDialog,
    LicenseLifecycle
  },
  props: {
    supportUnreadCount: {
      type: Number,
      default: 0
    },
    wsStatus: {
      type: Object,
      default: () => ({
        status: 'unknown',
        timestamp: Date.now(),
        extra: null
      })
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
      whitelabelConfig: cloneDefaultWhiteLabelConfig(),
      isWhiteLabelUnlocked: false,
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
    },
    wsStatusMeta() {
      const status = (this.wsStatus?.status || 'unknown').toLowerCase();
      const map = {
        connected: {
          label: 'Connected',
          containerClass: 'border-success/50 text-success bg-success/15 hover:bg-success/25',
          dotClass: 'bg-success shadow-sm shadow-success/50'
        },
        connecting: {
          label: 'Connecting',
          containerClass: 'border-info/50 text-info bg-info/15 hover:bg-info/25',
          dotClass: 'bg-info shadow-sm shadow-info/50'
        },
        initial: {
          label: 'Starting',
          containerClass: 'border-info/50 text-info bg-info/15 hover:bg-info/25',
          dotClass: 'bg-info shadow-sm shadow-info/50'
        },
        error: {
          label: 'Error',
          containerClass: 'border-error/50 text-error bg-error/15 hover:bg-error/25',
          dotClass: 'bg-error shadow-sm shadow-error/50'
        },
        disconnected: {
          label: 'Offline',
          containerClass: 'border-warning/50 text-warning bg-warning/15 hover:bg-warning/25',
          dotClass: 'bg-warning shadow-sm shadow-warning/50'
        },
        unknown: {
          label: 'Unknown',
          containerClass: 'border-base-300 text-base-content/70 bg-base-300/30 hover:bg-base-300/40',
          dotClass: 'bg-base-content/50'
        }
      };
      const meta = map[status] || map.unknown;
      const tooltipParts = [`Status: ${status}`];
      if (this.wsStatus?.extra?.url) {
        tooltipParts.push(`URL: ${this.wsStatus.extra.url}`);
      }
      if (this.wsStatus?.extra?.reason) {
        tooltipParts.push(`Reason: ${this.wsStatus.extra.reason}`);
      }
      if (this.wsStatus?.extra?.error) {
        tooltipParts.push(`Error: ${this.wsStatus.extra.error}`);
      }
      if (this.wsStatus?.timestamp) {
        try {
          tooltipParts.push(`Updated: ${new Date(this.wsStatus.timestamp).toLocaleTimeString()}`);
        } catch (error) {
          // ignore date formatting issues
        }
      }
      const tooltip = tooltipParts.join('\n');
      return {
        ...meta,
        tooltip
      };
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
        const licenseData = await licenseWsService.ws_get_license();
        this.licenseData = licenseData;
        await this.$emiter('LICENSE_STATUS_CHANGED', this.licenseData);
      } catch (error) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: error.message || error,
          timeout: 2000
        });
      } finally {
        this.isLoadingLicense = false;
      }
    },
    async check_update(silent = false) {

      if (!silent) {
        this.check_update_dialog_title = this.$t('checkingUpdate') || 'Checking update...';
        this.$refs.download_dialog.showModal();
      }

      try {
        if (!silent) {
          await this.checkAppBinaryUpdate();
        }

        await invoke('update_manager_check_now', { silent });

        if (!silent) {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('updateCheckCompleted'),
            timeout: 3000
          });
        }
      } catch (error) {
        console.error('Manual update failed:', error);
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('updateCheckFailed'),
          timeout: 4000
        });
      } finally {
        if (!silent && this.$refs.download_dialog?.open) {
          this.$refs.download_dialog.close();
        }
      }
    },

    async checkAppBinaryUpdate() {
      const platform = await this.getPlatform();
      const { shouldUpdate, manifest } = await checkUpdate();
      if (!shouldUpdate) {
        return;
      }

      if (platform === 'windows') {
        const yes = await ask(`${manifest?.body || ''}`, this.$t('updateConfirm'));
        if (yes) {
          this.check_update_dialog_title = this.$t('downloadingUpdate') || 'Downloading update...';
          await this.shutdown();
          await installUpdate();
          await relaunch();
        }
      } else {
        const downloadUrl = this.whitelabelConfig.targetApp === 'instagram'
          ? `${this.whitelabelConfig.officialWebsite}/Download-IgMatrix`
          : `${this.whitelabelConfig.officialWebsite}/Download`;

        const yes = await ask(
          this.$t('macUpdatePrompt', { version: manifest?.version }),
          this.$t('macUpdateAvailable')
        );

        if (yes) {
          await open(downloadUrl);
        }
      }
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
  },
  async mounted() {
    // Version & Name
    this.version = await getVersion();
    this.name = await getName();
    await this.loadLicense();
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

    await this.$listen("reload_license", async (e) => {
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

    // Listen to update manager status
    await this.$listen('update_manager_status', async (e) => {
      const payload = e.payload;
      console.log('[TitleBar] Update manager status:', payload);
      if (payload.status === 'checking' || payload.status === 'downloading') {
        this.check_update_dialog_title = payload.message;
        // Show dialog if not already open
        if (this.$refs.download_dialog && !this.$refs.download_dialog.open) {
          this.$refs.download_dialog.showModal();
        }
      } else if (payload.status === 'completed' || payload.status === 'error') {
        // Close dialog when update check is completed or failed
        if (this.$refs.download_dialog && this.$refs.download_dialog.open) {
          this.$refs.download_dialog.close();
        }
        // Show error notification if update failed
        if (payload.status === 'error') {
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: payload.message || this.$t('updateCheckFailed'),
            timeout: 4000
          });
        }
      }
    });

    // Listen to agent manager status
    await this.$listen('agent_manager_status', async (e) => {
      const payload = e.payload;
      console.log('[TitleBar] Agent manager status:', payload);
      if (payload.status === 'error' && payload.message) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: payload.message,
          timeout: 4000
        });
      }
    });

  }
}
</script>
