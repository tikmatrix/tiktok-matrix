<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";
import { onMounted } from 'vue';
const server_status = ref(0);
const server_pid = ref(0);
const agent_status = ref(0);
const agent_pid = ref(0);
const adb_server_status = ref(0);
const adb_server_pid = ref(0);

async function start_server() {
  server_pid.value = await invoke("start_server");
  server_status.value = 1;
}
async function stop_server() {
  await invoke("stop_server", { pid: server_pid.value });
  server_status.value = 0;
}
async function update_server() {
  await invoke("update_server");
}
async function start_agent() {
  agent_pid.value = await invoke("start_agent");
  agent_status.value = 1;
}

async function stop_agent() {
  await invoke("stop_agent", { pid: agent_pid.value });
  agent_status.value = 0;
}
async function update_agent() {
  await invoke("update_agent");
}
async function start_adb_server() {
  adb_server_pid.value = await invoke("start_adb_server");
  adb_server_status.value = 1;
}
async function stop_adb_server() {
  await invoke("stop_adb_server", { pid: adb_server_pid.value });
  adb_server_status.value = 0;
}
async function update_adb_server() {
  await invoke("update_adb_server");
}


onMounted(() => {
  window.addEventListener('beforeunload', (event) => {
    if (server_status.value == 1) {
      stop_server();
    }
    if (agent_status.value == 1) {
      stop_agent();
    }
    if (adb_server_status.value == 1) {
      stop_adb_server();
    }
  });
});
</script>

<template>
  <div class="button-container">
    <label>Web Server</label>
    <button @click="start_server" v-if="server_status == 0">Start</button>
    <button @click="stop_server" v-if="server_status == 1">Stop: {{ server_pid }}</button>
    <button @click="update_server" v-if="server_status == 0">Update</button>
  </div>
  <div class="button-container">
    <label>Agent</label>
    <button @click="start_agent" v-if="agent_status == 0">Start</button>
    <button @click="stop_agent" v-if="agent_status == 1">Stop: {{ agent_pid }}</button>
    <button @click="update_agent" v-if="agent_status == 0">Update</button>
  </div>
  <div class="button-container">
    <label>Adb Server</label>
    <button @click="start_adb_server" v-if="adb_server_status == 0">Start</button>
    <button @click="stop_adb_server" v-if="adb_server_status == 1">Stop: {{ adb_server_pid }}</button>
    <button @click="update_adb_server" v-if="adb_server_status == 0">Update</button>
  </div>
</template>
