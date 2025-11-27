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
import AccountWarmupFormFields from '@/components/common/AccountWarmupFormFields.vue';
import { SettingsManager } from '@/utils/settingsManager';

const createDefaultWarmupSettings = () => ({
  auto_train: 0,
  train_start_time: '',
  min_duration: 10,
  max_duration: 90,
  task_duration: 300,
  topic: '',
  comment: '',
  generate_by_chatgpt: false,
  chatgpt_settings: {
    url: 'https://api.openai.com/v1/chat/completions',
    api_key: '',
    model: 'gpt-4o-mini',
    system_prompt: 'You are a TikTok comment generation assistant. Please generate a real user comment based on the TikTok post caption content provided by the user. The comment format includes text and emojis; the comment length should not exceed 100 characters; the comment content should include two parts: First Praise the post based on the post caption; Then Promote TikMatrix: TikMatrix is a phone farm automation software that automates the management of hundreds of TikTok accounts from one computer. If you are interested, please Google search: TikMatrix'
  },
  insert_emoji: false,
  comment_order: 'random',
  floow_probable: 50,
  like_probable: 50,
  collect_probable: 50,
  comment_probable: 50
});

const DEFAULT_WARMUP_SETTINGS_TEMPLATE = createDefaultWarmupSettings();

const WARMUP_SETTING_KEYS = [
  'auto_train', 'train_start_time', 'min_duration', 'max_duration', 'task_duration',
  'topic', 'comment', 'generate_by_chatgpt', 'chatgpt_settings', 'insert_emoji',
  'comment_order', 'floow_probable', 'like_probable', 'collect_probable', 'comment_probable'
];

