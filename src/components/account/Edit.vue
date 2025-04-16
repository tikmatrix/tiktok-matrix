<template>
  <div class="bg-base-100 flex flex-col items-start p-4 min-h-96">

    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-32">{{ $t('email') }}:</label>
      <input class="input" type="email" v-model="myaccount.email" />
    </div>
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-32">{{ $t('password') }}:</label>
      <input class="input" type="text" v-model="myaccount.pwd" />
    </div>
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-32">{{ $t('username') }}:</label>
      <input class="input validator" type="input" required placeholder="Username" v-model="myaccount.username" />
    </div>
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-32">{{ $t('loginStatus') }}:</label>
      <div class="flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="logined" value="1" v-model="account.logined" class="form-radio text-primary h-4 w-4">
          <label for="logined" class="ml-2">{{ $t('logined') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="unlogined" value="0" v-model="account.logined"
            class="form-radio text-primary h-4 w-4">
          <label for="unlogined" class="ml-2">{{ $t('unlogined') }}</label>
        </div>

      </div>
    </div>
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-32">{{ $t('status') }}:</label>
      <div class="flex items-center gap-4">
        <div class="flex items-center">
          <input type="radio" id="enable" value="0" v-model="account.status" class="form-radio text-primary h-4 w-4">
          <label for="enable" class="ml-2">{{ $t('enable') }}</label>
        </div>
        <div class="flex items-center">
          <input type="radio" id="disable" value="1" v-model="account.status" class="form-radio text-primary h-4 w-4">
          <label for="disable" class="ml-2">{{ $t('disable') }}</label>
        </div>

      </div>
    </div>
    <div class="flex w-full items-center gap-2 mb-2">
      <label class="font-bold w-32">{{ $t('device') }}:</label>
        <form class="filter" v-if="devices.length > 0">
          <input class="btn btn-md btn-error" type="reset" value="×" />
          <input class="btn btn-md btn-success" type="radio" name="frameworks" :aria-label="device.key" v-for="(device, index) in devices"
            :key="device.serial" @click="selectDevice(device)" :checked="device.key === myaccount.device_index" />
        </form>
        <div v-else class="text-gray-500">{{ $t('noDevice') }}  </div>
        
    </div>

    <!-- other fields... -->
    <div class="mt-4 w-full flex justify-end">
      <button
        class="bg-primary hover:bg-blue-700 text-primary-content font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        @click="save">
        {{ $t('save') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {

  props: {
    devices: {
      type: Array,
      required: true
    },
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
      this.myaccount.logined = Number(this.myaccount.logined)
      this.myaccount.status = Number(this.myaccount.status)
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
