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
</template>

<script>
import { invoke } from "@tauri-apps/api/tauri";
export default {
  name: 'RunAgentTips',
  data() {
    return {
    }
  },
  methods: {
    restart_agent() {
      console.log("restart_agent")
      invoke("stop_agent");
      invoke("start_agent");
    },
  }
}
</script>
