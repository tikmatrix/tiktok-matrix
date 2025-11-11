<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('matchAccountsWarning') }}</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'MatchAccounts',
  data() {
    return {
    }
  },
  methods: {
    async runScript(enable_multi_account = false, rotate_proxy = false) {
      enable_multi_account = false;
      await this.$emiter('run_now_by_account', { name: 'match_accounts', args: { enable_multi_account, rotate_proxy } })
      return true;
    },
  },
  async mounted() {
  }
}
</script>
