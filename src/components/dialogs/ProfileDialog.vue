<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('profileWarning') }}</span>
      </div>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('nicknames') }}: </span>
      <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('nicknamesTips')"
        autocomplete="off" v-model="nicknames"> </textarea>

    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('usernames') }}: </span>
      <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('usernamesTips')"
        autocomplete="off" v-model="usernames"> </textarea>

    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('bios') }}: </span>
      <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('biosTips')"
        autocomplete="off" v-model="bios"> </textarea>

    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('avatarsPath') }}: </span>
      <input type="text" placeholder="example: C:/Users/Administrator/Desktop/avatars"
        class="input input-sm grow input-bordered" v-model="avatars_path" />
      <button class="btn btn-sm btn-info ml-2" @click="selectAvatars">{{ $t('select') }}</button>
    </div>
</template>
<script>
import { open } from '@tauri-apps/api/dialog';
export default {
  name: 'ProfileDialog',
 
  data() {
    return {
      nicknames: localStorage.getItem('nicknames') || '',
      usernames: localStorage.getItem('usernames') || '',
      bios: localStorage.getItem('bios') || '',
      avatars_path: localStorage.getItem('avatars_path') || '',
    }
  },
  watch: {
    nicknames(newVal) {
      localStorage.setItem('nicknames', newVal)
    },
    usernames(newVal) {
      localStorage.setItem('usernames', newVal)
    },
    bios(newVal) {
      localStorage.setItem('bios', newVal)
    },
    avatars_path(newVal) {
      localStorage.setItem('avatars_path', newVal)
    },
  },
  
  methods: {

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
      this.avatars_path = filePath
    },
   
   
    async runScript() {
      await this.$emiter('run_task_now', { name: 'profile', args: {
        nicknames: this.nicknames,
        usernames: this.usernames,
        bios: this.bios,
        avatars_path: this.avatars_path,
      } })
    },

  },
  async mounted() {
  }
}
</script>
