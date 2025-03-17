<template>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetUsernamesPath') }}: </span>
      <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
        class="input input-sm grow input-bordered" v-model="settings.target_username_path" />
      <button class="btn btn-sm btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>

    </div>
    <div role="alert" class="alert gap-2 max-w-full w-full mt-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ $t('batchFOTips') }}</span>
    </div>
    

</template>
<script>
import MyButton from '../Button.vue'
import { open } from '@tauri-apps/api/dialog';
export default {
  name: 'FollowDialog',
  components: {
    MyButton
  },
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
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

   
    async runScript() {
      await this.$service.update_settings(this.settings);
      //reload settings
     await this.$emiter('reload_settings', {})
      await this.$emiter('batchFO', {})
    },

  },
  async mounted() {
  }
}
</script>
