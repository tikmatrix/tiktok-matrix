<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('massDMWarning') }}</span>
    </div>
  </div>
  <!-- <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('sendProfileCard') }}: </span>
    <input type="text" class="input input-md grow input-bordered" v-model="send_profile_card"
      :placeholder="$t('sendProfileCardTips')" />
  </div> -->
  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('messageContents') }}: </span>
    <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('messageContentsTips')"
      autocomplete="off" v-model="message_contents"> </textarea>
    <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
    <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_emoji"
      title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
  </div>

  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('targetUsernamesPath') }}: </span>
    <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
      class="input input-md grow input-bordered" v-model="target_username_path" />
    <button class="btn btn-md btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>
  </div>
  <!-- 新增打开用户方式选择 -->
  <div class="flex flex-row items-center p-2 gap-2">
    <label class="font-bold text-right col-span-1">{{ $t('openUserMethod') }}:</label>
    <input type="radio" id="search" v-model="open_user_method" value="search" />
    <label for="search">{{ $t('searchUser') }}</label>
    <input type="radio" id="direct" v-model="open_user_method" value="direct" />
    <label for="direct">{{ $t('directOpenProfile') }}</label>
  </div>

</template>
<script>
import { open } from '@tauri-apps/api/dialog';
import { massDMSettings } from '@/utils/settingsManager';

export default {
  name: 'MassDM',
  mixins: [
    massDMSettings.createVueMixin(
      {
        message_contents: '',
        insert_emoji: false,
        target_username_path: '',
        send_profile_card: '',
        open_user_method: 'direct',
      }, // 默认设置
      ['message_contents', 'insert_emoji', 'target_username_path', 'send_profile_card', 'open_user_method'] // 需要监听的属性
    )
  ],
  data() {
    return {
      message_contents: '',
      insert_emoji: false,
      target_username_path: '',
      send_profile_card: '',
      open_user_method: 'direct',
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

      this.target_username_path = filePath
    },



    async runScript(enable_multi_account) {
      this.send_profile_card = this.send_profile_card.trim()
      //append @ to the start of send_profile_card if send_profile_card is not empty
      if (this.send_profile_card.length > 0 && this.send_profile_card.charAt(0) !== '@') {
        this.send_profile_card = '@' + this.send_profile_card
      }
      await this.$emiter('massDM', {
        target_username_path: this.target_username_path,
        enable_multi_account: enable_multi_account
      })
    },


  }
}
</script>
