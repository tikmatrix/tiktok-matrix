<template>
  <!-- 添加提示信息 -->
  <div class="alert alert-warning mb-4 shadow-lg">
    <div>
      <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-6 w-6 mr-2" />
      <span>{{ $t('boostUsersWarning') }}</span>
    </div>
  </div>

  <div class="flex flex-row items-center p-2 gap-2">
    <label class="font-bold text-right col-span-1">{{ $t('boostType') }}:</label>
    <input type="radio" id="follow" v-model="boost_type" value="follow" />
    <label for="follow">{{ $t('follow') }}</label>
    <input type="radio" id="unFollow" v-model="boost_type" value="unFollow" />
    <label for="unFollow">{{ $t('unFollow') }}</label>
  </div>
  <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
    <span class="font-bold">{{ $t('targetUsernamesPath') }}: </span>
    <input type="text" placeholder="example: C:/Users/Administrator/Desktop/usernames.txt"
      class="input input-md grow input-bordered" v-model="target_username_path" />
    <button class="btn btn-md btn-info ml-2" @click="selectTargetUsernames">{{ $t('select') }}</button>
  </div>
  <!-- 新增关注方式选择 -->
  <div class="flex flex-row items-center p-2 gap-2">
    <label class="font-bold text-right col-span-1">{{ $t('followMethod') }}:</label>
    <input type="radio" id="search" v-model="follow_method" value="search" />
    <label for="search">{{ $t('searchUser') }}</label>
    <input type="radio" id="direct" v-model="follow_method" value="direct" />
    <label for="direct">{{ $t('directOpenProfile') }}</label>
  </div>



</template>
<script>
import { open } from '@tauri-apps/api/dialog';
import { boostUsersSettings } from '@/utils/settingsManager';

export default {
  name: 'BoostUsers',
  mixins: [
    boostUsersSettings.createVueMixin(
      {
        boost_type: 'follow',
        follow_method: 'search',
        target_username_path: '',
      }, // 默认设置
      ['boost_type', 'follow_method', 'target_username_path'] // 需要监听的属性
    )
  ],
  data() {
    return {
      boost_type: 'follow',
      follow_method: 'search',
      target_username_path: '',
    }
  },
  methods: {
    // 选择文件并获取路径
    async selectTargetUsernames() {
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Text Files', extensions: ['txt'] },
        ]
      });

      this.target_username_path = filePath
    },
    async runScript(enable_multi_account) {
      await this.$emiter('run_now_by_account', {
        name: this.boost_type,
        args: {
          follow_method: this.follow_method,  // 将关注方式传递给脚本
          enable_multi_account: enable_multi_account,
          target_username_path: this.target_username_path
        }
      })
    },
  }
}
</script>