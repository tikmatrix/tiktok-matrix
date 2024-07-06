<template>
  <div class="w-full h-screen overflow-y-auto">
    <Pagination ref="device_panel" :items="devices" :searchKeys="['serial', 'account']" @refresh="refreshPage">
      <template v-slot:default="slotProps">
        <div class="flex flex-wrap gap-2 p-4">

          <div class="flex flex-wrap gap-2 flex-1">
            <div v-for="(device, index) in devices" :key="device.serial">
              <Miniremote :device="device" :index="index" :key="device.key" />
            </div>
          </div>
        </div>

        <div v-if="slotProps.items.length == 0" class="p-4">
          <div role="alert" class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>No devices found! Please connect your device via USB or TCP!</span>
          </div>
        </div>
      </template>
    </Pagination>

  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Miniremote from './Miniremote.vue'
import Device from './Device.vue'
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
    Device,
    Modal,
    Pagination,
  },
  data() {
    return {
      mydevices: [],
      settings: {
      },
    }
  },

  methods: {
    refreshPage() {
      window.location.reload();
    },

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
      })
    },




  },

  mounted() {
    this.mydevices = this.devices
    for (let i = 0; i < this.mydevices.length; i++) {
      this.mydevices[i].key = i
    }
    this.get_settings()
    // this.$emitter.on('refreshDevice', (data) => {
    //   // console.log("receive refreshDevice: ", data)
    //   for (let i = 0; i < this.mydevices.length; i++) {
    //     if (this.mydevices[i].serial == data) {
    //       this.mydevices[i].key = Date.now()
    //     }
    //   }
    // });
  },
  unmounted() {
  }
}
</script>
