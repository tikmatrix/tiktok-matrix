<template>
  <div class="flex flex-col items-start p-12">

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="tooltip tooltip-right" :data-tip="$t('emailsFileTips')">
        <span class="font-bold">{{ $t('emailsFile') }}: </span>
        <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
      </div>
      <input type="text" placeholder="example: C:/Users/Administrator/Desktop/emails.txt"
        class="input input-sm grow input-bordered" v-model="settings.emails_file" />
      <button class="btn btn-sm btn-info ml-2" @click="selectEmails">{{ $t('select') }}</button>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('password') }}: </span>
      <input class="input input-bordered w-full max-w-xs" :placeholder="$t('passwordTips')" v-model="settings.password">
      </input>
    </div>


    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      <button class="btn btn-success" @click="set_settings">{{ $t('startScript') }}</button>
    </div>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
import { open } from '@tauri-apps/api/dialog';
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
    // 选择文件并获取路径
    async selectTargetUsernames() {
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Text Files', extensions: ['txt'] },
        ]
      });

      console.log('Selected file path:', filePath);
      // 将 filePath 用于其他操作
      this.settings.target_username_path = filePath
    },
    //选择头像目录
    async selectAvatars() {
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: true, // 是否选择目录
        filters: [ // 文件过滤器
        ]
      });
      console.log('Selected file path:', filePath);
      // 将 filePath 用于其他操作
      this.settings.avatars_path = filePath
    },
    async selectEmails() {
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Email File', extensions: ['txt'] },
        ]
      });
      console.log('Selected file path:', filePath);
      // 将 filePath 用于其他操作
      this.settings.emails_file = filePath
    },
    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    set_settings() {
      this.$service.update_settings(this.settings).then(res => {
        this.$emitter.emit('scriptEventData', { name: 'register', args: { count: 1 } })
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
