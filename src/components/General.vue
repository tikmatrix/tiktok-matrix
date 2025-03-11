<template>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'accounts' })">
        <font-awesome-icon icon="user" class="h-3 w-3" />{{ $t('accounts') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'packageNameSettings' })">
        <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('packageNameSettings') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="grantTikTok">
        <font-awesome-icon icon="fa fa-hand-holding-usd" class="h-3 w-3 text-success" />
        {{ $t('grantTikTok') }}
    </button>


    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="enableFastInput">
        <font-awesome-icon icon="fa fa-keyboard" class="h-3 w-3 text-primary-content" />
        {{ $t('enableFastInput') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" :data-tip="$t('enableTCP')"
        @click="$emiter('adbEventData', { args: ['tcpip', '5555'] })">
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
    props: ['menuItems', 'settings'],
    components: {
        MyButton
    },
    data() {
        return {
            ip_1: util.getData('ip_1') || 192,
            ip_2: util.getData('ip_2') || 168,
            ip_3: util.getData('ip_3') || 1,
            ip_4: util.getData('ip_4') || 2,
            ip_5: util.getData('ip_5') || 254,
            port: util.getData('scan_port') || 5555,
            proxy_host: util.getData('proxy_host') || '127.0.0.1',
            proxy_port: util.getData('proxy_port') || 8080,
            scaning: false,
            screenScaled: Number(localStorage.getItem('screenScaled')) || 100,
        }
    },
    methods: {
        async enableFastInput() {
            await this.$emiter('adbEventData', { args: ['shell', 'ime', 'set', 'com.github.tikmatrix/.FastInputIME'] })
            await this.$emiter('showToast', this.$t('fastInputEnabled'))
        },
        async grantTikTok() {
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.READ_EXTERNAL_STORAGE'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.WRITE_EXTERNAL_STORAGE'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.RECORD_AUDIO'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.CAMERA'] })
            await this.$emiter('showToast', this.$t('grantSuccess'))
        },
        async enableProxy() {
            util.setData('proxy_host', this.proxy_host)
            util.setData('proxy_port', this.proxy_port)
            await this.$emiter('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', `${this.proxy_host}:${this.proxy_port}`] })
            await this.$emiter('showToast', this.$t('proxyEnabled'))
        },
        async disableProxy() {
            await this.$emiter('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', ':0'] })
            await this.$emiter('showToast', this.$t('proxyDisabled'))
        },
        async open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        async scan() {
            this.scaning = true
            util.setData('ip_1', this.ip_1)
            util.setData('ip_2', this.ip_2)
            util.setData('ip_3', this.ip_3)
            util.setData('ip_4', this.ip_4)
            util.setData('ip_5', this.ip_5)
            util.setData('scan_port', this.port)
            this.$service.scan_tcp({
                start_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_4}`,
                end_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_5}`,
                port: this.port
            }).then((res) => {
                console.log(res)
                this.scaning = false
            })
        },
        async updateScreenSize() {
            localStorage.setItem('screenScaled', this.screenScaled);
            const scaled = this.screenScaled / 100
            await this.$emiter('screenScaled', { scaled: scaled })
        },

    }
}
</script>