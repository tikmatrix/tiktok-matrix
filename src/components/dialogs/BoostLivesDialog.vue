<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-3 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('boostLivesWarning') }}</span>
    </div>
  </div>

  <!-- 直播链接输入区域 -->
  <div class="flex flex-row items-center p-1 w-full">
    <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-24 leading-tight"
      :placeholder="$t('targetLiveUrlTips')" autocomplete="off" v-model="target_live_urls"></textarea>
  </div>

  <!-- 功能选项区域 - 将点赞和评论选项放在同一行 -->
  <div class="flex flex-row items-center justify-start p-1 gap-4">
    <div class="form-control">
      <label class="label cursor-pointer gap-2 py-1">
        <input type="checkbox" v-model="enable_like" class="checkbox checkbox-success checkbox-sm" />
        <span class="label-text">{{ $t('likeLive') }}</span>
      </label>
    </div>

    <div class="form-control">
      <label class="label cursor-pointer gap-2 py-1">
        <input type="checkbox" v-model="enable_comment" class="checkbox checkbox-success checkbox-sm" />
        <span class="label-text">{{ $t('commentLive') }}</span>
      </label>
    </div>
    <!-- 观看时长输入 -->
    <div class="flex flex-row items-center p-1 gap-2">
      <label class="font-bold text-right">{{ $t('viewDuration') }}:</label>
      <input type="number" min="30" max="3600" v-model="view_duration" class="input input-bordered input-sm w-20" />
      <span>{{ $t('second') }}</span>
    </div>
  </div>



  <!-- 点赞相关选项，仅在启用点赞时显示 -->
    <div class="flex flex-row flex-wrap gap-x-4">
      <!-- 点赞间隔输入 -->
      <div class="flex flex-row items-center p-1 gap-2">
        <label class="font-bold text-right">{{ $t('likeInterval') }}:</label>
        <input type="number" min="3" max="60" v-model="like_interval" class="input input-bordered input-sm w-20" />
        <span>{{ $t('second') }}</span>
      </div>

      <!-- 点赞连击次数输入 -->
      <div class="flex flex-row items-center p-1 gap-2">
        <label class="font-bold text-right">{{ $t('likeTapCount') }}:</label>
        <input type="number" min="1" max="10" v-model="like_count" class="input input-bordered input-sm w-20" />
        <span>{{ $t('times') }}</span>
      </div>
    </div>

    <!-- 评论间隔输入 -->
    <div class="flex flex-row items-center p-1 gap-2">
      <label class="font-bold text-right">{{ $t('commentInterval') }}:</label>
      <input type="number" min="5" max="120" v-model="comment_interval" class="input input-bordered input-sm w-20" />
      <span>{{ $t('second') }}</span>
    </div>

   
   <!-- 评论文本输入区域 -->
   <div class="flex flex-row items-center p-1 w-full">
        <label class="font-bold">{{ $t('commentTexts') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-24 leading-tight flex-grow"
          :placeholder="$t('commentTextsTips')" v-model="comment_texts" autocomplete="off"></textarea>
    </div>
</template>
<script>
export default {
  name: 'BoostLives',
  data() {
    return {
      target_live_urls: localStorage.getItem('target_live_urls') || '',
      enable_like: localStorage.getItem('enable_like') === 'true' || true,
      enable_comment: localStorage.getItem('enable_comment') === 'true' || false, // 默认不启用评论
      view_duration: Number(localStorage.getItem('view_duration')) || 120,
      like_interval: Number(localStorage.getItem('like_interval')) || 10,
      like_count: Number(localStorage.getItem('like_count')) || 3,
      comment_interval: Number(localStorage.getItem('comment_interval')) || 30, // 默认评论间隔30秒
      comment_texts: localStorage.getItem('comment_texts') || '' // 评论文本，多行
    }
  },
  watch: {
    target_live_urls: {
      handler(newVal) {
        localStorage.setItem('target_live_urls', newVal)
      },
    },
    enable_like: {
      handler(newVal) {
        localStorage.setItem('enable_like', newVal)
      },
    },
    enable_comment: {
      handler(newVal) {
        localStorage.setItem('enable_comment', newVal)
      },
    },
    view_duration: {
      handler(newVal) {
        localStorage.setItem('view_duration', newVal)
      },
    },
    like_interval: {
      handler(newVal) {
        localStorage.setItem('like_interval', newVal)
      },
    },
    like_count: {
      handler(newVal) {
        localStorage.setItem('like_count', newVal)
      },
    },
    comment_interval: {
      handler(newVal) {
        localStorage.setItem('comment_interval', newVal)
      },
    },
    comment_texts: {
      handler(newVal) {
        localStorage.setItem('comment_texts', newVal)
      },
    }
  },
  methods: {
    filterTargetLiveUrl() {
      if (this.target_live_urls == '') {
        alert(this.$t('liveUrlRequired'))
        return false;
      }
      //filter empty lines
      let lines = this.target_live_urls.split('\n').filter(line => line.trim() != '')
      if (lines.length == 0) {
        alert(this.$t('liveUrlRequired'))
        return false;
      }
      //remove query string
      lines = lines.map(line => {
        let url = new URL(line)
        return url.origin + url.pathname
      })
      //check format https://www.tiktok.com/@v.lais4/live
      let regex = /^https:\/\/www\.tiktok\.com\/@[^\/]+\/live$/
      if (!regex.test(lines[0])) {
        alert(this.$t('liveUrlFormatError'))
        return false;
      }
      this.target_live_urls = lines.join('\n')
      return true;
    },
    async runScript() {
      if (!this.filterTargetLiveUrl()) {
        return;
      }

      // 检查如果启用了评论但没有输入评论文本
      if (this.enable_comment && !this.comment_texts.trim()) {
        alert(this.$t('commentTextsRequired'))
        return;
      }

      // 修改为传递更多参数，包括点赞连击次数和评论相关
      await this.$emiter('run_now_by_account', {
        name: 'view_live',
        args: {
          live_url: this.target_live_urls,
          enable_like: this.enable_like,
          view_duration: this.view_duration,
          like_interval: this.like_interval,
          like_count: this.like_count,
          enable_comment: this.enable_comment,
          comment_interval: this.comment_interval,
          comment_texts: this.comment_texts
        }
      })
    },
  },
  async mounted() {
  }
}
</script>