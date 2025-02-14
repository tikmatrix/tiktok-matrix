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

    }
  },
  methods: {

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
    async get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    async set_settings() {
      this.$service.update_settings(this.settings).then(async (res) => {
        await this.$emiter('run_task_now', { name: 'register', args: { count: 1 } })
      })
    },

  },
  async mounted() {
    this.get_settings()
  }
}
</script>
