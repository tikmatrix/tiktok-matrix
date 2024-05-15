<template>
  <div class="w-full">
    <Pagination ref="device_panel" :items="devices" :searchKeys="['serial', 'account']" :showRefBtn="false">
      <template v-slot:buttons>
        <div class="p-2 bg-accent rounded-lg shadow-md ml-2">
          <div class="form-control center">
            <label class="swap swap-flip">
              <input type="checkbox" @change="toggleUsbTcp" :checked="isTcp" />
              <div class="swap-on ml-1">
                <font-awesome-icon icon="fa-solid fa-network-wired" />
                <kbd class="kbd">TCP</kbd>
              </div>
              <div class="swap-off ml-1">
                <font-awesome-icon icon="fas fa-plug" />
                <kbd class="kbd">USB</kbd>
              </div>
            </label>
          </div>
        </div>


        <MyButton class="btn btn-success ml-2" @click="showHiddenDevices" label="showHiddenDevices" />
      </template>
      <template v-slot:default="slotProps">
        <div class="flex flex-wrap gap-2 p-4">

          <div class="flex flex-wrap gap-2 flex-1">
            <div v-for="(device, index) in devices" :key="device.serial">
              <Miniremote :device="device" :index="index" :key="device.serial" />
            </div>
          </div>
        </div>
        <div v-if="slotProps.items.length == 0 && settings.adb_mode == 'TCP'" class="p-4">
          <div role="alert" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Plase wait 10 seconds ! System is scanning and connecting your net devices.</span>
          </div>

        </div>
        <div v-if="slotProps.items.length == 0 && settings.adb_mode == 'USB'" class="p-4">
          <div role="alert" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>No devices found! Please connect your device via USB!</span>
          </div>
        </div>
      </template>
    </Pagination>

  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Miniremote from './Miniremote.vue'
import Modal from '../Modal.vue'
import Pagination from '../Pagination.vue'
import { inject } from 'vue'
export default {
  name: 'devices',
  setup() {
    const devices = inject('devices')

    return { devices: devices.list }
  },
  components: {
    MyButton,
    Miniremote,
    Modal,
    Pagination,
  },
  data() {
    return {
      settings: {
        adb_mode: ''
      },
      isTcp: false,
      fullscreen: false,
    }
  },

  methods: {


    get_groups() {
      this.$service
        .get_groups()
        .then(res => {
          this.groups = res.data
          this.devices.forEach(device => {
            device.group_name = this.groups.find(group => group.id === device.group_id)?.name
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
        this.isTcp = this.settings.adb_mode === 'TCP'
      })
    },
    toggleUsbTcp() {
      this.isTcp = !this.isTcp
      this.settings.adb_mode = this.isTcp ? 'TCP' : 'USB'
      if (this.settings.adb_mode === 'TCP') {
        this.scan_tcp()
      }
      this.$service
        .update_settings(this.settings)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    scan_tcp() {
      this.$service
        .scan_tcp({})
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    showHiddenDevices() {
      this.$emitter.emit('show-hidden-devices')
    }

  },

  mounted() {
    this.get_settings()
  },
  unmounted() {
  }
}
</script>
