<template>
   <!-- 添加提示信息 -->
   <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('boostPostsWarning') }}</span>
      </div>
    </div>
      <div class="flex flex-row items-center p-2 w-full">
          <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
              :placeholder="$t('targetPostUrlTips')" autocomplete="off" v-model="target_post_urls"> </textarea>
      </div>
      <div class="flex flex-row items-center p-2 gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('boostType') }}:</label>
        <input type="radio" id="like" v-model="boost_type" value="like" />
        <label for="like">{{ $t('like') }}</label>
        <input type="radio" id="comment" v-model="boost_type" value="comment" />
        <label for="comment">{{ $t('comment') }}</label>
        <input type="radio" id="favorite" v-model="boost_type" value="favorite" />
        <label for="favorite">{{ $t('favorite') }}</label>
        <input type="radio" id="view" v-model="boost_type" value="view" />
        <label for="view">{{ $t('view') }}</label>
        <input type="radio" id="share" v-model="boost_type" value="share" />
        <label for="share">{{ $t('share') }}</label>
      </div>
            
  
     
  </template>
  <script>
  export default {
    name: 'BoostPosts',
    data() {
      return {
        target_post_urls: '',
        boost_type: 'like',
      }
    },
    methods: {
      filterTargetPostUrl() {
            if (this.target_post_urls == '') {
                alert(this.$t('postUrlRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_post_urls.split('\n').filter(line => line.trim() != '')
            if (lines.length == 0) {
                alert(this.$t('postUrlRequired'))
                return false;
            }
            //remove query string
            lines = lines.map(line => {
                let url = new URL(line)
                return url.origin + url.pathname
            })
            this.target_post_urls = lines.join('\n')
            return true;
        },
          async runScript() {
            if (!this.filterTargetPostUrl()) {
              return;
            }
            await this.$emiter('run_now_by_account', { name: this.boost_type, args: { post_url: this.target_post_urls } })
        },
    },
    async mounted() {
    }
  }
  </script>
  