<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('massCommentWarning') }}</span>
    </div>
  </div>

  <!-- 添加模式选择 -->
  <div class="flex flex-row gap-4 mb-4">
    <span class="font-bold">{{ $t('commentMode') }}: </span>
    <div class="flex gap-2">
      <label class="cursor-pointer flex items-center gap-2">
        <input type="radio" name="comment-mode" class="radio radio-accent" value="multi-to-single"
          v-model="comment_mode" />
        <span>{{ $t('multiAccountToSinglePost') }}</span>
      </label>
      <label class="cursor-pointer flex items-center gap-2">
        <input type="radio" name="comment-mode" class="radio radio-accent" value="single-to-single"
          v-model="comment_mode" />
        <span>{{ $t('singleAccountToSinglePost') }}</span>
      </label>
    </div>
  </div>
  <!-- 单账号模式下显示的附加说明 -->
  <div v-if="comment_mode === 'single-to-single'" class="mt-2 text-md text-gray-500">
    <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-1" />
    <span>{{ $t('singleAccountModeTip') }}</span>
  </div>

  <!-- 多账号模式下显示的附加说明 -->
  <div v-if="comment_mode === 'multi-to-single'" class="mt-2 text-md text-gray-500">
    <font-awesome-icon icon="fa-solid fa-info-circle" class="mr-1" />
    <span>{{ $t('multiAccountModeTip') }}</span>
  </div>
  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('comments') }}: </span>
    <textarea class="textarea textarea-success w-lg h-32 leading-tight"
      :placeholder="$t('commentContentTips')" autocomplete="off" v-model="comment_content"> </textarea>
    <div class="flex flex-col gap-2">
      <div class="flex flex-row items-center gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
        <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_emoji"
          title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <label class="font-bold">{{ $t('commentOrder') }}:</label>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="commentOrder" value="random" class="radio radio-sm radio-primary"
              v-model="comment_order" />
            <span>{{ $t('random') }}</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="commentOrder" value="sequential" class="radio radio-sm radio-primary"
              v-model="comment_order" />
            <span>{{ $t('sequential') }}</span>
          </label>
        </div>
      </div>
      
      <!-- 添加评论间隔时间设置 -->
      <div class="flex flex-row items-center">
        <label class="font-bold mr-4">{{ $t('commentInterval') }}:</label>
        <VueSlider v-model="comment_interval" :width="200" :min="0" :max="10" :marks="{0: '0'+$t('minute'),5: '5'+$t('minute'),10: '10'+$t('minute')}" />
      </div>
    </div>
  </div>

  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('targetPostUrls') }}: </span>
    <textarea class="textarea textarea-success w-lg h-32 leading-tight"
      :placeholder="$t('targetPostUrlTips')" autocomplete="off" v-model="target_post_urls"> </textarea>
  </div>



</template>
<script>
import VueSlider from "vue-3-slider-component";
export default {
  name: 'MassCommentDialog',
  components: {
    VueSlider
  },
  data() {
    return {
     
      comment_mode: localStorage.getItem('comment_mode') || 'multi-to-single',
      comment_content: localStorage.getItem('comment_content') || '',
      insert_emoji: localStorage.getItem('insert_emoji') === 'true' || false,
      target_post_urls: localStorage.getItem('target_post_urls') || '',
      comment_order: localStorage.getItem('comment_order') || 'random',
      comment_interval: [localStorage.getItem('min_interval') || 0, localStorage.getItem('max_interval') || 10]
    }
  },
  watch: {
    comment_mode(newVal) {
      localStorage.setItem('comment_mode', newVal)
    },
    comment_content(newVal) {
      localStorage.setItem('comment_content', newVal)
    },
    insert_emoji(newVal) {
      localStorage.setItem('insert_emoji', newVal)
    },
    target_post_urls(newVal) {
      localStorage.setItem('target_post_urls', newVal)
    },
    comment_order(newVal) {
      localStorage.setItem('comment_order', newVal)
    },
    comment_interval(newVal) {
      localStorage.setItem('min_interval', newVal[0])
      localStorage.setItem('max_interval', newVal[1])
    },
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
      if (!this.filterTargetPostUrl()) {
        return;
      }

      if (this.comment_mode === 'single-to-single') {
        await this.$emiter('massComment', {
          comment_content: this.comment_content,
          insert_emoji: this.insert_emoji,
          target_post_urls: this.target_post_urls,
          comment_order: this.comment_order,
          min_interval: Number(this.comment_interval[0]),
          max_interval: Number(this.comment_interval[1]),
        })
      } else {
        await this.$emiter('run_now_by_account', {
          name: 'comment', args: {
            comment_contents: this.comment_content,
            insert_emoji: this.insert_emoji,
            target_post_urls: this.target_post_urls,
            comment_order: this.comment_order,
            min_interval: Number(this.comment_interval[0]),
            max_interval: Number(this.comment_interval[1]),
          }
        })
      }
    },
  },
}
</script>
