import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
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
import VueDragSelect from "@coleqiu/vue-drag-select";
import VueDraggableResizable from 'vue-draggable-resizable'
import { emit, listen } from '@tauri-apps/api/event';

let devices = reactive({ list: [] })

async function getDevices() {
  service.get_devices().then(res => {
    //mock
    // for (let i = 0; i < 100; i++) {
    //   res.data[i] = { real_serial: i, group_id: 0, sort: 0 }
    // }
    devices.list.splice(0, devices.list.length, ...res.data)
    for (let i = 0; i < devices.list.length; i++) {
      devices.list[i].sort = localStorage.getItem(`sort_${devices.list[i].real_serial}`) || '0'
    }
    devices.list.sort((a, b) => {
      // fisrt: sort
      // second: group_id
      // third: real_serial
      return a.sort - b.sort || a.group_id - b.group_id || a.real_serial - b.real_serial
    });
    for (let i = 0; i < devices.list.length; i++) {
      devices.list[i].key = i + 1
    }
  })
}
getDevices()
setInterval(getDevices, 10000)

const app = createApp(App)
app.use(i18n)
app.use(VueDragSelect)
app.provide('devices', devices) // provide 'devices
app.config.globalProperties.$service = service
app.config.globalProperties.$emiter = emit
app.config.globalProperties.$listen = listen
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('VueDatePicker', VueDatePicker)
app.component("vue-draggable-resizable", VueDraggableResizable)
app.mount('#app')
