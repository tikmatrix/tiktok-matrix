<template>
  <div class="flex h-screen bg-gray-200 justify-center items-center w-full">
    <div class="bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-4">
        {{ $t('serverStarting') }}
      </h1>
      <h2>
        {{ $t('serverStartingTips') }}
      </h2>
      <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="restart_agent">
        <font-awesome-icon icon="fa-solid fa-rotate-right" class="h-3 w-3 text-white" />
        {{ $t('restartService') }}
      </button>
    </div>
  </div>
  <dialog ref="update_agent_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ $t('updateAgent') }}</h3>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-primary" @click="update_agent">{{ $t('update') }}</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script>
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event';
import axios from 'axios'
export default {
  name: 'RunAgentTips',
  data() {
    return {
      remote_version: {
        version: '1.0.0',
        windows_url: 'https://r2.tikmatrix.com/tiktok-agent.exe',
        mac_url: 'https://r2.tikmatrix.com/tiktok-agent',
      },
    }
  },
  methods: {
    update_agent() {
      console.log("update_agent")
      invoke("update_agent");
      listen("download-progress", (event) => {
        console.log("download-progress", event)
      })
    },
    check_agent_update() {
      let local_version = this.$store.state.local_version;
      axios.get('https://r2.tikmatrix.com/agentVersion.json').then((res) => {
        this.remote_version = res;
        if (local_version !== this.remote_version.version) {
          this.$refs.update_agent_dialog.showModal()
        }
      })
    },
    restart_agent() {
      console.log("restart_agent")
      invoke("stop_agent");
      invoke("start_agent");
    },
  }
}
</script>
