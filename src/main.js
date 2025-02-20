import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import * as service from './service'
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
import VueDragSelect from "@coleqiu/vue-drag-select";
import VueDraggableResizable from 'vue-draggable-resizable'
import { emit, listen } from '@tauri-apps/api/event';

const app = createApp(App)
app.use(i18n)
app.use(VueDragSelect)
app.config.globalProperties.$service = service
app.config.globalProperties.$emiter = emit
app.config.globalProperties.$listen = listen
app.component('font-awesome-icon', FontAwesomeIcon)
app.component("vue-draggable-resizable", VueDraggableResizable)
app.mount('#app')
