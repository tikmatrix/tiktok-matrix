<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-3 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('boostLivesWarning') }}</span>
    </div>
  </div>

  <!-- 直播用户名输入区域 -->
  <div class="flex flex-row items-center p-2 w-full">
    <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
      :placeholder="$t('targetUsernameTips')" autocomplete="off" v-model="live_target_username"> </textarea>
  </div>
  <!-- 新增进入方式选择 -->
  <div class="flex flex-row items-center p-2 gap-2">
    <label class="font-bold text-right col-span-1">{{ $t('enterMethod') }}:</label>
    <input type="radio" id="search" v-model="enter_method" value="search" />
    <label for="search">{{ $t('searchUser') }}</label>
    <input type="radio" id="direct" v-model="enter_method" value="direct" />
    <label for="direct">{{ $t('directOpenProfile') }}</label>
  </div>
  <!-- 功能选项区域 - 将点赞和评论选项放在同一行 -->
  <div class="flex flex-row items-center justify-start p-1 gap-4">
    <div class="form-control">
      <label class="label cursor-pointer gap-2 py-1">
        <input type="checkbox" v-model="live_enable_like" class="checkbox checkbox-success checkbox-md" />
        <span class="label-text">{{ $t('likeLive') }}</span>
      </label>
    </div>

    <div class="form-control">
      <label class="label cursor-pointer gap-2 py-1">
        <input type="checkbox" v-model="live_enable_comment" class="checkbox checkbox-success checkbox-md" />
        <span class="label-text">{{ $t('commentLive') }}</span>
      </label>
    </div>
    <!-- 观看时长输入 -->
    <div class="flex flex-row items-center p-1 gap-2">
      <label class="font-bold text-right">{{ $t('viewDuration') }}:</label>
      <input type="number" min="30" max="3600" v-model="live_view_duration"
        class="input input-bordered input-md w-20" />
      <span>{{ $t('second') }}</span>
    </div>
  </div>



  <!-- 点赞相关选项，仅在启用点赞时显示 -->
  <div class="flex flex-row flex-wrap gap-x-4">
    <!-- 点赞间隔输入 -->
    <div class="flex flex-row items-center p-1 gap-2">
      <label class="font-bold text-right">{{ $t('likeInterval') }}:</label>
      <input type="number" min="3" max="60" v-model="live_like_interval" class="input input-bordered input-md w-20" />
      <span>{{ $t('second') }}</span>
    </div>

    <!-- 点赞连击次数输入 -->
    <div class="flex flex-row items-center p-1 gap-2">
      <label class="font-bold text-right">{{ $t('likeTapCount') }}:</label>
      <input type="number" min="1" max="10" v-model="live_like_count" class="input input-bordered input-md w-20" />
      <span>{{ $t('times') }}</span>
    </div>
  </div>

  <!-- 评论间隔输入 -->
  <div class="flex flex-row items-center p-1 gap-2">
    <label class="font-bold text-right">{{ $t('commentInterval') }}:</label>
    <input type="number" min="5" max="120" v-model="live_comment_interval" class="input input-bordered input-md w-20" />
    <span>{{ $t('second') }}</span>
  </div>


  <!-- 评论文本输入区域 -->
  <div class="flex flex-row items-center p-1 w-full gap-2">
    <label class="font-bold">{{ $t('comments') }}:</label>
    <textarea class="textarea textarea-success w-lg h-32 leading-tight" :placeholder="$t('commentTextsTips')"
      v-model="live_comment_texts" autocomplete="off"></textarea>
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


    </div>

  </div>
  <!-- 添加任务间隔时间设置 -->
  <div class="flex flex-row items-center">
    <label class="font-bold mr-4">{{ $t('taskInterval') }}:</label>
    <VueSlider v-model="task_interval" :width="500" :min="0" :max="10"
      :marks="{ 0: '0' + $t('minute'), 5: '5' + $t('minute'), 10: '10' + $t('minute') }" />
  </div>
