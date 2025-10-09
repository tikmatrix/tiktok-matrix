<template>
    <div data-tauri-drag-region
        class="h-12 bg-base-100 select-none flex items-center justify-between fixed top-0 left-0 right-0 z-50 px-4 shadow-md">
        <!-- 左侧：应用图标、名称、版本和检查更新 -->
        <div class="flex items-center space-x-2">
            <img :src="whitelabelConfig.logo?.main || '../assets/app-icon.png'" class="h-10 w-10" alt="App Icon" />
            <span class="text-2xl text-base-content font-bold">{{ whitelabelConfig.appName || 'TikZenX' }}</span>
            <!-- <span class="text-md text-base-content">v{{ version }}</span> -->
            <!-- 检查更新按钮 -->
            <button @click="check_update(true)"
                class="flex items-center space-x-1 text-md text-info ml-2 hover:underline pointer cursor-pointer">
                <font-awesome-icon icon="fa-solid fa-sync" class="h-4 w-4" />
                <span>v{{ version }}</span>
            </button>
        </div>
        <!-- 教程链接 -->
        <a v-if="whitelabelConfig.features?.showTutorial"
            class="flex items-center space-x-1 text-md text-info ml-2 hover:underline"
            :href="whitelabelConfig.branding?.tutorialUrl || 'https://tikzenx.com/docs/intro'" target="_blank">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="h-4 w-4" />
            <span>{{ $t('tutorial') }}</span>
        </a>
        <!-- <a class="flex items-center space-x-1 text-md text-info ml-2 hover:underline" @click="open_dir('')">
            <font-awesome-icon icon="fa fa-folder" class="h-4 w-4" />
            <span>{{ $t('openAppDir') }}</span>
        </a> -->
        <!-- Rewards-->
        <!-- <a class="flex items-center space-x-1 text-md text-info ml-2 hover:underline" :href="$t('siteUrl') + '/rewards'"
            target="_blank">
            <font-awesome-icon icon="fa-solid fa-gift" class="h-4 w-4" />
            <span>{{ $t('rewards') }}</span>
        </a> -->
        <!-- 中间：灵活空间 -->
        <div class="flex-1"></div>
        <!-- 右侧：功能按钮和控制按钮 -->
        <div class="flex items-center space-x-4">
            <!-- 侧边栏切换 -->
            <label class="swap swap-rotate" :title="$t('toggleSidebar')">
                <input type="checkbox" value="true" v-model="sidebarVisible" />
                <svg class="swap-off fill-current w-6 h-6 text-base-content" fill="#000000" viewBox="0 0 64 64"
                    version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    xml:space="preserve" xmlns:serif="http://www.serif.com/"
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
                <svg class="swap-on fill-current w-6 h-6 text-base-content" fill="#000000" viewBox="0 0 64 64"
                    version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    xml:space="preserve" xmlns:serif="http://www.serif.com/"
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
            <!-- 许可证状态 -->
            <button
                class="btn btn-md flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
                :class="[
                    isLoadingLicense ? 'btn-neutral' :
                        is_licensed() ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none' : 'btn-error text-white'
                ]" @click="showLicenseDialog">
                <font-awesome-icon v-if="isLoadingLicense" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
                <font-awesome-icon v-else-if="is_licensed()" icon="fa-solid fa-crown" class="h-5 w-5 text-yellow-200" />
                <font-awesome-icon v-else :icon="'fa fa-lock'" class="h-4 w-4" />
                <span v-if="isLoadingLicense" class="font-semibold whitespace-nowrap">{{ $t('loading') }}</span>
                <span v-else-if="is_licensed()" class="font-semibold whitespace-nowrap">{{ licenseData.plan_name
                    }}</span>
                <span class="font-semibold whitespace-nowrap" v-else>{{ $t('unlicensed') }}</span>
                <div class="flex items-center flex-row gap-2 w-full" v-if="licenseData.is_stripe_active == 1">

                    <label class="text-xs text-warning" v-if="licenseData.stripe_cancel_at">{{ $t('cancelTips', {
                        date: new Date(licenseData.stripe_cancel_at *
                            1000).toLocaleDateString()
                    }) }}</label>
                    <label class="text-xs text-warning" v-else>{{ $t('renewTips', {
                        date: new Date(licenseData.stripe_renew_at *
                            1000).toLocaleDateString()
                    }) }}</label>
                </div>
                <div class="flex items-center flex-row gap-2 w-full" v-else>
                    <label class="text-xs text-warning" v-if="licenseData.leftdays > 0">{{ $t('expiredTips', {
                        date: new Date(new Date().getTime() + licenseData.leftdays * 24 * 60 * 60 *
                            1000).toLocaleDateString()
                    }) }}</label>
                </div>
            </button>
            <!-- 白标设置按钮 - 仅在解锁后显示 -->
            <button v-if="isWhiteLabelUnlocked" @click="openWhiteLabelDialog" class="p-1 hover:bg-gray-200 rounded"
                :title="$t('whitelabelSettings')">
                <font-awesome-icon icon="fa-solid fa-palette" class="h-6 w-6 text-base-content" />
            </button>
            <!-- 语言选择 -->
            <select class="select select-info select-md" v-model="currentLocale" @change="changeLocale">
                <option selected value="en">English</option>
                <option value="zh-CN">简体中文</option>
                <option value="ru">Русский</option>
            </select>

            <!-- 主题切换 -->
            <label class="swap swap-rotate">
                <input type="checkbox" class="theme-controller" value="dark" v-model="darkMode" @change="changeTheme" />
                <font-awesome-icon icon="fa-solid fa-sun" class="swap-off fill-current w-6 h-6 text-base-content" />
                <font-awesome-icon icon="fa-solid fa-moon" class="swap-on fill-current w-6 h-6 text-base-content" />
            </label>

            <!-- 窗口控制按钮 -->
            <div class="flex space-x-2">
                <button @click="minimizeWindow" class="p-1 hover:bg-gray-200 rounded">
                    <font-awesome-icon icon="fa-solid fa-minus" class="h-8 w-8 text-base-content" />
                </button>
                <button @click="maximizeWindow" class="p-1 hover:bg-gray-200 rounded">
                    <font-awesome-icon icon="fa fa-window-restore" class="h-8 w-8 text-base-content" />
                </button>
                <button @click="closeWindow" class="p-1 hover:bg-gray-200 rounded">
                    <font-awesome-icon icon="fa-solid fa-xmark" class="h-8 w-8 text-base-content" />
                </button>
            </div>
        </div>
    </div>

    <!-- 白标设置弹窗 -->
    <WhiteLabelDialog ref="whitelabelDialog" @config-updated="onWhiteLabelConfigUpdated" />

    <!-- 许可证管理弹窗 -->
    <LicenseManagementDialog ref="licenseManagementDialog" :license="licenseData" />


    <!-- 下载进度弹窗 -->
    <dialog ref="download_dialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ check_update_dialog_title }}</h3>
            <div class="modal-body">
                <div class="flex flex-row justify-between text-center items-center"
                    v-if="download_progress.filesize > 0">
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
import { Command } from '@tauri-apps/api/shell'
import AgentErrorDialog from './AgentErrorDialog.vue';
import { getWhiteLabelConfig } from '../config/whitelabel.js';
import { isFeatureUnlocked } from '../utils/features.js';

