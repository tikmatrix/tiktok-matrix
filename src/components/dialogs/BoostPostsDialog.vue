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
    <label class="font-bold text-right col-span-1">{{ $t('boostOptions') }}:</label>
    <div class="flex flex-wrap gap-4">
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <input type="checkbox" class="checkbox checkbox-primary" v-model="enable_like" />
          <span class="label-text">{{ $t('like') }}</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <input type="checkbox" class="checkbox checkbox-primary" v-model="enable_favorite" />
          <span class="label-text">{{ $t('favorite') }}</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <input type="checkbox" class="checkbox checkbox-primary" v-model="enable_share" />
          <span class="label-text">{{ $t('share') }}</span>
        </label>
      </div>
      <div class="form-control">
        <label class="label cursor-pointer gap-2">
          <input type="checkbox" class="checkbox checkbox-primary" v-model="enable_follow" />
          <span class="label-text">{{ $t('follow') }}</span>
        </label>
      </div>
    </div>
  </div>

  <div class="flex flex-row items-center p-2 gap-2">
    <label class="font-bold text-right">{{ $t('viewDuration') }}:</label>
    <input type="number" class="input input-bordered w-24" v-model.number="view_duration" min="1" max="300" />
    <span class="ml-2">{{ $t('seconds') }}</span>
  </div>
  <div class="flex flex-row items-center">
    <label class="font-bold mr-4">{{ $t('boostPostInterval') }}:</label>
    <VueSlider v-model="boost_post_interval" :width="200" :min="0" :max="10"
      :marks="{ 0: '0' + $t('minute'), 5: '5' + $t('minute'), 10: '10' + $t('minute') }" />
  </div>
</template>
<script>
import VueSlider from "vue-3-slider-component";
export default {
  name: 'BoostPosts',
  components: {
    VueSlider
  },
  data() {
    return {
      target_post_urls: localStorage.getItem('target_post_urls') || '',
      enable_like: localStorage.getItem('enable_like') === 'true',
      enable_favorite: localStorage.getItem('enable_favorite') === 'true',
      enable_share: localStorage.getItem('enable_share') === 'true',
      enable_follow: localStorage.getItem('enable_follow') === 'true',
      view_duration: parseInt(localStorage.getItem('view_duration')) || 10,
      boost_post_interval: [localStorage.getItem('boost_post_min_interval') || 0, localStorage.getItem('boost_post_max_interval') || 0]
    }
  },
  watch: {
    target_post_urls(newVal) {
      localStorage.setItem('target_post_urls', newVal)
    },
    enable_like(newVal) {
      localStorage.setItem('enable_like', newVal)
      console.log('enable_like', localStorage.getItem('enable_like') === 'true')
    },
    enable_favorite(newVal) {
      localStorage.setItem('enable_favorite', newVal)
      console.log('enable_favorite', localStorage.getItem('enable_favorite') === 'true')
    },
    enable_share(newVal) {
      localStorage.setItem('enable_share', newVal)
      console.log('enable_share', localStorage.getItem('enable_share') === 'true')
    },
    enable_follow(newVal) {
      localStorage.setItem('enable_follow', newVal)
      console.log('enable_follow', localStorage.getItem('enable_follow') === 'true')
    },
    view_duration(newVal) {
      localStorage.setItem('view_duration', newVal)
      console.log('view_duration', localStorage.getItem('view_duration'))
    },
    boost_post_interval(newVal) {
      localStorage.setItem('boost_post_min_interval', newVal[0])
      localStorage.setItem('boost_post_max_interval', newVal[1])
    },
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
    async runScript(enable_multi_account) {
      if (!this.filterTargetPostUrl()) {
        return;
      }
      await this.$emiter('run_now_by_account', {
        name: 'boost_post',
        args: {
          post_url: this.target_post_urls,
          enable_like: this.enable_like,
          enable_favorite: this.enable_favorite,
          enable_share: this.enable_share,
          enable_follow: this.enable_follow,
          view_duration: this.view_duration,
          min_interval: Number(this.boost_post_interval[0]),
          max_interval: Number(this.boost_post_interval[1]),
          enable_multi_account: enable_multi_account
        }
      })
    },
  },
  async mounted() {
  }
}
</script>