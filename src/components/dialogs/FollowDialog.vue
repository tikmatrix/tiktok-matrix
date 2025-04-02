<template>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetUsernamesPath') }}: </span>
      <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
        class="input input-md grow input-bordered" v-model="target_username_path" />
      <button class="btn btn-md btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>

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
import { open } from '@tauri-apps/api/dialog';
export default {
  name: 'FollowDialog',
  data() {
    return {
      target_username_path: localStorage.getItem('target_username_path') || '',
    }
  },
  watch: {
    target_username_path(newVal) {
      localStorage.setItem('target_username_path', newVal)
    },
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

      this.target_username_path = filePath
    },

   
    async runScript() {
      await this.$emiter('batchFO', { target_username_path: this.target_username_path })
    },

  },
  async mounted() {
  }
}
</script>
