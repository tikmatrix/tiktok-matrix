<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('unFollowAllWarning') }}</span>
    </div>
  </div>


</template>
<script>
import VueSlider from "vue-3-slider-component";
import { unfollowAllSettings } from '@/utils/settingsManager';

export default {
  name: 'UnFollowAll',
  components: {
    VueSlider
  },
  mixins: [
    unfollowAllSettings.createVueMixin(
      {
        enable_send_message: false,
        message_content: '',
        insert_emoji: false,
      }, // 默认设置
      ['enable_send_message', 'message_content', 'insert_emoji'] // 需要监听的属性
    )
  ],
  data() {
    return {
      enable_send_message: false,
      message_content: '',
      insert_emoji: false,
    }
  },
  methods: {
    async runScript(enable_multi_account) {
      await this.$emiter('run_now_by_account', {
        name: 'unFollowAll',
        args: {
          enable_multi_account
        }
      })
    },
  },
  async mounted() {
  }
}
</script>