export default {
    name: 'TitleBar',
    components: {
        LicenseManagementDialog,
        WhiteLabelDialog,
        AgentErrorDialog
    },
    data() {
        return {
            version: '',
            name: '',
            sidebarVisible: true,
            darkMode: localStorage.getItem('isDark')?.replace(/"/g, '') || 'false',
            currentLocale: localStorage.getItem('locale')?.replace(/"/g, '') || 'en',
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
            agentErrorType: 'port', // 默认为端口问题
            whitelabelConfig: getWhiteLabelConfig(),
            isWhiteLabelUnlocked: isFeatureUnlocked('whiteLabel')
        }
    },
    watch: {
        sidebarVisible(val) {
            this.$emiter('sidebarChange', val);
        },
        darkMode(val) {
            localStorage.setItem('isDark', val);
        },
        currentLocale(val) {
            localStorage.setItem('locale', val);
            this.$i18n.locale = val;
        }
    },

    methods: {

        is_licensed() {
            return this.licenseData.leftdays > 0 || this.licenseData.is_stripe_active;
        },

        async startAgent() {
            try {
                this.$refs.download_dialog.showModal();
                this.check_update_dialog_title = 'Checking agent...';

                //check agent.exe is running
                let pname = await invoke("is_agent_running");
                console.log('agent_running:', pname)
                if (pname === '') {
                    console.log('agent is not running')
                    this.check_update_dialog_title = 'Starting agent...';
                    //check agent.exe is exists
                    const osType = await os.type();
                    const agentFilename = osType === 'Darwin' ? 'agent' : 'agent.exe';
                    let agent_exists = await exists(`bin/${agentFilename}`, { dir: BaseDirectory.AppData })
                    if (!agent_exists) {
                        console.log(`${agentFilename} not found`)
                        this.$refs.download_dialog.close();
                        // 使用自定义dialog显示agent未找到错误
                        this.agentErrorType = 'notfound';
                        this.$refs.agentErrorDialog.show();
                        return;
                    }
                    const command = new Command('start-agent', [])
                    command.on('close', data => {
                        console.log(`command exit: ${JSON.stringify(data)}`)
                    });
                    // command.on('error', error => console.error(`command error: "${error}"`));
                    // command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
                    // command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
                    const child = await command.spawn();
                    console.log('pid:', child.pid);
                    //write pid to file
                    await writeTextFile('agent.pid', `${child.pid}`, { dir: BaseDirectory.AppData });
                } else {
                    console.log('50809 port is used, process name:', pname)
                    this.$refs.download_dialog.close();
                    // 使用自定义dialog替代ask弹窗
                    this.agentProcessName = pname;
                    this.agentErrorType = 'port';
                    this.$refs.agentErrorDialog.show();
                }
            } catch (e) {
                let error = e.toString();
                await message(error, { title: 'Agent Start Error', type: 'error' });
            }
            console.log('waiting for agent startup')
            // wait for agent startup by listening to port
            for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 1000));
                const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
                if (port > 0) {
                    console.log('agent started')
                    await this.$emiter('agent_started', {})
                    this.$refs.download_dialog.close();
                    return;
                }
            }
            this.$refs.download_dialog.close();
            // 使用自定义dialog替代message弹窗
            this.agentErrorType = 'timeout';
            this.$refs.agentErrorDialog.show();
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
        changeTheme() {
            if (this.darkMode) {
                //invert logo color
                this.$refs.logo.style.filter = 'invert(1.0) brightness(1.0)';
            } else {
                this.$refs.logo.style.filter = 'none';
            }
        },
        showLicenseDialog() {
            // this.$refs.buyLicenseDialog.show()
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
                console.log(`license: ${JSON.stringify(this.licenseData)}`);
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
        async check_update(force) {
            let hasCheckedUpdate = localStorage.getItem('hasCheckedUpdate');
            if (hasCheckedUpdate && !force) {
                await this.startAgent();
                return;
            }
            this.check_update_dialog_title = 'Checking update...';
            this.$refs.download_dialog.showModal();
            const osType = await os.type();
            const arch = await os.arch();
            console.log('osType:', osType, 'arch:', arch);

            let platform = 'windows';
            if (osType === 'Darwin') {
                if (arch === 'aarch64') {
                    platform = 'mac-arm';
                } else {
                    platform = 'mac-intel';
                }
            }
            console.log('platform:', platform);

            if (platform === 'windows') {
                try {
                    const { shouldUpdate, manifest } = await checkUpdate();
                    if (shouldUpdate) {
                        console.log(
                            `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
                        );
                        const yes = await ask(`${manifest?.body}`, this.$t('updateConfirm'));
                        if (yes) {
                            this.check_update_dialog_title = 'Downloading update...';
                            await this.shutdown();
                            await installUpdate();
                            await relaunch();
                            return;
                        }
                    } else {
                        console.log('No update available');
                    }
                } catch (e) {
                    await message(e, { title: 'Start Error', type: 'error' });
                    this.$refs.download_dialog.close();
                    return;
                }
            }

            let response = null;
            try {

                response = await fetch(`https://api.tikmatrix.com/front-api/check_libs?time=${new Date().getTime()}`, {
                    method: 'GET',
                    timeout: 10,
                    responseType: ResponseType.JSON,
                    headers: {
                        'User-Agent': platform,
                        'X-App-Id': this.name
                    }
                });
                console.log('response:', response);
            } catch (e) {
                await message(e, { title: 'Check Libs Error', type: 'error' });
            }

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
                // 只有在首次检查更新或者 agent/script 有更新时才启动 agent
                if (!force || agentUpdated || scriptUpdated) {
                    await this.startAgent();
                }
                localStorage.setItem('hasCheckedUpdate', 'true');
                this.$refs.download_dialog.close();
            } else {
                this.$refs.download_dialog.close();
                await message('Failed to check for updates', { title: 'Error', type: 'error' });
            }
        },
        // 新增方法：统一处理库的下载和更新
        async download_and_update_lib(lib, localStorageKey) {
            try {
                let updated = false;
                this.check_update_dialog_title = `Checking ${lib.name} update...`;
                let localversion = localStorage.getItem(localStorageKey) || '0';
                localversion = localversion.replace(/"/g, '');
                let url = lib.downloadUrl;
                let work_path = await appDataDir();
                let name = url.split('/').pop();
                //先下载到tmp目录
                let path = work_path + 'tmp/' + name;
                let downloaded = await exists('tmp/' + name, { dir: BaseDirectory.AppData });
                console.log(`check_file_update: ${lib.name} localversion: ${localversion} remoteVersion: ${lib.version}`);

                if (!downloaded || localversion !== lib.version) {
                    console.log(`downloading ${lib.name} from ${url} to ${path}`);
                    // 使用版本号作为缓存参数，提高CDN缓存命中率
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

                localStorage.setItem(localStorageKey, lib.version);

                // 根据不同类型的库执行特定的更新操作
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
                return updated;
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

        // 白标相关方法
        openWhiteLabelDialog() {
            this.$refs.whitelabelDialog.showDialog();
        },

        onWhiteLabelConfigUpdated(config) {
            this.whitelabelConfig = config;
            // 更新页面标题
            document.title = config.appName || 'TikZenX';
            // 可以触发其他需要更新的组件
            this.$emit('whitelabel-updated', config);
        },

        // 静默更新方法
        async performSilentUpdate() {
            console.log('开始执行静默更新...');
            try {
                let hasCheckedUpdate = localStorage.getItem('hasCheckedUpdate');
                // 强制检查更新，忽略hasCheckedUpdate状态
                localStorage.removeItem('hasCheckedUpdate');

                const osType = await os.type();
                const arch = await os.arch();
                console.log('osType:', osType, 'arch:', arch);

                let platform = 'windows';
                if (osType === 'Darwin') {
                    if (arch === 'aarch64') {
                        platform = 'mac-arm';
                    } else {
                        platform = 'mac-intel';
                    }
                }

                // 静默检查系统更新（仅Windows）
                if (platform === 'windows') {
                    try {
                        const { shouldUpdate, manifest } = await checkUpdate();
                        if (shouldUpdate) {
                            console.log('发现系统更新，但静默更新不安装系统更新，跳过');
                        }
                    } catch (e) {
                        console.log('检查系统更新失败:', e);
                    }
                }

                // 检查库更新
                let response = null;
                try {
                    response = await fetch(`https://api.tikmatrix.com/front-api/check_libs?time=${new Date().getTime()}`, {
                        method: 'GET',
                        timeout: 10,
                        responseType: ResponseType.JSON,
                        headers: {
                            'User-Agent': platform,
                            'X-App-Id': this.name
                        }
                    });
                    console.log('静默更新 - 库检查响应:', response);
                } catch (e) {
                    console.log('静默更新 - 检查库失败:', e);
                    return;
                }

                if (response?.ok && response?.data?.code === 20000) {
                    const libs = response.data.data.libs;
                    let hasUpdates = false;

                    for (const lib of libs) {
                        const updated = await this.silentDownloadAndUpdateLib(lib, this.getLibStorageKey(lib.name));
                        if (updated) {
                            hasUpdates = true;
                        }
                    }

                    if (hasUpdates) {
                        console.log('静默更新完成，发现并安装了更新');
                        // 发送通知但不弹窗
                        await this.$emiter('NOTIFY', {
                            type: 'success',
                            message: '后台自动更新已完成',
                            timeout: 3000
                        });
                    } else {
                        console.log('静默更新完成，没有发现新的更新');
                    }

                    localStorage.setItem('hasCheckedUpdate', 'true');
                } else {
                    console.log('静默更新 - 检查更新失败');
                }
            } catch (error) {
                console.error('静默更新失败:', error);
            }
        },

        // 获取库对应的本地存储键
        getLibStorageKey(libName) {
            const libKeyMap = {
                'platform-tools': 'platform-tools',
                'PaddleOCR': 'PaddleOCR',
                'apk': 'apk',
                'test-apk': 'test-apk',
                'scrcpy': 'scrcpy',
                'script': 'script',
                'agent': 'agent'
            };
            return libKeyMap[libName] || libName;
        },

        // 静默下载和更新库
        async silentDownloadAndUpdateLib(lib, localStorageKey) {
            try {
                let localversion = localStorage.getItem(localStorageKey) || '0';
                localversion = localversion.replace(/"/g, '');

                console.log(`静默检查 ${lib.name}: 本地版本 ${localversion}, 远程版本 ${lib.version}`);

                if (localversion === lib.version) {
                    return false; // 无需更新
                }

                let url = lib.downloadUrl;
                let work_path = await appDataDir();
                let name = url.split('/').pop();
                let path = work_path + 'tmp/' + name;

                console.log(`静默下载 ${lib.name} 从 ${url}`);
                // 使用版本号作为缓存参数，提高CDN缓存命中率
                await invoke('download_file_with_version', {
                    url,
                    path,
                    version: lib.version
                });

                localStorage.setItem(localStorageKey, lib.version);

                // 执行特定的更新操作（静默版本，不显示进度）
                await this.silentUpdateLib(lib, path, work_path);

                console.log(`静默更新 ${lib.name} 完成`);
                return true; // 已更新
            } catch (e) {
                console.error(`静默更新 ${lib.name} 失败:`, e);
                return false;
            }
        },

        // 静默更新库（无UI反馈）
        async silentUpdateLib(lib, path, work_path) {
            if (lib.name === 'platform-tools') {
                const osType = await os.type();
                const adbFileName = osType === 'Darwin' ? 'adb' : 'adb.exe';
                let adb_exists = await exists(`platform-tools/${adbFileName}`, { dir: BaseDirectory.AppData });
                if (!adb_exists) {
                    await invoke("kill_process", { name: "adb" });
                    await new Promise(r => setTimeout(r, 3000));
                    await invoke("unzip_file", { zipPath: path, destDir: work_path });
                    await invoke("grant_permission", { path: "platform-tools/adb" });
                }
            } else if (lib.name === 'PaddleOCR') {
                const osType = await os.type();
                const paddleFileName = osType === 'Darwin' ? 'PaddleOCR-json' : 'PaddleOCR-json.exe';
                let paddle_exists = await exists(`PaddleOCR-json/${paddleFileName}`, { dir: BaseDirectory.AppData });
                if (!paddle_exists) {
                    await invoke("kill_process", { name: "PaddleOCR-json" });
                    await invoke("unzip_file", { zipPath: path, destDir: work_path });
                }
            } else if (lib.name === 'apk' || lib.name === 'test-apk' || lib.name === 'scrcpy') {
                await copyFile(path, path.replace('tmp', 'bin'));
            } else if (lib.name === 'script' || lib.name === 'agent') {
                await invoke("kill_process", { name: lib.name });
                await new Promise(r => setTimeout(r, 3000));
                await copyFile(path, path.replace('tmp', 'bin'));
                await invoke("grant_permission", { path: `bin/${lib.name}` });
            }
        },
    },
    async mounted() {
        // 设置主题
        console.log('darkMode:', this.darkMode);
        this.darkMode = this.darkMode === 'true' || this.darkMode === true;
        if (this.darkMode) {
            console.log('set dark theme');
            //invert logo color
            this.$refs.logo.style.filter = 'invert(1.0) brightness(1.0)';
        } else {
            this.$refs.logo.style.filter = 'none';
        }
        // 获取版本号
        this.version = await getVersion();
        this.name = await getName();
        // 设置当前语言
        this.$i18n.locale = this.currentLocale;
        console.log('currentLocale:', this.currentLocale);

        // 检查功能解锁状态
        this.isWhiteLabelUnlocked = isFeatureUnlocked('whiteLabel');

        // 监听下载进度
        await this.$listen("DOWNLOAD_PROGRESS", async (e) => {
            this.download_progress = e.payload;
        });

        // 监听下载完成
        await this.$listen("DOWNLOAD_FINISHED", async (e) => {
            console.log("download finished");
            this.download_progress = {
                filesize: 0,
                transfered: 0,
                transfer_rate: 0,
                percentage: 0
            };
        });

        // 监听LICENSE事件
        await this.$listen("LICENSE", async (e) => {
            if (e.payload.reload) {
                await this.loadLicense();
            }

            if (e.payload.show) {
                this.showLicenseDialog();
            }
        });

        // 监听代理启动事件
        await this.$listen('agent_started', async (e) => {
            await this.loadLicense();
            if (!this.is_licensed()) {
                this.showLicenseDialog();
            }
        });

        // 监听功能解锁事件
        await this.$listen('featureUnlocked', async (e) => {
            this.isWhiteLabelUnlocked = isFeatureUnlocked('whiteLabel');
        });

        // 监听自动更新触发事件
        await this.$listen('AUTO_UPDATE_TRIGGER', async (e) => {
            console.log('收到自动更新触发信号');
            const { silent } = e.payload || {};
            if (silent) {
                // 静默更新，不显示弹窗
                await this.performSilentUpdate();
            } else {
                // 常规更新
                await this.check_update(true);
            }
        });

        this.check_update();
    }
}
</script>
