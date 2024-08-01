import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import axios from 'axios'
import VueAxios from 'vue-axios'
import * as service from './service'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* add some free styles */
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
/* add icons to the library */
library.add(fas, fab)
import { i18n } from './i18n.js'
import { reactive } from 'vue'
import mitt from 'mitt'
import VueDragSelect from "@coleqiu/vue-drag-select";
import VueDraggableResizable from 'vue-draggable-resizable'

const emitter = mitt()
let devices = reactive({ list: [] })
async function getDevices() {
  service.get_devices().then(res => {
    for (let i = 0; i < res.data.length; i++) {
      if (res.data[i].index == 0) {
        res.data[i].index = i + 1
        console.log(res.data[i])
      }
    }
    devices.list.splice(0, devices.list.length, ...res.data)
  })
}
getDevices() //get devices on page load
setInterval(getDevices, 10000)
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
const wsPort = await readTextFile('wsport.txt', { dir: BaseDirectory.AppData });
let config = {
  wsUrl: 'ws://127.0.0.1:' + wsPort,
  apiUrl: 'http://127.0.0.1:' + port
}

const app = createApp(App)
app.use(VueAxios, axios)
app.use(i18n)
app.use(VueDragSelect)
app.provide('axios', app.config.globalProperties.axios) // provide 'axios'
app.provide('devices', devices) // provide 'devices
app.config.globalProperties.$service = service
app.config.globalProperties.$emitter = emitter
app.config.globalProperties.$config = config
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('VueDatePicker', VueDatePicker)
app.component("vue-draggable-resizable", VueDraggableResizable)
app.mount('#app')
