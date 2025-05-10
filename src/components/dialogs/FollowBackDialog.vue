<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('followBackWarning') }}</span>
    </div>
  </div>

  <div class="flex flex-row items-center p-2 gap-2">
    <label class="font-bold text-right col-span-1">{{ $t('actions') }}:</label>
    <div class="flex flex-wrap gap-4">
      
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <input type="checkbox" class="checkbox checkbox-primary" v-model="enable_send_message" />
          <span class="label-text">{{ $t('sendMessage') }}</span>
        </label>
      </div>


    </div>
  </div>

  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('messageContent') }}: </span>
    <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('messageContentTips')"
      autocomplete="off" v-model="message_content"> </textarea>
    <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
    <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_emoji"
      title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
  </div>
</template>
<script>
import VueSlider from "vue-3-slider-component";
export default {
  name: 'FollowBack',
  components: {
    VueSlider
  },
  data() {
    return {
      enable_send_message: localStorage.getItem('enable_send_message') === 'true',
      message_content: localStorage.getItem('follow_back_message_content') || '',
      insert_emoji: localStorage.getItem('follow_back_insert_emoji') === 'true',
    }
  },
  watch: {
    enable_send_message(newVal) {
      localStorage.setItem('enable_send_message', newVal)
    },
    message_content(newVal) {
      localStorage.setItem('follow_back_message_content', newVal)
    },
    insert_emoji(newVal) {
      localStorage.setItem('follow_back_insert_emoji', newVal)
    },
  },
  methods: {
    
    async runScript() {
      await this.$emiter('run_now_by_account', {
        name: 'follow_back',
        args: {
          enable_send_message: this.enable_send_message,
          message_content: this.message_content,
          insert_emoji: this.insert_emoji,
        }
      })
    },
  },
  async mounted() {
  }
}
</script>