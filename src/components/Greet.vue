<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/tauri";

const server_status = ref(0);
const server_pid = ref(0);
const agent_status = ref(0);
const agent_pid = ref(0);

async function start_server() {
  server_pid.value = await invoke("start_server");
  server_status.value = 1;
}
async function stop_server() {
  await invoke("stop_server", { pid: server_pid.value });
  server_status.value = 0;
}
async function start_agent() {
  agent_pid.value = await invoke("start_agent");
  agent_status.value = 1;
}
async function stop_agent() {
  await invoke("stop_agent", { pid: agent_pid.value });
  agent_status.value = 0;
}
</script>

<template>
  <button @click="start_server" v-if="server_status == 0">Start Server</button>
  <button @click="stop_server" v-if="server_status == 1">Stop Server: {{ server_pid }}</button>
  <br>
  <button @click="start_agent" v-if="agent_status == 0">Start Agent</button>
  <button @click="stop_agent" v-if="agent_status == 1">Stop Agent: {{ agent_pid }}</button>
</template>
