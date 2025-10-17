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
    <textarea class="textarea textarea-success w-lg h-32 leading-tight" :placeholder="$t('commentContentTips')"
      autocomplete="off" v-model="comment_contents"> </textarea>
    <div class="flex flex-col gap-2">
      <div class="flex flex-row items-center gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
        <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_emoji"
          title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('insertDeviceNumber') }}:</label>
        <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="insert_device_number" />
      </div>
      <div class="flex flex-row items-center gap-2">
        <label class="font-bold">{{ $t('commentOrder') }}:</label>
        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="commentOrder" value="random" class="radio radio-md radio-primary"
              v-model="comment_order" />
            <span>{{ $t('random') }}</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="commentOrder" value="sequential" class="radio radio-md radio-primary"
              v-model="comment_order" />
            <span>{{ $t('sequential') }}</span>
          </label>
        </div>
      </div>

      <!-- 添加评论间隔时间设置 -->
      <div class="flex flex-row items-center">
        <label class="font-bold mr-4">{{ $t('commentInterval') }}:</label>
        <VueSlider v-model="comment_interval" :width="200" :min="0" :max="10"
          :marks="{ 0: '0' + $t('minute'), 5: '5' + $t('minute'), 10: '10' + $t('minute') }" />
      </div>
    </div>
  </div>

  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('targetPostUrls') }}: </span>
    <textarea class="textarea textarea-success w-lg h-32 leading-tight" :placeholder="$t('targetPostUrlTips')"
      autocomplete="off" v-model="target_post_urls"> </textarea>
  </div>



</template>
<script>
import VueSlider from "vue-3-slider-component";
import { massCommentSettings } from '@/utils/settingsManager';

const massCommentMixin = massCommentSettings.createVueMixin(
  {
    settings: 'custom',
    startOption: 'now',
    scheduledTime: '09:00',
    target_post_urls: 'https://www.tiktok.com/@tikmatrix001/photo/7520819163665911054',
    comment_contents: 'Great video!\nLove this content!\nAmazing!',
    comment_delay_min: 2,
    comment_delay_max: 8,
    insert_emoji: false,
    insert_device_number: false,
    comment_order: 'random',
    comment_mode: 'multi-to-single',
    comment_interval: [0, 0]
  },
  [
    'settings', 'startOption', 'scheduledTime', 'target_post_urls',
    'comment_contents', 'comment_delay_min', 'comment_delay_max',
    'insert_emoji', 'insert_device_number', 'comment_order',
    'comment_mode', 'comment_interval'
  ]
);

export default {
  mixins: [massCommentMixin],
  name: 'MassCommentDialog',
  components: {
    VueSlider
  }, data() {
    return {
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

    async runScript(enable_multi_account) {
      if (!this.filterTargetPostUrl()) {
        return;
      }

      if (this.comment_mode === 'single-to-single') {
        await this.$emiter('massComment', {
          min_interval: Number(this.comment_interval[0]),
          max_interval: Number(this.comment_interval[1]),
          enable_multi_account: enable_multi_account
        })
      } else {
        await this.$emiter('run_now_by_account', {
          name: 'comment', args: {
            target_post_urls: this.target_post_urls,
            min_interval: Number(this.comment_interval[0]),
            max_interval: Number(this.comment_interval[1]),
            enable_multi_account: enable_multi_account
          }
        })
      }
    },
  },
}
</script>
