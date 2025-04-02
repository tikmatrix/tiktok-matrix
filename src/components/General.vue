<template>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', settings.packagename + '/com.ss.android.ugc.aweme.splash.SplashActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-primary-content" />
        {{ $t('openTiktok') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'force-stop', settings.packagename] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-yellow-500" />
        {{ $t('stopTiktok') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="$refs.clear_cache_dialog.showModal()">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-pink-500" />
        {{ $t('clearData') }}
    </button>

    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="grantTikTok">
        <font-awesome-icon icon="fa fa-hand-holding-usd" class="h-3 w-3 text-success" />
        {{ $t('grantTikTok') }}
    </button>

    
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="app_install">
        <font-awesome-icon icon="fa fa-download" class="h-3 w-3 text-primary-content" />
        {{ $t('installApk') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="$refs.uninstall_dialog.showModal()">
        <font-awesome-icon icon="fa-brands fa-android" class="h-3 w-3 text-primary-content" />
        {{ $t('uninstallApk') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="uploadVideo">
        <font-awesome-icon icon="fa fa-upload" class="h-3 w-3 text-primary-content" />
        {{ $t('uploadToGallery') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="clearGallery">
        <font-awesome-icon icon="fa fa-eraser" class="h-3 w-3 text-primary-content" />
        {{ $t('clearGallery') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="$emiter('initDevice')">
        <font-awesome-icon icon="fa fa-undo" class="h-3 w-3 text-pink-500" />
        {{ $t('initAppAgent') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.github.tikmatrix/.MainActivity'] })">
        <font-awesome-icon icon="fa fa-play" class="h-3 w-3 text-success" />
        {{ $t('openAppAgent') }}
    </button>

    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="$refs.proxy_dialog.show()">
        <font-awesome-icon icon="fa fa-server" class="h-3 w-3" />
        {{ $t('setProxy') }}
    </button>



    <button class="btn btn-md btn-primary ml-1 mb-1" @click="$refs.resolution_dialog.show()">
        <font-awesome-icon icon="fa fa-tv" class="h-3 w-3" />
        {{ $t('adjustResolution') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1" @click="$emiter('send_screen_mode', 'off')">
        <font-awesome-icon icon="fa fa-power-off" class="h-3 w-3 text-primary-content" />
        {{ $t('screenOff') }}
    </button>
    <div>
        <label class="label">
            <span class="label-text">{{ $t('screenScaled') }}: {{ screenScaled }}%</span>
        </label>
        <input type="range" min="50" max="150" v-model="screenScaled" class="range range-primary"
            @change="updateScreenSize" />
        <div role="alert" class="alert alert-info alert-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="h-6 w-6 shrink-0 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('screenScaledNote') }}</span>
        </div>
    </div>
    <dialog ref="uninstall_dialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('inputPackageName') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-md" type="text" v-model="uninstall_package" />
            </div>
            <button class="btn btn-md btn-success ml-2" @click="uninstallApk">{{
                $t('confirm') }}</button>

        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="proxy_dialog" class="modal">
        <div class="modal-box bg-base-300">
            <h3 class="font-bold text-lg">{{ $t('proxyServer') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-md w-40" type="text" v-model="proxy_host" />
                <span class="font-bold p-1">:</span>
                <input class="input input-bordered input-md w-20" type="number" v-model="proxy_port" />
            </div>
            <button class="btn btn-md btn-success ml-2" @click="enableProxy">{{ $t('enableProxy') }}</button>
            <button class="btn btn-md btn-warning ml-2" @click="disableProxy">{{ $t('disableProxy') }}</button>

        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>



    <dialog ref="resolution_dialog" class="modal">
        <div class="modal-box bg-base-300">
            <h3 class="font-bold text-lg">{{ $t('adjustResolution') }}</h3>
            <div class="flex flex-col p-2 gap-4">
                <div class="flex flex-wrap gap-2">
                    <button class="btn btn-md" :class="{ 'btn-active': resolution === 256 }"
                        @click="setResolution(256)">
                        {{ $t('lowResolution') }} (256px)
                    </button>
                    <button class="btn btn-md" :class="{ 'btn-active': resolution === 512 }"
                        @click="setResolution(512)">
                        {{ $t('highResolution') }} (512px)
                    </button>
                    <button class="btn btn-md" :class="{ 'btn-active': resolution === 720 }"
                        @click="setResolution(720)">
                        {{ $t('ultraResolution') }} (720px)
                    </button>
                    <button class="btn btn-md" :class="{ 'btn-active': resolution === 1080 }"
                        @click="setResolution(1080)">
                        {{ $t('fullHD') }} (1080px)
                    </button>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">{{ $t('customResolution') }}</span>
                    </label>
                    <div class="flex items-center gap-2">
                        <input type="number" v-model="customResolution" min="128" max="1920" step="16"
                            class="input input-bordered input-md w-24" />
                        <span>px</span>
                        <button @click="setResolution(Number(customResolution))" class="btn btn-md btn-primary"
                            :disabled="!isValidResolution">
                            {{ $t('apply') }}
                        </button>
                    </div>
                </div>

                <div class="mt-2 text-md opacity-70">
                    <p>{{ $t('resolutionNote') }}</p>
                </div>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>

    <dialog ref="clear_cache_dialog" class="modal">
        <div class="modal-box bg-base-300">
            <h3 class="font-bold text-lg">{{ $t('clearData') }}</h3>
            <p class="py-4">{{ $t('clearCacheConfirm') }}</p>
            <div class="modal-action">
                <button class="btn btn-md btn-success" @click="confirmClearCache">{{ $t('confirm') }}</button>
                <button class="btn btn-md" @click="$refs.clear_cache_dialog.close()">{{ $t('cancel') }}</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";

import MyButton from './Button.vue'
export default {
    name: 'Tools',
    props: ['settings'],
    components: {
        MyButton
    },
    data() {
        return {
            proxy_host: localStorage.getItem('proxy_host') || '127.0.0.1',
            proxy_port: localStorage.getItem('proxy_port') || 8080,
            screenScaled: Number(localStorage.getItem('screenScaled')) || 100,
            resolution: Number(localStorage.getItem('screenResolution')) || 512,
            customResolution: 512,
        }
    },
    computed: {
        isValidResolution() {
            const res = Number(this.customResolution);
            return !isNaN(res) && res >= 128 && res <= 1920;
        }
    },
    methods: {
        async app_install() {
            await this.$emiter('installApks', {})
        },
        async uploadVideo() {
            await this.$emiter('uploadFiles', {})
        },
        async uninstallApk() {
            this.$refs.uninstall_dialog.close()
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'uninstall', this.uninstall_package] })
        },
        async clearGallery() {
            await this.$emiter('clearGallery', {})
        },
        async clearCache() {
            this.$refs.clear_cache_dialog.showModal();
        },
        async confirmClearCache() {
            this.$refs.clear_cache_dialog.close();
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'clear', this.settings.packagename] });
        },


        async grantTikTok() {
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.READ_EXTERNAL_STORAGE'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.WRITE_EXTERNAL_STORAGE'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.RECORD_AUDIO'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.CAMERA'] })
        },
        async enableProxy() {
            localStorage.setItem('proxy_host', this.proxy_host)
            localStorage.setItem('proxy_port', this.proxy_port)
            await this.$emiter('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', `${this.proxy_host}:${this.proxy_port}`] })
        },
        async disableProxy() {
            await this.$emiter('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', ':0'] })
        },
        async open_dir(name) {
            invoke("open_dir", {
                name
            });
        },

        async updateScreenSize() {
            localStorage.setItem('screenScaled', this.screenScaled);
            const scaled = this.screenScaled / 100
            await this.$emiter('screenScaled', { scaled: scaled })
        },
        async setResolution(value) {
            this.resolution = value;
            localStorage.setItem('screenResolution', value);
            await this.$emiter('screenResolution', { resolution: value });
        },
    }
}
</script>