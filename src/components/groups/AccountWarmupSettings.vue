<template>
  <div class="bg-base-100 flex flex-col items-start p-4">

    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-40">{{ $t('enableSchedule') }}:</label>
      <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.auto_train" true-value="1" false-value="0" />
      <div role="alert" class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('enableScheduleTips') }}</span>
      </div>
    </div>

    <div>
      <div class="flex w-full items-center gap-2 mb-2" v-if="mygroup.auto_train == 1">
        <label class="font-bold w-40">{{ $t('scheduleTime') }}:</label>
        <div class="flex flex-wrap gap-2">
          <div v-for="(time, index) in trainTimes" :key="index" class="flex items-center">
            <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="trainTimes[index]"
              :placeholder="'00:00'" />
            <button @click="removeTime(index)" class="ml-1 p-1 text-red-500 hover:text-red-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button @click="addTime" class="p-2 text-primary hover:text-primary-focus">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 使用公共表单组件 -->
      <AccountWarmupFormFields :formData="formDataForFields" @update:formData="updateFormData" />
    </div>

    <!-- other fields... -->
    <div class="mt-8 w-full flex justify-end">
      <button class="btn btn-primary mr-2" @click="update">
        {{ $t('update') }}
      </button>
    </div>
  </div>
</template>

<script>
import VueSlider from "vue-3-slider-component";
import AccountWarmupFormFields from '@/components/common/AccountWarmupFormFields.vue';

