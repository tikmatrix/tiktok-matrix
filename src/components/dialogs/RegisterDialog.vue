<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('registerWarning') }}</span>
    </div>
  </div>

  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('emails') }}: </span>
    <textarea class="textarea textarea-success grow  h-32 leading-tight" :placeholder="$t('emailsTips')"
      autocomplete="off" v-model="settings.emails"> </textarea>
  </div>
  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('password') }}: </span>
    <input class="input input-bordered w-full max-w-md" :placeholder="$t('passwordTips')" v-model="settings.password">
    </input>
  </div>



</template>
<script>
export default {
  name: 'RegisterDialog',
  components: {
  },
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
    }
  },
  methods: {

    async runScript() {
      await this.$service.update_settings(this.settings)
      //reload settings
      await this.$emiter('reload_settings', {})
      await this.$emiter('run_now_by_account', { name: 'register', args: { count: 1 } })
    },

  },
  async mounted() {
    await this.$emiter('reload_settings', {})
  }
}
</script>
