<template>
  <div class="bg-base-100 flex flex-col items-start p-4 min-h-96">
    <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('platform') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="tiktok" value="tiktok" v-model="myaccount.platform"
            class="form-radio text-blue-500 h-4 w-4">
          <label for="tiktok" class="ml-2">{{ $t('tiktok') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="instagram" value="instagram" v-model="myaccount.platform"
            class="form-radio text-blue-500 h-4 w-4">
          <label for="instagram" class="ml-2">{{ $t('instagram') }}</label>
        </div>

      </div>
    </div>
    <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('email') }}:</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="myaccount.email" />
    </div>
    <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right">{{ $t('password') }}:</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="myaccount.pwd" />
    </div>
    <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
      <div class="text-right">
        <label class="font-bold text-red-500">*</label>
        <label class="font-bold">{{ $t('username') }}:</label>
      </div>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="myaccount.username" />
    </div>
    <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('status') }}:</label>
      <div class="col-span-2 flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="logined" value="1" v-model="account.logined" class="form-radio text-blue-500 h-4 w-4">
          <label for="logined" class="ml-2">{{ $t('logined') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="unlogined" value="0" v-model="account.logined"
            class="form-radio text-blue-500 h-4 w-4">
          <label for="unlogined" class="ml-2">{{ $t('unlogined') }}</label>
        </div>

      </div>
    </div>
    <div class="grid grid-cols-4 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('device') }}:</label>
      <div class="relative col-span-2">
        <input class="border-2 border-gray-300 p-2 rounded w-full" v-model="myaccount.device_index"
          @click="showDeviceList = !showDeviceList" readonly />
        <div class="absolute z-10 bg-white border border-gray-300 rounded mt-2 w-full overflow-y-auto max-h-32"
          v-show="showDeviceList">
          <div class="cursor-pointer p-2 hover:bg-gray-200" v-for="(device, _index) in devices" :key="device.serial"
            @click="selectDevice(device)">
            {{ device.key }}
          </div>
        </div>
      </div>
    </div>

    <!-- other fields... -->
    <div class="mt-4 w-full flex justify-end">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        @click="save">
        {{ $t('save') }}
      </button>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'
export default {
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  props: {
    account: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      myaccount: {},
      showDeviceList: false,
    }
  },
  methods: {
    save() {
      if (!this.myaccount.username) {
        alert(this.$t('usernameRequired'))
        return
      }
      this.myaccount.username = this.myaccount.username.trim()
      this.myaccount.logined = parseInt(this.myaccount.logined)
      if (this.myaccount.id) {
        this.$emit('update', this.myaccount)
      } else {
        this.$emit('add', this.myaccount)
      }
    },

    selectDevice(device) {
      this.myaccount.device = device.real_serial
      this.myaccount.device_index = device.key
      this.showDeviceList = false
    },

  },
  mounted() {
    this.myaccount = this.account
    this.myaccount.device_index = this.devices.find(device => device.real_serial === this.myaccount.device)?.key
  }
}
</script>
