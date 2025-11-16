<template>
  <div class="flex-1 w-full h-full px-0">
    <div
      class="flex-1 w-full h-full overflow-hidden rounded-2xl bg-base-100 border border-base-200/60 shadow-md backdrop-blur-md">
      <div class="h-full overflow-y-auto no-scrollbar px-4 pb-20 pt-4 space-y-4">

        <!-- 键盘输入提示信息 -->
        <div v-if="showKeyboardTip" class="alert alert-info shadow-lg relative">
          <button class="absolute top-2 right-2 btn btn-md btn-ghost hover:btn-error" @click="closeKeyboardTip">
            <font-awesome-icon icon="fa-solid fa-times" class="h-3 w-3" />
          </button>
          <div class="flex items-center pr-8">
            <font-awesome-icon icon="fa-solid fa-keyboard" class="h-6 w-6 text-info" />
            <div class="ml-3">
              <h3 class="font-bold text-lg">{{ $t('keyboardInput') }}</h3>
              <div class="text-md">{{ $t('keyboardInputTip') }}</div>
            </div>
          </div>
        </div>

        <Pagination ref="device_panel" :items="mydevices" :pageSize="200" @refresh="refreshPage" :showTopControls="true"
          :showBottomControls="false">
          <template #buttons>
            <div class="flex flex-wrap items-center justify-between gap-3 w-full px-1">
              <div class="flex flex-wrap items-center gap-2">
                <button class="btn btn-md md:btn-md btn-primary" @click="$refs.scan_dialog.show()">
                  <font-awesome-icon icon="fa-solid fa-network-wired" class="h-3 w-3" />{{ $t('scanTCPDevice') }}
                </button>
                <button class="btn btn-md md:btn-md btn-primary" @click="$emiter('showDialog', { name: 'accounts' })">
                  <font-awesome-icon icon="user" class="h-3 w-3" />{{ $t('accounts') }}
                </button>
                <button class="btn btn-md md:btn-md btn-primary"
                  @click="$emiter('showDialog', { name: 'materials', group: item })">
                  <font-awesome-icon icon="fa-solid fa-film" class="h-3 w-3" />{{ $t('materials') }}
                </button>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <div
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-base-200/80 border border-base-300/60 shadow-md"
                  role="group" :aria-label="$t('displayMode')">
                  <div
                    class="join rounded-lg overflow-hidden border border-base-300 bg-base-100 shadow-inner text-md font-medium">
                    <button type="button"
                      class="join-item btn btn-md md:btn-md gap-1 px-3 py-1.5 border-0 bg-transparent hover:bg-primary/10"
                      :class="{ 'btn-active bg-primary text-primary-content shadow': !listMode }"
                      :aria-pressed="!listMode" @click="setDisplayMode('grid')">
                      <font-awesome-icon icon="fa-solid fa-th" class="h-3 w-3" />
                      <span class="hidden sm:inline">{{ $t('gridMode') }}</span>
                    </button>
                    <button type="button"
                      class="join-item btn btn-md md:btn-md gap-1 px-3 py-1.5 border-0 bg-transparent hover:bg-primary/10"
                      :class="{ 'btn-active bg-primary text-primary-content shadow': listMode }"
                      :aria-pressed="listMode" @click="setDisplayMode('list')">
                      <font-awesome-icon icon="fa-solid fa-list" class="h-3 w-3" />
                      <span class="hidden sm:inline">{{ $t('listMode') }}</span>
                    </button>
                  </div>
                </div>

                <div
                  class="flex items-center gap-2 px-4 py-2 rounded-xl bg-base-200/80 border border-base-300/60 shadow-md">
                  <span class="text-md font-medium whitespace-nowrap">{{ $t('screenSize') }}</span>
                  <div class="join">
                    <button class="btn btn-md join-item btn-ghost btn-circle" :title="$t('screenScaledNote')"
                      @click="$emiter('screenScaled', { action: 'minus' })">
                      <font-awesome-icon icon="fa-solid fa-minus" class="h-3 w-3" />
                    </button>
                    <div
                      class="join-item px-3 py-1 text-md font-semibold rounded-none bg-base-100 border border-base-300 text-base-content">
                      {{ screenSizeDisplay }}
                    </div>
                    <button class="btn btn-md join-item btn-ghost btn-circle" :title="$t('screenScaledNote')"
                      @click="$emiter('screenScaled', { action: 'plus' })">
                      <font-awesome-icon icon="fa-solid fa-plus" class="h-3 w-3" />
                    </button>
                  </div>
                  <div class="tooltip tooltip-bottom" :data-tip="$t('screenScaledNote')">
                    <font-awesome-icon icon="fa-solid fa-circle-info" class="h-4 w-4 text-info" />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #default="slotProps">
            <div class="flex flex-wrap gap-4 p-4">
              <div class="flex flex-wrap gap-3 flex-1" v-if="listMode">
                <div
                  class="overflow-x-auto w-full rounded-2xl border border-base-300/60 bg-base-200/50 shadow-md shadow-primary/5">
                  <table class="table table-md md:table-md table-auto w-full align-middle text-sm md:text-base">
                    <thead
                      class="bg-base-200/70 text-[0.7rem] md:text-xs uppercase tracking-wide text-base-content/60 sticky top-0">
                      <tr>
                        <th class="font-semibold text-left">{{ $t('no') }}</th>
                        <th class="font-semibold text-left">{{ $t('serial') }}</th>
                        <th class="font-semibold text-left">{{ $t('mode') }}</th>
                        <th class="font-semibold text-left">{{ $t('device') }}</th>
                        <th class="font-semibold text-left">{{ $t('connectType') }}</th>
                        <th class="font-semibold text-left">{{ $t('group') }}</th>
                        <th class="font-semibold text-left">{{ $t('task') }}</th>
                        <th class="font-semibold text-left">{{ $t('sort') }}</th>
                        <th class="font-semibold text-left">{{ $t('proxyRotationUrl') }}</th>
                        <th class="font-semibold text-left">{{ $t('lastProxyRotation') }}</th>
                      </tr>
                    </thead>
                    <tbody class="text-md text-base-content/80">
                      <tr v-for="(device, index) in slotProps.items" :key="index"
                        class="hover:bg-base-100/60 transition-colors even:bg-base-100/40">
                        <td class="font-semibold text-base-content/70 whitespace-nowrap px-2">{{ device.key }}</td>
                        <td class="px-2">
                          <a class="link link-primary font-medium break-all" @click="$emiter('openDevice', device)"
                            v-if="device.key">{{ device.serial }}</a>
                        </td>
                        <td class="text-base-content/70 px-2 whitespace-nowrap">{{ device.mode }}</td>
                        <td class="text-base-content/70 px-2 break-all">{{ device.real_serial }}</td>
                        <td class="px-2 whitespace-nowrap">
                          <div class="badge badge-outline badge-md md:badge-md border-base-300 text-base-content"
                            v-if="device.connect_type == '0'">USB</div>
                          <div class="badge badge-primary badge-md md:badge-md" v-else>TCP</div>
                        </td>
                        <td class="px-2 text-base-content/70 break-words">{{ device.group_name || '--' }}</td>
                        <td class="px-2 whitespace-nowrap">
                          <div class="badge badge-success badge-md md:badge-md text-success-content"
                            v-if="device.task_status == '1'">
                            {{ $t('running') }}
                          </div>
                          <div class="badge badge-info badge-md md:badge-md text-info-content" v-else>
                            {{ $t('ready') }}
                          </div>
                        </td>
                        <td class="px-2">
                          <div class="flex flex-wrap items-center gap-2">
                            <span class="text-base-content/70 whitespace-nowrap">{{ device.sort }}</span>
                            <button class="btn btn-xs md:btn-sm btn-outline btn-primary"
                              @click="showSetSortDialog(device)">{{ $t('setSort') }}</button>
                          </div>
                        </td>
                        <td class="px-2">
                          <div class="flex flex-col gap-2 max-w-[14rem] md:max-w-[18rem]">
                            <span v-if="device.proxyRotation?.rotation_url" class="truncate"
                              :title="device.proxyRotation.rotation_url">{{
                                device.proxyRotation.rotation_url }}</span>
                            <span v-else class="text-base-content/50">{{ $t('proxyRotationNotConfigured') }}</span>
                            <div class="flex flex-wrap gap-2">
                              <button class="btn btn-xs btn-outline btn-secondary"
                                @click="openProxyRotationDialog(device)">{{ $t('configure') }}</button>
                            </div>
                          </div>
                        </td>
                        <td class="px-2">
                          <div class="flex flex-col gap-2 text-sm md:text-base">
                            <div class="flex flex-col gap-1">
                              <span>{{ formatRotationTime(device.proxyRotation?.last_rotated_at) }}</span>
                              <span v-if="device.proxyRotation?.last_status"
                                :class="['text-xs font-semibold', rotationStatusClass(device.proxyRotation?.last_status)]">
                                {{ rotationStatusLabel(device.proxyRotation?.last_status) }}
                              </span>
                            </div>
                            <button class="btn btn-xs md:btn-sm btn-outline btn-info w-full md:w-auto"
                              :class="{ 'loading': isTestingRotation(device) }"
                              :disabled="!device.proxyRotation?.rotation_url || isTestingRotation(device)"
                              @click="testProxyRotation(device)">
                              <span v-if="!isTestingRotation(device)">{{ $t('testProxyRotation') }}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div :style="gridStyle" v-else class="grid auto-rows-fr gap-4">
                <Miniremote :device="device" :key="device.real_serial" :no="device.key"
                  v-for="device in slotProps.items" @sizeChanged="sizeChanged" />
              </div>
            </div>
          </template>
        </Pagination>


        <div v-if="isLicensed && devices.length == 0"
          class="w-full min-h-[40vh] bg-base-100 flex flex-col items-center justify-center rounded-xl border border-dashed border-base-300 p-8">
          <div class="relative flex justify-center items-center">
            <div class="absolute animate-spin rounded-full h-48 w-48 border-t-4 border-b-4 border-purple-500"></div>
            <svg class="fill-current text-info h-32 w-32" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 471.117 471.117" xml:space="preserve">
              <g>
                <path
                  d="M447.564,129.817h-68.192c-8.213,0-14.871,6.675-14.871,14.872v129.155 c0,8.213,6.658,14.873,14.871,14.873h68.192c8.197,0,14.856-6.66,14.856-14.873V144.689 C462.42,136.492,455.761,129.817,447.564,129.817z M446.81,144.689v115.13h-66.776l-0.662-114.377L446.81,144.689z M406.025,273.461c0-4.076,3.321-7.429,7.428-7.429c4.122,0,7.443,3.353,7.443,7.429c0,4.107-3.321,7.444-7.443,7.444 C409.346,280.905,406.025,277.568,406.025,273.461z" />
                <path
                  d="M116.123,216.788v38.371h-12.365c-8.627,0-15.61,6.999-15.61,15.626 c0,8.629,6.983,15.609,15.61,15.609h101.765c8.629,0,15.626-6.98,15.626-15.609c0-8.627-6.997-15.626-15.626-15.626h-12.364 v-38.371H271.5c16.04,0,29.083-13.041,29.083-29.083V29.082C300.583,13.042,287.54,0,271.5,0H37.781 C21.739,0,8.697,13.042,8.697,29.082v158.623c0,16.042,13.042,29.083,29.084,29.083H116.123z M39.933,31.236h229.415v154.316 H39.933V31.236z" />
                <path
                  d="M345.138,298.622h-170.42c-16.118,0-29.237,13.118-29.237,29.235v114.024 c0,16.117,13.119,29.235,29.237,29.235h170.42c16.117,0,29.235-13.118,29.235-29.235V327.857 C374.374,311.74,361.255,298.622,345.138,298.622z M165.583,395.805c-6.044,0-10.935-4.876-10.935-10.936 c0-6.059,4.891-10.95,10.935-10.95c6.028,0,10.95,4.892,10.95,10.95C176.533,390.929,171.611,395.805,165.583,395.805z M350.951,441.882c0,3.198-2.614,5.813-5.813,5.813H184.577V322.045h160.562c3.198,0,5.813,2.614,5.813,5.813V441.882z" />
                <path
                  d="M49.36,399.558v-133.34v-25.452H25.937v170.511c0,6.46,5.244,11.704,11.705,11.704h78.48v-23.423 h-5.383H49.36z" />
                <path
                  d="M418.989,343.237v56.32h-20.485h-4.26v23.423h36.465c6.459,0,11.703-5.244,11.703-11.704V311.033 h-23.423V343.237z" />
              </g>
            </svg>
          </div>
          <span class="mt-8 text-lg font-semibold text-base-content animate-bounce">{{ $t('detecting_devices') }}</span>
          <a class="link link-primary text-md flex items-center gap-1 min-w-max"
            :href="whitelabelConfig.officialWebsite + '/docs/troubleshooting/unable-detect-phone'" target="_blank">
            <font-awesome-icon icon="fas fa-question-circle" class="h-5 w-5" />
            {{ $t('unableDetectPhoneTip') }}
          </a>
        </div>
      </div>
    </div>
  </div>
  <vue-draggable-resizable v-if="device && device.serial" :w="`auto`" :h="`auto`" :resizable="false" :parent="false"
    :z="20" drag-handle=".drag"
    class="bg-base-100 fixed top-32 right-32 border-1 border-base-300 justify-center items-center flex flex-col ring-1 ring-info ring-opacity-50 shadow-2xl rounded-md">
    <Miniremote :device="device" :no="device.key" :bigSize="true" :key="device.real_serial + '_big'" />
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
      <div class="flex flex-wrap items-center gap-2 mt-4">
        <MyButton @click="scan" label="startScan" :showLoading="scaning" icon="fa fa-search" />
        <span class="label-text">{{ scanResult }}</span>
      </div>
      <div class="mt-3 space-y-2" v-if="scanDetails.length">
        <h5 class="font-bold text-sm">{{ $t('scanDetailsTitle') }}</h5>
        <div
          class="max-h-48 overflow-y-auto rounded-xl border border-base-200 bg-base-100/70 divide-y divide-base-200 text-sm">
          <div v-for="(detail, index) in scanDetails" :key="`${detail.ip}-${index}`" class="px-3 py-2 space-y-1">
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-base-content/80">{{ detail.ip }}</span>
              <span :class="scanDetailStatusClass(detail)">{{ scanDetailStatusLabel(detail) }}</span>
            </div>
            <span class="text-xs text-base-content/60 break-all" :title="detail.message">{{ detail.message }}</span>
          </div>
        </div>
      </div>
      <div class="mt-3 text-sm text-base-content/70" v-else-if="scanSummary">
        {{ $t('scanNoDevices') }}
      </div>
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

  <dialog ref="proxy_rotation_dialog" class="modal">
    <div class="modal-box bg-base-300 max-w-3xl">
      <h3 class="font-bold text-lg mb-4">
        {{ $t('proxyRotationConfig') }}
        <span v-if="proxyRotationForm.device_label" class="text-sm text-base-content/70 ml-2">({{
          proxyRotationForm.device_label }})</span>
      </h3>
      <form class="space-y-4" @submit.prevent="saveProxyRotation">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">{{ $t('proxyRotationUrl') }}</span>
          </label>
          <input class="input input-bordered input-md w-full" type="url" v-model.trim="proxyRotationForm.rotation_url"
            required />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">{{ $t('requestMethod') }}</span>
            </label>
            <select class="select select-bordered" v-model="proxyRotationForm.method">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">{{ $t('requestTimeout') }}</span>
            </label>
            <input class="input input-bordered input-md" type="number" min="1000"
              v-model.number="proxyRotationForm.timeout_ms" />
          </div>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">{{ $t('requestHeadersJson') }}</span>
          </label>
          <textarea class="textarea textarea-bordered font-mono" rows="4" v-model.trim="proxyRotationForm.headers_json"
            :placeholder="$t('requestHeadersPlaceholder', { authorizationHeader: requestHeadersSample })"></textarea>
        </div>
        <div class="form-control" v-if="proxyRotationForm.method === 'POST'">
          <label class="label">
            <span class="label-text font-semibold">{{ $t('requestBodyJson') }}</span>
          </label>
          <textarea class="textarea textarea-bordered font-mono" rows="4" v-model.trim="proxyRotationForm.body_json"
            :placeholder="$t('requestBodyPlaceholder')"></textarea>
        </div>
        <div class="modal-action">
          <button type="button" class="btn" @click="closeProxyRotationDialog">{{ $t('cancel') }}</button>
          <button type="button" class="btn btn-error" v-if="canClearProxyRotation" @click="clearProxyRotation">{{
            $t('clearConfiguration') }}</button>
          <button type="submit" class="btn btn-primary" :class="{ 'loading': proxyRotationSaving }">
            <span v-if="!proxyRotationSaving">{{ $t('save') }}</span>
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <!-- Debug Dialog -->
  <DeviceDebugDialog v-if="debugDevice" v-model="showDebugDialog" :device="debugDevice"
    @close="handleCloseDebugDialog" />
