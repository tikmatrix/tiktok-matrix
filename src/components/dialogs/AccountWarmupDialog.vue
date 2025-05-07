<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('accountWarmupWarning') }}</span>
    </div>
  </div>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-40">{{ $t('taskArgs') }}:</label>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-1 cursor-pointer">
          <input type="radio" name="settingsOption" value="group" class="radio radio-sm radio-primary"
            v-model="settings" />
          <span>{{ $t('group') }}</span>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input type="radio" name="settingsOption" value="custom" class="radio radio-sm radio-primary"
            v-model="settings" />
          <span>{{ $t('custom') }}</span>
        </label>
      </div>
    </div>
    <template v-if="settings === 'custom'">
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('startTime') }}:</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="startOption" value="now" class="radio radio-sm radio-primary"
              v-model="startOption" />
            <span>{{ $t('startNow') }}</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="startOption" value="scheduled" class="radio radio-sm radio-primary"
              v-model="startOption" />
            <span>{{ $t('scheduleTime') }}</span>
          </label>
        </div>
        <div v-if="startOption === 'scheduled'" class="flex items-center">
          <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="scheduledTime" />
        </div>

      </div>

      <div>

        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('viewDuration') }}:</label>
          <VueSlider v-model="view_duration" :width="300" :min="10" :max="180"
            :marks="{ 10: '10' + $t('second'), 90: '90' + $t('second'), 180: '180' + $t('second') }" />

          <div role="alert" class="alert w-96 ml-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="stroke-info shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('viewDurationTips') }}</span>
          </div>
        </div>
        <div class="flex w-full items-center gap-2 mb-8">
          <label class="font-bold w-40">{{ $t('taskDuration') }}:</label>
          <VueSlider v-model="taskDurationInMinutes" :width="500" :min="10" :max="60"
            :marks="{ 10: '10' + $t('minute'), 20: '20' + $t('minute'), 30: '30' + $t('minute'), 40: '40' + $t('minute'), 50: '50' + $t('minute'), 60: '60' + $t('minute') }" />
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('topics') }}:</label>
          <textarea class="textarea textarea-success w-xl" :placeholder="$t('topicsTips')" autocomplete="off"
            v-model="topic"> </textarea>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('comments') }}:</label>
          <textarea class="textarea textarea-success w-lg" :placeholder="$t('commentsTips')" autocomplete="off"
            v-model="comment"> </textarea>
          <div class="flex flex-col gap-2">
            <div class="flex flex-row items-center gap-2">
              <label class="font-bold">{{ $t('insertEmoji') }}:</label>
              <input type="checkbox" class="toggle toggle-accent" v-model="insert_emoji"
                title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
            </div>
            <div class="flex flex-row items-center">
              <label class="font-bold">{{ $t('commentOrder') }}:</label>
              <div class="flex items-center">
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
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('interact') }}:</label>
          <div class="flex flex-wrap gap-8">
            <!-- 关注概率滑块 -->
            <div class="flex flex-col">
              <div class="flex justify-between items-center mb-1">
                <label class="text-md">{{ $t('follow') }}: </label>
                <span class="text-md font-medium">{{ floow_probable }}%</span>
              </div>
              <VueSlider v-model="floow_probable" :width="100" :min="0" :max="100"
                :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
            </div>

            <!-- 点赞概率滑块 -->
            <div class="flex flex-col">
              <div class="flex justify-between items-center mb-1">
                <label class="text-md">{{ $t('like') }}: </label>
                <span class="text-md font-medium">{{ like_probable }}%</span>
              </div>
              <VueSlider v-model="like_probable" :width="100" :min="0" :max="100"
                :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
            </div>

            <!-- 收藏概率滑块 -->
            <div class="flex flex-col">
              <div class="flex justify-between items-center mb-1">
                <label class="text-md">{{ $t('favorite') }}: </label>
                <span class="text-md font-medium">{{ collect_probable }}%</span>
              </div>
              <VueSlider v-model="collect_probable" :width="100" :min="0" :max="100"
                :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
            </div>

            <!-- 评论概率滑块 -->
            <div class="flex flex-col">
              <div class="flex justify-between items-center mb-1">
                <label class="text-md">{{ $t('comment') }}: </label>
                <span class="text-md font-medium">{{ comment_probable }}%</span>
              </div>
              <VueSlider v-model="comment_probable" :width="100" :min="0" :max="100"
                :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>
