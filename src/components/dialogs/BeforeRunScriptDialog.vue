<template>
    <div class="flex flex-col items-start p-12">
      <h3 class="font-bold text-lg">{{ $t(script.name) }}</h3>
      
      <!-- 添加选中设备信息 -->
      <div class="mt-2 w-full">
        <div class="text-md font-medium">
          {{ $t('selectedDevices') }}: {{ selecedDevices.length }} {{ $t('units') }}
        </div>
        <div class="flex flex-wrap gap-2 mt-1 max-h-24 overflow-y-auto bg-base-200 p-2 rounded-md">
          <div v-for="real_serial in selecedDevices" :key="real_serial" class="badge badge-outline">
            {{ devices.find(d => d.real_serial === real_serial).key }}
          </div>
          <div v-if="selecedDevices.length === 0" class="text-error text-md px-2">
            {{ $t('noDevicesSelected') }}
          </div>
        </div>
      </div>

      <RegisterDialog v-if="script.name === 'register'" ref="currentDialog" :settings="settings"/>
      <ProfileDialog v-if="script.name === 'profile'" ref="currentDialog" :settings="settings"/>
      <MassDMDialog v-if="script.name === 'massDM'" ref="currentDialog" :settings="settings"/>
      <FollowDialog v-if="script.name === 'follow'" ref="currentDialog" :settings="settings"/>
      <TrainDialog v-if="script.name === 'train'" ref="currentDialog" :settings="settings"/>
      <PublishDialog v-if="script.name === 'publish'" ref="currentDialog" :settings="settings"/>
      <LoginDialog v-if="script.name === 'login'" ref="currentDialog" :settings="settings"/>
      <MatchAccounts v-if="script.name === 'matchAccount'" ref="currentDialog" :settings="settings"/>
      <ScrapeFollowersDialog v-if="script.name === 'scrapeFollowers'" ref="currentDialog" :settings="settings"/>
      <DeletePostDialog v-if="script.name === 'deletePost'" ref="currentDialog" :settings="settings"/>
      <BoostUsersDialog v-if="script.name === 'boostUsers'" ref="currentDialog" :settings="settings"/>
      <BoostPostsDialog v-if="script.name === 'boostPosts'" ref="currentDialog" :settings="settings"/>
      <BoostLivesDialog v-if="script.name === 'boostLives'" ref="currentDialog" :settings="settings"/>
      <MassCommentDialog v-if="script.name === 'massComment'" ref="currentDialog" :settings="settings"/>

      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <div class="flex flex-1"></div>
        <button class="btn btn-success" :disabled="selecedDevices.length === 0" @click="runScript">{{ $t('startScript') }}</button>
      </div>
    </div>
  </template>
  <script>
  import RegisterDialog from './RegisterDialog.vue'
  import ProfileDialog from './ProfileDialog.vue'
  import MassDMDialog from './MassDMDialog.vue'
  import FollowDialog from './FollowDialog.vue'
  import LoginDialog from './LoginDialog.vue'
  import TrainDialog from './TrainDialog.vue'
  import PublishDialog from './PublishDialog.vue'
  import ScrapeFollowersDialog from './ScrapeFollowersDialog.vue'
  import DeletePostDialog from './DeletePostDialog.vue'
  import BoostUsersDialog from './BoostUsersDialog.vue'
  import BoostPostsDialog from './BoostPostsDialog.vue'
  import MatchAccounts from './MatchAccounts.vue'
  import MassCommentDialog from './MassCommentDialog.vue'
  import BoostLivesDialog from './BoostLivesDialog.vue'
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
      FollowDialog,
      LoginDialog,
      TrainDialog,
      PublishDialog,
      ScrapeFollowersDialog,
      DeletePostDialog,
      BoostUsersDialog,
      BoostPostsDialog,
      MatchAccounts,
      MassCommentDialog,
      BoostLivesDialog
    },

    data() {
      return {
      }
    },
    methods: {
      async runScript() {
        if (this.selecedDevices.length === 0) {
          return;
        }
        
        if (this.$refs.currentDialog && typeof this.$refs.currentDialog.runScript === 'function') {
          await this.$refs.currentDialog.runScript();
          await this.$emiter('closeDialog', {})
        }
      },
    },
    async mounted() {
      
    }
  }
  </script>
  