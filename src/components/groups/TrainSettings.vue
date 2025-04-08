<template>
  <div class="bg-base-100 flex flex-col items-start p-4">

    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-40">{{ $t('scheduledTrain') }}:</label>
      <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.auto_train" true-value="1" false-value="0" />
      <div role="alert" class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('trainTimeTips') }}</span>
      </div>
    </div>

    <div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('trainTimer') }}:</label>
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
          <button v-if="trainTimes.length < 6" @click="addTime" class="p-2 text-primary hover:text-primary-focus">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('viewDuration') }}:</label>
        <!-- 最小观看时长 -->
        <div class="flex flex-col">
          <div class="flex justify-between items-center mb-1 gap-1">
            <span class="text-md">{{ $t('minDuration') }}:</span>
            <span class="text-md font-bold text-primary">{{ mygroup.min_duration }}</span>
            <span class="text-md text-info">{{ $t('second') }}</span>
          </div>
          <input type="range" min="10" max="180" step="1" :max="Math.min(180, mygroup.max_duration)"
            class="range range-success range-md" v-model="mygroup.min_duration" />
          <div class="flex justify-between text-md px-1">
            <span>10</span>
            <span>{{ Math.min(180, mygroup.max_duration) }}</span>
          </div>
        </div>

        <!-- 最大观看时长 -->
        <div class="flex flex-col">
          <div class="flex justify-between items-center mb-1 gap-1">
            <span class="text-md">{{ $t('maxDuration') }}:</span>
            <span class="text-md font-bold text-warning">{{ mygroup.max_duration }}</span>
            <span class="text-md text-info">{{ $t('second') }}</span>
          </div>
          <input type="range" min="10" max="180" step="1" :min="Math.max(10, mygroup.min_duration)"
            class="range range-success range-md" v-model="mygroup.max_duration" />
          <div class="flex justify-between text-md px-1">
            <span>{{ Math.max(10, mygroup.min_duration) }}</span>
            <span>180</span>
          </div>
        </div>
        <div role="alert" class="alert w-96">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ $t('viewDurationTips') }}</span>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('trainDuration') }}:</label>
        <div class="flex flex-col w-96">
          <div class="flex justify-between items-center mb-1 gap-1">
            <span class="text-md font-bold text-primary">{{ trainDurationInMinutes }}</span>
            <span class="text-md text-info">{{ $t('minute') }}</span>
          </div>
          <input type="range" min="10" max="60" step="1" class="range range-success range-md"
            v-model="trainDurationInMinutes" />
          <div class="flex justify-between text-md px-1">
            <span>10</span>
            <span>60</span>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('topics') }}:</label>
        <textarea class="textarea textarea-success w-xl" :placeholder="$t('topicsTips')" autocomplete="off"
          v-model="mygroup.topic"> </textarea>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('comments') }}:</label>
        <textarea class="textarea textarea-success w-xl" :placeholder="$t('commentsTips')" autocomplete="off"
          v-model="mygroup.comment"> </textarea>
        <div class="flex flex-col gap-2">
          <div class="flex flex-row items-center gap-2">
            <label class="font-bold">{{ $t('insertEmoji') }}:</label>
            <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.insert_emoji" :true-value=1
              :false-value=0 />
          </div>
          <div class="flex flex-row items-center gap-2">
            <label class="font-bold">{{ $t('commentOrder') }}:</label>
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="commentOrder" value="random" class="radio radio-sm radio-primary" v-model="mygroup.comment_order" />
                <span>{{ $t('random') }}</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="commentOrder" value="sequential" class="radio radio-sm radio-primary" v-model="mygroup.comment_order" />
                <span>{{ $t('sequential') }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('interact') }}:</label>
        <div class="flex flex-wrap gap-2">
          <!-- 关注概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('follow') }}: </label>
              <span class="text-md font-medium">{{ mygroup.floow_probable }}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" class="range range-success range-md"
              v-model="mygroup.floow_probable" />
          </div>

          <!-- 点赞概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('like') }}: </label>
              <span class="text-md font-medium">{{ mygroup.like_probable }}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" class="range range-success range-md"
              v-model="mygroup.like_probable" />
          </div>

          <!-- 收藏概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('favorite') }}: </label>
              <span class="text-md font-medium">{{ mygroup.collect_probable }}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" class="range range-success range-md"
              v-model="mygroup.collect_probable" />
          </div>

          <!-- 评论概率滑块 -->
          <div class="flex flex-col">
            <div class="flex justify-between items-center mb-1">
              <label class="text-md">{{ $t('comment') }}: </label>
              <span class="text-md font-medium">{{ mygroup.comment_probable }}%</span>
            </div>
            <input type="range" min="0" max="100" step="1" class="range range-success range-md"
              v-model="mygroup.comment_probable" />
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
export default {
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  computed: {
    trainDurationInMinutes: {
      get() {
        return this.mygroup.train_duration / 60
      },
      set(value) {
        this.mygroup.train_duration = value * 60
      }
    }
  },
  data() {
    return {
      mygroup: {},
      trainTimes: [],
    }
  },
  watch: {
    'mygroup.auto_train': function (val) {
      this.mygroup.auto_train = Number(val)
    },
    'mygroup.insert_emoji': function (val) {
      this.mygroup.insert_emoji = Number(val)
    },
    'mygroup.min_duration': function (val) {
      this.mygroup.min_duration = Number(val)
      if (this.mygroup.min_duration > this.mygroup.max_duration) {
        this.mygroup.max_duration = this.mygroup.min_duration
      }
    },
    'mygroup.max_duration': function (val) {
      this.mygroup.max_duration = Number(val)
      if (this.mygroup.min_duration > this.mygroup.max_duration) {
        this.mygroup.min_duration = this.mygroup.max_duration
      }
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
    addTime() {
      if (this.trainTimes.length < 6) {
        this.trainTimes.push('')
      }
    },
    removeTime(index) {
      this.trainTimes.splice(index, 1)
    },
    async update() {
      this.mygroup.train_start_time = this.trainTimes
        .filter(Boolean)
        .join(',')
      if (this.mygroup.auto_train == 1 && !this.mygroup.train_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('trainStartTimeFormatError'),
          timeout: 2000
        });
        return
      }
      this.updateGroup(this.mygroup)
    },
    async updateGroup(group) {
      this.$service
        .update_group(group)
        .then(async () => {
          await this.$emiter('closeDialog', {})
          await this.$emiter('reload_group', {})
        })
    },
  },
  async mounted() {
    this.mygroup = this.group
    if (this.mygroup.train_start_time) {
      this.trainTimes = this.mygroup.train_start_time.split(',')
    }
    if (!this.mygroup.comment_order) {
      this.mygroup.comment_order = 'random'
    }
  },
}
</script>