<script>
import VueSlider from "vue-3-slider-component";
export default {
  name: 'AccountWarmupDialog',
  components: {
    VueSlider
  },
  data() {
    return {
      settings: localStorage.getItem('settings') || 'custom',
      task_duration: Number(localStorage.getItem('task_duration')) || 10,
      startOption: localStorage.getItem('startOption') || 'now',
      scheduledTime: localStorage.getItem('scheduledTime') || '',
      insert_emoji: localStorage.getItem('insert_emoji') === 'true' || false,
      comment_order: localStorage.getItem('comment_order') || 'random',
      floow_probable: Number(localStorage.getItem('floow_probable')) || 10,
      like_probable: Number(localStorage.getItem('like_probable')) || 10,
      collect_probable: Number(localStorage.getItem('collect_probable')) || 10,
      comment_probable: Number(localStorage.getItem('comment_probable')) || 10,
      min_duration: Number(localStorage.getItem('min_duration')) || 15,
      max_duration: Number(localStorage.getItem('max_duration')) || 30,
      topic: localStorage.getItem('topic') || '',
      comment: localStorage.getItem('comment') || '',
    }
  },
  computed: {
    taskDurationInMinutes: {
      get() {
        return this.task_duration / 60
      },
      set(value) {
        this.task_duration = value * 60
      }
    },
    view_duration: {
      get() {
        return [this.min_duration, this.max_duration]
      },
      set(value) {
        this.min_duration = value[0]
        this.max_duration = value[1]
      }
    },


  },
  watch: {
    'scheduledTime': function (val) {
      localStorage.setItem('scheduledTime', val)
    },
    'insert_emoji': function (val) {
      localStorage.setItem('insert_emoji', val)
    },
    'task_duration': function (val) {
      localStorage.setItem('task_duration', val)
    },
    'like_probable': function (val) {
      localStorage.setItem('like_probable', val)
    },
    'collect_probable': function (val) {
      localStorage.setItem('collect_probable', val)
    },
    'comment_probable': function (val) {
      localStorage.setItem('comment_probable', val)
    },
    'floow_probable': function (val) {
      localStorage.setItem('floow_probable', val)
    },
    'comment_order': function (val) {
      localStorage.setItem('comment_order', val)
      if (val !== 'random' && val !== 'sequential') {
        this.comment_order = 'random'
      }
    },
    'min_duration': function (val) {
      localStorage.setItem('min_duration', val)
    },
    'max_duration': function (val) {
      localStorage.setItem('max_duration', val)
    },
    'topic': function (val) {
      localStorage.setItem('topic', val)
    },
    'comment': function (val) {
      localStorage.setItem('comment', val)
    },
    'startOption': function (val) {
      localStorage.setItem('startOption', val)
    },
    'settings': function (val) {
      localStorage.setItem('settings', val)
    },

  },
  methods: {
    async runScript() {
      await this.$emiter('run_now_by_account', {
        name: 'account_warmup', args: {
          settings: this.settings,
          task_duration: this.task_duration,
          start_time: this.startOption === 'scheduled' ? this.scheduledTime : '',
          insert_emoji: this.insert_emoji,
          comment_order: this.comment_order,
          floow_probable: Number(this.floow_probable),
          like_probable: Number(this.like_probable),
          collect_probable: Number(this.collect_probable),
          comment_probable: Number(this.comment_probable),
          topic: this.topic,
          comment: this.comment,
          min_duration: Number(this.min_duration),
          max_duration: Number(this.max_duration),
        }
      })
    },
  },
  async mounted() {
  }
}
</script>
