<template>
  <div class="w-full h-screen overflow-y-auto">
    <Pagination ref="device_panel" :items="devices" :searchKeys="['serial', 'account']" @refresh="refreshPage">
      <template v-slot:buttons>
        <MyButton @click="$service.reset_all_index" label="resetIndex" icon="fa fa-refresh" />
        <MyButton @click="$refs.scan_dialog.show()" label="scanTCPDevice" icon="fa-solid fa-network-wired" />
      </template>
      <template v-slot:default="slotProps">
        <div class="flex flex-wrap gap-2 p-4">
          <div class="flex flex-wrap gap-2 flex-1">
            <div v-for="(device, _index) in devices" :key="device.serial">
              <Miniremote :device="device" :key="device.key" />
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
            <span>{{ $t('no_devices_tips') }}</span>
          </div>
        </div>
      </template>
    </Pagination>

  </div>
  <dialog ref="scan_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('scanIpTitle') }}</h3>
      <div class="flex flex-row items-center">
        <input class="input input-bordered input-sm w-20" type="number" v-model="ip_1" />
        <span class="font-bold p-1">.</span>
        <input class="input input-bordered input-sm w-20" type="number" v-model="ip_2" />
        <span class="font-bold p-1">.</span>
        <input class="input input-bordered input-sm w-20" type="number" v-model="ip_3" />
        <span class="font-bold p-1">.</span>
        <input class="input input-bordered input-sm w-20" type="number" v-model="ip_4" />
        <span class="font-bold p-2">-</span>
        <input class="input input-bordered input-sm w-20" type="number" v-model="ip_5" />
      </div>
      <h5 class="font-bold">{{ $t('scanPortTip') }}</h5>
      <input class="input input-bordered input-sm w-24" type="number" v-model="port" />
      <MyButton @click="scan" label="startScan" :showLoading="scaning" />

    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
<script>
import MyButton from '../Button.vue'
import Miniremote from './Miniremote.vue'
import Device from './Device.vue'
import Modal from '../Modal.vue'
import Pagination from '../Pagination.vue'
import { inject } from 'vue'
import * as util from '../../utils'

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
      ip_1: util.getData('ip_1') || 192,
      ip_2: util.getData('ip_2') || 168,
      ip_3: util.getData('ip_3') || 1,
      ip_4: util.getData('ip_4') || 2,
      ip_5: util.getData('ip_5') || 254,
      port: util.getData('scan_port') || 5555,
      proxy_host: util.getData('proxy_host') || '127.0.0.1',
      proxy_port: util.getData('proxy_port') || 8080,
      scaning: false
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

    scan() {
      this.scaning = true
      util.setData('ip_1', this.ip_1)
      util.setData('ip_2', this.ip_2)
      util.setData('ip_3', this.ip_3)
      util.setData('ip_4', this.ip_4)
      util.setData('ip_5', this.ip_5)
      util.setData('scan_port', this.port)
      this.$service.scan_tcp({
        start_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_4}`,
        end_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_5}`,
        port: this.port
      }).then((res) => {
        console.log(res)
        this.scaning = false
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
