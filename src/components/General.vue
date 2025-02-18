<template>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'accounts' })">
        <font-awesome-icon icon="user" class="h-3 w-3" />{{ $t('accounts') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'packageNameSettings' })">
        <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('packageNameSettings') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="grantApp">
        <font-awesome-icon icon="fa fa-hand-holding-usd" class="h-3 w-3 text-success" />
        {{ $t('grantApp') }}
    </button>


    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'ime', 'set', 'com.github.tikmatrix/.FastInputIME'] })">
        <font-awesome-icon icon="fa fa-keyboard" class="h-3 w-3 text-primary-content" />
        {{ $t('enableFastInput') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" :data-tip="$t('enableTCP')"
        @click="$emiter('adbEventData', { args: ['tcpip', '5555'] })">
        <font-awesome-icon icon="fa-solid fa-network-wired" class="h-3 w-3" />
        {{ $t('enableTCP') }}
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
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.proxy_dialog.show()">
        <font-awesome-icon icon="fa fa-server" class="h-3 w-3" />
        {{ $t('setProxy') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="open_dir('bin')">
        <font-awesome-icon icon="fa fa-folder" class="h-3 w-3" />
        {{ $t('openAppDir') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('updateService')">
        <font-awesome-icon icon="fa fa-download" class="h-3 w-3" />
        {{ $t('checkUpdate') }}
    </button>
    <dialog ref="proxy_dialog" class="modal">
        <div class="modal-box">
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
            scaning: false
        }
    },
    methods: {
        async grantApp() {
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.READ_EXTERNAL_STORAGE'] })
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'grant', this.settings.packagename, 'android.permission.WRITE_EXTERNAL_STORAGE'] })
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


    }
}
</script>