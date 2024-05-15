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
import * as util from './utils'


const emitter = mitt()
let hideDevices = []
hideDevices = util.getData('hideDevices')
if (!hideDevices) {
  console.log("init hideDevices")
  hideDevices = []
}
let devices = reactive({ list: [] })
emitter.on('hideDevice', (device) => {
  hideDevices.push(device.serial)
  util.setData('hideDevices', hideDevices)
  devices.list.splice(devices.list.indexOf(device), 1)
});
emitter.on('show-hidden-devices', () => {
  console.log("show-hidden-devices")
  hideDevices = []
  util.setData('hideDevices', hideDevices)
})
async function getDevices() {
  const res = await service.get_devices()
  if (hideDevices.length > 0) {
    res.data = res.data.filter(device => !hideDevices.includes(device.serial))
  }
  devices.list.splice(0, devices.list.length, ...res.data)
}
getDevices() //get devices on page load
setInterval(getDevices, 3000)
let config = {
  wsUrl: import.meta.env.VITE_WS_URL,
  apiUrl: import.meta.env.VITE_API_URL
}

const app = createApp(App)
app.use(VueAxios, axios)
app.use(i18n)
app.use(VueDragSelect);
app.provide('axios', app.config.globalProperties.axios) // provide 'axios'
app.provide('devices', devices) // provide 'devices
app.config.globalProperties.$service = service
app.config.globalProperties.$emitter = emitter
app.config.globalProperties.$config = config
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('VueDatePicker', VueDatePicker)
app.component("vue-draggable-resizable", VueDraggableResizable)
app.mount('#app')
