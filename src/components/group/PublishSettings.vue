<template>
  <div class="bg-base-100 flex flex-col items-start p-4">

    <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-2">{{ $t('autoPublish') }}:</label>
      <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.auto_publish" true-value="1"
        false-value="0" />
      <div role="alert" class="alert col-span-5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('publishTimeTips') }}</span>
      </div>
    </div>
    <div>
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('publishTimer') }}:</label>
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="publish_time1" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="publish_time2" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="publish_time3" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="publish_time4" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="publish_time5" placeholder="00:00" />
        <input class="border-2 border-gray-300 p-2 rounded col-span-1" v-model="publish_time6" placeholder="00:00" />
      </div>
      <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-1">{{ $t('publishType') }}:</label>
        <div class="col-span-2 flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="video" value="0" v-model="mygroup.publish_type"
              class="form-radio text-blue-500 h-4 w-4">
            <label for="video" class="ml-2">{{ $t('video') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="image" value="1" v-model="mygroup.publish_type"
              class="form-radio text-blue-500 h-4 w-4">
            <label for="image" class="ml-2">{{ $t('image') }}</label>
          </div>
          <div class="flex items-center" v-if="mygroup.publish_type == 1">
            <input class="border-2 border-gray-300 p-2 rounded col-span-1 input-sm" v-model="mygroup.image_count"
              :placeholder="$t('imageCount')" type="number" />
          </div>
        </div>
      </div>
      <!-- add sound start -->
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('addSound') }}:</label>
        <div class="col-span-6 flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="disable" value="0" v-model="mygroup.add_sound"
              class="form-radio text-blue-500 h-4 w-4">
            <label for="disable" class="ml-2">{{ $t('disable') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="enable" value="1" v-model="mygroup.add_sound"
              class="form-radio text-blue-500 h-4 w-4">
            <label for="enable" class="ml-2">{{ $t('enable') }}</label>
          </div>
          <!-- add sound tips -->

          <div role="alert" class="alert col-span-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="stroke-info shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('addSoundTips') }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 w-full items-center gap-2 mb-2" v-if="mygroup.add_sound == 1">
        <label class="font-bold text-right col-span-1">{{ $t('soundVolume') }}:</label>
        <div class="flex items-center col-span-3">
          <label class="ml-2 text-right">{{ $t('originSound') }}: </label>
          <input type="range" min="0" max="100" value="25" class="range range-xs range-success w-32" step="25"
            v-model="mygroup.origin_sound_volume" />
          <label class="ml-2 text-right">{{ $t('addSound') }}: </label>
          <input type="range" min="0" max="100" value="25" class="range range-xs range-success w-32" step="25"
            v-model="mygroup.add_sound_volume" />
        </div>
      </div>
      <!-- add sound end-->
      <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-1">{{ $t('titles') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32" :placeholder="$t('titlesTips')"
          autocomplete="off" v-model="mygroup.title"> </textarea>
      </div>
      <!-- <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
            <label class="font-bold text-right col-span-1">{{ $t('productLink') }}</label>
            <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="mygroup.product_link" />
        </div> -->
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
  components: {},
  data() {
    return {
      mygroup: {
        add_sound: 0,
        auto_train: 0,
        auto_publish: 0,
        image_count: 2,
      },
      train_time1: '',
      train_time2: '',
      train_time3: '',
      train_time4: '',
      train_time5: '',
      train_time6: '',
      publish_time1: '',
      publish_time2: '',
      publish_time3: '',
      publish_time4: '',
      publish_time5: '',
      publish_time6: ''
    }
  },
  methods: {
    update() {
      this.mygroup.train_start_time = [this.train_time1, this.train_time2, this.train_time3, this.train_time4, this.train_time5, this.train_time6]
        .filter(Boolean)
        .join(',')
      this.mygroup.publish_start_time = [this.publish_time1, this.publish_time2, this.publish_time3, this.publish_time4, this.publish_time5, this.publish_time6]
        .filter(Boolean)
        .join(',')
      if (this.mygroup.auto_train == 1 && !this.mygroup.train_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        this.$emitter.emit('showToast', this.$t('trainStartTimeFormatError'))
        return
      }
      if (this.mygroup.auto_publish == 1 && !this.mygroup.publish_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        this.$emitter.emit('showToast', this.$t('publishStartTimeFormatError'))
        return
      }
      this.updateGroup(this.mygroup)
    },

    updateGroup(group) {
      this.$service
        .update_group({
          id: group.id,
          name: group.name,
          auto_train: Number(group.auto_train),
          auto_publish: Number(group.auto_publish),
          publish_start_time: group.publish_start_time,
          train_start_time: group.train_start_time,
          title: group.title,
          publish_type: Number(group.publish_type),
          product_link: group.product_link,
          floow_probable: Number(group.floow_probable),
          like_probable: Number(group.like_probable),
          collect_probable: Number(group.collect_probable),
          comment_probable: Number(group.comment_probable),
          train_duration: Number(group.train_duration),
          min_duration: Number(group.min_duration),
          max_duration: Number(group.max_duration),
          topic: group.topic,
          comment: group.comment,
          image_count: Number(group.image_count),
          add_sound: Number(group.add_sound),
          origin_sound_volume: Number(group.origin_sound_volume),
          add_sound_volume: Number(group.add_sound_volume),
        })
        .then(() => {
          this.$emitter.emit('closePageDialog', {})
        })
    },
  },
  mounted() {
    console.log('mounted', this.group)
    this.mygroup = this.group
    console.log(this.mygroup)
    if (this.mygroup.train_start_time) {
      const [train_time1, train_time2, train_time3, train_time4, train_time5, train_time6] = this.mygroup.train_start_time.split(',')
      this.train_time1 = train_time1
      this.train_time2 = train_time2
      this.train_time3 = train_time3
      this.train_time4 = train_time4
      this.train_time5 = train_time5
      this.train_time6 = train_time6
    }
    if (this.mygroup.publish_start_time) {
      const [publish_time1, publish_time2, publish_time3, publish_time4, publish_time5, publish_time6] = this.mygroup.publish_start_time.split(',')
      this.publish_time1 = publish_time1
      this.publish_time2 = publish_time2
      this.publish_time3 = publish_time3
      this.publish_time4 = publish_time4
      this.publish_time5 = publish_time5
      this.publish_time6 = publish_time6
    }
  },
  unmounted() {
    console.log('unmounted', this.group)
  }
}
</script>
