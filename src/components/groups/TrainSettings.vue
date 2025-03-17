<template>
  <div class="bg-base-100 flex flex-col items-start p-4">

    <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-2">{{ $t('scheduledTrain') }}:</label>
      <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="mygroup.auto_train" true-value="1"
        false-value="0" />
      <div role="alert" class="alert col-span-5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('trainTimeTips') }}</span>
      </div>
    </div>

    <div>
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('trainTimer') }}:</label>
        <div class="col-span-6 flex flex-wrap gap-2">
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
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('viewDuration') }}:</label>
        <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mygroup.min_duration"
          placeholder="0" />
        <label class="text-lg text-center col-span-1 font-bold"> ~ </label>
        <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mygroup.max_duration"
          placeholder="0" />
        <label class="text-sm text-left col-span-1">{{ $t('second') }}</label>
      </div>
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('trainDuration') }}:</label>
        <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="trainDurationInMinutes"
          placeholder="0" />
        <label class="text-sm text-left col-span-1">{{ $t('minute') }}</label>
      </div>
      <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-1">{{ $t('topics') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-16 leading-tight"
          :placeholder="$t('topicsTips')" autocomplete="off" v-model="mygroup.topic"> </textarea>
      </div>
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('comments') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-4 h-16 leading-tight"
          :placeholder="$t('commentsTips')" autocomplete="off" v-model="mygroup.comment"> </textarea>
        <label class="font-bold text-right col-span-1">{{ $t('insertEmoji') }}:</label>
        <input type="checkbox" class="toggle toggle-accent col-span-1" v-model="mygroup.insert_emoji" :true-value=1
          :false-value=0 />
      </div>
      <div class="grid grid-cols-12 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-3">{{ $t('interact') }}:</label>
        <div class="col-span-2 grid grid-cols-6 items-center">
          <label class="text-sm text-right col-span-3">{{ $t('follow') }}: </label>
          <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mygroup.floow_probable"
            placeholder="0" />
          <label class="text-sm text-left col-span-1">%</label>
        </div>
        <div class="col-span-2 grid grid-cols-6 items-center">
          <label class="text-sm text-right col-span-3">{{ $t('like') }}: </label>
          <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mygroup.like_probable"
            placeholder="0" />
          <label class="text-sm text-left col-span-1">%</label>
        </div>
        <div class="col-span-2 grid grid-cols-6 items-center">
          <label class="text-sm text-right col-span-3">{{ $t('favorite') }}: </label>
          <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2"
            v-model="mygroup.collect_probable" placeholder="0" />
          <label class="text-sm text-left col-span-1">%</label>
        </div>
        <div class="col-span-2 grid grid-cols-6 items-center">
          <label class="text-sm text-right col-span-3">{{ $t('comment') }}: </label>
          <input type="number" class="border-2 border-gray-300 p-2 rounded col-span-2"
            v-model="mygroup.comment_probable" placeholder="0" />
          <label class="text-sm text-left col-span-1">%</label>
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
  },
}
</script>
