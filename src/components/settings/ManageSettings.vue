<template>
  <div class="flex flex-col items-start p-12 w-full">
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <span class="font-bold">{{ $t('uid') }}: </span>
        <input id="uid" type="text" placeholder="uid" class="input input-sm grow input-bordered" v-model="license.uid"
          readonly />
        <MyButton @click="copyuid" label="copy" :loading-time="1" />
      </div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <span class="font-bold">{{ $t('license') }}: </span>
        <input type="text" placeholder="license key" class="input input-sm grow input-bordered"
          v-model="license.key" />
        <MyButton @click="add_license" label="save" :loading-time="2000" />
      </div>
      
      <div class="label">
        <label class="label-text-alt text-red-500 font-bold" v-if="license.status != 'pass'">{{ license.status
          }}</label>
        <label class="label-text-alt" v-if="license.status == 'pass'">
          For: <label class="text-green-500 font-bold">{{ license.name }}</label> Left:
          <label class="text-red-500 font-bold">{{ license.left_days }}</label> days.
        </label>
      </div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <span class="font-bold">{{ $t('proxyServer') }}: </span>
        <input type="text" placeholder="example: 192.168.0.1:7890" class="input input-sm grow input-bordered"
          v-model="settings.proxy_url" />
        <MyButton @click="set_settings" label="save" :loading-time="2000" />
      </div>
      <div class="divider">{{ $t('registerSettings') }}</div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <span class="font-bold">{{ $t('emailSuffix') }}: </span>
        <input type="text" placeholder="example: @tikmatrix.com" class="input input-sm grow input-bordered"
          v-model="settings.email_suffix" />
        <MyButton @click="set_settings" label="save" :loading-time="2000" />
      </div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full">
        <span class="font-bold">{{ $t('nicknames') }}: </span>
        <textarea class="textarea textarea-success grow  h-16" :placeholder="$t('nicknamesTips')"
          autocomplete="off" v-model="settings.nicknames"> </textarea>
        <MyButton @click="set_settings" label="save" :loading-time="2000" />
      </div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full mt-2">
        <span class="font-bold">{{ $t('usernames') }}: </span>
        <textarea class="textarea textarea-success grow  h-16" :placeholder="$t('usernamesTips')"
          autocomplete="off" v-model="settings.usernames"> </textarea>
        <MyButton @click="set_settings" label="save" :loading-time="2000" />
      </div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full mt-2">
        <span class="font-bold">{{ $t('bios') }}: </span>
        <textarea class="textarea textarea-success grow  h-16" :placeholder="$t('biosTips')"
          autocomplete="off" v-model="settings.bios"> </textarea>
        <MyButton @click="set_settings" label="save" :loading-time="2000" />
      </div>
      <div class="flex items-center flex-row gap-2 max-w-lg w-full mt-2">
        <span class="font-bold">{{ $t('avatarsPath') }}: </span>
        <input type="text" placeholder="example: C:/Users/Administrator/Desktop/avatars" class="input input-sm grow input-bordered"
          v-model="settings.avatars_path" />
        <MyButton @click="set_settings" label="save" :loading-time="2000" />
      </div>
    
    
  </div>
</template>
<script>
import MyButton from '../Button.vue'
export default {
  name: 'app',
  components: {
    MyButton
  },
  data() {
    return {
      settings: {},
      license: {
        uid: '',
        key: '',
        status: '',
        name: '',
        left_days: 0
      },
    }
  },
  methods: {
    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    set_settings() {
      this.$service.update_settings(this.settings).then(res => {
        console.log(res)
      })
    },
    copyuid() {
      //copy uid to clipboard
      var input = document.getElementById("uid");
      input.select(); // 选择文本
      input.setSelectionRange(0, 99999); // 对于移动设备，确保能选择文本

      try {
        var successful = document.execCommand('copy'); // 执行复制操作
        this.$emitter.emit('showToast', this.$t('copySuccess'))
      } catch (err) {
        console.log('Unable to copy', err);
      }

    },
    get_license() {
      this.$service.get_license().then(res => {
        this.license = res.data
      })
    },
    add_license() {
      this.$service
        .add_license({
          key: this.license.key
        })
        .then(res => {
          console.log(res)
          this.get_license()
        })
    }
  },
  mounted() {
    this.get_settings()
    this.get_license()
  }
}
</script>
