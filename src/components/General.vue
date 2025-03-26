<template>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('showDialog', { name: 'accounts' })">
        <font-awesome-icon icon="user" class="h-3 w-3" />{{ $t('accounts') }}
    </button>
   

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="enableFastInput">
        <font-awesome-icon icon="fa fa-keyboard" class="h-3 w-3 text-primary-content" />
        {{ $t('enableFastInput') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" :data-tip="$t('enableTCP')"
        @click="enableTCP">
        <font-awesome-icon icon="fa-solid fa-network-wired" class="h-3 w-3" />
        {{ $t('enableTCP') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.proxy_dialog.show()">
        <font-awesome-icon icon="fa fa-server" class="h-3 w-3" />
        {{ $t('setProxy') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('send_screen_mode', 'off')">
        <font-awesome-icon icon="fa fa-power-off" class="h-3 w-3 text-primary-content" />
        {{ $t('screenOff') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('initDevice')">
        <font-awesome-icon icon="fa fa-undo" class="h-3 w-3 text-pink-500" />
        {{ $t('initAppAgent') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.github.tikmatrix/.MainActivity'] })">
        <font-awesome-icon icon="fa fa-play" class="h-3 w-3 text-success" />
        {{ $t('openAppAgent') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="open_dir('')">
        <font-awesome-icon icon="fa fa-folder" class="h-3 w-3" />
        {{ $t('openAppDir') }}
    </button>

    <button class="btn btn-sm btn-primary ml-1 mb-1" @click="$refs.screen_size_dialog.show()">
        <font-awesome-icon icon="fa fa-expand" class="h-3 w-3" />
        {{ $t('adjustScreenSize') }}
    </button>

    <button class="btn btn-sm btn-primary ml-1 mb-1" @click="$refs.resolution_dialog.show()">
        <font-awesome-icon icon="fa fa-tv" class="h-3 w-3" />
        {{ $t('adjustResolution') }}
    </button>

    <dialog ref="proxy_dialog" class="modal">
        <div class="modal-box bg-base-300">
            <h3 class="font-bold text-lg">{{ $t('proxyServer') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-sm w-40" type="text" v-model="proxy_host" />
                <span class="font-bold p-1">:</span>
                <input class="input input-bordered input-sm w-20" type="number" v-model="proxy_port" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="enableProxy">{{ $t('enableProxy') }}</button>
            <button class="btn btn-sm btn-warning ml-2" @click="disableProxy">{{ $t('disableProxy') }}</button>

        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>

    <dialog ref="screen_size_dialog" class="modal">
        <div class="modal-box bg-base-300">
            <h3 class="font-bold text-lg">{{ $t('adjustScreenSize') }}</h3>

            <div class="flex flex-col p-2 gap-4">

                <div>
                    <label class="label">
                        <span class="label-text">{{ $t('screenScaled') }}: {{ screenScaled }}%</span>
                    </label>
                    <input type="range" min="50" max="150" v-model="screenScaled" class="range range-primary"
                        @change="updateScreenSize" />
                </div>

                <div class="mt-2 text-sm opacity-70">
                    <p>{{ $t('screenScaledNote') }}</p>
                </div>
            </div>
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
                    <button class="btn btn-sm" :class="{ 'btn-active': resolution === 256 }"
                        @click="setResolution(256)">
                        {{ $t('lowResolution') }} (256px)
                    </button>
                    <button class="btn btn-sm" :class="{ 'btn-active': resolution === 512 }"
                        @click="setResolution(512)">
                        {{ $t('highResolution') }} (512px)
                    </button>
                    <button class="btn btn-sm" :class="{ 'btn-active': resolution === 720 }"
                        @click="setResolution(720)">
                        {{ $t('ultraResolution') }} (720px)
                    </button>
                    <button class="btn btn-sm" :class="{ 'btn-active': resolution === 1080 }"
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
                            class="input input-bordered input-sm w-24" />
                        <span>px</span>
                        <button @click="setResolution(Number(customResolution))" class="btn btn-sm btn-primary"
                            :disabled="!isValidResolution">
                            {{ $t('apply') }}
                        </button>
                    </div>
                </div>

                <div class="mt-2 text-sm opacity-70">
                    <p>{{ $t('resolutionNote') }}</p>
                </div>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>
<script>
import * as util from '../utils'
import { invoke } from "@tauri-apps/api/tauri";

import MyButton from './Button.vue'
export default {
    name: 'Tools',
    props: [ 'settings'],
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
        async enableTCP() {
            await this.$emiter('adbEventData', { args: ['tcpip', '5555'] })
        },
        async enableFastInput() {
            await this.$emiter('adbEventData', { args: ['shell', 'ime', 'set', 'com.github.tikmatrix/.FastInputIME'] })
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