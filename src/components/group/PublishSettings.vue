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
              class="form-radio text-primary h-4 w-4">
            <label for="video" class="ml-2">{{ $t('video') }}</label>
          </div>
          <div class="flex items-center">
            <input type="radio" id="image" value="1" v-model="mygroup.publish_type"
              class="form-radio text-primary h-4 w-4">
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
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('loadSoundWaitTime') }}:</label>
        <div class="col-span-2 flex items-center gap-4">
          <div class="flex items-center">
            <input class="border-2 border-gray-300 p-2 rounded col-span-1 input-sm mr-2"
              v-model="mygroup.sound_wait_time" type="number" /> {{ $t('second') }}
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
      <div class="grid grid-cols-8 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-2">{{ $t('addProductLink') }}:</label>
        <div class="col-span-6 flex items-center gap-4">
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

          <div role="alert" class="alert col-span-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              class="stroke-info shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{{ $t('addProductLinkTips') }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
        <label class="font-bold text-right col-span-1">{{ $t('titles') }}:</label>
        <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
          :placeholder="$t('titlesTips')" autocomplete="off" v-model="mygroup.title"> </textarea>
      </div>

    </div>
    <!-- other fields... -->
    <div class="mt-8 w-full flex justify-end">
      <button
        class="bg-primary hover:bg-blue-700 text-primary-content font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
  data() {
    return {
      mygroup: {},
      publish_time1: '',
      publish_time2: '',
      publish_time3: '',
      publish_time4: '',
      publish_time5: '',
      publish_time6: '',
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

  },
  methods: {
    async update() {
      this.mygroup.publish_start_time = [this.publish_time1, this.publish_time2, this.publish_time3, this.publish_time4, this.publish_time5, this.publish_time6]
        .filter(Boolean)
        .join(',')
      if (this.mygroup.auto_publish == 1 && !this.mygroup.publish_start_time.match(/^(\d{2}:\d{2},)*\d{2}:\d{2}$/)) {
        await this.$emiter('showToast', this.$t('publishStartTimeFormatError'))
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
    if (this.mygroup.publish_start_time) {
      const [publish_time1, publish_time2, publish_time3, publish_time4, publish_time5, publish_time6] = this.mygroup.publish_start_time.split(',')
      this.publish_time1 = publish_time1
      this.publish_time2 = publish_time2
      this.publish_time3 = publish_time3
      this.publish_time4 = publish_time4
      this.publish_time5 = publish_time5
      this.publish_time6 = publish_time6
    }
  }
}
</script>
