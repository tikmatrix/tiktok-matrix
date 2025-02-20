<template>
  <div class="flex flex-col items-start p-12">

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('emails') }}: </span>
      <textarea class="textarea textarea-success grow  h-32 leading-tight" :placeholder="$t('emailsTips')"
        autocomplete="off" v-model="settings.emails"> </textarea>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('password') }}: </span>
      <input class="input input-bordered w-full max-w-xs" :placeholder="$t('passwordTips')" v-model="settings.password">
      </input>
    </div>


    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      <button class="btn btn-success" @click="set_settings">{{ $t('startScript') }}</button>
    </div>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
export default {
  name: 'app',
  components: {
    MyButton
  },
  data() {
    return {
      settings: {},

    }
  },
  methods: {
    async get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    async set_settings() {
      this.$service.update_settings(this.settings).then(async (res) => {
        await this.$emiter('run_task_now', { name: 'register', args: { count: 1 } })
      })
    },

  },
  async mounted() {
    this.get_settings()
  }
}
</script>
