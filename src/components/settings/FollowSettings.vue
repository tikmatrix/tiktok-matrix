<template>
  <div class="flex flex-col items-start p-12">
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetUsernamesPath') }}: </span>
      <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
        class="input input-sm grow input-bordered" v-model="settings.target_username_path" />
      <button class="btn btn-sm btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>

    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      <button class="btn btn-md btn-primary ml-2" @click="startFollow">
        {{ $t('follow') }}
      </button>
      <button class="btn btn-md btn-secondary ml-2" @click="startUnFollow">
        {{ $t('unFollow') }}
      </button>

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

    async get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    async set_settings() {
      this.$service.update_settings(this.settings).then(async (res) => {
        await this.$emiter('batch_follow')
      })
    },

  },
  async mounted() {
    this.get_settings()
  }
}
</script>