export default {
  components: {
    VueSlider,
    AccountWarmupFormFields
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  computed: {
    // 为 AccountWarmupFormFields 组件准备数据
    formDataForFields() {
      const minDuration = this.mygroup.min_duration ?? 10;
      const maxDuration = this.mygroup.max_duration ?? 90;
      const trainDuration = this.mygroup.train_duration || 300;

      return {
        view_duration: [minDuration, maxDuration],
        taskDurationInMinutes: trainDuration / 60,
        topic: this.mygroup.topic || '',
        comment: this.mygroup.comment || '',
        generate_by_chatgpt: this.mygroup.generate_by_chatgpt,
        chatgpt_settings: this.chatgpt_settings,
        insert_emoji: this.mygroup.insert_emoji,
        comment_order: this.mygroup.comment_order || 'random',
        floow_probable: this.mygroup.floow_probable ?? 50,
        like_probable: this.mygroup.like_probable ?? 50,
        collect_probable: this.mygroup.collect_probable ?? 50,
        comment_probable: this.mygroup.comment_probable ?? 50,
      };
    }
  },
  data() {
    return {
      mygroup: {},
      trainTimes: [],
      chatgpt_settings: {},
    }
  },
  watch: {
    'mygroup.auto_train': function (val) {
      this.mygroup.auto_train = Number(val)
    },
  },
  methods: {
    // 更新表单数据
    updateFormData(newData) {
      // 处理 view_duration
      if (newData.view_duration) {
        this.mygroup.min_duration = newData.view_duration[0];
        this.mygroup.max_duration = newData.view_duration[1];
      }

      // 处理 taskDurationInMinutes
      if (newData.taskDurationInMinutes !== undefined) {
        this.mygroup.train_duration = newData.taskDurationInMinutes * 60;
      }

      // 处理 chatgpt_settings
      if (newData.chatgpt_settings) {
        this.chatgpt_settings = newData.chatgpt_settings;
      }

      // 处理其他字段
      const fieldsToUpdate = [
        'topic', 'comment', 'generate_by_chatgpt', 'insert_emoji',
        'comment_order', 'floow_probable', 'like_probable',
        'collect_probable', 'comment_probable'
      ];

      fieldsToUpdate.forEach(key => {
        if (newData[key] !== undefined) {
          this.mygroup[key] = newData[key];
        }
      });
    },
    addTime() {
      const currentTime = new Date();
      this.trainTimes.push(currentTime.toTimeString().slice(0, 5));
    },
    removeTime(index) {
      this.trainTimes.splice(index, 1)
    },
    async update() {
      console.log("trainTimes:", this.trainTimes);
      this.mygroup.train_start_time = this.trainTimes
        .filter(Boolean)
        .join(',')
      console.log("train_start_time:", this.mygroup.train_start_time);
      if (this.mygroup.auto_train == 1 && !this.mygroup.train_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('trainStartTimeFormatError'),
          timeout: 2000
        });
        return
      }
      this.mygroup.chatgpt_settings = JSON.stringify(this.chatgpt_settings)

      // 直接保存到配置文件而不是更新数据库
      await this.saveGroupConfigFile()

      // 保存成功后关闭对话框
      await this.$emiter('closeDialog', {})
      await this.$emiter('reload_group', {})
    },

    // 保存当前设置到group配置文件
    async saveGroupConfigFile() {
      try {
        console.log('Saving group config file for group:', this.mygroup.id);

        // 构建要保存的配置
        const config = {
          auto_train: this.mygroup.auto_train,
          train_start_time: this.mygroup.train_start_time,
          task_duration: this.mygroup.train_duration,
          floow_probable: this.mygroup.floow_probable,
          like_probable: this.mygroup.like_probable,
          collect_probable: this.mygroup.collect_probable,
          comment_probable: this.mygroup.comment_probable,
          topic: this.mygroup.topic || '',
          comment: this.mygroup.comment || '',
          min_duration: this.mygroup.min_duration,
          max_duration: this.mygroup.max_duration,
          insert_emoji: this.mygroup.insert_emoji,
          comment_order: this.mygroup.comment_order || 'random',
          generate_by_chatgpt: this.mygroup.generate_by_chatgpt,
          chatgpt_settings: JSON.stringify(this.chatgpt_settings),
          settings: 'group_file'
        };

        const response = await this.$service.save_group_config_file({
          group_id: this.mygroup.id,
          script_name: 'account_warmup',
          settings: config
        });

        if (response.code === 0) {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('configFileSaved') || 'Configuration saved successfully',
            timeout: 2000
          });
        } else {
          await this.$emiter('NOTIFY', {
            type: 'error',
            message: this.$t('saveConfigError') || 'Failed to save configuration file',
            timeout: 2000
          });
        }
      } catch (error) {
        console.error('Error saving group config file:', error);
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('saveConfigError') || 'Failed to save configuration file',
          timeout: 2000
        });
      }
    },
  },
  async mounted() {
    this.mygroup = { ...this.group }

    // 尝试从配置文件加载设置，如果存在则使用配置文件的设置
    try {
      const response = await this.$service.get_group_config_file({
        group_id: this.mygroup.id,
        script_name: 'account_warmup'
      });

      if (response.code === 0 && response.data) {
        // 如果存在配置文件，则使用配置文件的设置覆盖数据库设置
        const config = response.data;

        // 更新账号预热相关配置
        if (config.auto_train !== undefined) {
          this.mygroup.auto_train = config.auto_train;
        }
        if (config.train_start_time !== undefined) {
          this.mygroup.train_start_time = config.train_start_time;
        }
        if (config.task_duration !== undefined) {
          this.mygroup.train_duration = config.task_duration;
        }
        if (config.floow_probable !== undefined) {
          this.mygroup.floow_probable = config.floow_probable;
        }
        if (config.like_probable !== undefined) {
          this.mygroup.like_probable = config.like_probable;
        }
        if (config.collect_probable !== undefined) {
          this.mygroup.collect_probable = config.collect_probable;
        }
        if (config.comment_probable !== undefined) {
          this.mygroup.comment_probable = config.comment_probable;
        }
        if (config.topic !== undefined) {
          this.mygroup.topic = config.topic;
        }
        if (config.comment !== undefined) {
          this.mygroup.comment = config.comment;
        }
        if (config.min_duration !== undefined) {
          this.mygroup.min_duration = config.min_duration;
        }
        if (config.max_duration !== undefined) {
          this.mygroup.max_duration = config.max_duration;
        }
        if (config.insert_emoji !== undefined) {
          this.mygroup.insert_emoji = config.insert_emoji;
        }
        if (config.comment_order !== undefined) {
          this.mygroup.comment_order = config.comment_order;
        }
        if (config.generate_by_chatgpt !== undefined) {
          this.mygroup.generate_by_chatgpt = config.generate_by_chatgpt;
        }
        if (config.chatgpt_settings !== undefined) {
          this.mygroup.chatgpt_settings = config.chatgpt_settings;
        }

        console.log('Loaded settings from config file for account warmup');
      } else {
        console.log('No config file found, using database settings for account warmup');
      }
    } catch (error) {
      console.log('Failed to load config file, using database settings for account warmup:', error);
    }

    if (!this.mygroup.chatgpt_settings) {
      this.chatgpt_settings = {
        url: 'https://api.openai.com/v1/chat/completions',
        api_key: '',
        model: 'gpt-3.5-turbo',
        system_prompt: 'You are a TikTok comment generation assistant. Please generate a real user comment based on the TikTok post caption content provided by the user. The comment format includes text and emojis; the comment length should not exceed 100 characters; the comment content should include two parts: First Praise the post based on the post caption; Then Promote TikMatrix: TikMatrix is a phone farm automation software that automates the management of hundreds of TikTok accounts from one computer. If you are interested, please Google search: TikMatrix'
      }
    } else {
      this.chatgpt_settings = JSON.parse(this.mygroup.chatgpt_settings)
    }

    if (this.mygroup.train_start_time) {
      this.trainTimes = this.mygroup.train_start_time.split(',')
    }
    if (!this.mygroup.comment_order) {
      this.mygroup.comment_order = 'random'
    }

    // 确保 min_duration 和 max_duration 有默认值
    if (this.mygroup.min_duration === undefined || this.mygroup.min_duration === null) {
      this.mygroup.min_duration = 10
    }
    if (this.mygroup.max_duration === undefined || this.mygroup.max_duration === null) {
      this.mygroup.max_duration = 90
    }
  },
}
</script>
