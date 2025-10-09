<template>
  <div class="bg-base-100 rounded-xl shadow-lg p-6 min-h-96">
    <div class="space-y-6">
      <!-- Email Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-2">
          {{ $t('email') }}
        </label>
        <input class="input input-bordered w-full focus:input-primary transition-all duration-200" type="email"
          v-model="myaccount.email" placeholder="user@example.com" />
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-2">
          {{ $t('password') }}
        </label>
        <input class="input input-bordered w-full focus:input-primary transition-all duration-200" type="text"
          v-model="myaccount.pwd" placeholder="••••••••" />
      </div>

      <!-- Username Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-2">
          {{ $t('username') }}
          <span class="text-error ml-1">*</span>
        </label>
        <input class="input input-bordered w-full focus:input-primary transition-all duration-200" type="text" required
          placeholder="Username" v-model="myaccount.username" />
      </div>

      <!-- Package Name Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-2">
          {{ $t('packagename') }} - App Cloner | NomixCloner
        </label>
        <div class="flex gap-2">
          <input class="input input-bordered flex-1 focus:input-primary transition-all duration-200" type="text"
            v-model="myaccount.packagename" placeholder="Default Package" />
          <button type="button"
            class="btn btn-outline btn-primary btn-md gap-2 hover:shadow-md transition-all duration-200"
            :class="{ 'loading': detectingPackage }" :disabled="!myaccount.device || detectingPackage"
            @click="detectPackageName">
            <svg v-if="!detectingPackage" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd" />
            </svg>
            {{ $t('detectPackage') }}
          </button>
        </div>
      </div>

      <!-- Login Status Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-3">
          {{ $t('loginStatus') }}
        </label>
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <input type="radio" id="logined" value="1" v-model="account.logined" class="radio radio-primary radio-sm">
            <span class="ml-2 text-base-content">{{ $t('logined') }}</span>
          </label>
          <label class="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <input type="radio" id="unlogined" value="0" v-model="account.logined" class="radio radio-primary radio-sm">
            <span class="ml-2 text-base-content">{{ $t('unlogined') }}</span>
          </label>
        </div>
      </div>

      <!-- Status Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-3">
          {{ $t('status') }}
        </label>
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <input type="radio" id="enable" value="0" v-model="account.status" class="radio radio-success radio-sm">
            <span class="ml-2 text-base-content">{{ $t('enable') }}</span>
          </label>
          <label class="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <input type="radio" id="disable" value="1" v-model="account.status" class="radio radio-error radio-sm">
            <span class="ml-2 text-base-content">{{ $t('disable') }}</span>
          </label>
        </div>
      </div>

      <!-- Device Field -->
      <div class="form-group">
        <label class="block text-sm font-semibold text-base-content mb-3">
          {{ $t('device') }}
        </label>
        <div v-if="devices.length > 0" class="flex flex-wrap items-center gap-2">
          <button type="button" class="btn btn-sm btn-error btn-circle" @click="clearDevice" title="Clear selection">
            ×
          </button>
          <button v-for="(device, index) in devices" :key="device.serial" type="button"
            class="btn btn-sm transition-all duration-200"
            :class="device.key === myaccount.device_index ? 'btn-success' : 'btn-outline btn-success'"
            @click="selectDevice(device)">
            {{ device.key }}
          </button>
        </div>
        <div v-else class="text-sm text-gray-400 italic bg-base-200 rounded-lg p-4 text-center">
          {{ $t('noDevice') }}
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-8 pt-6 border-t border-base-300 flex justify-end gap-3">
      <button class="btn btn-primary btn-md gap-2 shadow-md hover:shadow-lg transition-all duration-200" @click="save">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
        </svg>
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
      detectingPackage: false,
    }
  },
  methods: {
    async detectPackageName() {
      if (!this.myaccount.device) {
        this.$emiter('NOTIFY', {
          type: 'warning',
          message: this.$t('pleaseSelectDevice'),
          timeout: 3000
        })
        return
      }

      this.detectingPackage = true
      try {
        const result = await this.$service.detectCurrentPackage(this.myaccount.device)
        if (result && result.data) {
          this.myaccount.packagename = result.data
          this.$emiter('NOTIFY', {
            type: 'success',
            message: `${this.$t('detectPackageSuccess')}: ${result.data}`,
            timeout: 3000
          })
        } else {
          this.$emiter('NOTIFY', {
            type: 'error',
            message: this.$t('detectPackageFailed'),
            timeout: 3000
          })
        }
      } catch (error) {
        console.error('Detect package error:', error)
        this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('detectPackageError'),
          timeout: 3000
        })
      } finally {
        this.detectingPackage = false
      }
    },

    save() {
      if (!this.myaccount.username) {
        this.$emiter('NOTIFY', {
          type: 'warning',
          message: this.$t('usernameRequired'),
          timeout: 3000
        })
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

    clearDevice() {
      this.myaccount.device = null
      this.myaccount.device_index = null
    },

  },
  mounted() {
    this.myaccount = this.account
    this.myaccount.device_index = this.devices.find(device => device.real_serial === this.myaccount.device)?.key
  }
}
</script>