</template>
<style>
@import "vue-draggable-resizable/style.css";
</style>
<script>
import MyButton from '../Button.vue'
import Miniremote from './Miniremote.vue'
import Pagination from '../Pagination.vue'
import DeviceDebugDialog from '../dialogs/DeviceDebugDialog.vue'
import { writeText } from '@tauri-apps/api/clipboard';
import { readTextFile, writeTextFile, exists, createDir, BaseDirectory } from '@tauri-apps/api/fs';
import { getWhiteLabelConfig, cloneDefaultWhiteLabelConfig } from '../../config/whitelabel.js';
import { getItem, setItem } from '@/utils/persistentStorage.js';


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
    },
  },
  components: {
    MyButton,
    Miniremote,
    Pagination,
    DeviceDebugDialog
  },
  data() {
    return {
      device: null,
      whitelabelConfig: cloneDefaultWhiteLabelConfig(),
      listMode: false,
      mydevices: [],
      ip_1: 192,
      ip_2: 168,
      ip_3: 1,
      ip_4: 2,
      ip_5: 254,
      port: 5555,
      proxy_host: 'localhost',
      proxy_port: 8080,
      scaning: false,
      scanResult: '',
      scanSummary: null,
      scanDetails: [],
      groups: [],
      currentDevice: null,
      cardMinWidth: 150,
      licenseData: {},
      showKeyboardTip: true,
      // Debug Dialog
      showDebugDialog: false,
      debugDevice: null,
      proxyRotationMap: {},
      proxyRotationForm: {
        device_serial: '',
        device_label: '',
        rotation_url: '',
        method: 'GET',
        headers_json: '',
        body_json: '',
        timeout_ms: 10000,
      },
      proxyRotationSaving: false,
      testingRotations: {},
      requestHeadersSample: '{ "Authorization": "Bearer token" }',
    }
  },
  watch: {
    async showKeyboardTip(val) {
      await setItem('showKeyboardTip', val ? 'true' : 'false')
    },
    groups: {
      handler() {
        this.syncDisplayedDevices()
      },
      deep: true
    },
    async listMode(val) {
      await setItem('listMode', val ? 'true' : 'false')
    },
    devices: {
      handler() {
        this.syncDisplayedDevices()
      },
      deep: true
    }
  },
  async created() {
    const [
      config,
      storedListMode,
      ip1,
      ip2,
      ip3,
      ip4,
      ip5,
      scanPort,
      storedProxyHost,
      storedProxyPort,
      storedDeviceWidth,
      storedShowKeyboardTip
    ] = await Promise.all([
      getWhiteLabelConfig(),
      getItem('listMode'),
      getItem('ip_1'),
      getItem('ip_2'),
      getItem('ip_3'),
      getItem('ip_4'),
      getItem('ip_5'),
      getItem('scan_port'),
      getItem('proxy_host'),
      getItem('proxy_port'),
      getItem('deviceWidth'),
      getItem('showKeyboardTip')
    ]);

    const parseNumber = (value, fallback) => {
      if (value === null || value === undefined) {
        return fallback;
      }
      const parsed = Number(String(value).replace(/"/g, ''));
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    if (config) {
      this.whitelabelConfig = config;
    }

    if (storedListMode !== null) {
      this.listMode = storedListMode === 'true' || storedListMode === true;
    }

    this.ip_1 = parseNumber(ip1, 192);
    this.ip_2 = parseNumber(ip2, 168);
    this.ip_3 = parseNumber(ip3, 1);
    this.ip_4 = parseNumber(ip4, 2);
    this.ip_5 = parseNumber(ip5, 254);
    this.port = parseNumber(scanPort, 5555);

    if (storedProxyHost) {
      this.proxy_host = String(storedProxyHost).replace(/"/g, '') || 'localhost';
    }
    if (storedProxyPort !== null) {
      this.proxy_port = parseNumber(storedProxyPort, 8080);
    }

    const widthParsed = parseNumber(storedDeviceWidth, 150);
    if (widthParsed > 0) {
      this.cardMinWidth = widthParsed;
    }

    if (storedShowKeyboardTip !== null) {
      this.showKeyboardTip = storedShowKeyboardTip !== 'false';
    }
  },
  methods: {
    setDisplayMode(mode) {
      this.listMode = mode === 'list';
    },
    async copyText(text) {
      await writeText(text)
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('copied'),
        timeout: 2000
      });
    },
    breakAt() {
      const obj = {};
      for (let i = 1; i <= 4; i++) {
        obj[200 * (i + 1) + 15 * i] = i;
      }
      return obj;
    },
    showSetSortDialog(device) {
      if (device) {
        this.currentDevice = device
        this.$refs.set_sort_dialog.show()
      }
    },
    async setSort() {
      if (!this.currentDevice) return
      this.currentDevice.sort = parseInt(this.currentDevice.sort)
      await setItem(`sort_${this.currentDevice.real_serial}`, this.currentDevice.sort)
      this.mydevices.sort((a, b) => {
        // fisrt: sort
        // second: group_id
        // third: real_serial
        return a.sort - b.sort || a.group_id - b.group_id || a.real_serial - b.real_serial
      });
      this.$emiter('reload_devices', {})
    },
    getDeviceSerial(device) {
      return device?.real_serial || device?.serial || ''
    },
    refreshPage() {
      this.$emiter('refreshDevice', {})
    },
    closeKeyboardTip() {
      this.showKeyboardTip = false
    },
    resetProxyRotationForm() {
      this.proxyRotationForm = {
        device_serial: '',
        device_label: '',
        rotation_url: '',
        method: 'GET',
        headers_json: '',
        body_json: '',
        timeout_ms: 10000,
      }
    },
    async loadProxyRotations() {
      try {
        const fileExists = await exists('data/proxy-rotations.json', { dir: BaseDirectory.AppData })
        if (!fileExists) {
          this.proxyRotationMap = {}
          return
        }
        const content = await readTextFile('data/proxy-rotations.json', { dir: BaseDirectory.AppData })
        const parsed = JSON.parse(content || '[]')
        if (Array.isArray(parsed)) {
          this.proxyRotationMap = parsed.reduce((acc, item) => {
            if (item && item.device_serial) {
              acc[item.device_serial] = item
            }
            return acc
          }, {})
        } else {
          this.proxyRotationMap = {}
        }
      } catch (error) {
        console.error('Failed to load proxy rotations:', error)
        this.proxyRotationMap = {}
      } finally {
        this.syncDisplayedDevices()
      }
    },
    decorateDevice(device, groupNameMap) {
      if (!device) {
        return device
      }
      const serial = this.getDeviceSerial(device)
      const rotation = this.proxyRotationMap[serial] || null
      const resolvedGroupName = groupNameMap?.get(device.group_id)
        ?? device.group_name
        ?? (this.groups || []).find(group => group.id === device.group_id)?.name

      if (resolvedGroupName !== undefined && device.group_name !== resolvedGroupName) {
        device.group_name = resolvedGroupName
      }

      if (device.proxyRotation !== rotation) {
        device.proxyRotation = rotation
      }
      return device
    },
    syncDisplayedDevices() {
      if (!Array.isArray(this.devices)) {
        this.mydevices = []
        return
      }
      this.mydevices = this.devices
      const groupNameMap = new Map(
        (this.groups || []).map(group => [group.id, group.name])
      )
      this.mydevices.forEach(device => {
        this.decorateDevice(device, groupNameMap)
      })
    },
    openProxyRotationDialog(device) {
      const serial = this.getDeviceSerial(device)
      const config = this.proxyRotationMap[serial] || {
        device_serial: serial,
        rotation_url: '',
        method: 'GET',
        headers: {},
        body: {},
        timeout_ms: 10000,
      }
      this.proxyRotationForm.device_serial = serial
      this.proxyRotationForm.device_label = device?.key || serial
      this.proxyRotationForm.rotation_url = config.rotation_url || ''
      this.proxyRotationForm.method = config.method || 'GET'
      this.proxyRotationForm.timeout_ms = config.timeout_ms || 10000
      this.proxyRotationForm.headers_json = config.headers ? JSON.stringify(config.headers, null, 2) : ''
      this.proxyRotationForm.body_json = config.body ? JSON.stringify(config.body, null, 2) : ''
      if (this.$refs.proxy_rotation_dialog?.showModal) {
        this.$refs.proxy_rotation_dialog.showModal()
      } else if (this.$refs.proxy_rotation_dialog?.show) {
        this.$refs.proxy_rotation_dialog.show()
      }
    },
    closeProxyRotationDialog() {
      if (this.$refs.proxy_rotation_dialog?.close) {
        this.$refs.proxy_rotation_dialog.close()
      }
      this.resetProxyRotationForm()
    },
    async persistProxyRotations() {
      try {
        const dataDirExists = await exists('data', { dir: BaseDirectory.AppData })
        if (!dataDirExists) {
          await createDir('data', { dir: BaseDirectory.AppData, recursive: true })
        }
        const payload = Object.values(this.proxyRotationMap)
        await writeTextFile('data/proxy-rotations.json', JSON.stringify(payload, null, 2), {
          dir: BaseDirectory.AppData
        })
      } catch (error) {
        console.error('Failed to save proxy rotations:', error)
        throw error
      }
    },
    parseJsonInput(value, fallback = {}) {
      if (!value || value.trim() === '') {
        return fallback
      }
      try {
        return JSON.parse(value)
      } catch (error) {
        throw new Error(this.$t('invalidJsonFormat'))
      }
    },
    async saveProxyRotation() {
      if (!this.proxyRotationForm.device_serial) {
        return
      }
      this.proxyRotationSaving = true
      try {
        const headers = this.parseJsonInput(this.proxyRotationForm.headers_json, {})
        const body = this.proxyRotationForm.method === 'POST'
          ? this.parseJsonInput(this.proxyRotationForm.body_json, {})
          : undefined
        const config = {
          device_serial: this.proxyRotationForm.device_serial,
          rotation_url: this.proxyRotationForm.rotation_url,
          method: this.proxyRotationForm.method,
          headers,
          body,
          timeout_ms: Number(this.proxyRotationForm.timeout_ms) || 10000,
          last_status: this.proxyRotationMap[this.proxyRotationForm.device_serial]?.last_status || null,
          last_message: this.proxyRotationMap[this.proxyRotationForm.device_serial]?.last_message || '',
          last_rotated_at: this.proxyRotationMap[this.proxyRotationForm.device_serial]?.last_rotated_at || null,
        }
        this.proxyRotationMap = {
          ...this.proxyRotationMap,
          [config.device_serial]: config,
        }
        await this.persistProxyRotations()
        this.syncDisplayedDevices()
        await this.$emiter('NOTIFY', {
          type: 'success',
          message: this.$t('proxyRotationSaved'),
          timeout: 3000,
        })
        this.closeProxyRotationDialog()
      } catch (error) {
        console.error('Failed to save proxy rotation:', error)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: error.message || this.$t('proxyRotationSaveFailed'),
          timeout: 4000,
        })
      } finally {
        this.proxyRotationSaving = false
      }
    },
    async clearProxyRotation() {
      const serial = this.proxyRotationForm.device_serial
      if (!serial) {
        return
      }
      this.proxyRotationSaving = true
      try {
        const updatedMap = { ...this.proxyRotationMap }
        delete updatedMap[serial]
        this.proxyRotationMap = updatedMap
        await this.persistProxyRotations()
        this.syncDisplayedDevices()
        await this.$emiter('NOTIFY', {
          type: 'success',
          message: this.$t('proxyRotationCleared'),
          timeout: 3000,
        })
        this.closeProxyRotationDialog()
      } catch (error) {
        console.error('Failed to clear proxy rotation:', error)
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('proxyRotationSaveFailed'),
          timeout: 4000,
        })
      } finally {
        this.proxyRotationSaving = false
      }
    },
    formatRotationTime(timestamp) {
      if (!timestamp) {
        return this.$t('proxyRotationNever')
      }
      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime())) {
        return this.$t('proxyRotationNever')
      }
      return date.toLocaleString()
    },
    rotationStatusClass(status) {
      if (status === 'success') {
        return 'text-success'
      }
      if (status === 'failure') {
        return 'text-error'
      }
      return 'text-base-content/70'
    },
    rotationStatusLabel(status) {
      if (status === 'success') {
        return this.$t('proxyRotationSuccess')
      }
      if (status === 'failure') {
        return this.$t('proxyRotationFailure')
      }
      return this.$t('proxyRotationUnknown')
    },
    isTestingRotation(device) {
      const serial = this.getDeviceSerial(device)
      return !!this.testingRotations[serial]
    },
    async testProxyRotation(device) {
      const serial = this.getDeviceSerial(device)
      const config = this.proxyRotationMap[serial]
      if (!config || !config.rotation_url) {
        await this.$emiter('NOTIFY', {
          type: 'warning',
          message: this.$t('proxyRotationNotConfigured'),
          timeout: 3000,
        })
        return
      }
      this.testingRotations = { ...this.testingRotations, [serial]: true }
      try {
        const payload = {
          device_serial: config.device_serial,
          rotation_url: config.rotation_url,
          method: config.method,
          headers: config.headers || {},
          body: config.body,
          timeout_ms: config.timeout_ms,
        }
        const response = await this.$service.test_proxy_rotation(payload)
        const result = response?.data ?? response ?? {}
        const responseCode = typeof response?.code === 'number' ? response.code : 0
        const isSuccess = responseCode === 0
          ? (result?.success !== false)
          : (result?.success === true)
        const status = result?.status || (isSuccess ? 'success' : 'failure')
        const message =
          result?.message ||
          response?.error ||
          (isSuccess ? this.$t('proxyRotationTestSuccess') : this.$t('proxyRotationTestFailed'))
        const rotatedAt = result?.rotated_at || new Date().toISOString()
        this.proxyRotationMap = {
          ...this.proxyRotationMap,
          [serial]: {
            ...config,
            last_status: status,
            last_message: message,
            last_rotated_at: rotatedAt,
          }
        }
        await this.persistProxyRotations()
        this.syncDisplayedDevices()
        await this.$emiter('NOTIFY', {
          type: isSuccess ? 'success' : 'error',
          message,
          timeout: 3000,
        })
      } catch (error) {
        console.error('Proxy rotation test failed:', error)
        this.proxyRotationMap = {
          ...this.proxyRotationMap,
          [serial]: {
            ...config,
            last_status: 'failure',
            last_message: error.message || this.$t('proxyRotationTestFailed'),
            last_rotated_at: new Date().toISOString(),
          }
        }
        await this.persistProxyRotations()
        this.syncDisplayedDevices()
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: error.message || this.$t('proxyRotationTestFailed'),
          timeout: 4000,
        })
      } finally {
        const rest = { ...this.testingRotations }
        delete rest[serial]
        this.testingRotations = rest
      }
    },

    async scan() {
      this.scaning = true
      this.scanResult = ''
      this.scanSummary = null
      this.scanDetails = []
      try {
        await Promise.all([
          setItem('ip_1', this.ip_1),
          setItem('ip_2', this.ip_2),
          setItem('ip_3', this.ip_3),
          setItem('ip_4', this.ip_4),
          setItem('ip_5', this.ip_5),
          setItem('scan_port', this.port)
        ])
        const payload = {
          start_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_4}`,
          end_ip: `${this.ip_1}.${this.ip_2}.${this.ip_3}.${this.ip_5}`,
          port: Number(this.port)
        }

        let summary
        try {
          const res = await this.$service.scan_tcp_details(payload)
          summary = res?.data || res || {}
        } catch (err) {
          console.warn('scan_tcp_details unavailable, fallback to legacy api', err)
          const legacyRes = await this.$service.scan_tcp(payload)
          const legacyCount = Number(legacyRes?.data ?? legacyRes ?? 0) || 0
          summary = {
            total: legacyCount,
            success: legacyCount,
            failed: 0,
            details: []
          }
        }
        const successCount = summary?.success ?? 0
        const failedCount = summary?.failed ?? 0
        const successText = this.$t('scanSuccessCount', { count: successCount })
        const failedText = this.$t('scanFailureCount', { count: failedCount })
        this.scanSummary = summary
        this.scanResult = `${successText} · ${failedText}`
        this.scanDetails = Array.isArray(summary.details) ? summary.details : []
      } catch (error) {
        console.error('TCP scan failed:', error)
        this.scanResult = this.$t('scanFailedGeneric')
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('scanFailedGeneric'),
          timeout: 3000
        })
      } finally {
        this.scaning = false
      }
    },
    scanDetailStatusClass(detail) {
      return detail?.success ? 'text-success font-semibold' : 'text-error font-semibold'
    },
    scanDetailStatusLabel(detail) {
      return detail?.success ? this.$t('scanStatusConnected') : this.$t('scanStatusFailed')
    },
    async update_settings() {
      await this.$service.update_settings(this.settings)
      //reload settings
      await this.$emiter('reload_settings', {})
    },
    sizeChanged(cardWidth) {
      this.cardMinWidth = cardWidth
    },
    async showLicenseDialog() {
      await this.$emiter('LICENSE', { show: true });
    },
    handleCloseDebugDialog() {
      this.showDebugDialog = false
      this.debugDevice = null
    },
  },
  computed: {
    isLicensed() {
      return this.licenseData.leftdays > 0 || this.licenseData.is_stripe_active == 1;
    },
    screenSizeDisplay() {
      return Math.round(this.cardMinWidth || 0);
    },
    gridStyle() {
      // 当元素数量<=5个时，限制最大宽度而不是占满整行
      if (this.mydevices.length <= 5) {
        return {
          display: 'grid',
          gridTemplateColumns: `repeat(${this.mydevices.length}, minmax(${this.cardMinWidth}px, auto))`,
          justifyContent: 'flex-start',
          autoRows: 'auto',
          gap: '1rem',
          flex: 1
        }
      }
      // 更多元素时保持原来的自适应布局
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${this.cardMinWidth}px, 1fr))`,
        autoRows: 'auto',
        gap: '1.25rem',
        flex: 1
      }
    },
    canClearProxyRotation() {
      return !!this.proxyRotationForm.device_serial && !!this.proxyRotationMap[this.proxyRotationForm.device_serial]
    }
  },
  async mounted() {
    await this.loadProxyRotations()
    this.syncDisplayedDevices()
    await this.$listen('openDevice', async (e) => {
      const storedBigScreen = await getItem('bigScreen')
      const bigScreen = storedBigScreen || 'standard'
      if (bigScreen === 'standard') {
        this.device = e.payload
        const groupNameMap = new Map(
          (this.groups || []).map(group => [group.id, group.name])
        )
        const decoratedDevice = this.decorateDevice(this.device, groupNameMap) || this.device
        for (let i = 0; i < this.mydevices.length; i++) {
          if (this.mydevices[i].serial === this.device.serial) {
            this.mydevices[i] = decoratedDevice
            break
          }
        }
      }
    });
    await this.$listen('closeDevice', () => {
      this.device = null
    });
    // 监听TitleBar组件的授权状态变更
    await this.$listen('LICENSE_STATUS_CHANGED', async (e) => {
      this.licenseData = e.payload;
    });

    // 监听打开 Debug Dialog 事件
    await this.$listen('openDebugDialog', async (e) => {
      const { serial, real_serial } = e.payload
      // 查找设备
      const device = this.mydevices.find(d => d.serial === serial || d.real_serial === real_serial)
      if (device) {
        this.debugDevice = device
        this.showDebugDialog = true
      }
    });

  },
}
</script>
