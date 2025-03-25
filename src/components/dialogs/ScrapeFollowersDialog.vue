<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('scrapeFollowersWarning') }}</span>
      </div>
    </div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetUsername') }}: </span>
      <input class="input input-bordered input-sm" type="text" v-model="target_username"
        :placeholder="$t('targetUsername')" />
    </div>
    

    <button class="btn btn-primary" @click="openDownloadDir">{{ $t('openDownloadDir') }}</button>
</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";
export default {
  name: 'ScrapeFollowers',
  data() {
    return {
      target_username: localStorage.getItem('target_username') || '',
    }
  },
  watch: {
    target_username(newVal) {
      localStorage.setItem('target_username', newVal)
    },
  },
  methods: {
    async openDownloadDir() {
      await invoke('open_dir', { name: 'download' })
    },
    filterTargetUsername() {
            if (this.target_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_username.split('\n').filter(line => line.trim() != '')
            if (lines.length == 0) {
                alert(this.$t('targetUsernameRequired'))
                return false;
            }
            //add @ to usernames
            lines = lines.map(line => {
                if (!line.startsWith('@')) {
                    return '@' + line
                }
                return line
            })
            this.target_username = lines.join('\n')
            return true;
        },
    async runScript() {
      if (!this.filterTargetUsername()) {
        return;
      }
      await this.$emiter('run_task_now', { name: 'scrape_fans', args: { target_username: this.target_username } })
    },
  },
  async mounted() {
  }
}
</script>
