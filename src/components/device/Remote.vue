<template>
  <div class="bg-base-100 p-4 grid grid-cols-10">
    <div class="relative col-span-4">
      <video
        ref="display"
        autoplay
        poster="../../assets/preview.jpg"
        class="rounded-2xl border-2 border-gray-300 shadow-2xl cursor-pointer"
        @mousedown="mouseDownListener"
        @mouseup="mouseUpListener"
        @mouseleave="mouseLeaveListener"
        @mousemove="mouseMoveListener"
      />
      <div
        v-if="showEffect"
        class="absolute rounded-full w-12 h-12 bg-white opacity-50 pointer-events-none"
        :style="{ top: `${effectY}px`, left: `${effectX}px` }"
      ></div>
      <!-- add a tast running tips -->
      <div class="absolute top-0 p-1 bg-red-500 bg-opacity-50 text-white rounded-lg w-full text-left" v-show="task_status == 'running'">
        <span class=""> Auto Task Running... </span>
        <MyButton @click="stop_task" label="stopTask" icon="fa-solid fa-stop" />
      </div>
      <div class="skeleton absolute w-full h-full top-0 left-0 bg-opacity-20" v-if="loading"></div>
    </div>
    <div class="p-1 col-span-6">
      <p class="p-1">
        NO: <span class="text-green-500 text-sm" v-text="mydevice.index"></span> Serial:
        <span class="text-green-500 text-sm" v-text="mydevice.serial"></span> FPS: <span class="text-green-500 text-sm" v-text="fps.toFixed(1)"></span> LAN IP:
        <span class="text-green-500 text-sm" v-text="ip"></span>
      </p>
      <details class="collapse collapse-arrow bg-base-200">
        <summary class="collapse-title text-xl font-medium">{{ $t('quickOperation') }}</summary>
        <div class="collapse-content">
          <!-- <MyButton icon="fa fa-upload" @click="app_install" label="installApk" />
        <MyButton icon="fa fa-trash" @click="app_uninstall" label="uninstallApk" /> -->
        <MyButton label="1080x1920" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'wm', 'size', '1080x1920'])" />
        <MyButton label="320" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'wm', 'density', '320'])" />
        <MyButton label="back" icon="fa-solid fa-chevron-left" @click="adb_command(['shell', 'input', 'keyevent', 'KEYCODE_BACK'])" />
        <MyButton label="home" icon="fa-solid fa-home" @click="adb_command(['shell', 'input', 'keyevent', 'KEYCODE_HOME'])" />
        <MyButton label="wakeup" icon="fa-solid fa-mobile-screen" @click="adb_command(['shell', 'input', 'keyevent', 'KEYCODE_WAKEUP'])" />
        
        <MyButton label="sleep" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'input', 'keyevent', 'KEYCODE_SLEEP'])" />
        <MyButton
          label="openTiktok"
          icon="fa-brands fa-tiktok"
          @click="adb_command(['shell', 'am', 'start', '-n', 'com.zhiliaoapp.musically/com.ss.android.ugc.aweme.splash.SplashActivity'])"
        />
        <MyButton label="stopTiktok" icon="fa-brands fa-tiktok" @click="adb_command(['shell', 'am', 'force-stop', 'com.zhiliaoapp.musically'])" />
        <MyButton label="clearTiktok" icon="fa-brands fa-tiktok" @click="adb_command(['shell', 'pm', 'clear', 'com.zhiliaoapp.musically'])" />
        <MyButton label="enableProxy" icon="fa-solid fa-link" @click="enable_proxy" />
        <MyButton label="disableProxy" icon="fa-solid fa-unlink" @click="adb_command(['shell', 'settings', 'put', 'global', 'http_proxy', ':0'])" />
        <MyButton label="showLanguageSetting" icon="fa-solid fa-trash" @click="adb_command(['shell', 'am', 'start', '-n', 'com.android.settings/.LanguageSettings'])" />
        <MyButton label="showTimeSetting" icon="fa-solid fa-clock" @click="adb_command(['shell', 'am', 'start', '-a', 'android.settings.DATE_SETTINGS'])" />
        <MyButton label="showSimInfo" icon="fa-solid fa-sim-card" @click="adb_command(['shell', 'am', 'start', '-a', 'android.settings.DEVICE_INFO_SETTINGS'])" />
        <MyButton label="openNotification" icon="fa-solid fa-bell" @click="adb_command(['shell', 'input', 'swipe', '500', '0', '500', '1000'])" />
        <MyButton label="openWhoer" icon="fa-brands fa-wikipedia-w" @click="adb_command(['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'https://whoer.net'])" />
        <MyButton label="ipinfo" icon="fa-solid fa-info" @click="adb_command(['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'https://ipinfo.io'])" />
       
        <MyButton label="reboot" color="btn-error" icon="fa-solid fa-power-off" @click="adb_command(['shell','reboot'])" />
          <MyButton label="init" icon="fa-solid fa-wrench" @click="repair(mydevice.serial)" />
        </div>
      </details>
      <details class="collapse collapse-arrow bg-base-200">
        <summary class="collapse-title text-xl font-medium">{{ $t('autoScripts') }}</summary>
        <div class="collapse-content">
          <MyButton @click="script('train',['0','50','50','50','','300',''])" label="train" icon="fa-solid fa-dumbbell" :disabled="task_status == 'running'" />
          <MyButton @click="script('connect_wifi')" label="connectWifi" icon="fa-solid fa-wifi" :disabled="task_status == 'running'" />
          <MyButton @click="script('unlock')" label="unlock" icon="fa-solid fa-unlock" :disabled="task_status == 'running'" />
          <MyButton @click="script('disconnect_wifi')" label="disconnectWifi" icon="fa-solid fa-wifi" :disabled="task_status == 'running'" />
          <MyButton @click="script('torch_on')" label="torchOn" icon="fa-solid fa-lightbulb" :disabled="task_status == 'running'" />
          <MyButton @click="script('torch_off')" label="torchOff" icon="fa-solid fa-power-off" :disabled="task_status == 'running'" />
          <MyButton @click="script('clear_notification')" label="clearNotification" icon="fa-solid fa-bell-slash" :disabled="task_status == 'running'" />
          <MyButton @click="script('clear_tasks')" label="clearTasks" icon="fa-solid fa-trash" :disabled="task_status == 'running'" />
          <MyButton @click="script('profile')" label="setProfile" icon="fa-solid fa-user" :disabled="task_status == 'running'" />
          <MyButton @click="script('match_account')" label="matchAccount" icon="fa-solid fa-user-plus" :disabled="task_status == 'running'" />
          <MyButton label="register" icon="fa-solid fa-address-card" @click="script('register',['1'])" :disabled="task_status == 'running'" />
          <MyButton
            label="registerAll"
            icon="fa-solid fa-address-card"
            @click="script('register', ['8'])"
            :disabled="task_status == 'running'"
          />
          <MyButton label="login" icon="fa-solid fa-address-card" @click="script('login')" :disabled="task_status == 'running'" />
        </div>
      </details>
      <details class="collapse collapse-arrow bg-base-200">
        <summary class="collapse-title text-xl font-medium">{{ $t('input_output') }}</summary>
        <div class="collapse-content">
          <input v-model="text" :placeholder="$t('inputText')" v-on:keyup.enter="inputText" class="w-full p-2 my-2 border-2 border-gray-300 rounded" />
          <input id="upload_video_input" type="file" v-on:change="on_upload_video" multiple hidden />
          <MyButton label="readClipboard" icon="fa-solid fa-clipboard" @click="readClipboard" />
          <MyButton label="uploadVideo" icon="fa-solid fa-upload" @click="uploadVideo" />
          <MyButton label="setInputMethod" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'ime', 'set','com.github.tikmatrix/.FastInputIME'])" />
        </div>
      </details>

    </div>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
