<template>
    <div data-tauri-drag-region
        class="h-12 bg-base-100 select-none flex items-center justify-between fixed top-0 left-0 right-0 z-50 px-4 shadow-md">
        <!-- 左侧：应用图标、名称、版本和检查更新 -->
        <div class="flex items-center space-x-2">
            <font-awesome-icon icon="fa-brands fa-tiktok" class="text-base-content h-10 w-10" />
            <span class="text-2xl text-base-content font-bold">{{ $t('siteName') }}</span>
            <span class="text-sm text-base-content">v{{ version }}</span>
            <!-- 检查更新按钮 -->
            <button @click="check_update(true)"
                class="flex items-center space-x-1 text-sm text-info ml-2 hover:underline">
                <font-awesome-icon icon="fa-solid fa-sync" class="h-4 w-4" />
                <span>{{ $t('checkUpdate') }}</span>
            </button>
        </div>
        <!-- 教程链接 -->
        <a class="flex items-center space-x-1 text-sm text-info ml-2 hover:underline"
            :href="$t('siteUrl') + '/docs/intro'" target="_blank">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="h-4 w-4" />
            <span>{{ $t('tutorial') }}</span>
        </a>
        <!-- Rewards-->
        <a class="flex items-center space-x-1 text-sm text-info ml-2 hover:underline" :href="$t('siteUrl') + '/rewards'"
            target="_blank">
            <font-awesome-icon icon="fa-solid fa-gift" class="h-4 w-4" />
            <span>{{ $t('rewards') }}</span>
        </a>
        <!-- 中间：灵活空间 -->
        <div class="flex-1"></div>
        <!-- 右侧：功能按钮和控制按钮 -->
        <div class="flex items-center space-x-4">
            <!-- 侧边栏切换 -->
            <label class="swap swap-rotate" :title="$t('toggleSidebar')">
                <input type="checkbox" value="true" v-model="sidebarVisible" />
                <font-awesome-icon icon="fa fa-bars" class="swap-off fill-current w-6 h-6 text-base-content" />
                <font-awesome-icon icon="fa fa-bars" class="swap-on fill-current w-6 h-6 text-base-content" />
            </label>
            <!-- 许可证状态 -->
            <button
                class="flex items-center space-x-1 text-sm px-3 py-1 rounded-full transition-transform duration-300 transform hover:scale-105"
                :class="[
                    isLoadingLicense ? 'bg-gray-500 text-white' :
                        licenseData.leftdays > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                ]" @click="showLicenseDialog" :title="isLoadingLicense ? $t('loadingLicense') :
                    licenseData.leftdays > 0 ? $t('licenseValid', { days: licenseData.leftdays }) :
                        $t('activateLicense')">
                <font-awesome-icon v-if="isLoadingLicense" icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
                <font-awesome-icon v-else :icon="licenseData.leftdays > 0 ? 'fa fa-key' : 'fa fa-lock'"
                    class="h-4 w-4" />
                <span v-if="isLoadingLicense">{{ $t('loading') }}</span>
                <span v-else-if="licenseData.leftdays > 0">{{ $t('licensed') }} ({{ licenseData.leftdays }} {{
                    $t('days') }})</span>
                <span v-else>{{ $t('unlicensed') }}</span>
            </button>
            <!-- 语言选择 -->
            <select class="select select-info select-sm" v-model="currentLocale" @change="changeLocale">
                <option selected value="en">English</option>
                <option value="zh-CN">简体中文</option>
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

    <!-- 购买授权弹窗 -->
    <BuyLicense ref="buyLicenseDialog" :license="licenseData" />


    <!-- 下载进度弹窗 -->
    <dialog ref="download_dialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ check_update_dialog_title }}</h3>
            <div class="modal-body">
                <div class="flex flex-row justify-between text-center items-center"
                    v-if="download_progress.filesize > 0">
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
import { appWindow } from '@tauri-apps/api/window';
import { getAll } from '@tauri-apps/api/window';
import { ask, message } from '@tauri-apps/api/dialog';
import { invoke } from "@tauri-apps/api/tauri";
import { readTextFile, writeTextFile, exists, copyFile } from '@tauri-apps/api/fs';
import { BaseDirectory } from '@tauri-apps/api/fs';
import * as util from '../utils';
import { getVersion } from '@tauri-apps/api/app';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { appDataDir } from '@tauri-apps/api/path';
import { os } from '@tauri-apps/api';
import BuyLicense from './settings/BuyLicense.vue';
import { Command } from '@tauri-apps/api/shell'
import { open } from '@tauri-apps/api/shell';

