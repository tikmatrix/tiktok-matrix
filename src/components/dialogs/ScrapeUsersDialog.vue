<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('scrapeUsersWarning') }}</span>
    </div>
  </div>
  <!-- 采集方式选择 -->
  <div class="flex flex-row gap-4 mb-4">
    <span class="font-bold">{{ $t('scrapeMode') }}: </span>
    <div class="flex gap-2">
      <label class="cursor-pointer flex items-center gap-2">
        <input type="radio" name="followers" class="radio radio-accent" value="followers" v-model="scrape_mode" />
        <span>{{ $t('scrapeByFollowers') }}</span>
      </label>
      <label class="cursor-pointer flex items-center gap-2">
        <input type="radio" name="following" class="radio radio-accent" value="following" v-model="scrape_mode" />
        <span>{{ $t('scrapeByFollowing') }}</span>
      </label>
      <label class="cursor-pointer flex items-center gap-2">
        <input type="radio" name="keyword" class="radio radio-accent" value="keyword" v-model="scrape_mode" />
        <span>{{ $t('scrapeByKeyword') }}</span>
      </label>
    </div>
  </div>


  <!-- 用户名输入 -->
  <div v-if="scrape_mode === 'followers' || scrape_mode === 'following'" class="flex flex-row items-center p-2 w-full">
    <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
      :placeholder="$t('targetUsernameTips')" autocomplete="off" v-model="target_username"> </textarea>
    <div class="flex flex-row items-center ml-4">
      <label class="font-bold mr-2">{{ $t('maxScrapeCount') }}:</label>
      <input type="number" min="1" max="1000" v-model="max_scrape_count" class="input input-bordered input-md w-24" />
    </div>
  </div>

  <!-- 关键字输入 -->
  <div v-if="scrape_mode === 'keyword'" class="flex flex-row items-center p-2 w-full">
    <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
      :placeholder="$t('searchKeywordTips')" autocomplete="off" v-model="search_keyword"> </textarea>
    <div class="flex flex-row items-center ml-4">
      <label class="font-bold mr-2">{{ $t('maxScrapeCount') }}:</label>
      <input type="number" min="1" max="1000" v-model="max_scrape_count" class="input input-bordered input-md w-24" />
    </div>
  </div>

  <button class="btn btn-primary" @click="openDownloadDir">{{ $t('openDownloadDir') }}</button>
</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";
import { scrapeUsersSettings } from '@/utils/settingsManager';

export default {
  name: 'ScrapeUsers',
  mixins: [
    scrapeUsersSettings.createVueMixin(
      {
        scrape_mode: 'followers',
        target_username: '',
        search_keyword: '',
        max_scrape_count: 50,
      }, // 默认设置
      ['scrape_mode', 'target_username', 'search_keyword', 'max_scrape_count'] // 需要监听的属性
    )
  ],
  data() {
    return {
      scrape_mode: 'followers',
      target_username: '',
      search_keyword: '',
      max_scrape_count: 50,
    }
  },
  methods: {
    async openDownloadDir() {
      await invoke('open_dir', { name: 'download' })
    },
    filterTargetUsername() {
      if ((this.scrape_mode === 'followers' || this.scrape_mode === 'following') && this.target_username == '') {
        alert(this.$t('targetUsernameRequired'))
        return false;
      }
      //filter empty lines
      let lines = this.target_username.split('\n').filter(line => line.trim() != '')
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
    filterSearchKeyword() {
      if (this.scrape_mode === 'keyword' && this.search_keyword.trim() === '') {
        alert(this.$t('searchKeywordRequired'))
        return false;
      }
      return true;
    },
    async runScript(enable_multi_account = false, rotate_proxy = false) {
      if (!this.filterTargetUsername()) {
        return;
      }
      if (!this.filterSearchKeyword()) {
        return;
      }
      await this.$emiter('massScrape', {
        mode: this.scrape_mode,
        target_username: this.target_username,
        search_keyword: this.search_keyword,
        enable_multi_account: enable_multi_account,
        rotate_proxy: rotate_proxy
      })
    },
  },
  async mounted() {
  }
}
</script>
