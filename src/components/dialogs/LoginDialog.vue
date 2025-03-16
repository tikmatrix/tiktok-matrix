<template>
  <div class="flex flex-col items-start p-12">
    <!-- 添加提示信息 -->
    <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('loginWarning') }}</span>
      </div>
    </div>

    

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      <button class="btn btn-success" @click="startLogin">{{ $t('startScript') }}</button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LoginSettings',
  data() {
    return {
      settings: {},
    }
  },
  methods: {
    async startLogin() {
      await this.$emiter('run_task_now', { name: 'login', args: { count: 1 } })
    },
  },
  async mounted() {
  }
}
</script>
