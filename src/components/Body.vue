<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { onMounted } from 'vue';
import { window } from "@tauri-apps/api"
import { TauriEvent } from "@tauri-apps/api/event"
import { ask } from '@tauri-apps/api/dialog';




const agent_status = ref(false);
const settings = ref({});



async function start_agent() {
  await invoke("start_agent");
  agent_status.value = true;

}

async function stop_agent() {
  await invoke("stop_agent");
  agent_status.value = false;
}

async function get_settings() {
  settings.value = await invoke("get_settings");
}
async function set_settings() {
  console.log("set_settings");
  await invoke("set_settings", {
    serverUrl: server_url.value
  });
}
async function open_log_dir() {
  await invoke("open_log_dir");
}



function toggle_agent() {
  if (agent_status.value ) {
    start_agent();
  } else {
    stop_agent();
  }

}


onMounted(() => {
    window.getCurrent().listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
      const yes = await ask("Are you sure?");
      console.log("result:" + yes);
      if (yes) {
        stop_agent();
        window.getCurrent().close();
      }
    });
  
  get_settings();
  start_agent();

});
</script>

<template>
  <div class="flex flex-col">
    <div class="form-control w-52">
      <label class="cursor-pointer label">
        <span class="label-text text-lg font-bold text-green-500">STATUS</span>
        <span class="text-sm text-gray-400 p-3 font-serif">{{  settings.version }}</span>
        <input type="checkbox" class="toggle toggle-secondary" @change="toggle_agent" v-model="agent_status"/>
      </label>
    </div>

  </div>

  <div class="mockup-browser border border-base-300">
    <div class="mockup-browser-toolbar">
      <div class="input border border-base-300">
        {{ settings.server_url }}
      </div>
    </div>
    <div class="flex justify-center px-4 py-4 border-t border-base-300">
      <a class="link link-primary" :href="settings.server_url" target="_blank">Click to open</a>
    </div>
  </div>
  <a class="link link-error" @click="open_log_dir">Open Logs Directory</a>
</template>
