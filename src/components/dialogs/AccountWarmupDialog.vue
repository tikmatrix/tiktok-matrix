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
          <textarea class="textarea textarea-success w-full" :placeholder="$t('topicsTips')" autocomplete="off"
            v-model="topic"> </textarea>
        </div>
        <div class="flex w-full items-center gap-2 mb-2">
          <label class="font-bold w-40">{{ $t('comments') }}:</label>
          <div class="flex flex-col w-full gap-2">
            <div class="flex flex-row items-center gap-2">
              <label class="font-bold">{{ $t('generateByChatGPT') }}:</label>
              <input type="checkbox" class="toggle toggle-accent" v-model="generate_by_chatgpt" />
            </div>
            <div v-if="generate_by_chatgpt" class="flex flex-col gap-2">
              <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
                <legend class="fieldset-legend">{{ $t('chatgptSettings') }}</legend>

                <label class="label">{{ $t('url') }}</label>
                <input type="text" class="input w-full" placeholder="https://api.openai.com/v1/chat/completions"
                  v-model="chatgpt_settings.url" />

                <label class="label">{{ $t('apiKey') }}</label>
                <input type="password" class="input w-full" placeholder="sk-********"
                  v-model="chatgpt_settings.api_key" />

                <label class="label">{{ $t('model') }}</label>
                <input type="text" class="input" placeholder="gpt-3.5-turbo" v-model="chatgpt_settings.model" />
                <label class="label">{{ $t('systemPrompt') }}</label>
                <textarea class="textarea textarea-success w-full" :placeholder="$t('systemPromptTips')"
                  autocomplete="off" v-model="chatgpt_settings.system_prompt"> </textarea>
              </fieldset>
              <button class="btn btn-primary" @click="testChatGPT">Test ChatGPT</button>
              <span :class="testResultStyle">{{ testResult }}</span>

            </div>
            <div class="flex flex-col gap-2 relative" v-else>
              <textarea class="textarea textarea-success w-full" :placeholder="$t('commentsTips')" autocomplete="off"
                v-model="comment"> </textarea>
              <div class="flex flex-row items-center gap-2 absolute top-2 right-4">
                <label class="font-bold">{{ $t('insertEmoji') }}:</label>
                <input type="checkbox" class="toggle toggle-accent" v-model="insert_emoji"
                  title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
              </div>
              <div class="flex flex-row items-center absolute top-8 right-4">
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
import { invoke } from "@tauri-apps/api/tauri";
import { accountWarmupSettings } from '@/utils/settingsManager';

const accountWarmupMixin = accountWarmupSettings.createVueMixin(
  {
    settings: 'group',
    startOption: 'now',
    scheduledTime: '09:00',
    task_duration: 1200,
    insert_emoji: false,
    comment_order: 'random',
    floow_probable: 50,
    like_probable: 50,
    collect_probable: 50,
    comment_probable: 50,
    min_duration: 30,
    max_duration: 60,
    topic: '#fyp #foryou #viral',
    comment: '',
    generate_by_chatgpt: false,
    chatgpt_settings: {
      url: 'https://api.openai.com/v1/chat/completions',
      api_key: '',
      model: 'gpt-3.5-turbo',
      system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
    }
  },
  [
    'scheduledTime', 'insert_emoji', 'task_duration', 'like_probable',
    'collect_probable', 'comment_probable', 'floow_probable', 'comment_order',
    'min_duration', 'max_duration', 'topic', 'comment', 'generate_by_chatgpt',
    'chatgpt_settings', 'settings', 'startOption'
  ]
);

export default {
  mixins: [accountWarmupMixin],
  name: 'AccountWarmupDialog',
  components: {
    VueSlider
  },
  data() {
    return {
      testResult: '',
      testResultStyle: 'text-gray-500',
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
  methods: {
    async testChatGPT() {
      try {
        await this.saveSettings(); // 先保存设置
        this.testResult = 'Testing...';
        this.testResultStyle = 'text-warning';
        const response = await this.$service.chatgpt_completion({
          url: this.chatgpt_settings.url,
          api_key: this.chatgpt_settings.api_key,
          model: this.chatgpt_settings.model,
          system_prompt: this.chatgpt_settings.system_prompt,
          post_caption: 'This is a test post caption for TikTok.',
        });
        console.log(response);
        if (response.code == 0) {
          this.testResult = response.data;
          this.testResultStyle = 'text-success';
        } else {
          this.testResult = response.data;
          this.testResultStyle = 'text-error';
        }
      } catch (error) {
        this.testResult = 'Error: ' + error.message;
        this.testResultStyle = 'text-error';
      }
    },
    async runScript(enable_multi_account) {
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
          generate_by_chatgpt: this.generate_by_chatgpt,
          chatgpt_settings: JSON.stringify(this.chatgpt_settings),
          enable_multi_account: enable_multi_account
        }
      })
    },
  }
}
</script>
