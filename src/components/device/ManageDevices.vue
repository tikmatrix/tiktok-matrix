<template>
  <div class="flex-1 w-full h-screen overflow-y-scroll no-scrollbar pl-2 pr-2 pb-14">
    <Pagination ref="device_panel" :items="mydevices" :pageSize="200" @refresh="refreshPage">
      <template v-slot:buttons>
        <div class="flex items-center space-x-2 ml-2">
          <button class="btn btn-md btn-primary" @click="$refs.scan_dialog.show()">
            <font-awesome-icon icon="fa-solid fa-network-wired" class="h-3 w-3" />{{ $t('scanTCPDevice') }}
          </button>
          <button class="btn btn-md btn-primary" @click="$emiter('showDialog', { name: 'accounts' })">
            <font-awesome-icon icon="user" class="h-3 w-3" />{{ $t('accounts') }}
          </button>
          <button class="btn btn-md btn-primary" @click="$emiter('showDialog', { name: 'tiktokSettings' })">
            <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('settings') }}
          </button>
          <div class="form-control px-3 py-1 rounded-lg bg-base-300 shadow-md flex-row items-center">
            <label class="label cursor-pointer flex items-center space-x-2">
              <span class="text-md font-medium">{{ $t('autoWakeUp') }}</span>
              <input type="checkbox" class="toggle toggle-primary toggle-md" v-model="settings.uiautomator_status"
                true-value="1" false-value="0" @change="update_settings" />
            </label>
          </div>

          <div class="form-control px-3 py-1 rounded-lg bg-base-300 shadow-md flex-row items-center">
            <label class="label cursor-pointer flex items-center space-x-2">
              <span class="text-md font-medium">{{ $t('displayMode') }}</span>
              <label class="swap swap-rotate">
                <input type="checkbox" v-model="listMode" />
                <font-awesome-icon icon="fa-solid fa-list" class="swap-on fill-current w-5 h-5 text-primary" />
                <font-awesome-icon icon="fa-solid fa-th" class="swap-off fill-current w-5 h-5 text-primary" />
              </label>
            </label>
          </div>
        </div>
      </template>
      <template v-slot:default="slotProps">
        <div class="flex flex-wrap gap-2 p-4">
          <div class="flex flex-wrap gap-2 flex-1" v-if="listMode">
            <div class="overflow-x-auto">
              <table class="table table-md">
                <thead>
                  <tr>
                    <th>{{ $t('no') }}</th>
                    <th>{{ $t('serial') }}</th>
                    <th>{{ $t('mode') }}</th>
                    <th>{{ $t('device') }}</th>
                    <th>{{ $t('connectType') }}</th>
                    <th>{{ $t('group') }}</th>
                    <th>{{ $t('task') }}</th>
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
                    <td>{{ device.real_serial }}</td>
                    <td>
                      <div class="badge badge-neutral badge-md" v-if="device.connect_type == '0'">USB</div>
                      <div class="badge badge-primary badge-md" v-else>TCP</div>
                    </td>
                    <td>{{ device.group_name }}</td>
                    <td>
                      <div class="badge badge-success badge-md" v-if="device.task_status == '1'">
                        {{ $t('running') }}
                      </div>
                      <div class="badge badge-primary badge-md" v-else>
                        {{ $t('ready') }}
                      </div>
                    </td>
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
            <div v-for="(device, index) in slotProps.items" :key="device.real_serial">
              <Miniremote :device="device" :key="device.real_serial" :no="device.key" />
            </div>
          </div>
        </div>
      </template>
    </Pagination>
    <div v-if="devices.length == 0" class="w-full min-h-screen bg-base-100 flex flex-col items-center justify-center">
      <div class="relative flex justify-center items-center">
        <div class="absolute animate-spin rounded-full h-48 w-48 border-t-4 border-b-4 border-purple-500"></div>
        <svg class="fill-current text-info h-32 w-32" xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 471.117 471.117" xml:space="preserve">
          <g>
            <path d="M447.564,129.817h-68.192c-8.213,0-14.871,6.675-14.871,14.872v129.155
		c0,8.213,6.658,14.873,14.871,14.873h68.192c8.197,0,14.856-6.66,14.856-14.873V144.689
		C462.42,136.492,455.761,129.817,447.564,129.817z M446.81,144.689v115.13h-66.776l-0.662-114.377L446.81,144.689z
		 M406.025,273.461c0-4.076,3.321-7.429,7.428-7.429c4.122,0,7.443,3.353,7.443,7.429c0,4.107-3.321,7.444-7.443,7.444
		C409.346,280.905,406.025,277.568,406.025,273.461z" />
            <path d="M116.123,216.788v38.371h-12.365c-8.627,0-15.61,6.999-15.61,15.626
		c0,8.629,6.983,15.609,15.61,15.609h101.765c8.629,0,15.626-6.98,15.626-15.609c0-8.627-6.997-15.626-15.626-15.626h-12.364
		v-38.371H271.5c16.04,0,29.083-13.041,29.083-29.083V29.082C300.583,13.042,287.54,0,271.5,0H37.781
		C21.739,0,8.697,13.042,8.697,29.082v158.623c0,16.042,13.042,29.083,29.084,29.083H116.123z M39.933,31.236h229.415v154.316
		H39.933V31.236z" />
            <path
              d="M345.138,298.622h-170.42c-16.118,0-29.237,13.118-29.237,29.235v114.024
		c0,16.117,13.119,29.235,29.237,29.235h170.42c16.117,0,29.235-13.118,29.235-29.235V327.857
		C374.374,311.74,361.255,298.622,345.138,298.622z M165.583,395.805c-6.044,0-10.935-4.876-10.935-10.936
		c0-6.059,4.891-10.95,10.935-10.95c6.028,0,10.95,4.892,10.95,10.95C176.533,390.929,171.611,395.805,165.583,395.805z
		 M350.951,441.882c0,3.198-2.614,5.813-5.813,5.813H184.577V322.045h160.562c3.198,0,5.813,2.614,5.813,5.813V441.882z" />
            <path d="M49.36,399.558v-133.34v-25.452H25.937v170.511c0,6.46,5.244,11.704,11.705,11.704h78.48v-23.423
		h-5.383H49.36z" />
            <path d="M418.989,343.237v56.32h-20.485h-4.26v23.423h36.465c6.459,0,11.703-5.244,11.703-11.704V311.033
		h-23.423V343.237z" />
          </g>
        </svg>
      </div>
      <span class="mt-8 text-lg font-semibold text-base-content animate-bounce">{{ $t('detecting_devices') }}</span>
    </div>
  </div>
  <vue-draggable-resizable v-if="device && device.serial" :w="`auto`" :h="`auto`" :resizable="false" :parent="false"
    :z="20" drag-handle=".drag"
    class="bg-base-100 fixed top-16 right-16 border-1 border-base-300 justify-center items-center flex flex-col ring-1 ring-info ring-opacity-50 shadow-2xl rounded-md">
    <Miniremote :device="device" :no="device.key" :big="true" :key="device.real_serial + '_big'" />
  </vue-draggable-resizable>
  <dialog ref="scan_dialog" class="modal">
    <div class="modal-box bg-base-300">
      <h3 class="font-bold text-lg">{{ $t('scanIpTitle') }}</h3>
      <div class="flex flex-row items-center">
        <input class="input input-bordered input-md w-20 ring" type="number" v-model="ip_1" />
        <span class="font-bold p-1">.</span>
        <input class="input input-bordered input-md w-20 ring" type="number" v-model="ip_2" />
        <span class="font-bold p-1">.</span>
        <input class="input input-bordered input-md w-20 ring" type="number" v-model="ip_3" />
        <span class="font-bold p-1">.</span>
        <input class="input input-bordered input-md w-20 ring ring-info" type="number" v-model="ip_4" />
        <span class="font-bold p-2 mr-1 ml-1 text-lg">-</span>
        <input class="input input-bordered input-md w-20 ring ring-success" type="number" v-model="ip_5" />
      </div>
      <h5 class="font-bold">{{ $t('scanPortTip') }}</h5>
      <input class="input input-bordered input-md w-24 ring" type="number" v-model="port" />
      <MyButton @click="scan" label="startScan" :showLoading="scaning" icon="fa fa-search" />
      <span class="label-text ml-2">{{ scanResult }}</span>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
  <dialog ref="set_sort_dialog" class="modal">
    <div class="modal-box bg-base-300">
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
<style>
@import "vue-draggable-resizable/style.css";
</style>
<script>
import MyButton from '../Button.vue'
import Miniremote from './Miniremote.vue'
import Modal from '../Modal.vue'
import Pagination from '../Pagination.vue'



