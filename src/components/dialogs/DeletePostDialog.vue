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
    <input class="input ring input-md ml-2" type="number" v-model="maxViews" :placeholder="$t('maxViews')" />
  </div>



</template>
<script>
import { deletePostSettings } from '@/utils/settingsManager';

export default {
  name: 'DeletePost',
  mixins: [
    deletePostSettings.createVueMixin(
      { maxViews: 0 }, // 默认设置
      ['maxViews']     // 需要监听的属性
    )
  ],
  data() {
    return {
      maxViews: 0,
    }
  },
  methods: {
    async runScript(enable_multi_account) {
      await this.$emiter('run_now_by_account', { name: 'delete_post', args: { max_views: this.maxViews, enable_multi_account } })
    },
  }
}
</script>