<template>
  <div class="bg-base-100 flex flex-col items-start p-4">

    <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-2">{{ $t('autoTrain') }}:</label>
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
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="train_time1" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="train_time2" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="train_time3" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="train_time4" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="train_time5" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="train_time6" placeholder="00:00" />
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
      <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-1">{{ $t('comments') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-16 leading-tight"
          :placeholder="$t('commentsTips')" autocomplete="off" v-model="mygroup.comment"> </textarea>
      </div>
      <div class="grid grid-cols-10 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('interact') }}:</label>
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
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        @click="update">
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
      train_time1: '',
      train_time2: '',
      train_time3: '',
      train_time4: '',
      train_time5: '',
      train_time6: '',

    }
  },
  watch: {
    'mygroup.auto_train': function (val) {
      this.mygroup.auto_train = Number(val)
    },


  },
  methods: {
    async update() {
      this.mygroup.train_start_time = [this.train_time1, this.train_time2, this.train_time3, this.train_time4, this.train_time5, this.train_time6]
        .filter(Boolean)
        .join(',')
      if (this.mygroup.auto_train == 1 && !this.mygroup.train_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('showToast', this.$t('trainStartTimeFormatError'))
        return
      }
      this.updateGroup(this.mygroup)
    },

    async updateGroup(group) {
      this.$service
        .update_group(group)
        .then(async () => {
          await this.$emiter('closePageDialog', {})
          await this.$emiter('reload_group', {})
        })
    },
  },
  async mounted() {
    this.mygroup = this.group
    if (this.mygroup.train_start_time) {
      const [train_time1, train_time2, train_time3, train_time4, train_time5, train_time6] = this.mygroup.train_start_time.split(',')
      this.train_time1 = train_time1
      this.train_time2 = train_time2
      this.train_time3 = train_time3
      this.train_time4 = train_time4
      this.train_time5 = train_time5
      this.train_time6 = train_time6
    }

  },

}
</script>
