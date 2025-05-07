<template>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-40">{{ $t('enableSchedule') }}:</label>
      <input type="checkbox" class="toggle toggle-accent" v-model="mygroup.auto_publish" true-value="1"
        false-value="0" />
      <div role="alert" class="alert">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>{{ $t('enableScheduleTips') }}</span>
      </div>
    </div>
    <div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('scheduleTime') }}:</label>
        <div class="flex flex-wrap gap-2">
          <div v-for="(time, index) in publishTimes" :key="index" class="flex items-center">
            <input type="time" class="border-2 border-gray-300 p-2 rounded" v-model="publishTimes[index]"
              :placeholder="'00:00'" />
            <button @click="removeTime(index)" class="ml-1 p-1 text-red-500 hover:text-red-700">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button v-if="publishTimes.length < 6" @click="addTime" class="p-2 text-primary hover:text-primary-focus">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('contentType') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="video" value="0" v-model="mygroup.publish_type"
              class="form-radio text-primary h-4 w-4">
            <label for="video" class="ml-2">{{ $t('video') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="image" value="1" v-model="mygroup.publish_type"
              class="form-radio text-primary h-4 w-4">
            <label for="image" class="ml-2">{{ $t('image') }}</label>
          </div>
          <div class="flex items-center" v-if="mygroup.publish_type == 1">
            <input class="border-2 border-gray-300 p-2 rounded col-span-1 input-md" v-model="mygroup.image_count"
              :placeholder="$t('imageCount')" type="number" />
          </div>
        </div>
      </div>
      <!-- add sound start -->
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('addSound') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="default" value="-1" v-model="mygroup.add_sound"
              class="form-radio text-primary h-4 w-4">
            <label for="default" class="ml-2">{{ $t('default') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="disable" value="0" v-model="mygroup.add_sound"
              class="form-radio text-primary h-4 w-4">
            <label for="disable" class="ml-2">{{ $t('disable') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="enable" value="1" v-model="mygroup.add_sound"
              class="form-radio text-primary h-4 w-4">
            <label for="enable" class="ml-2">{{ $t('enable') }}</label>
          </div>
          <!-- add sound tips -->

          <div role="alert" class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="stroke-info shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('addSoundTips') }}</span>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-4">
        <label class="font-bold w-40">{{ $t('loadingTime') }}:</label>
        <VueSlider v-model="mygroup.sound_wait_time" :width="500" :min="5" :max="30" :step="1" :marks="{5: '5'+$t('second'),  10: '10'+$t('second'),  15: '15'+$t('second'),  20: '20'+$t('second'),  25: '25'+$t('second'),  30: '30'+$t('second')}" />
        
      </div>
      <div class="flex w-full items-center gap-2 mb-4" v-if="mygroup.add_sound == 1">
        <label class="font-bold w-40">{{ $t('soundVolume') }}:</label>
        <div class="flex items-center">
          <label class="ml-2 mr-2">{{ $t('originSound') }}: </label>
          <VueSlider v-model="mygroup.origin_sound_volume" :width="100" :min="0" :max="100" :step="25" :marks="{0: '0',  100: '100'}" />
          <label class="ml-8 mr-2">{{ $t('addSound') }}: </label>
          <VueSlider v-model="mygroup.add_sound_volume" :width="100" :min="0" :max="100" :step="25" :marks="{0: '0',  100: '100'}" />
        </div>
      </div>
      <!-- add sound end-->
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('addProductLink') }}:</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <input type="radio" id="disable" value="0" v-model="mygroup.add_product_link"
              class="form-radio text-primary h-4 w-4">
            <label for="disable" class="ml-2">{{ $t('disable') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="enable" value="1" v-model="mygroup.add_product_link"
              class="form-radio text-primary h-4 w-4">
            <label for="enable" class="ml-2">{{ $t('enable') }}</label>
          </div>

          <div role="alert" class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="stroke-info shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('addProductLinkTips') }}</span>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center gap-2 mb-2">
        <label class="font-bold w-40">{{ $t('captions') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
          :placeholder="$t('titlesTips')" autocomplete="off" v-model="mygroup.title"> </textarea>
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
  data() {
    return {
      mygroup: {},
      publishTimes: [],
    }
  },
  watch: {
    'mygroup.auto_publish': function (val) {
      this.mygroup.auto_publish = Number(val)
    },
    'mygroup.publish_type': function (val) {
      this.mygroup.publish_type = Number(val)
    },
    'mygroup.add_sound': function (val) {
      this.mygroup.add_sound = Number(val)
    },
    'mygroup.add_product_link': function (val) {
      this.mygroup.add_product_link = Number(val)
    },
    'mygroup.origin_sound_volume': function (val) {
      this.mygroup.origin_sound_volume = Number(val)
    },
    'mygroup.add_sound_volume': function (val) {
      this.mygroup.add_sound_volume = Number(val)
    },
    'mygroup.sound_wait_time': function (val) {
      this.mygroup.sound_wait_time = Number(val)
    },

  },
  methods: {
    addTime() {
      if (this.publishTimes.length < 6) {
        this.publishTimes.push('')
      }
    },
    removeTime(index) {
      this.publishTimes.splice(index, 1)
    },
    async update() {
      this.mygroup.publish_start_time = this.publishTimes
        .filter(Boolean)
        .join(',')
      if (this.mygroup.auto_publish == 1 && !this.mygroup.publish_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('publishStartTimeFormatError'),
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
    if (this.mygroup.publish_start_time) {
      this.publishTimes = this.mygroup.publish_start_time.split(',')
    }
  }
}
</script>
