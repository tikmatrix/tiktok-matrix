<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('switchAccountWarning') }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'SwitchAccountDialog',
  data() {
    return {
    }
  },
  methods: {
    async runScript(enable_multi_account, rotate_proxy_before_switch = false) {
      await this.$emiter('run_now_by_account', {
        name: 'switch_account',
        args: { enable_multi_account, rotate_proxy_before_switch }
      })
    },
  },
  async mounted() {
  }
}
</script>
