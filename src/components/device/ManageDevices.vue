<template>
  <div class="w-full min-h-screen">
    <Pagination ref="device_panel" :items="mydevices" :pageSize="200" @refresh="refreshPage">
      <template v-slot:buttons>
        <!-- <MyButton @click="$service.reset_all_index" label="resetIndex" icon="fa fa-refresh" /> -->
        <MyButton @click="$refs.scan_dialog.show()" label="scanTCPDevice" icon="fa-solid fa-network-wired" />
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text text-xs font-bold">{{ $t('autoWakeUp') }}</span>
            <input type="checkbox" class="toggle toggle-success" v-model="settings.uiautomator_status" true-value="1"
              false-value="0" @change="update_settings" />
          </label>
        </div>
      </template>
      <template v-slot:default="slotProps">
        <div class="flex flex-wrap gap-2 p-4">
          <div class="flex flex-wrap gap-2 flex-1">
            <div v-for="(device, index) in slotProps.items" :key="device.key">
              <Miniremote :device="device" :key="device.key" :no="device.key" />
            </div>
          </div>
        </div>
      </template>
    </Pagination>
    <div v-if="devices.length == 0" class="w-full min-h-screen bg-base-100 flex flex-col items-center justify-center">
      <div class="relative w-64 h-64">
        <div class="absolute inset-0 border-4 border-gray-300 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <i class="fas fa-mobile-alt text-5xl text-gray-600"></i>
        </div>
        <div class="absolute top-1/2 left-1/2 w-1 h-32 bg-blue-500 origin-bottom animate-radar"></div>
      </div>
      <span class="mt-4 text-lg font-semibold text-gray-700">{{ $t('detecting_devices') }}</span>
    </div>
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
      <span class="label-text ml-2">{{ scanResult }}</span>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
<script>
import MyButton from '../Button.vue'
import Miniremote from './Miniremote.vue'
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
      scaning: false,
      scanResult: ''
    }
  },
  watch: {

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

    async scan() {
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
        this.scaning = false
        this.scanResult = `${res.data} ${this.$t('deviceFound')}`
      })
    },
    update_settings() {
      this.$service.update_settings(this.settings).then(res => {
        console.log(res)
      })
    }
  },

  mounted() {
    this.mydevices = this.devices

    this.get_settings()
    this.$emitter.on('reload_sidebar', () => {
      this.get_settings()
    });
  },
  unmounted() {
  }
}
</script>

<style scoped>
@keyframes radar-sweep {
  from {
    transform: translate(-50%, -100%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -100%) rotate(360deg);
  }
}

.animate-radar {
  animation: radar-sweep 3s linear infinite;
}
</style>
