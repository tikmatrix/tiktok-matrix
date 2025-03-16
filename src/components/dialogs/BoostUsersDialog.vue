<template>
    <div class="flex flex-col items-start p-12">
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
            
  
      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <div class="flex flex-1"></div>
        <button class="btn btn-success" @click="boostUsers">{{ $t('startScript') }}</button>
      </div>
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
          async boostUsers() {
            if (!this.filterTargetUsername()) {
              return;
            }
            if (this.boost_type == 'follow') {
              await this.$emiter('run_now_by_account', { name: 'follow', args: { target_username: this.target_usernames } })
            } else {
              await this.$emiter('run_now_by_account', { name: 'unfollow', args: { target_username: this.target_usernames } })
            }
        },
    },
    async mounted() {
    }
  }
  </script>
  