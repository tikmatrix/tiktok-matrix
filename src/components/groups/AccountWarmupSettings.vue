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
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('viewDuration') }}:</label>
        <VueSlider v-model="view_duration" :width="300" :min="10" :max="180"
          :marks="{ 10: '10' + $t('second'), 90: '90' + $t('second'), 180: '180' + $t('second') }" />

        <div role="alert" class="alert w-96 ml-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('viewDurationTips') }}</span>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-8">
        <label class="font-bold w-40">{{ $t('taskDuration') }}:</label>
        <VueSlider v-model="trainDurationInMinutes" :width="500" :min="10" :max="60"
          :marks="{ 10: '10' + $t('minute'), 20: '20' + $t('minute'), 30: '30' + $t('minute'), 40: '40' + $t('minute'), 50: '50' + $t('minute'), 60: '60' + $t('minute') }" />
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('topics') }}:</label>
        <textarea class="textarea textarea-success w-xl" :placeholder="$t('topicsTips')" autocomplete="off"
          v-model="mygroup.topic"> </textarea>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('comments') }}:</label>
        <div class="flex flex-col w-full gap-2">
          <div class="flex flex-row items-center gap-2">
            <label class="font-bold">{{ $t('generateByChatGPT') }}:</label>
            <input type="checkbox" class="toggle toggle-accent" :true-value=1 :false-value=0
              v-model="mygroup.generate_by_chatgpt" />
          </div>
          <div v-if="mygroup.generate_by_chatgpt" class="flex flex-col gap-2">
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
              v-model="mygroup.comment"> </textarea>
            <div class="flex flex-row items-center gap-2 absolute top-2 right-4 pl-2 pr-2 rounded">
              <label class="font-bold">{{ $t('insertEmoji') }}:</label>
              <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.insert_emoji" :true-value=1
                :false-value=0
                title="😃, 😄, 😁, 😆, 😅, 😂, 🤣, 😊, 😇, 🙂, 🙃, 😉, 😋, 😛, 😝, 😜, 🤪, 😎, 🤩, 🥳, 😏, 🤗, 🤠, 😍, 😘, 😚, 😙, 😗, 🥰, 🤤, 😻, 😽, 💖, 💗, 💓, 💞, 💕, 💟, ❣️, 💌, 🌟, ✨, 💫, 🎉, 🎊, 🎁, 🎈, 🍾, 🥂, 🍻" />
            </div>
            <div class="flex flex-row items-center absolute top-8 right-4 pl-2 pr-2 rounded">
              <label class="font-bold">{{ $t('commentOrder') }}:</label>
              <div class="flex items-center">
                <label class="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="commentOrder" value="random" class="radio radio-sm radio-primary"
                    v-model="mygroup.comment_order" />
                  <span>{{ $t('random') }}</span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="commentOrder" value="sequential" class="radio radio-sm radio-primary"
                    v-model="mygroup.comment_order" />
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
              <span class="text-md font-medium">{{ mygroup.floow_probable }}%</span>
            </div>
            <VueSlider v-model="mygroup.floow_probable" :width="100" :min="0" :max="100"
              :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
          </div>

          <!-- 点赞概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('like') }}: </label>
              <span class="text-md font-medium">{{ mygroup.like_probable }}%</span>
            </div>
            <VueSlider v-model="mygroup.like_probable" :width="100" :min="0" :max="100"
              :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
          </div>

          <!-- 收藏概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('favorite') }}: </label>
              <span class="text-md font-medium">{{ mygroup.collect_probable }}%</span>
            </div>
            <VueSlider v-model="mygroup.collect_probable" :width="100" :min="0" :max="100"
              :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
          </div>

          <!-- 评论概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('comment') }}: </label>
              <span class="text-md font-medium">{{ mygroup.comment_probable }}%</span>
            </div>
            <VueSlider v-model="mygroup.comment_probable" :width="100" :min="0" :max="100"
              :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
          </div>
        </div>
      </div>
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
export default {
  components: {
    VueSlider
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  computed: {
    trainDurationInMinutes: {
      get() {
        return (this.mygroup.train_duration / 60) || 10
      },
      set(value) {
        this.mygroup.train_duration = value * 60
      }
    },
    view_duration: {
      get() {
        return [this.mygroup.min_duration, this.mygroup.max_duration]
      },
      set(value) {
        this.mygroup.min_duration = value[0]
        this.mygroup.max_duration = value[1]
      }
    }
  },
  data() {
    return {
      mygroup: {},
      trainTimes: [],
      chatgpt_settings: {},
      testResult: '',
      testResultStyle: 'text-gray-500',
    }
  },
  watch: {
    'mygroup.auto_train': function (val) {
      this.mygroup.auto_train = Number(val)
    },
    'mygroup.insert_emoji': function (val) {
      this.mygroup.insert_emoji = Number(val)
    },

    'mygroup.train_duration': function (val) {
      this.mygroup.train_duration = Number(val)
    },
    'mygroup.like_probable': function (val) {
      this.mygroup.like_probable = Number(val)
    },
    'mygroup.collect_probable': function (val) {
      this.mygroup.collect_probable = Number(val)
    },
    'mygroup.comment_probable': function (val) {
      this.mygroup.comment_probable = Number(val)
    },
    'mygroup.floow_probable': function (val) {
      this.mygroup.floow_probable = Number(val)
    },
    'mygroup.comment_order': function (val) {
      if (val !== 'random' && val !== 'sequential') {
        this.mygroup.comment_order = 'random'
      }
    },
  },
  methods: {
    async testChatGPT() {
      try {
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
        system_prompt: 'You are a TikTok comment generation assistant. Please generate a real user comment based on the TikTok post caption content provided by the user. The comment format includes text and emojis; the comment length should not exceed 100 characters; the comment content should include two parts: First Praise the post based on the post caption; Then Promote TikZenX: TikZenX is a phone farm automation software that automates the management of hundreds of TikTok accounts from one computer. If you are interested, please Google search: TikZenX'
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
  },
}
</script>
