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
    async runScript() {
      await this.$emiter('run_now_by_account', { name: 'match_accounts' })
    },
  },
  async mounted() {
  }
}
</script>
