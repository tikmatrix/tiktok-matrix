<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
      <div>
        <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
        <span>{{ $t('boostUsersWarning') }}</span>
      </div>
    </div>
      <div class="flex flex-row items-center p-2 w-full">
          <textarea class="textarea textarea-success w-full max-w-xl col-span-3 h-32 leading-tight"
              :placeholder="$t('targetUsernameTips')" autocomplete="off" v-model="target_username"> </textarea>
      </div>
      <div class="flex flex-row items-center p-2 gap-2">
        <label class="font-bold text-right col-span-1">{{ $t('boostType') }}:</label>
        <input type="radio" id="follow" v-model="boost_type" value="follow" />
        <label for="follow">{{ $t('follow') }}</label>
        <input type="radio" id="unFollow" v-model="boost_type" value="unFollow" />
        <label for="unFollow">{{ $t('unFollow') }}</label>
      </div>
            
  
      
  </template>
  <script>
  export default {
    name: 'BoostUsers',
    data() {
      return {
        target_username: localStorage.getItem('target_username') || '',
        boost_type: localStorage.getItem('boost_type') || 'follow',
      }
    },
    watch: {
      target_username(newVal) {
        localStorage.setItem('target_username', newVal)
      },
      boost_type(newVal) {
        localStorage.setItem('boost_type', newVal)
      },
    },
    methods: {
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
            await this.$emiter('run_now_by_account', { name: this.boost_type, args: { target_username: this.target_username } })
        },
    },
    async mounted() {
    }
  }
  </script>
  