import { inject } from 'vue'
import JMuxer from 'jmuxer'
import * as util from '../../utils'
export default {
  props: {
    device: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  components: {
    MyButton
  },
  data() {
    return {
      mydevice: {},
      rotation: 0,
      command: '',
      text: '',
      loading: true,
      fps: 0,
      periodImageCount: 0,
      showEffect: false,
      effectX: 0,
      effectY: 0,
      scrcpy: null,
      touch: false,
      task_status: 'IDLE',
      timer_fps: null,
      timer_task_status: null,
      timer_loading: null,
      settings: {},
      ip: '0.0.0.0'
    }
  },
  methods: {
    uploadVideo(group) {
      this.currentGroup = group
      document.getElementById('upload_video_input').click()
    },
    on_upload_video(e) {
      const formData = new FormData()
      formData.append('serial', this.mydevice.serial)
      for (let i = 0; i < e.target.files.length; i++) {
        formData.append('files', e.target.files[i])
      }
      this.$service
        .upload_video(formData)
        .then(() => {})
        .catch(err => {
          console.log(err)
        })
    },
    enable_proxy() {
      this.adb_command(['shell', 'settings', 'put', 'global', 'http_proxy', `${this.settings.proxy_url}`])
      this.$service
        .enable_proxy_rule({
          serial: this.mydevice.serial,
          ip: this.ip
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_ip() {
      this.$service
        .get_ip({
          serial: this.mydevice.serial
        })
        .then(res => {
          this.ip = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    readClipboard() {
      this.$service
        .read_clipboard({
          serial: this.mydevice.serial
        })
        .then(res => {
          this.text = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_task_status() {
      this.$service
        .get_task_status({
          serial: this.mydevice.serial
        })
        .then(res => {
          this.task_status = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    stop_task() {
      this.$service
        .stop_task({
          serial: this.mydevice.serial
        })
        .then(res => {
        })
        .catch(err => {
          console.log(err)
        })
    },
    repair(serial) {
      this.$service
        .init({
          serial: serial,
          init: 0
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    inputText() {
      let encodedText = btoa(this.text)
      this.adb_command(['shell', 'am', 'broadcast', '-a', 'ADB_INPUT_TEXT', '--es', 'text', `"${encodedText}"`])
      this.text = ''
    },
    adb_command(args) {
      this.$service
        .adb_command({
          serials: [this.mydevice.serial],
          args: args
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    script(name, args=[]) {
      this.$service
        .script({
          name: name,
          serials: [this.mydevice.serial],
          args: args
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    coords(boundingW, boundingH, relX, relY, rotation) {
      var w, h, x, y
      switch (rotation) {
        case 0:
          w = boundingW
          h = boundingH
          x = relX
          y = relY
          break
        case 90:
          w = boundingH
          h = boundingW
          x = boundingH - relY
          y = relX
          break
        case 180:
          w = boundingW
          h = boundingH
          x = boundingW - relX
          y = boundingH - relY
          break
        case 270:
          w = boundingH
          h = boundingW
          x = relY
          y = boundingW - relX
          break
      }
      return { x, y, w, h }
    },
    touchSync(operation, event) {
      var e = event
      if (e.originalEvent) {
        e = e.originalEvent
      }
      e.preventDefault()
      let x = e.offsetX,
        y = e.offsetY
      let w = e.target.clientWidth,
        h = e.target.clientHeight
      let scaled = this.coords(w, h, x, y, this.rotation)
      this.scrcpy.send(
        JSON.stringify({
          operation: operation, // u, d, c, w
          x: scaled.x,
          y: scaled.y,
          w: scaled.w,
          h: scaled.h
        })
      )
    },
    mouseMoveListener(event) {
      if (this.loading) {
        return
      }
      if (!this.touch) {
        return
      }
      this.touchSync('m', event)
      this.updateEffectPosition(event)
    },
    mouseUpListener(event) {
      if (this.loading) {
        return
      }
      this.touchSync('u', event)
      this.showEffect = false
      this.touch = false
    },
    mouseLeaveListener(event) {
      if (this.loading) {
        return
      }
      if (!this.touch) {
        return
      }
      this.touchSync('u', event)
      this.showEffect = false
      this.touch = false
    },
    mouseDownListener(event) {
      if (this.loading) {
        return
      }
      this.touchSync('d', event)
      this.updateEffectPosition(event)
      this.touch = true
    },
    updateEffectPosition(event) {
      var e = event
      if (e.originalEvent) {
        e = e.originalEvent
      }
      e.preventDefault()
      this.showEffect = true
      let x = e.offsetX,
        y = e.offsetY
      this.effectX = x - 25
      this.effectY = y - 25
    },

    syncDisplay() {
      const jmuxer = new JMuxer({
        node: this.$refs.display,
        mode: 'video',
        flushingTime: 0,
        maxDelay: 0,
        fps: 60,
        debug: false,
        onError: function () {
          if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
            jmuxer.reset()
          }
        }
      })
      this.scrcpy = new WebSocket(import.meta.env.VITE_WS_URL)
      this.scrcpy.binaryType = 'arraybuffer'
      this.scrcpy.onopen = () => {
        this.loading = false
        this.scrcpy.send(`${this.mydevice.serial}`)
        // max size: 1200
        this.scrcpy.send(800)
        // control: false
        this.scrcpy.send('true')
      }
      this.scrcpy.onclose = () => {
        this.loading = true
        jmuxer.reset()
      }
      this.scrcpy.onerror = () => {
        this.loading = true
        jmuxer.reset()
      }
      this.scrcpy.onmessage = message => {
        this.periodImageCount += 1
        jmuxer.feed({
          video: new Uint8Array(message.data)
        })
      }
    },
    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    }
  },
  mounted() {
    this.mydevice = this.device
    this.mydevice.index = this.devices.findIndex(mydevice => mydevice.serial === this.mydevice.serial) + 1
    this.get_ip()
    this.syncDisplay()
    // calculate fps
    this.timer_fps = setInterval(() => {
      this.fps = this.periodImageCount / 0.5
      this.periodImageCount = 0
    }, 500)
    this.timer_task_status = setInterval(() => {
      this.get_task_status()
    }, 1000)
   
    this.get_settings()
  },
  unmounted() {
    console.log('remote unmounted')
    this.loading = true
    if (this.scrcpy) this.scrcpy.close()
    clearInterval(this.timer_fps)
    clearInterval(this.timer_task_status)
    clearInterval(this.timer_loading)
  }
}
</script>
