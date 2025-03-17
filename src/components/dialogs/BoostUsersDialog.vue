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
        target_usernames: '',
        boost_type: 'follow',
      }
    },
    methods: {
      filterTargetUsername() {
            if (this.target_usernames == '') {
                alert(this.$t('targetUsernameRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_usernames.split('\n').filter(line => line.trim() != '')
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
            this.target_usernames = lines.join('\n')
            return true;
        },
          async runScript() {
            if (!this.filterTargetUsername()) {
              return;
            }
            await this.$emiter('run_now_by_account', { name: this.boost_type, args: { target_username: this.target_usernames } })
        },
    },
    async mounted() {
    }
  }
  </script>
  