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
          <input type="radio" name="settingsOption" value="group" class="radio radio-md radio-primary"
            v-model="settings" />
          <span>{{ $t('group') }}</span>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input type="radio" name="settingsOption" value="custom" class="radio radio-md radio-primary"
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
            <input type="radio" name="startOption" value="now" class="radio radio-md radio-primary"
              v-model="startOption" />
            <span>{{ $t('startNow') }}</span>
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="startOption" value="scheduled" class="radio radio-md radio-primary"
              v-model="startOption" />
            <span>{{ $t('scheduleTime') }}</span>
          </label>
        </div>
        <div v-if="startOption === 'scheduled'" class="flex items-center">
          <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="scheduledTime" />
        </div>
      </div>

      <!-- 使用公共表单组件 -->
      <AccountWarmupFormFields :formData="formDataForFields" @update:formData="updateFormData" />
    </template>

  </div>

</template>
<script>
import { accountWarmupSettings } from '@/utils/settingsManager';
import AccountWarmupFormFields from '@/components/common/AccountWarmupFormFields.vue';

const accountWarmupMixin = accountWarmupSettings.createVueMixin(
  {
    settings: 'custom',
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
    comment: 'Great video!\nLove this content!\nAwesome!',
    generate_by_chatgpt: false,
    chatgpt_settings: {
      url: 'https://api.openai.com/v1/chat/completions',
      api_key: '',
      model: 'gpt-4o-mini',
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
    AccountWarmupFormFields
  },
  data() {
    return {
    }
  },
  computed: {
    // 为 AccountWarmupFormFields 组件准备数据
    formDataForFields() {
      return {
        view_duration: [this.min_duration, this.max_duration],
        taskDurationInMinutes: this.task_duration / 60,
        topic: this.topic,
        comment: this.comment,
        generate_by_chatgpt: this.generate_by_chatgpt,
        chatgpt_settings: this.chatgpt_settings,
        insert_emoji: this.insert_emoji,
        comment_order: this.comment_order,
        floow_probable: this.floow_probable,
        like_probable: this.like_probable,
        collect_probable: this.collect_probable,
        comment_probable: this.comment_probable,
      };
    }
  },
  methods: {
    // 更新表单数据
    updateFormData(newData) {
      // 处理 view_duration
      if (newData.view_duration) {
        this.min_duration = newData.view_duration[0];
        this.max_duration = newData.view_duration[1];
      }

      // 处理 taskDurationInMinutes
      if (newData.taskDurationInMinutes !== undefined) {
        this.task_duration = newData.taskDurationInMinutes * 60;
      }

      // 处理其他字段
      const fieldsToUpdate = [
        'topic', 'comment', 'generate_by_chatgpt', 'chatgpt_settings',
        'insert_emoji', 'comment_order', 'floow_probable', 'like_probable',
        'collect_probable', 'comment_probable'
      ];

      fieldsToUpdate.forEach(key => {
        if (newData[key] !== undefined) {
          this[key] = newData[key];
        }
      });
    },

    async runScript(enable_multi_account = false, rotate_proxy = false) {
      await this.$emiter('run_now_by_account', {
        name: 'account_warmup', args: {
          start_time: this.startOption === 'scheduled' ? this.scheduledTime : '',
          min_duration: Number(this.min_duration),
          max_duration: Number(this.max_duration),
          enable_multi_account: enable_multi_account,
          rotate_proxy: rotate_proxy,
        }
      })
      return true;
    },
  }
}
</script>
