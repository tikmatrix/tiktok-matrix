<template>
  <div class="flex flex-col items-start p-12">
    <div class="divider">{{ $t('tiktokSettings') }}</div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <label class="font-bold text-right col-span-1">{{ $t('tiktokPackagename') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="global" value="com.zhiliaoapp.musically" v-model="settings.packagename"
            class="form-radio text-primary h-4 w-4">
          <label for="global" class="ml-2">{{ $t('global') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="asia" value="com.ss.android.ugc.trill" v-model="settings.packagename"
            class="form-radio text-primary h-4 w-4">
          <label for="asia" class="ml-2">{{ $t('asia') }}</label>
        </div>

      </div>

    </div>

    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <div class="flex flex-1"></div>
      <MyButton @click="set_settings" label="save" :loading-time="2000" />
    </div>

  </div>
</template>
<script>
import MyButton from '../Button.vue'
export default {
  name: 'app',
  components: {
    MyButton
  },
  data() {
    return {
      settings: {},

    }
  },
  methods: {
    async get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    async set_settings() {
      this.$service.update_settings(this.settings).then(res => {
        console.log(res)
      })
    },

  },
  async mounted() {
    this.get_settings()
  }
}
</script>
