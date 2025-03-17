<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('deletePostWarning') }}</span>
      </div>
    </div>
      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <span class="font-bold">{{ $t('maxViews') }}: </span>
        <input class="input ring input-sm ml-2" type="number" v-model="maxViews"
                    :placeholder="$t('maxViews')" />
      </div>
      
  
     
  </template>
  <script>
  export default {
    name: 'DeletePost',
    data() {
      return {
        maxViews: 0,
      }
    },
    methods: {
        async runScript() {
            await this.$emiter('run_now_by_account', { name: 'delete_post', args: { max_views: this.maxViews } })
        },
    },
    async mounted() {
    }
  }
  </script>
  