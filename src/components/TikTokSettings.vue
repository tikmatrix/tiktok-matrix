<template>
  <div class="flex flex-col items-start p-12">
    <div class="divider">{{ $t('tiktokPackagename') }}</div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <label class="font-bold text-right col-span-1">{{ $t('tiktokPackagename') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center px-3 py-1 rounded-lg shadow-md">
          <input type="radio" id="global" value="com.zhiliaoapp.musically" v-model="packagename"
            class="form-radio text-primary h-4 w-4">
          <label for="global" class="label cursor-pointer ml-2">{{ $t('global') }}</label>
        </div>
        <div class="flex items-center px-3 py-1 rounded-lg shadow-md">
          <input type="radio" id="asia" value="com.ss.android.ugc.trill" v-model="packagename"
            class="form-radio text-primary h-4 w-4">
          <label for="asia" class="label cursor-pointer ml-2">{{ $t('asia') }}</label>
        </div>
      </div>
    </div>
    <div class="divider">{{ $t('autoWakeUp') }}</div>
    <div class="form-control px-3 py-1 rounded-lg shadow-md flex-row items-center">
      <label class="label cursor-pointer flex items-center space-x-2">
        <span class="text-md font-bold">{{ $t('autoWakeUp') }}</span>
        <input type="checkbox" class="toggle toggle-primary toggle-md" v-model="settings.uiautomator_status"
          true-value="1" false-value="0" @change="update_settings" />
      </label>
    </div>
    <div class="divider">{{ $t('bigScreen') }}</div>
    <div class="flex items-center flex-row gap-2 max-w-full w-full">
      <label class="font-bold text-right col-span-1">{{ $t('bigScreen') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center px-3 py-1 rounded-lg shadow-md">
          <input type="radio" id="standard" value="standard" v-model="bigScreen"
            class="form-radio text-primary h-4 w-4">
          <label for="standard" class="label cursor-pointer ml-2">{{ $t('standardWindow') }}</label>
        </div>
        <div class="flex items-center px-3 py-1 rounded-lg shadow-md">
          <input type="radio" id="docked" value="docked" v-model="bigScreen" class="form-radio text-primary h-4 w-4">
          <label for="docked" class="label cursor-pointer ml-2">{{ $t('dockedWindow') }}</label>
        </div>
      </div>
    </div>
    <div class="divider">{{ $t('openAppDir') }}</div>
    <div class="form-control px-3 py-1 rounded-lg shadow-md flex-row items-center">
      <label class="label cursor-pointer flex items-center space-x-2">
        <span class="text-md font-bold">{{ $t('openAppDir') }}:</span>
        <a class="link link-primary" @click="open_dir('')">
          {{ work_path }}
        </a>
      </label>
    </div>
    <div class="divider">{{ $t('featureUnlock') }}</div>
    <div class="form-control px-3 py-1 rounded-lg shadow-md flex-row items-center">
      <label class="label cursor-pointer flex items-center space-x-2">
        <span class="text-md font-bold">{{ $t('featureUnlock') }}:</span>
        <input v-model="featureCode" class="input input-bordered input-md w-40" :placeholder="$t('inputFeatureCode')" />
        <button class="btn btn-md btn-primary ml-2" @click="unlockFeature">{{ $t('unlock') }}</button>
      </label>
    </div>
    <div class="divider">{{ $t('openAdbTerminal') }}</div>
    <div class="form-control px-3 py-1 rounded-lg shadow-md flex-row items-center">
      <label class="label cursor-pointer flex items-center space-x-2">
        <span class="text-md font-bold">{{ $t('openAdbTerminal') }}:</span>
        <button class="btn btn-md btn-secondary ml-2" @click="open_adb_terminal">{{ $t('openAdbTerminalBtn') }}</button>
      </label>
    </div>
  </div>
</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";
import { appDataDir } from '@tauri-apps/api/path';
export default {
  name: 'TikTokSettings',
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  watch: {
    packagename: {
      handler(newVal) {
        this.settings.packagename = newVal
        this.update_settings()
      },
      deep: true
    },
    bigScreen: {
      handler(newVal) {
        localStorage.setItem('bigScreen', newVal)
      },
      deep: true
    }
  },
  data() {
    return {
      packagename: '',
      bigScreen: localStorage.getItem('bigScreen') || 'standard',
      work_path: '',
      featureCode: '',
    }
  },
  methods: {
    async open_dir(name) {
      invoke("open_dir", {
        name
      });
    },
    async open_adb_terminal() {
      const dir = (await appDataDir()) + 'platform-tools';
      invoke('open_adb_terminal', { dir });
    },
    async update_settings() {
      await this.$service.update_settings(this.settings)
      //reload settings
      await this.$emiter('reload_settings', {})

    },
    async unlockFeature() {
      // 激活码与功能映射，可扩展
      const featureMap = {
        'cGxhbl9rZXk=': 'followPlan', // 'plan_key' base64
        // 未来可添加更多激活码
      };
      const code = this.featureCode.trim();
      const unlocked = JSON.parse(localStorage.getItem('unlockedFeatures') || '[]');
      if (featureMap[code]) {
        if (!unlocked.includes(featureMap[code])) {
          unlocked.push(featureMap[code]);
          localStorage.setItem('unlockedFeatures', JSON.stringify(unlocked));
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('featureUnlocked'),
            timeout: 2000
          });
          await this.$emiter('featureUnlocked', {})
        } else {
          await this.$emiter('NOTIFY', {
            type: 'info',
            message: this.$t('featureAlreadyUnlocked'),
            timeout: 2000
          });
        }
      } else {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('featureCodeInvalid'),
          timeout: 2000
        });
      }
    }
  },
  async mounted() {
    this.packagename = this.settings.packagename
    this.work_path = await appDataDir();
  }
}
</script>
