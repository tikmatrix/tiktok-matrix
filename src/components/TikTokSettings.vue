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
    }
  },
  methods: {
    async open_dir(name) {
      invoke("open_dir", {
        name
      });
    },
    async update_settings() {
      await this.$service.update_settings(this.settings)
      //reload settings
      await this.$emiter('reload_settings', {})

    }
  },
  async mounted() {
    this.packagename = this.settings.packagename
    this.work_path = await appDataDir();
  }
}
</script>
