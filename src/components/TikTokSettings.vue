<template>
  <div class="flex flex-col items-start p-12">
    <div class="divider">{{ $t('tiktokSettings') }}</div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <label class="font-bold text-right col-span-1">{{ $t('tiktokPackagename') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="global" value="com.zhiliaoapp.musically" v-model="packagename"
            class="form-radio text-primary h-4 w-4">
          <label for="global" class="ml-2">{{ $t('global') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="asia" value="com.ss.android.ugc.trill" v-model="packagename"
            class="form-radio text-primary h-4 w-4">
          <label for="asia" class="ml-2">{{ $t('asia') }}</label>
        </div>

      </div>

    </div>

   
  </div>
</template>
<script>

export default {
  name: 'TikTokSettings',
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  watch: {
    packagename: {
      handler(newVal) {
        this.settings.packagename = newVal
        this.update_settings()
      },
      deep: true
    }
  },
  data() {
    return {
      packagename:''
    }
  },
  methods: {
    async update_settings(){
     await this.$service.update_settings(this.settings)
     //reload settings
     await this.$emiter('reload_settings', {})
     
    }
  },
  async mounted() {
    this.packagename = this.settings.packagename
  }
}
</script>
