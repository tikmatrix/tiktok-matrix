<template>
  <div class="flex flex-col items-start p-12 max-w-6xl">
    <h3 class="font-bold text-lg">{{ $t(script.name) }}</h3>

    <!-- 添加选中设备信息 -->
    <div class="mt-2 w-full">
      <div class="flex flex-row gap-2">
        <div class="text-md font-medium">
          {{ $t('selectedDevices') }}: {{ selecedDevices.length }} {{ $t('units') }}
        </div>
        <div class="flex flex-row items-center gap-2" v-if="script.name === 'profile'
          || script.name === 'accountWarmup'
          || script.name === 'post'
          || script.name === 'massDM'
          || script.name === 'followBack'
          || script.name === 'unFollowAll'
          || script.name === 'scrapeFollowers'
          || script.name === 'deletePost'
          || script.name === 'boostUsers'
          || script.name === 'boostPosts'
          || script.name === 'boostLives'
          || script.name === 'massComment'
          || script.name === 'switchAccount'">
          <label class="font-bold text-info">{{ $t('enableMultiAccount') }}:</label>
          <input type="checkbox" class="toggle toggle-accent" v-model="enable_multi_account" />
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mt-1 max-h-24 overflow-y-auto bg-base-200 p-2 rounded-md">
        <div v-for="real_serial in selecedDevices" :key="real_serial" class="badge badge-outline">
          {{devices.find(d => d.real_serial === real_serial).key}}
        </div>
        <div v-if="selecedDevices.length === 0" class="text-error text-md px-2">
          {{ $t('noDevicesSelected') }}
        </div>
      </div>
    </div>

    <RegisterDialog v-if="script.name === 'register'" ref="currentDialog" :settings="settings" />
    <ProfileDialog v-if="script.name === 'profile'" ref="currentDialog" />
    <MassDMDialog v-if="script.name === 'massDM'" ref="currentDialog" />
    <FollowBackDialog v-if="script.name === 'followBack'" ref="currentDialog" />
    <UnFollowAllDialog v-if="script.name === 'unFollowAll'" ref="currentDialog" />
    <AccountWarmupDialog v-if="script.name === 'accountWarmup'" ref="currentDialog" />
    <PostDialog v-if="script.name === 'post'" ref="currentDialog" />
    <LoginDialog v-if="script.name === 'login'" ref="currentDialog" />
    <MatchAccounts v-if="script.name === 'matchAccount'" ref="currentDialog" />
    <ScrapeFollowersDialog v-if="script.name === 'scrapeFollowers'" ref="currentDialog" />
    <DeletePostDialog v-if="script.name === 'deletePost'" ref="currentDialog" />
    <BoostUsersDialog v-if="script.name === 'boostUsers'" ref="currentDialog" />
    <BoostPostsDialog v-if="script.name === 'boostPosts'" ref="currentDialog" />
    <BoostLivesDialog v-if="script.name === 'boostLives'" ref="currentDialog" />
    <MassCommentDialog v-if="script.name === 'massComment'" ref="currentDialog" />
    <SwitchAccountDialog v-if="script.name === 'switchAccount'" ref="currentDialog" />

    <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
      <div class="flex flex-1"></div>
      <button class="btn btn-success" :disabled="selecedDevices.length === 0" @click="runScript">{{ $t('startScript')
      }}</button>
    </div>
  </div>
</template>
<script>
import RegisterDialog from './RegisterDialog.vue'
import ProfileDialog from './ProfileDialog.vue'
import MassDMDialog from './MassDMDialog.vue'
import FollowBackDialog from './FollowBackDialog.vue'
import UnFollowAllDialog from './UnFollowAllDialog.vue'
import LoginDialog from './LoginDialog.vue'
import AccountWarmupDialog from './AccountWarmupDialog.vue'
import PostDialog from './PostDialog.vue'
import ScrapeFollowersDialog from './ScrapeFollowersDialog.vue'
import DeletePostDialog from './DeletePostDialog.vue'
import BoostUsersDialog from './BoostUsersDialog.vue'
import BoostPostsDialog from './BoostPostsDialog.vue'
import MatchAccounts from './MatchAccounts.vue'
import MassCommentDialog from './MassCommentDialog.vue'
import BoostLivesDialog from './BoostLivesDialog.vue'
import SwitchAccountDialog from './SwitchAccountDialog.vue'
export default {
  name: 'BeforeRunScript',
  props: {
    devices: {
      type: Array,
      required: true
    },
    script: {
      type: Object,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
    selecedDevices: {
      type: Array,
      required: true
    }
  },
  components: {
    RegisterDialog,
    ProfileDialog,
    MassDMDialog,
    FollowBackDialog,
    UnFollowAllDialog,
    LoginDialog,
    AccountWarmupDialog,
    PostDialog,
    ScrapeFollowersDialog,
    DeletePostDialog,
    BoostUsersDialog,
    BoostPostsDialog,
    MatchAccounts,
    MassCommentDialog,
    BoostLivesDialog,
    SwitchAccountDialog
  },

  data() {
    return {
      enable_multi_account: localStorage.getItem(`enable_multi_account_${this.script.name}`) === 'true' || false
    }
  },
  watch: {
    enable_multi_account(newValue) {
      localStorage.setItem(`enable_multi_account_${this.script.name}`, newValue);
    }
  },
  methods: {
    async update_settings() {
      await this.$service.update_settings(this.settings)
      //reload settings
      await this.$emiter('reload_settings', {})
    },
    async runScript() {
      if (this.selecedDevices.length === 0) {
        return;
      }

      if (this.$refs.currentDialog && typeof this.$refs.currentDialog.runScript === 'function') {
        await this.$refs.currentDialog.runScript(this.enable_multi_account);
        await this.$emiter('closeDialog', {})
      }
    },
  },
  async mounted() {

  }
}
</script>