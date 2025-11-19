<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('registerWarning') }}</span>
    </div>
  </div>

  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('emails') }}: </span>
    <textarea class="textarea textarea-success grow  h-32 leading-tight" :placeholder="$t('emailsTips')"
      autocomplete="off" v-model="localSettings.emails"></textarea>
  </div>
  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('password') }}: </span>
    <input class="input input-bordered w-full max-w-md" :placeholder="$t('passwordTips')"
      v-model="localSettings.password" />
  </div>



</template>
<script>
import * as settingsWsService from '../../service/settingsWebSocketService'

export default {
  name: 'RegisterDialog',
  components: {
  },
  emits: ['update:settings'],
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localSettings: {
        emails: '',
        password: '',
      }
    }
  },
  watch: {
    settings: {
      immediate: true,
      deep: true,
      handler(value) {
        this.localSettings = {
          emails: value?.emails || '',
          password: value?.password || ''
        }
      }
    }
  },
  methods: {

    async runScript(enable_multi_account = false, rotate_proxy = false) {
      const updatedSettings = {
        ...this.settings,
        ...this.localSettings
      }
      // 使用 WebSocket 更新设置
      try {
        await settingsWsService.ws_update_settings(updatedSettings)
        this.$emit('update:settings', updatedSettings)
        //reload settings
        await this.$emiter('reload_settings', {})
        await this.$emiter('run_now_by_account', {
          name: 'register',
          args: {
            count: 1,
            enable_multi_account,
            rotate_proxy
          }
        })
        return true
      } catch (error) {
        console.error('Failed to update settings:', error)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: 'Failed to update settings',
          timeout: 2000
        })
        return false
      }
    },

  },
  async mounted() {
    await this.$emiter('reload_settings', {})
  }
}
</script>
