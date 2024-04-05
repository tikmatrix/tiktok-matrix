<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { onMounted } from 'vue';
const server_status = ref(0);
const agent_status = ref(0);
const server_url = ref("");


async function start_server() {
  server_pid.value = await invoke("start_server");
  server_status.value = 1;
}
async function stop_server() {
  await invoke("stop_server");
  server_status.value = 0;
}
async function start_agent() {
  agent_pid.value = await invoke("start_agent");
  agent_status.value = 1;

}

async function stop_agent() {
  await invoke("stop_agent");
  agent_status.value = 0;
}

async function get_settings() {
  var settings = await invoke("get_settings");
  server_url.value = settings.server_url;

}
async function set_settings() {
  console.log("set_settings");
  await invoke("set_settings", {
    serverUrl: server_url.value
  });
}

function toggle_web_server() {
  if (server_status.value == 1) {
    stop_server();
  } else {
    start_server();
  }
}

function toggle_agent() {
  if (agent_status.value == 1) {
    stop_agent();
  } else {
    start_agent();
  }

}


onMounted(() => {
  window.addEventListener('beforeunload', (event) => {
    if (server_status.value == 1) {
      stop_server();
    }
    if (agent_status.value == 1) {
      stop_agent();
    }

  });
  get_settings();

});
</script>

<template>
  <div class="flex flex-col">
    <div class="form-control w-52">
      <label class="cursor-pointer label">
        <span class="label-text">Web Server</span>
        <input type="checkbox" class="toggle toggle-success" @change="toggle_web_server" />
      </label>
    </div>
    <div class="form-control w-52">
      <label class="cursor-pointer label">
        <span class="label-text">Agent</span>
        <input type="checkbox" class="toggle toggle-secondary" @change="toggle_agent" />
      </label>
    </div>

  </div>

  <div class="mockup-browser border border-base-300">
    <div class="mockup-browser-toolbar">
      <div class="input border border-base-300">
        {{ server_url }}
      </div>
    </div>
    <div class="flex justify-center px-4 py-4 border-t border-base-300">
      <a class="link link-primary" :href="server_url" target="_blank">Click to open</a>
    </div>
  </div>
</template>
