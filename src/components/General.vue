<template>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'accounts' })">
        <font-awesome-icon icon="user" class="h-3 w-3" />{{ $t('accounts') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'packageNameSettings' })">
        <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('packageNameSettings') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'registerSettings' })">
        <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('registerSettings') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'messageSettings' })">
        <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('messageSettings') }}
    </button>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'ime', 'set', 'com.github.tikmatrix/.FastInputIME'] })">
        <font-awesome-icon icon="fa fa-keyboard" class="h-3 w-3 text-white" />
        {{ $t('setFastInput') }}
    </button>


    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$refs.proxy_dialog.show()">
        <font-awesome-icon icon="fa-solid fa-link" class="h-3 w-3 text-white" />
        {{ $t('setProxy') }}
    </button>
    <!-- <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$refs.scan_dialog.show()">
        <font-awesome-icon icon="fa-solid fa-network-wired" class="h-3 w-3" />{{ $t('scanTCPDevice') }}
    </button> -->
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('initDevice')">
        <font-awesome-icon icon="fa-solid fa-arrows-rotate" class="h-3 w-3" />{{ $t('initApp') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.github.tikmatrix/.MainActivity'] })">
        {{ $t('openTikMatrixApp') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="open_dir('logs')">
        <font-awesome-icon icon="fa-solid fa-file-lines" class="h-3 w-3" />{{ $t('openLogs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('downloadOcr')">
        <font-awesome-icon icon="fa fa-download" class="h-3 w-3" />{{ $t('downloadOcr') }}
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
    props: ['menuItems'],
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
        enableProxy() {
            util.setData('proxy_host', this.proxy_host)
            util.setData('proxy_port', this.proxy_port)
            this.$emitter.emit('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', `${this.proxy_host}:${this.proxy_port}`] })
            this.$emitter.emit('showToast', this.$t('proxyEnabled'))
        },
        disableProxy() {
            this.$emitter.emit('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', ':0'] })
            this.$emitter.emit('showToast', this.$t('proxyDisabled'))
        },
        open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        scan() {
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