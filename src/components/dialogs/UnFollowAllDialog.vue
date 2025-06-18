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
export default {
  name: 'UnFollowAll',
  components: {
    VueSlider
  },
  data() {
    return {
      enable_send_message: localStorage.getItem('enable_send_message') === 'true',
      message_content: localStorage.getItem('follow_back_message_content') || '',
      insert_emoji: localStorage.getItem('follow_back_insert_emoji') === 'true',
    }
  },
  watch: {
    enable_send_message(newVal) {
      localStorage.setItem('enable_send_message', newVal)
    },
    message_content(newVal) {
      localStorage.setItem('follow_back_message_content', newVal)
    },
    insert_emoji(newVal) {
      localStorage.setItem('follow_back_insert_emoji', newVal)
    },
  },
  methods: {

    async runScript(enable_multi_account) {
      await this.$emiter('run_now_by_account', {
        name: 'unFollowAll',
        args: {
        }
      })
    },
  },
  async mounted() {
  }
}
</script>