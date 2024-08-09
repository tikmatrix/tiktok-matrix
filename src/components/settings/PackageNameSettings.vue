<template>
  <div class="flex flex-col items-start p-12">
    <div class="divider">{{ $t('tiktokSettings') }}</div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <label class="font-bold text-right col-span-1">{{ $t('tiktokPackagename') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="global" value="com.zhiliaoapp.musically" v-model="settings.packagename"
            class="form-radio text-blue-500 h-4 w-4">
          <label for="global" class="ml-2">{{ $t('global') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="asia" value="com.ss.android.ugc.trill" v-model="settings.packagename"
            class="form-radio text-blue-500 h-4 w-4">
          <label for="asia" class="ml-2">{{ $t('asia') }}</label>
        </div>

      </div>

    </div>

    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <div class="flex flex-1"></div>
      <MyButton @click="set_settings" label="save" :loading-time="2000" />
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
