<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('loginWarning') }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LoginDialog',
  data() {
    return {
    }
  },
  methods: {
    async runScript(enable_multi_account = false, rotate_proxy = false) {
      await this.$emiter('run_now_by_account', { name: 'login', args: { enable_multi_account, rotate_proxy } })
    },
  },
  async mounted() {
  }
}
</script>
