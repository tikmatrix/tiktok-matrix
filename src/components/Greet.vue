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
const server_url = ref("http://192.168.0.1:8090");
const proxy_url = ref("192.168.0.1:7890");
const country = ref("UK");
const wifi_name = ref("");
const wifi_password = ref("");

async function start_server() {
  server_pid.value = await invoke("start_server");
  server_status.value = 1;
}
async function stop_server() {
  await invoke("stop_server", { pid: server_pid.value });
  server_status.value = 0;
}
async function start_agent() {
  // await start_adb_server();
  agent_pid.value = await invoke("start_agent");
  agent_status.value = 1;

}

async function stop_agent() {
  // await stop_adb_server();
  await invoke("stop_agent", { pid: agent_pid.value });
  agent_status.value = 0;
}
async function start_adb_server() {
  adb_server_pid.value = await invoke("start_adb_server");
  adb_server_status.value = 1;
}
async function stop_adb_server() {
  await invoke("stop_adb_server", { pid: adb_server_pid.value });
  adb_server_status.value = 0;
}
async function get_settings() {
  var settings = await invoke("get_settings");
  server_url.value = settings.server_url;
  proxy_url.value = settings.proxy_url;
  country.value = settings.country;
  wifi_name.value = settings.wifi_name;
  wifi_password.value = settings.wifi_password;
}
async function set_settings() {
  console.log("set_settings");
  await invoke("set_settings", { serverUrl: server_url.value, proxyUrl: proxy_url.value, country: country.value, wifiName: wifi_name.value, wifiPassword: wifi_password.value });
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
  get_settings();

});
</script>

<template>
  <div class="button-container">
    <label>Proxy Server:</label>
    <input type="text" v-model="proxy_url" @change="set_settings" />
    <button @click="proxy_url = ':0'">Disable</button>
  </div>
  <div class="button-container">
    <label>Web Server:</label>
    <button @click="start_server" v-if="server_status == 0">Start</button>
    <button @click="stop_server" v-if="server_status == 1">Stop: {{ server_pid }}</button>
    <input type="text" v-model="server_url" @change="set_settings" />
    <a :href="server_url" target="_blank">Open</a>
  </div>
  <div class="button-container">
    <label>Agent:</label>
    <button @click="start_agent" v-if="agent_status == 0">Start</button>
    <button @click="stop_agent" v-if="agent_status == 1">Stop: {{ agent_pid }}</button>
  </div>

  <div class="button-container">
    <label>Country:</label>
    <select v-model="country" @change="set_settings">
      <option value="UK">UK</option>
      <option value="US">US</option>
    </select>
  </div>
  <div class="button-container">
    <label>Wifi:</label>
    <input type="text" v-model="wifi_name" @change="set_settings" placeholder="name" />
    <input type="text" v-model="wifi_password" @change="set_settings" placeholder="password" />
  </div>
</template>