</template>
<script>
import VueSlider from "vue-3-slider-component";
export default {
  name: 'BoostLives',
  components: {
    VueSlider
  },
  data() {
    return {
      live_target_username: localStorage.getItem('live_target_username') || '',
      live_enable_like: localStorage.getItem('live_enable_like') === 'true' || false,
      live_enable_comment: localStorage.getItem('live_enable_comment') === 'true' || false,
      live_view_duration: Number(localStorage.getItem('live_view_duration')) || 120,
      live_like_interval: Number(localStorage.getItem('live_like_interval')) || 10,
      live_like_count: Number(localStorage.getItem('live_like_count')) || 10,
      live_comment_interval: Number(localStorage.getItem('live_comment_interval')) || 30, // 默认评论间隔30秒
      live_comment_texts: localStorage.getItem('live_comment_texts') || '', // 评论文本，多行
      enter_method: localStorage.getItem('live_enter_method') || 'search', // 默认搜索用户
      insert_emoji: localStorage.getItem('live_insert_emoji') === 'true' || false,
      comment_order: localStorage.getItem('live_comment_order') || 'random',
      task_interval: [localStorage.getItem('live_min_interval') || 0, localStorage.getItem('live_max_interval') || 10]
    }
  },
  watch: {
    live_target_username: {
      handler(newVal) {
        localStorage.setItem('live_target_username', newVal)
      },
    },
    live_enable_like: {
      handler(newVal) {
        localStorage.setItem('live_enable_like', newVal)
      },
    },
    live_enable_comment: {
      handler(newVal) {
        localStorage.setItem('live_enable_comment', newVal)
      },
    },
    live_view_duration: {
      handler(newVal) {
        localStorage.setItem('live_view_duration', newVal)
      },
    },
    live_like_interval: {
      handler(newVal) {
        localStorage.setItem('live_like_interval', newVal)
      },
    },
    live_like_count: {
      handler(newVal) {
        localStorage.setItem('live_like_count', newVal)
      },
    },
    live_comment_interval: {
      handler(newVal) {
        localStorage.setItem('live_comment_interval', newVal)
      },
    },
    live_comment_texts: {
      handler(newVal) {
        localStorage.setItem('live_comment_texts', newVal)
      },
    },
    enter_method: {
      handler(newVal) {
        localStorage.setItem('live_enter_method', newVal)
      },
    },
    insert_emoji(newVal) {
      localStorage.setItem('live_insert_emoji', newVal)
    },
    comment_order(newVal) {
      localStorage.setItem('live_comment_order', newVal)
    },
    task_interval(newVal) {
      localStorage.setItem('live_min_interval', newVal[0])
      localStorage.setItem('live_max_interval', newVal[1])
    },
  },
  methods: {
    filterTargetUsername() {
      if (this.live_target_username == '') {
        alert(this.$t('targetUsernameRequired'))
        return false;
      }
      //filter empty lines
      let lines = this.live_target_username.split('\n').filter(line => line.trim() != '')
      if (lines.length == 0) {
        alert(this.$t('targetUsernameRequired'))
        return false;
      }
      //add @ to usernames
      lines = lines.map(line => {
        if (!line.startsWith('@')) {
          return '@' + line
        }
        return line
      })
      this.live_target_username = lines.join('\n')
      return true;
    },
    async runScript(enable_multi_account) {
      if (!this.filterTargetUsername()) {
        return;
      }

      // 检查如果启用了评论但没有输入评论文本
      if (this.live_enable_comment && !this.live_comment_texts.trim()) {
        alert(this.$t('commentTextsRequired'))
        return;
      }

      // 修改为传递更多参数，包括点赞连击次数和评论相关
      await this.$emiter('run_now_by_account', {
        name: 'boost_live',
        args: {
          target_username: this.live_target_username,
          enter_method: this.enter_method,
          enable_like: this.live_enable_like,
          view_duration: this.live_view_duration,
          like_interval: this.live_like_interval,
          like_count: this.live_like_count,
          enable_comment: this.live_enable_comment,
          comment_interval: this.live_comment_interval,
          comment_texts: this.live_comment_texts,
          insert_emoji: this.insert_emoji,
          comment_order: this.comment_order,
          min_interval: Number(this.task_interval[0]),
          max_interval: Number(this.task_interval[1]),
          enable_multi_account: enable_multi_account
        }
      })
    },
  },
  async mounted() {
  }
}
</script>