export default {
  name: 'devices',
  props: {
    devices: {
      type: Array,
      required: true
    },
    settings: {
      type: Object,
      required: true
    }
  },
  components: {
    MyButton,
    Miniremote,
    Modal,
    Pagination,
  },
  data() {
    return {
      device: null,
      listMode: localStorage.getItem('listMode') === 'true' || false,
      mydevices: [],
      ip_1: localStorage.getItem('ip_1')?.replace(/"/g, '') || 192,
      ip_2: localStorage.getItem('ip_2')?.replace(/"/g, '') || 168,
      ip_3: localStorage.getItem('ip_3')?.replace(/"/g, '') || 1,
      ip_4: localStorage.getItem('ip_4')?.replace(/"/g, '') || 2,
      ip_5: localStorage.getItem('ip_5')?.replace(/"/g, '') || 254,
      port: localStorage.getItem('scan_port')?.replace(/"/g, '') || 5555,
      proxy_host: localStorage.getItem('proxy_host')?.replace(/"/g, '') || '127.0.0.1',
      proxy_port: localStorage.getItem('proxy_port')?.replace(/"/g, '') || 8080,
      scaning: false,
      scanResult: '',
      groups: [],
      currentDevice: null,
    }
  },
  watch: {
    groups(val) {
      this.mydevices.forEach(device => {
        device.group_name = this.groups.find(group => group.id === device.group_id)?.name
      })
    },
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
      this.$emiter('reload_devices', {})
    },
    refreshPage() {
      this.$emiter('refreshDevice', {})
    },



    async scan() {
      this.scaning = true
      localStorage.setItem('ip_1', this.ip_1)
      localStorage.setItem('ip_2', this.ip_2)
      localStorage.setItem('ip_3', this.ip_3)
      localStorage.setItem('ip_4', this.ip_4)
      localStorage.setItem('ip_5', this.ip_5)
      localStorage.setItem('scan_port', this.port)
      this.$service.scan_tcp({
        start_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_4}`,
        end_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_5}`,
        port: Number(this.port)
      }).then((res) => {
        this.scaning = false
        this.scanResult = `${res.data} ${this.$t('deviceFound')}`
      })
    },
    async update_settings() {
      await this.$service.update_settings(this.settings)
      //reload settings
      await this.$emiter('reload_settings', {})
    },

  },

  async mounted() {
    this.mydevices = this.devices
    await this.$listen('openDevice', async (e) => {
      this.device = e.payload
      for (let i = 0; i < this.mydevices.length; i++) {
        if (this.mydevices[i].serial === this.device.serial) {
          this.mydevices[i] = this.device
          break
        }
      }
    });
    await this.$listen('closeDevice', (e) => {
      this.device = null
    });

  },
}
</script>
