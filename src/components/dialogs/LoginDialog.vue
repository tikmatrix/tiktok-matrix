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
    async runScript() {
      await this.$emiter('run_task_now', { name: 'login', args: { count: 1 } })
    },
  },
  async mounted() {
  }
}
</script>
