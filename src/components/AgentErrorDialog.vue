<template>
    <dialog ref="dialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('agentStartError') }}</h3>
            <p class="py-4" v-if="errorType === 'port'">{{ $t('agentPortOccupied', { process: processName }) }}</p>
            <p class="py-4" v-else-if="errorType === 'timeout'">{{ $t('agentStartTimeout') }}</p>
            <p class="py-4" v-else-if="errorType === 'notfound'">{{ $t('agentNotFound') }}</p>
            <div class="modal-action">
                <button class="btn btn-error" @click="clearAgentCache">{{ $t('clearAgentCache') }}</button>
                <button class="btn" @click="closeDialog">{{ $t('cancel') }}</button>
                <button class="btn btn-primary" @click="exitApp">{{ $t('exitApp') }}</button>
            </div>
        </div>
    </dialog>
</template>

<script>
import { invoke } from "@tauri-apps/api/tauri";
import { getAll } from '@tauri-apps/api/window';
import { writeTextFile } from '@tauri-apps/api/fs';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { message } from '@tauri-apps/api/dialog';

export default {
    name: 'AgentErrorDialog',
    props: {
        processName: {
            type: String,
            default: ''
        },
        errorType: {
            type: String,
            default: 'port' // 'port' 或 'timeout'
        }
    },
    methods: {
        show() {
            this.$refs.dialog.showModal();
        },
        closeDialog() {
            this.$refs.dialog.close();
        },
        async exitApp() {
            await this.$parent.shutdown();
            getAll().forEach((win) => {
                win.close();
            });
        },
        async clearAgentCache() {
            try {
                // 清除agent版本记录
                localStorage.removeItem('agent');
                // 删除agent.pid文件
                await writeTextFile('agent.pid', '', { dir: BaseDirectory.AppData });
                await message(this.$t('agentCacheCleared'), { title: this.$t('success'), type: 'info' });
                this.closeDialog();
                // 通知用户重启应用
                await message(this.$t('pleaseRestartApp'), { title: this.$t('notice'), type: 'info' });
                await this.exitApp();
            } catch (error) {
                await message(error.toString(), { title: this.$t('error'), type: 'error' });
            }
        }
    }
}
</script>
