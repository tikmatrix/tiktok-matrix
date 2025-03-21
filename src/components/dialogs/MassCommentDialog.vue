<template>
     <!-- 添加提示信息 -->
     <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('massCommentWarning') }}</span>
      </div>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('commentContent') }}: </span>
      <textarea class="textarea textarea-success grow  h-16 leading-tight" :placeholder="$t('commentContentTips')"
        autocomplete="off" v-model="comment_content"> </textarea>
      <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
      <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_emoji" :true-value=1 :false-value=0
        title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
    </div>

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetPostUrls') }}: </span>
      <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
              :placeholder="$t('targetPostUrlTips')" autocomplete="off" v-model="target_post_urls"> </textarea>
    </div>
    
</template>
<script>
import MyButton from '../Button.vue'
export default {
  name: 'MassCommentDialog',
  components: {
    MyButton
  },
  data() {
    return {
      comment_content: localStorage.getItem('comment_content') || '',
      insert_emoji: Number(localStorage.getItem('insert_emoji')) || 0,
      target_post_urls: localStorage.getItem('target_post_urls') || '',
    }
  },
  methods: {
    filterTargetPostUrl() {
            if (this.target_post_urls == '') {
                alert(this.$t('postUrlRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_post_urls.split('\n').filter(line => line.trim() != '')
            if (lines.length == 0) {
                alert(this.$t('postUrlRequired'))
                return false;
            }
            //remove query string
            lines = lines.map(line => {
                let url = new URL(line)
                return url.origin + url.pathname
            })
            this.target_post_urls = lines.join('\n')
            return true;
        },


    async runScript() {
      localStorage.setItem('comment_content', this.comment_content)
      localStorage.setItem('insert_emoji', this.insert_emoji)
      localStorage.setItem('target_post_urls', this.target_post_urls)
      await this.$emiter('massComment', {
        comment_content: this.comment_content,
        insert_emoji: this.insert_emoji,
        target_post_urls: this.target_post_urls,
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
