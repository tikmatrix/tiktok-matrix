<template>
  <div class="bg-base-100 flex flex-col items-start p-4 min-h-96">
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('email') }}:</label>
      <input class="border-2 border-gray-300 p-2 rounded col-span-2" v-model="myaccount.email" />
    </div>
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right">{{ $t('password') }}:</label>
      <input class="border-2 border-gray-300 p-2 rounded w-full" v-model="myaccount.pwd" />
    </div>
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right">{{ $t('username') }}:</label>
      <input class="border-2 border-gray-300 p-2 rounded w-full" v-model="myaccount.username" />
    </div>
    <!-- <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
            <label class="font-bold text-right">{{ $t('fans') }}:</label>
            <input class="border-2 border-gray-300 p-2 rounded w-full" v-model="myaccount.fans" type="number"/>
        </div> -->
    <div class="grid grid-cols-3 w-full items-center gap-2 mb-2">
      <label class="font-bold text-right col-span-1">{{ $t('device') }}:</label>
      <div class="relative col-span-2">
        <input class="border-2 border-gray-300 p-2 rounded w-full" v-model="myaccount.device"
          @click="showDeviceList = !showDeviceList" readonly />
        <div class="absolute z-10 bg-white border border-gray-300 rounded mt-2 w-full overflow-y-auto max-h-32"
          v-show="showDeviceList">
          <div class="cursor-pointer p-2 hover:bg-gray-200" v-for="(device, index) in devices" :key="device.serial"
            @click="selectDevice(device)">
            {{ index + 1 }} - {{ device.serial }}
            <!-- <span v-if="device.email" class="text-green-500 m-1">{{ device.email }}</span>
                        <span v-else class="text-red-500 m-1">{{ $t('unbinded') }}</span> -->
          </div>
        </div>
      </div>
    </div>

    <!-- other fields... -->
    <div class="mt-4 w-full flex justify-end">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        @click="update">
        {{ $t('update') }}
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
    update() {
      this.$emit('update', this.myaccount)
    },

    selectDevice(device) {
      this.myaccount.device = device.serial
      this.showDeviceList = false
    },

  },
  mounted() {
    this.myaccount = this.account
  }
}
</script>