export default {
    name: 'TitleBar',
    components: {
        BuyLicense
    },
    data() {
        return {
            version: '',
            sidebarVisible: true,
            darkMode: util.getData('isDark') || '0',
            currentLocale: util.getData('locale') || 'en',
            licenseData: {},
            remote_version: {},
            download_progress: {
                filesize: 0,
                transfered: 0,
                transfer_rate: 0,
                percentage: 0
            },
            check_update_dialog_title: '',
            isLoadingLicense: true
        }
    },
    watch: {
        sidebarVisible(val) {
            this.$emiter('sidebarChange', val);
        },
        darkMode(val) {
            util.setData('isDark', val);
            console.log('isDark:', val);
        },
        currentLocale(val) {
            util.setData('locale', val);
            this.$i18n.locale = val;
        }
    },
    methods: {

        async start_agent() {
            console.log('start_agent')
            this.$refs.download_dialog.showModal();
            this.check_update_dialog_title = 'Checking agent...';
            try {
                //check agent.exe is running
                let agent_running = await invoke("is_agent_running");
                console.log('agent_running:', agent_running)
                if (!agent_running) {
                    console.log('agent is not running')
                    this.check_update_dialog_title = 'Starting agent...';
                    //check agent.exe is exists
                    let agent_exists = await exists('bin/agent.exe', { dir: BaseDirectory.AppData })
                    if (!agent_exists) {
                        console.log('agent.exe not found')
                        return;
                    }
                    const command = new Command('start-agent', [])
                    command.on('close', data => {
                        console.log(`command finished with code ${data.code} and signal ${data.signal}`)
                    });
                    command.on('error', error => console.error(`command error: "${error}"`));
                    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
                    command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
                    const child = await command.spawn();
                    console.log('pid:', child.pid);
                    //write pid to file
                    await writeTextFile('agent.pid', `${child.pid}`, { dir: BaseDirectory.AppData });
                } else {
                    console.log('agent is running')
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
                    await this.$emiter('agent_started', {})
                    await this.$emiter('reload_tasks', {})
                    this.$refs.download_dialog.close();
                    return;
                }
            }
            this.$refs.download_dialog.close();
            await message('Agent Start Timeout', { title: 'Error', type: 'error' });
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
            // 主题切换逻辑
        },
        showLicenseDialog() {
            this.$refs.buyLicenseDialog.show()
        },
        async loadLicense() {
            this.isLoadingLicense = true;
            try {
                const res = await this.$service.get_license();
                console.log(`loadLicense: ${JSON.stringify(res)}`);
                if (res.code === 0) {
                    this.licenseData = JSON.parse(res.data);
                    if (this.licenseData.leftdays <= 0 && !this.licenseData.github_starred) {
                        this.showLicenseDialog();
                    }
                } else {
                    await message(res.data, { title: 'Load License Error', type: 'error' });
                }
                console.log(`license: ${JSON.stringify(this.licenseData)}`);
            } catch (error) {
                // await message(error, { title: 'Load License Error', type: 'error' });
            } finally {
                this.isLoadingLicense = false;
            }
        },
        async check_update(force) {
            let hasCheckedUpdate = localStorage.getItem('hasCheckedUpdate');
            if (hasCheckedUpdate && !force) {
                await this.start_agent();
                return;
            }
            this.check_update_dialog_title = 'Checking update...';
            this.$refs.download_dialog.showModal();
            try {
                const { shouldUpdate, manifest } = await checkUpdate();
                if (shouldUpdate) {
                    console.log(
                        `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
                    );
                    const yes = await ask(`${manifest?.body}`, this.$t('updateConfirm'));
                    if (yes) {
                        this.check_update_dialog_title = 'Downloading update...';
                        await installUpdate();
                        await this.shutdown();
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

            let response = null;
            try {
                response = await fetch('https://pro.api.tikmatrix.com/front-api/check_core_update?time=' + new Date().getTime(), {
                    method: 'GET',
                    timeout: 10,
                    responseType: ResponseType.JSON,
                });
                console.log('response:', response);
            } catch (e) {
                await message(e, { title: 'Check Core Update Error', type: 'error' });
            }

            if (response.ok) {
                this.remote_version = response.data;
                await this.check_platform_tools();
                await this.check_ocr();
                await this.check_apk();
                await this.check_test_apk();
                await this.check_scrcpy();
                await this.check_script();
                await this.check_agent();
                await this.start_agent();
                localStorage.setItem('hasCheckedUpdate', 'true');
            }
        },
        async check_ocr() {
            let work_path = await appDataDir();
            let url = this.remote_version.ocr_windows_url;
            let { path, updated } = await this.check_file_update('PaddleOCR', this.remote_version.ocr_version, url);
            //check paddle file exists
            let paddle_exists = await exists('PaddleOCR-json/PaddleOCR-json.exe', { dir: BaseDirectory.AppData });
            if (updated || !paddle_exists) {
                this.check_update_dialog_title = 'Uziping PaddleOCR-json.zip';
                //kill PaddleOCR-json.exe
                await invoke("kill_process", { name: "PaddleOCR-json" });
                await invoke("unzip_file", { zipPath: path, destDir: work_path });
            }
        },
        async check_platform_tools() {
            let work_path = await appDataDir();
            let url = "";
            const osType = await os.type();
            if (osType === 'Darwin') {
                url = this.remote_version.platform_tools_mac_url;
            } else if (osType === 'Windows_NT') {
                url = this.remote_version.platform_tools_windows_url;
            } else {
                console.log('Unknown OS type');
                return;
            }
            let { path, updated } = await this.check_file_update('platform_tools', this.remote_version.platform_tools_version, url);
            let adb_exists = await exists('platform-tools/adb.exe', { dir: BaseDirectory.AppData });
            if (updated || !adb_exists) {
                this.check_update_dialog_title = 'Uziping platform-tools-latest-windows.zip';
                //kill adb.exe
                await invoke("kill_process", { name: "adb" });
                //wait for adb to be killed
                await new Promise(r => setTimeout(r, 3000));
                //unzip to platform-tools
                await invoke("unzip_file", { zipPath: path, destDir: work_path });
                await invoke("grant_permission", { path: "platform-tools/adb" });
            }
        },
        async check_apk() {
            let url = this.remote_version.apk_url;
            let { path, updated } = await this.check_file_update('apk', this.remote_version.apk_version, url);
            if (updated) {
                //copy apk to bin
                await copyFile(path, path.replace('tmp', 'bin'));
            }
        },
        async check_test_apk() {
            let url = this.remote_version.test_apk_url;
            let { path, updated } = await this.check_file_update('test_apk', this.remote_version.test_apk_version, url);
            if (updated) {
                //copy test_apk to bin
                await copyFile(path, path.replace('tmp', 'bin'));
            }
        },
        async check_scrcpy() {
            let url = this.remote_version.scrcpy_url;
            let { path, updated } = await this.check_file_update('scrcpy', this.remote_version.scrcpy_version, url);
            if (updated) {
                //copy scrcpy to bin
                await copyFile(path, path.replace('tmp', 'bin'));
            }
        },
        async check_script() {
            let url = "";
            const osType = await os.type();
            if (osType === 'Darwin') {
                url = this.remote_version.script_mac_url;
            } else if (osType === 'Windows_NT') {
                url = this.remote_version.script_windows_url;
            } else {
                console.log('Unknown OS type');
                return;
            }
            let { path, updated } = await this.check_file_update('script', this.remote_version.script_version, url);
            if (updated) {
                //kill script.exe
                await invoke("kill_process", { name: "script" });
                //wait for script to be killed
                await new Promise(r => setTimeout(r, 3000));
                //copy script to bin
                await copyFile(path, path.replace('tmp', 'bin'));
                //grant permission
                await invoke("grant_permission", { path: "bin/script" });
            }
        },
        async check_agent() {
            let url = "";
            const osType = await os.type();
            if (osType === 'Darwin') {
                url = this.remote_version.agent_mac_url;
            } else if (osType === 'Windows_NT') {
                url = this.remote_version.agent_windows_url;
            } else {
                console.log('Unknown OS type');
                return;
            }
            let { path, updated } = await this.check_file_update('agent', this.remote_version.agent_version, url);
            if (updated) {
                //kill agent.exe
                console.log('kill agent');
                await invoke("kill_process", { name: "agent" });
                //wait for agent to be killed
                await new Promise(r => setTimeout(r, 3000));
                console.log('copy agent to bin');
                //copy agent to bin
                await copyFile(path, path.replace('tmp', 'bin'));
                //grant permission
                await invoke("grant_permission", { path: "bin/agent" });
            }
        },
        async check_file_update(filename, remoteVersion, downloadUrl) {
            let updated = false;
            this.check_update_dialog_title = `Checking ${filename} update...`;
            let localversion = util.getData(filename);
            if (!localversion) {
                localversion = 0;
            }
            let url = downloadUrl;
            let work_path = await appDataDir();
            let name = url.split('/').pop();
            //先下载到tmp目录
            let path = work_path + 'tmp/' + name;
            let downloaded = await exists('tmp/' + name, { dir: BaseDirectory.AppData });
            console.log(`check_file_update: ${filename} localversion: ${localversion} remoteVersion: ${remoteVersion}`);
            if (!downloaded || localversion !== remoteVersion) {
                console.log("downloading " + filename + " from " + downloadUrl + " to " + path);
                url = url + '?t=' + new Date().getTime();
                await invoke('download_file', { url, path }).catch(async (e) => {
                    console.error(e);
                    await message('Download Error', { title: 'Error', type: 'error' });
                    return;
                });
                updated = true;
            } else {
                console.log(filename + " no need to update");
            }
            util.setData(filename, remoteVersion);
            return { path, updated };
        }
    },
    async mounted() {
        // 获取版本号
        this.version = await getVersion();

        // 设置当前语言
        this.$i18n.locale = this.currentLocale;

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
                if (this.licenseData.leftdays <= 0 && !this.licenseData.github_starred) {
                    this.showLicenseDialog();
                }
            }
        });

        // 监听代理启动事件
        await this.$listen('agent_started', async () => {
            this.loadLicense();
        });

        // 初始加载许可证信息
        this.loadLicense();
        this.check_update();
    }
}
</script>