export default {
  components: {
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
      const minDuration = this.min_duration ?? 10;
      const maxDuration = this.max_duration ?? 90;
      const trainDuration = this.task_duration || 300;

      return {
        view_duration: [minDuration, maxDuration],
        taskDurationInMinutes: trainDuration / 60,
        topic: this.topic || '',
        comment: this.comment || '',
        generate_by_chatgpt: this.generate_by_chatgpt,
        chatgpt_settings: this.chatgpt_settings,
        insert_emoji: this.insert_emoji,
        comment_order: this.comment_order || 'random',
        floow_probable: this.floow_probable ?? 50,
        like_probable: this.like_probable ?? 50,
        collect_probable: this.collect_probable ?? 50,
        comment_probable: this.comment_probable ?? 50,
      };
    }
  },
  data() {
    const defaults = createDefaultWarmupSettings();
    return {
      ...defaults,
      mygroup: {
        auto_train: '0',
        train_start_time: '',
        min_duration: defaults.min_duration,
        max_duration: defaults.max_duration,
        task_duration: defaults.task_duration,
        topic: '',
        comment: '',
        generate_by_chatgpt: defaults.generate_by_chatgpt,
        insert_emoji: defaults.insert_emoji,
        comment_order: defaults.comment_order,
        floow_probable: defaults.floow_probable,
        like_probable: defaults.like_probable,
        collect_probable: defaults.collect_probable,
        comment_probable: defaults.comment_probable
      },
      trainTimes: [],
      warmupSettingsManager: null,
      warmupSettingsUnwatchFns: []
    }
  },
  watch: {
    'mygroup.auto_train'(val) {
      const numeric = Number(val);
      this.auto_train = Number.isNaN(numeric) ? 0 : numeric;
    },
    auto_train(val) {
      const normalized = Number.isNaN(Number(val)) ? '0' : String(Number(val));
      if (this.mygroup.auto_train !== normalized) {
        this.mygroup.auto_train = normalized;
      }
    },
    'mygroup.train_start_time'(val) {
      const normalized = typeof val === 'string' ? val : '';
      if (this.train_start_time !== normalized) {
        this.train_start_time = normalized;
      }
      this.trainTimes = normalized
        ? normalized.split(',').map(time => time.trim()).filter(Boolean)
        : [];
    },
    train_start_time(val) {
      const normalized = typeof val === 'string' ? val : '';
      if (this.mygroup.train_start_time !== normalized) {
        this.mygroup.train_start_time = normalized;
      }
      this.trainTimes = normalized
        ? normalized.split(',').map(time => time.trim()).filter(Boolean)
        : [];
    },
    trainTimes: {
      handler(newTimes) {
        const normalized = Array.isArray(newTimes)
          ? newTimes.map(time => (typeof time === 'string' ? time.trim() : '')).filter(Boolean).join(',')
          : '';
        if (this.train_start_time !== normalized) {
          this.train_start_time = normalized;
        }
      },
      deep: true
    }
  },
  methods: {
    async initializeWarmupSettings() {
      this.warmupSettingsManager = new SettingsManager(`group_${this.group.id}_account_warmup_settings.json`);
      await this.loadLocalWarmupSettings();
      this.applyGroupOverrides();
      this.setupWarmupWatchers();
    },

    async loadLocalWarmupSettings() {
      if (!this.warmupSettingsManager) {
        return;
      }

      const defaults = createDefaultWarmupSettings();
      try {
        const settings = await this.warmupSettingsManager.loadSettings(defaults);
        Object.keys(defaults).forEach(key => {
          if (!(key in this.$data)) {
            return;
          }

          const defaultValue = defaults[key];
          const loadedValue = settings[key];
          this[key] = this.cloneSettingValue(defaultValue, loadedValue);
        });
      } catch (error) {
        console.error('Failed to load local warmup settings:', error);
      }
    },

    cloneSettingValue(defaultValue, loadedValue) {
      if (Array.isArray(defaultValue)) {
        if (Array.isArray(loadedValue)) {
          return [...loadedValue];
        }
        return [...defaultValue];
      }

      if (typeof defaultValue === 'number') {
        const numeric = Number(loadedValue);
        return Number.isFinite(numeric) ? numeric : defaultValue;
      }

      if (typeof defaultValue === 'boolean') {
        if (typeof loadedValue === 'string') {
          const lower = loadedValue.toLowerCase();
          if (lower === 'true' || lower === '1') {
            return true;
          }
          if (lower === 'false' || lower === '0') {
            return false;
          }
        }
        if (typeof loadedValue === 'number') {
          return loadedValue === 1;
        }
        if (typeof loadedValue === 'boolean') {
          return loadedValue;
        }
        return defaultValue;
      }

      if (defaultValue !== null && typeof defaultValue === 'object') {
        const source = loadedValue && typeof loadedValue === 'object'
          ? loadedValue
          : defaultValue;
        return JSON.parse(JSON.stringify(source));
      }

      return loadedValue !== undefined ? loadedValue : defaultValue;
    },

    applyGroupOverrides() {
      const overrideKeys = [
        'auto_train', 'train_start_time', 'min_duration', 'max_duration', 'task_duration',
        'topic', 'comment', 'generate_by_chatgpt', 'chatgpt_settings', 'insert_emoji',
        'comment_order', 'floow_probable', 'like_probable', 'collect_probable', 'comment_probable'
      ];

      overrideKeys.forEach(key => {
        const value = this.mygroup[key];
        if (value === undefined || value === null) {
          return;
        }

        if (key === 'auto_train') {
          const numeric = Number(value);
          this.auto_train = Number.isNaN(numeric) ? 0 : numeric;
        } else if (key === 'train_start_time') {
          const normalized = typeof value === 'string' ? value : '';
          this.train_start_time = normalized;
        } else if (key === 'chatgpt_settings') {
          if (typeof value === 'string') {
            try {
              this.chatgpt_settings = JSON.parse(value);
            } catch (error) {
              console.warn('Failed to parse group chatgpt_settings, using default:', error);
              this.chatgpt_settings = JSON.parse(JSON.stringify(DEFAULT_WARMUP_SETTINGS_TEMPLATE.chatgpt_settings));
            }
          } else {
            this.chatgpt_settings = this.cloneSettingValue(DEFAULT_WARMUP_SETTINGS_TEMPLATE.chatgpt_settings, value);
          }
        } else {
          this[key] = Array.isArray(value) || (value !== null && typeof value === 'object')
            ? this.cloneSettingValue(DEFAULT_WARMUP_SETTINGS_TEMPLATE[key] ?? value, value)
            : value;
        }
      });

      if (this.train_start_time && !this.trainTimes.length) {
        this.trainTimes = this.train_start_time.split(',').map(time => time.trim()).filter(Boolean);
      }
    },

    setupWarmupWatchers() {
      this.teardownWarmupWatchers();
      if (!this.warmupSettingsManager) {
        return;
      }

      WARMUP_SETTING_KEYS.forEach(key => {
        const defaultValue = DEFAULT_WARMUP_SETTINGS_TEMPLATE[key];
        const needsDeepWatch = Array.isArray(defaultValue) || (defaultValue !== null && typeof defaultValue === 'object');
        const unwatch = this.$watch(key, () => {
          this.saveLocalWarmupSettings();
        }, { deep: needsDeepWatch });
        this.warmupSettingsUnwatchFns.push(unwatch);
      });
    },

    teardownWarmupWatchers() {
      if (!this.warmupSettingsUnwatchFns.length) {
        return;
      }
      this.warmupSettingsUnwatchFns.forEach(unwatch => {
        if (typeof unwatch === 'function') {
          unwatch();
        }
      });
      this.warmupSettingsUnwatchFns = [];
    },

    async saveLocalWarmupSettings() {
      if (!this.warmupSettingsManager) {
        return false;
      }

      const payload = {};
      WARMUP_SETTING_KEYS.forEach(key => {
        const value = this[key];
        if (Array.isArray(value)) {
          payload[key] = [...value];
        } else if (value !== null && typeof value === 'object') {
          payload[key] = JSON.parse(JSON.stringify(value));
        } else {
          payload[key] = value;
        }
      });

      try {
        await this.warmupSettingsManager.saveSettings(payload);
        return true;
      } catch (error) {
        console.error('Failed to save local warmup settings:', error);
        return false;
      }
    },
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
          this[key] = newData[key];
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
      const normalizedTimes = this.trainTimes
        .map(time => (typeof time === 'string' ? time.trim() : ''))
        .filter(Boolean);
      this.trainTimes = normalizedTimes;
      this.train_start_time = normalizedTimes.join(',');
      this.auto_train = Number(this.auto_train ?? this.mygroup.auto_train ?? 0);

      if (this.auto_train === 1 && !this.train_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('trainStartTimeFormatError'),
          timeout: 2000
        });
        return
      }

      const saved = await this.saveLocalWarmupSettings();
      if (!saved) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('saveConfigError') || 'Failed to save configuration file',
          timeout: 2000
        });
        return;
      }

      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('configFileSaved') || 'Configuration saved successfully',
        timeout: 2000
      });
      await this.$emiter('closeDialog', {})
      await this.$emiter('reload_groups', {})
    },
  },
  async created() {
    this.mygroup = { ...this.group };
    if (this.mygroup.auto_train === undefined || this.mygroup.auto_train === null) {
      this.mygroup.auto_train = '0';
    }
    if (this.mygroup.train_start_time === undefined || this.mygroup.train_start_time === null) {
      this.mygroup.train_start_time = '';
    }
    if (this.mygroup.comment_order === undefined || this.mygroup.comment_order === null) {
      this.mygroup.comment_order = 'random';
    }
    if (this.mygroup.chatgpt_settings && typeof this.mygroup.chatgpt_settings === 'string') {
      try {
        this.chatgpt_settings = JSON.parse(this.mygroup.chatgpt_settings);
      } catch (error) {
        console.warn('Failed to parse chatgpt_settings from group, using default:', error);
        this.chatgpt_settings = JSON.parse(JSON.stringify(DEFAULT_WARMUP_SETTINGS_TEMPLATE.chatgpt_settings));
      }
    } else if (this.mygroup.chatgpt_settings && typeof this.mygroup.chatgpt_settings === 'object') {
      this.chatgpt_settings = JSON.parse(JSON.stringify(this.mygroup.chatgpt_settings));
    } else {
      this.chatgpt_settings = JSON.parse(JSON.stringify(DEFAULT_WARMUP_SETTINGS_TEMPLATE.chatgpt_settings));
    }

    await this.initializeWarmupSettings();
  },
  async mounted() {
    if (this.train_start_time) {
      this.trainTimes = this.train_start_time.split(',').map(time => time.trim()).filter(Boolean);
    }
  },
  beforeUnmount() {
    this.teardownWarmupWatchers();
  }
}
</script>
