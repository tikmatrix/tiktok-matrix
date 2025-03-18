<template>
   <!-- 添加提示信息 -->
   <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('boostLivesWarning') }}</span>
      </div>
    </div>
      <div class="flex flex-row items-center p-2 w-full">
          <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
              :placeholder="$t('targetLiveUrlTips')" autocomplete="off" v-model="target_live_urls"> </textarea>
      </div>
      <div class="flex flex-row items-center p-2 gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('boostType') }}:</label>
        <input type="radio" id="like_live" v-model="boost_type" value="like_live" />
        <label for="like_live">{{ $t('likeLive') }}</label>
        <input type="radio" id="view_live" v-model="boost_type" value="view_live" />
        <label for="view_live">{{ $t('viewLive') }}</label>
      </div>
            
  
     
  </template>
  <script>
  export default {
    name: 'BoostLives',
    data() {
      return {
        target_live_urls: '',
        boost_type: 'like_live',
      }
    },
    methods: {
      filterTargetLiveUrl() {

            if (this.target_live_urls == '') {
                alert(this.$t('liveUrlRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_live_urls.split('\n').filter(line => line.trim() != '')
            if (lines.length == 0) {
                alert(this.$t('liveUrlRequired'))
                return false;
            }
            //remove query string
            lines = lines.map(line => {
                let url = new URL(line)
                return url.origin + url.pathname
            })
            //check format https://www.tiktok.com/@v.lais4/live
            let regex = /^https:\/\/www\.tiktok\.com\/@[^\/]+\/live$/
            if (!regex.test(lines[0])) {
                alert(this.$t('liveUrlFormatError'))
                return false;
            }
            this.target_live_urls = lines.join('\n')
            return true;
        },
          async runScript() {
            if (!this.filterTargetLiveUrl()) {
              return;
            }
            await this.$emiter('run_now_by_account', { name: this.boost_type, args: { live_url: this.target_live_urls } })
        },
    },
    async mounted() {
    }
  }
  </script>
  