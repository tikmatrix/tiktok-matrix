<template>
  <div class="w-full p-4">
    <details class="collapse collapse-arrow bg-base-200">
      <summary class="collapse-title text-xl font-medium">{{ $t('batchAction') }}</summary>
      <div class="collapse-content">
        <input id="app_install_input" type="file" v-on:change="on_app_install" hidden />
        <MyButton icon="fa fa-upload" @click="app_install" label="installApk" />
        <MyButton icon="fa fa-trash" @click="app_uninstall" label="uninstallApk" />
        <MyButton label="1080x1920" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'wm', 'size', '1080x1920'])" />
        <MyButton label="320" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'wm', 'density', '320'])" />
        <MyButton label="setInputMethod" icon="fa-solid fa-mobile" @click="adb_command(['shell', 'ime', 'set','com.github.tikmatrix/.FastInputIME'])" />
        <MyButton
          label="openTiktok"
          icon="fa-brands fa-tiktok"
          @click="adb_command(['shell', 'am', 'start', '-n', 'com.zhiliaoapp.musically/com.ss.android.ugc.aweme.splash.SplashActivity'])"
        />
        <MyButton @click="script('match_account')" label="matchAccount" icon="fa-solid fa-user-plus" />
      </div>
    </details>
  </div>
</template>
<script>
import { adb_command } from '@/service'
import MyButton from '../Button.vue'
export default {
  name: 'BatchButtons',
  props: {
    devices: {
      type: Array,
      required: true
    },
  },
  components: {
    MyButton
  },
  data() {
    return {
      settings: {}
    }
  },
  methods: {
    enable_proxy() {
      this.adb_command(['shell', 'settings', 'put', 'global', 'http_proxy', `${this.settings.proxy_url}`])
      for (let i = 0; i < this.devices.length; i++) {
        this.$service.get_ip({
          serial: this.devices[i].serial,
        })
        .then(res => {
          this.$service.enable_proxy_rule({
            serial: this.devices[i].serial,
            ip: res.data
          })
          .then(res => {
            console.log(res)
          })
        })
       
        
      }
      
    },
    adb_command(args) {
      this.$service
        .adb_command({
          serials: this.devices.map(device => device.serial),
          args: args
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    app_install() {
      document.getElementById('app_install_input').click()
    },
    on_app_install(event) {
      const formData = new FormData()
      formData.append('file', event.target.files[0])
      this.$service
        .install(formData)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    app_uninstall() {
      // 弹出输入框让用户输入包名
      let packageName = window.prompt('请输入包名')
      if (packageName) {
        this.adb_command(['shell', 'pm', 'uninstall', packageName])
      } else {
        console.log('未输入包名')
      }
    },
    script(name, args=[]) {
      this.$service
        .script({
          name: name,
          serials: this.devices.map(device => device.serial),
          args: args
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    }
  },
  mounted() {
    this.get_settings()
  }
}
</script>
