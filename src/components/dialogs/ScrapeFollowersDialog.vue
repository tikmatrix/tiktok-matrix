<template>
  <div class="flex flex-col items-start p-12">
    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <span class="font-bold">{{ $t('targetUsername') }}: </span>
      <input class="input input-bordered input-sm" type="text" v-model="target_username"
        :placeholder="$t('targetUsername')" />
    </div>
    

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      
      <button class="btn btn-primary" @click="openDownloadDir">{{ $t('openDownloadDir') }}</button>
      <button class="btn btn-success" @click="startScrape">{{ $t('startScript') }}</button>
    </div>
  </div>
</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";
export default {
  name: 'ScrapeFollowers',
  data() {
    return {
      target_username: '',
    }
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
    async startScrape() {
      if (!this.filterTargetUsername()) {
        return;
      }
      await this.$emiter('run_now_by_account', { name: 'scrape_fans', args: { target_username: this.target_username } })
    },
  },
  async mounted() {
  }
}
</script>
