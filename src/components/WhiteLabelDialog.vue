<template>
    <dialog ref="whitelabelDialog" class="modal">
        <div class="modal-box max-w-4xl">
            <h3 class="font-bold text-lg mb-4">{{ $t('whitelabelSettings') }}</h3>

            <div class="tabs tabs-boxed mb-6">
                <a class="tab" :class="{ 'tab-active': activeTab === 'basic' }" @click="activeTab = 'basic'">
                    {{ $t('basicSettings') }}
                </a>
                <a class="tab" :class="{ 'tab-active': activeTab === 'branding' }" @click="activeTab = 'branding'">
                    {{ $t('brandingSettings') }}
                </a>
                <a class="tab" :class="{ 'tab-active': activeTab === 'preview' }" @click="activeTab = 'preview'">
                    {{ $t('preview') }}
                </a>
            </div>

            <!-- 基本设置 -->
            <div v-show="activeTab === 'basic'" class="space-y-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('applicationName') }}</span>
                    </label>
                    <input type="text" v-model="localConfig.appName" class="input input-bordered"
                        :placeholder="$t('enterApplicationName')" />
                </div>

                <!-- Logo上传 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('mainLogo') }}</span>
                    </label>
                    <div class="flex items-center space-x-4">
                        <img :src="logoPreview" class="w-16 h-16 object-contain border rounded" />
                        <div class="flex flex-col space-y-2">
                            <input type="file" ref="logoFile" @change="handleLogoUpload" accept="image/*"
                                class="file-input file-input-bordered file-input-sm" />
                            <div class="text-xs text-gray-500">
                                {{ $t('logoSizeHint') }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 功能开关 -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('featureToggles') }}</span>
                    </label>
                    <div class="space-y-2">
                        <label class="cursor-pointer label">
                            <span class="label-text">{{ $t('showTutorial') }}</span>
                            <input type="checkbox" v-model="localConfig.features.showTutorial" class="checkbox" />
                        </label>
                        <label class="cursor-pointer label">
                            <span class="label-text">{{ $t('showBranding') }}</span>
                            <input type="checkbox" v-model="localConfig.features.showBranding" class="checkbox" />
                        </label>
                    </div>
                </div>
            </div>

            <!-- 品牌设置 -->
            <div v-show="activeTab === 'branding'" class="space-y-4">
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('supportEmail') }}</span>
                    </label>
                    <input type="email" v-model="localConfig.branding.supportEmail" class="input input-bordered"
                        :placeholder="$t('enterSupportEmail')" />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('tutorialUrl') }}</span>
                    </label>
                    <input type="url" v-model="localConfig.branding.tutorialUrl" class="input input-bordered"
                        :placeholder="$t('enterTutorialUrl')" />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('telegramUrl') }}</span>
                    </label>
                    <input type="url" v-model="localConfig.branding.telegramUrl" class="input input-bordered"
                        :placeholder="$t('enterTelegramUrl')" />
                </div>
            </div>

            <!-- 预览 -->
            <div v-show="activeTab === 'preview'" class="space-y-4">
                <div class="mockup-window border bg-base-300">
                    <div class="flex justify-center bg-base-200">
                        <!-- 模拟标题栏 -->
                        <div
                            class="h-12 bg-base-100 select-none flex items-center justify-between w-full px-4 shadow-md">
                            <div class="flex items-center space-x-2">
                                <img :src="logoPreview" class="h-10 w-10" />
                                <span class="text-2xl text-base-content font-bold">{{ localConfig.appName }}</span>
                                <span class="text-md text-base-content">v2.7.4</span>
                            </div>
                            <div class="flex-1"></div>
                            <div class="flex items-center space-x-4">
                                <span class="text-sm">{{ $t('previewMode') }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center text-sm text-gray-500">
                    {{ $t('previewDescription') }}
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="modal-action">
                <button class="btn btn-ghost" @click="closeDialog">{{ $t('cancel') }}</button>
                <button class="btn btn-warning" @click="resetToDefault">{{ $t('resetToDefault') }}</button>
                <button class="btn btn-primary" @click="exportConfig">{{ $t('exportConfig') }}</button>
                <button class="btn btn-secondary" @click="importConfig">{{ $t('importConfig') }}</button>
                <button class="btn btn-success" @click="saveConfig">{{ $t('save') }}</button>
            </div>

            <!-- 隐藏的文件输入 -->
            <input type="file" ref="configFile" @change="handleConfigImport" accept=".json" style="display: none" />
        </div>
    </dialog>
</template>

<script>
import { getWhiteLabelConfig, saveWhiteLabelConfig, resetWhiteLabelConfig, validateWhiteLabelConfig } from '../config/whitelabel.js';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { save, open } from '@tauri-apps/api/dialog';

export default {
    name: 'WhiteLabelDialog',
    data() {
        return {
            activeTab: 'basic',
            localConfig: {},
            logoPreview: '',
        };
    },
    mounted() {
        this.loadConfig();
    },
    methods: {
        loadConfig() {
            this.localConfig = JSON.parse(JSON.stringify(getWhiteLabelConfig()));
            this.logoPreview = this.localConfig.logo?.main || '';

            // 确保所有必需的对象都存在
            if (!this.localConfig.features) {
                this.localConfig.features = {
                    showTutorial: true,
                    showRewards: true,
                    showBranding: true,
                    customTheme: false,
                };
            }
            if (!this.localConfig.branding) {
                this.localConfig.branding = {
                    supportEmail: 'admin@tikzenx.com',
                    tutorialUrl: 'https://tikzenx.com/docs/intro',
                    rewardsUrl: 'https://tikzenx.com/rewards',
                    telegramUrl: 'https://t.me/tikmatrix',
                };
            }
            if (!this.localConfig.theme) {
                this.localConfig.theme = {
                    primaryColor: '#3b82f6',
                    secondaryColor: '#10b981',
                    accentColor: '#f59e0b',
                };
            }
            if (!this.localConfig.logo) {
                this.localConfig.logo = {
                    main: '/src/assets/app-icon.png',
                    favicon: '/favicon.ico',
                    titleBar: '/src/assets/app-icon.png',
                };
            }
        },

        async handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('invalidImageFile'),
                    timeout: 3000
                });
                return;
            }

            // 验证文件大小 (2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('fileTooLarge'),
                    timeout: 3000
                });
                return;
            }

            // 创建预览
            const reader = new FileReader();
            reader.onload = (e) => {
                this.logoPreview = e.target.result;
                // 确保logo对象存在
                if (!this.localConfig.logo) {
                    this.localConfig.logo = {};
                }
                this.localConfig.logo.main = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        async saveConfig() {
            try {
                validateWhiteLabelConfig(this.localConfig);

                if (saveWhiteLabelConfig(this.localConfig)) {
                    await this.$emiter('NOTIFY', {
                        type: 'success',
                        message: this.$t('configSaved'),
                        timeout: 3000
                    });
                    this.$emit('config-updated', this.localConfig);
                    this.closeDialog();
                } else {
                    await this.$emiter('NOTIFY', {
                        type: 'error',
                        message: this.$t('configSaveFailed'),
                        timeout: 3000
                    });
                }
            } catch (error) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: error.message,
                    timeout: 3000
                });
            }
        },

        async resetToDefault() {
            // 使用确认对话框
            try {
                const { ask } = await import('@tauri-apps/api/dialog');
                const confirmed = await ask(this.$t('confirmResetConfig'), {
                    title: this.$t('whitelabelSettings'),
                    type: 'warning'
                });

                if (confirmed) {
                    this.localConfig = JSON.parse(JSON.stringify(resetWhiteLabelConfig()));
                    this.logoPreview = this.localConfig.logo?.main || '';
                    await this.$emiter('NOTIFY', {
                        type: 'success',
                        message: this.$t('resetToDefault'),
                        timeout: 3000
                    });
                }
            } catch (error) {
                console.error('Reset config error:', error);
            }
        },

        async exportConfig() {
            try {
                const filePath = await save({
                    filters: [{
                        name: 'JSON',
                        extensions: ['json']
                    }],
                    defaultPath: 'whitelabel-config.json'
                });

                if (filePath) {
                    await writeTextFile(filePath, JSON.stringify(this.localConfig, null, 2));
                    await this.$emiter('NOTIFY', {
                        type: 'success',
                        message: this.$t('configExported'),
                        timeout: 3000
                    });
                }
            } catch (error) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('exportFailed'),
                    timeout: 3000
                });
                console.error('Export failed:', error);
            }
        },

        importConfig() {
            this.$refs.configFile.click();
        },

        async handleConfigImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const config = JSON.parse(text);

                validateWhiteLabelConfig(config);

                this.localConfig = { ...this.localConfig, ...config };
                this.logoPreview = this.localConfig.logo?.main || '';

                await this.$emiter('NOTIFY', {
                    type: 'success',
                    message: this.$t('configImported'),
                    timeout: 3000
                });
            } catch (error) {
                await this.$emiter('NOTIFY', {
                    type: 'error',
                    message: this.$t('importFailed') + ': ' + error.message,
                    timeout: 3000
                });
                console.error('Import failed:', error);
            }
        },

        showDialog() {
            this.loadConfig();
            this.$refs.whitelabelDialog.showModal();
        },

        closeDialog() {
            this.$refs.whitelabelDialog.close();
        }
    }
};
</script>
