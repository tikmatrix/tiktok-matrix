<template>
  <div class="flex flex-col items-start p-12">



    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('messageContent') }}: </span>
      <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('messageContentTips')"
        autocomplete="off" v-model="message_content"> </textarea>
      <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
      <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_emoji" :true-value=1 :false-value=0
        title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
    </div>

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetUsernamesPath') }}: </span>
      <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
        class="input input-sm grow input-bordered" v-model="target_username_path" />
      <button class="btn btn-sm btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>
    </div>
    <div role="alert" class="alert gap-2 max-w-full w-full mt-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ $t('massDMTips') }}</span>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      <button class="btn btn-success" @click="massDM">{{ $t('startScript') }}</button>
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
      message_content: localStorage.getItem('message_content') || '',
      insert_emoji: Number(localStorage.getItem('insert_emoji')) || 0,
      target_username_path: localStorage.getItem('target_username_path') || '',
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
      this.target_username_path = filePath
    },


    async massDM() {
      localStorage.setItem('message_content', this.message_content)
      localStorage.setItem('insert_emoji', this.insert_emoji)
      localStorage.setItem('target_username_path', this.target_username_path)
      await this.$emiter('massDM', {
        message_content: this.message_content,
        insert_emoji: this.insert_emoji,
        target_username_path: this.target_username_path,
      })
    },


  },
  async mounted() {
  },
  watch: {
    insert_emoji(val) {
      this.insert_emoji = Number(val)
    }
  }
}
</script>
