<template>
  <div class="flex-1 w-full h-screen overflow-y-scroll no-scrollbar">
    <Pagination ref="device_panel" :items="mydevices" :pageSize="200" @refresh="refreshPage">
      <template v-slot:buttons>
        <MyButton @click="$refs.scan_dialog.show()" label="scanTCPDevice" icon="fa-solid fa-network-wired" />
        <div class="form-control ring-1 ml-2 rounded-lg">
          <label class="label cursor-pointer">
            <span class="text-md font-bold mr-2">{{ $t('autoWakeUp') }}: </span>
            <input type="checkbox" class="toggle toggle-success" v-model="settings.uiautomator_status" true-value="1"
              false-value="0" @change="update_settings" />
          </label>
        </div>
        <div class="form-control ring-1 ml-2 rounded-lg">
          <label class="label cursor-pointer">
            <span class="text-md font-bold mr-2">
              {{ $t('displayMode') }}:
            </span>
            <label class="swap swap-rotate">
              <input type="checkbox" v-model="listMode" />
              <!--list mode-->
              <font-awesome-icon icon="fa-solid fa-list" class="swap-on fill-current w-6 h-6 text-success" />
              <!--grid mode-->
              <font-awesome-icon icon="fa-solid fa-th" class="swap-off fill-current w-6 h-6 text-success" />
            </label>
          </label>
        </div>

      </template>
      <template v-slot:default="slotProps">
        <div class="flex flex-wrap gap-2 p-4">
          <div class="flex flex-wrap gap-2 flex-1" v-if="listMode">
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>{{ $t('no') }}</th>
                    <th>{{ $t('serial') }}</th>
                    <th>{{ $t('mode') }}</th>
                    <th>{{ $t('name') }}</th>
                    <th>{{ $t('forwardPort') }}</th>
                    <th>{{ $t('ip') }}</th>
                    <th>{{ $t('connectType') }}</th>
                    <th>{{ $t('group') }}</th>
                    <th>{{ $t('sort') }}</th>
                    <th>{{ $t('actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(device, index) in slotProps.items" :key="index">
                    <td>{{ device.key }}</td>
                    <td>
                      <a class="link link-primary" @click="$emiter('openDevice', device)" v-if="device.key">{{
                        device.serial }}</a>
                    </td>
                    <td>{{ device.mode }}</td>
                    <td>{{ device.name }}</td>
                    <td>{{ device.forward_port }}</td>
                    <td>{{ device.ip }}</td>
                    <td>
                      <div class="badge badge-neutral badge-sm" v-if="device.connect_type == '0'">USB</div>
                      <div class="badge badge-primary badge-sm" v-else>TCP</div>
                    </td>
                    <td>{{ device.group_name }}</td>
                    <td>{{ device.sort }}</td>
                    <td>
                      <div class="space-x-4">
                        <button class="btn-xs bg-primary hover:bg-blue-700 text-primary-content rounded"
                          @click="showSetSortDialog(device)">{{
                            $t('setSort') }}</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 flex-1" v-else>
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
        <div class="absolute inset-0 border-4 border-primary rounded-full animate-ping"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <i class="fas fa-mobile-alt text-5xl text-gray-600"></i>
        </div>
        <div class="absolute top-1/2 left-1/2 w-1 h-32 bg-primary origin-bottom animate-radar"></div>
      </div>
      <span class="mt-4 text-lg font-semibold text-gray-700 animate-bounce">{{ $t('detecting_devices') }}</span>
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
  <dialog ref="set_sort_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('setSort') }}</h3>
      <div class="flex flex-row items-center">
        <input class="input input-bordered input-md" type="number" v-model="currentDevice.sort" v-if="currentDevice" />
        <MyButton @click="setSort" label="confirm" />
      </div>

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
      listMode: localStorage.getItem('listMode') === 'true' || false,
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
      scanResult: '',
      groups: [],
      currentDevice: null,
    }
  },
  watch: {

    listMode(val) {
      localStorage.setItem('listMode', val)
    },
    devices: {
      handler(val) {
        this.mydevices = val
        this.mydevices.forEach(device => {
          device.group_name = this.groups.find(group => group.id === device.group_id)?.name
        })
      },
      deep: true
    }
  },
  methods: {

    showSetSortDialog(device) {
      if (device) {
        this.currentDevice = device
        this.$refs.set_sort_dialog.show()
      }
    },
    setSort() {
      if (!this.currentDevice) return
      this.currentDevice.sort = parseInt(this.currentDevice.sort)
      localStorage.setItem(`sort_${this.currentDevice.real_serial}`, this.currentDevice.sort)
      this.mydevices.sort((a, b) => {
        // fisrt: sort
        // second: group_id
        // third: real_serial
        return a.sort - b.sort || a.group_id - b.group_id || a.real_serial - b.real_serial
      });
    },
    refreshPage() {
      console.log('refreshPage')
      window.location.reload();
    },
    get_groups() {
      this.$service
        .get_groups()
        .then(res => {
          this.groups = res.data
          this.mydevices.forEach(device => {
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

  async mounted() {
    this.mydevices = this.devices
    this.get_groups()
    this.get_settings()
    await this.$listen('reload_sidebar', (e) => {
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
