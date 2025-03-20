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
      <!-- 修改为复选框，默认选中 -->
      <div class="flex flex-row items-center p-2 gap-2">
        <div class="form-control">
          <label class="label cursor-pointer gap-2">
            <input type="checkbox" v-model="enable_like" class="checkbox checkbox-success" />
            <span class="label-text">{{ $t('likeLive') }}</span>
          </label>
        </div>
      </div>
      
      <!-- 新增观看时长输入 -->
      <div class="flex flex-row items-center p-2 gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('viewDuration') }}:</label>
        <input type="number" min="30" max="3600" v-model="view_duration" class="input input-bordered w-24" />
        <span>{{ $t('second') }}</span>
      </div>
      
      <!-- 新增点赞间隔输入 -->
      <div class="flex flex-row items-center p-2 gap-2" v-if="enable_like">
        <label class="font-bold text-right col-span-1">{{ $t('likeInterval') }}:</label>
        <input type="number" min="3" max="60" v-model="like_interval" class="input input-bordered w-24" />
        <span>{{ $t('second') }}</span>
      </div>
  </template>
  <script>
  export default {
    name: 'BoostLives',
    data() {
      return {
        target_live_urls: '',
        enable_like: true,
        view_duration: 120,
        like_interval: 10
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
            
            // 修改为传递更多参数
            await this.$emiter('run_now_by_account', { 
              name: 'view_live', 
              args: { 
                live_url: this.target_live_urls,
                enable_like: this.enable_like,
                view_duration: this.view_duration,
                like_interval: this.like_interval
              } 
            })
        },
    },
    async mounted() {
    }
  }
  </script>
  