<template>
  <div class="z-50 top-12 left-0 fixed" v-if="!showSidebar">
    <font-awesome-icon icon="fa-solid fa-angle-right"
      class="text-secondary-content h-6 w-6 bg-secondary p-2 rounded-lg cursor-pointer" @click="showSidebar = true" />
  </div>
  <transition name="fade">
    <div class="bg-base-100 m-1 flex flex-col rounded-lg shadow w-96 h-screen overflow-y-scroll no-scrollbar"
      v-if="showSidebar">
      <div class="bg-primary p-4 rounded-t-lg">
        <div class="flex flex-row items-center justify-center">
          <font-awesome-icon icon="fa-brands fa-tiktok" class="text-primary-content h-8 w-8 mr-2" />
          <div>
            <span class="text-xl text-primary-content font-bold">{{ $t('siteName') }}</span>
            <span class="text-xs text-primary-content ml-2">v{{ version }}</span>
            <br>
            <span class="text-xs text-primary-content font-sans">{{ $t('siteUrl') }}</span>
          </div>
          <div class="ml-2">
            <select class="select select-info select-sm" v-model="locale">
              <option selected value="en">English</option>
              <option value="zh-CN">简体中文</option>
            </select>
          </div>
          <label class="swap swap-rotate ml-2">
            <!-- this hidden checkbox controls the state -->
            <input type="checkbox" class="theme-controller" value="dark" v-model="isDark" />
            <!-- sun icon -->
            <font-awesome-icon icon="fa-solid fa-sun" class="swap-off fill-current w-6 h-6 text-primary-content" />
            <!-- moon icon -->
            <font-awesome-icon icon="fa-solid fa-moon" class="swap-on fill-current w-6 h-6 text-primary-content" />
          </label>
          <font-awesome-icon icon="fa-solid fa-angle-left"
            class="text-secondary-content h-6 w-6 bg-secondary p-2 ml-2 rounded-lg cursor-pointer"
            @click="showSidebar = false" />
        </div>
      </div>
      <div class="p-4">
        <div class="flex flex-row p-2 bg-base-300 rounded-md">
          <a class="link link-primary text-xs float-right flex items-center mr-2"
            @click="$refs.buyLiscenseDialog.show()" v-if="license.leftdays > 0">
            <font-awesome-icon icon="fa fa-check-circle" class="text-success h-4 w-4" />
            <span class="ml-2">{{ $t('licensedDays') }}:</span>
            <span class="text-success font-bold mr-2">{{ license.leftdays }}</span>
          </a>
          <a class="link link-primary text-xs float-right flex items-center mr-2"
            @click="$refs.buyLiscenseDialog.show()" v-else>
            <font-awesome-icon icon="fa fa-exclamation-circle mr-2" class="text-error h-4 w-4" />
            <span class="ml-2">{{ $t('activate') }}</span>
          </a>
          <a class="link link-primary text-xs float-right flex items-center mr-2" :href="$t('siteUrl') + '/docs/intro'"
            target="_blank">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="text-primary h-4 w-4 mr-2" />
            {{ $t('tutorial') }}
          </a>
          <!-- <a class="link link-primary text-xs float-right flex items-center mr-2" :href="$t('siteUrl') + '#faq'"
            target="_blank">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="text-primary h-4 w-4 mr-2" />
            {{ $t('faq') }}
          </a> -->
          <!-- <a class="link link-primary text-xs float-right flex items-center mr-2"
            :href="'http://127.0.0.1:' + port + '/swagger-ui/'" target="_blank">
            <font-awesome-icon icon="fa-solid fa-globe" class="text-primary h-4 w-4 mr-2" />
            API Doc
          </a> -->
        </div>

        <div role="tablist" class="tabs tabs-lifted mt-2 bg-base-200 rounded-md">
          <a ref="general" role="tab" class="tab tab-active" @click="selectTab('general')">{{ $t('general') }}</a>
          <a ref="quickActions" role="tab" class="tab" @click="selectTab('quickActions')">{{ $t('quickActions') }}</a>
          <a ref="tktools" role="tab" class="tab" @click="selectTab('tktools')">{{ $t('tktools') }}</a>
          <a ref="instools" role="tab" class="tab" @click="selectTab('instools')">{{ $t('instools') }}</a>
        </div>
        <div class="border border-base-300 bg-base-500 rounded-md shadow-lg p-2">
          <div class="flex flex-row flex-wrap" v-if="selectedTab === 'general'">
            <General :menuItems="menuItems" :settings="settings" />
          </div>
          <div class="flex flex-row flex-wrap" v-if="selectedTab === 'quickActions'">
            <QuickActions :settings="settings" />
          </div>
          <div class="flex flex-row flex-wrap" v-if="selectedTab === 'tktools'">
            <TKTools :settings="settings" />
          </div>
          <div class="flex flex-row flex-wrap" v-if="selectedTab === 'instools'">
            <InsTools :settings="settings" />
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-sans p-2 bg-base-200 rounded-md font-bold mt-2">{{ $t('tasks') }}</span>
          <div class="flex flex-row flex-wrap border border-base-300 bg-base-500 rounded-md shadow-lg p-2">
            <Tasks :settings="settings" />
          </div>
        </div>
        <div class="flex flex-col">
          <span class="font-sans p-2 bg-base-200 rounded-md font-bold mt-2">{{ $t('groups') }}</span>
          <button class="btn btn-sm btn-primary border-1 border-success text-primary-content p-0 mt-1"
            @click="addGroup">
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
            <span class="text-xs">{{ $t('addGroup') }}</span>
          </button>
          <input ref="groupNameInput" v-if="showAddGroup"
            class="input input-sm input-bordered w-full max-w-xs mt-2 ring-1 ring-success" type="text"
            v-model="newGroupName" v-on:keyup.enter="saveGroup" @focus="(event) => event.target.select()" />
          <div class="border border-base-300 bg-base-500 rounded-md mt-2 shadow-lg" v-for="(item, index) in groups"
            :key="item.id">
            <div class="flex flex-row form-control items-center">
              <label class="label cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-sm ring-1 mr-1" @change="selectAll(item.id)"
                  :checked="isSelectAll(item.id)" />
                <span class="label-text text-primary  text-xs">{{ item.name }}({{ groupDevices[item.id].length
                }})</span>
              </label>
              <font-awesome-icon icon="fa-solid fa-edit" class="text-primary cursor-pointer ml-2"
                @click="renameGroup(item)"></font-awesome-icon>



              <div class="tooltip" :data-tip="$t('deleteGroup')">
                <font-awesome-icon icon="fa-solid fa-trash" class="text-error cursor-pointer ml-2"
                  @click="deleteGroup(item.id)"></font-awesome-icon>
              </div>

              <span class="label-text text-xs text-right flex-1 mr-2">{{ $t('selected') }}
                {{ selections[item.id].length }}
                {{ $t('units') }}
              </span>

            </div>

            <div class="flex flex-row form-control items-center">
              <button class="btn btn-sm btn-primary ml-1 mb-1"
                @click="$emiter('menuSelected', { name: 'trainSettings', group: item })">
                <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('trainSettings') }}
              </button>
              <button class="btn btn-sm btn-primary ml-1 mb-1"
                @click="$emiter('menuSelected', { name: 'publishSettings', group: item })">
                <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('publishSettings') }}
              </button>
              <button class="btn btn-sm btn-primary ml-1 mb-1"
                @click="$emiter('menuSelected', { name: 'materials', group: item })">
                <font-awesome-icon icon="fa-solid fa-film" class="h-3 w-3" />{{ $t('materials') }}
              </button>
            </div>
          </div>

          <div class="flex flex-row form-control items-center">
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm ring-1 mr-1" @change="selectAll(0)"
                :checked="isSelectAll(0)" />
              <span class="label-text text-primary text-xs">{{ $t('allDevices') }} ({{ groupDevices[0].length
              }})</span>
            </label>

            <span class="label-text text-xs text-right flex-1">{{ $t('selected') }}
              {{ selections[0].length }}
              {{ $t('units') }}
            </span>
            <div class="tooltip" :data-tip="$t('moveToGroup')">
              <details ref="moveToGroupMenu" class="dropdown dropdown-top">
                <summary class="btn btn-sm bg-transparent hover:bg-transparent border-0">
                  <font-awesome-icon icon="fa-solid fa-share" class="text-primary"></font-awesome-icon>
                </summary>
                <ul class="dropdown-content z-[10] menu menu-sm p-2 shadow bg-base-200 rounded-box w-52">
                  <li v-for="(item, index) in groups" :key="item.id"><a @click="moveToGroup(0, item.id)">{{
                    item.name }}</a>
                  </li>
                </ul>
              </details>
            </div>
          </div>
          <drag-select v-model="selection">
            <drag-select-option v-for="(item, index) in devices" :value="item.real_serial" :key="index">
              {{ index + 1 }}
            </drag-select-option>
          </drag-select>
        </div>
      </div>
    </div>
  </transition>
  <BuyLicense ref="buyLiscenseDialog" :license="license" />
  <dialog ref="init_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('initing') }}{{ init_progress }}</h3>
      <div class="modal-body">
        <div class="flex flex-row justify-between text-center items-center">
          <progress class="progress progress-success w-full"></progress>
        </div>
      </div>
    </div>
  </dialog>
</template>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active 在 Vue 2.1.8 或更高版本中生效 */
  {
  opacity: 0;
}
</style>
<script>
import BuyLicense from '../components/settings/BuyLicense.vue'
import * as util from '../utils'
import General from './General.vue'
import TKTools from './TKTools.vue'
import InsTools from './InsTools.vue'
import Tasks from './Tasks.vue'
import QuickActions from './QuickActions.vue';
import { open, ask } from '@tauri-apps/api/dialog';
import { getVersion } from '@tauri-apps/api/app';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'

export default {
  name: 'Sidebar',
  props: {
    devices: {
      type: Array,
      required: true
    }
  },
  components: {
    General,
    Tasks,
    TKTools,
    InsTools,
    QuickActions,
    BuyLicense
  },
  data() {
    return {
      license: {},
      showSidebar: true,
      settings: {},
      menuItems: [],
      fullMenuItems: [
      ],
      selection: [],
      newGroupName: '',
      showAddGroup: false,
      updateGroup: null,
      groups: [],
      selections: {
        0: [],
      },
      selectedTab: 'general',
      groupDevices: {
        0: [],
      },
      locale: util.getData('locale') || 'en',
      version: '1.0.0',
      port: -1,
      init_progress: '0/0',
      isDark: util.getData('isDark') || '0',
    }
  },

  watch: {
    locale() {
      util.setData('locale', this.locale)
      this.$i18n.locale = this.locale
    },
    selection() {
      this.refreshSelections()
    },
    isDark() {
      console.log('isDark:', this.isDark)
      util.setData('isDark', this.isDark)
    }
  },
  methods: {
    async loadLicense() {
      this.$service.get_license().then(res => {
        this.license = res.data
        if (this.license.leftdays <= 0 && !this.license.github_authorized) {
          this.$refs.buyLiscenseDialog.show()
        }
        console.log(`license: ${JSON.stringify(this.license)}`)
      })
    },
    async renameGroup(item) {
      if (this.showAddGroup) {
        this.showAddGroup = false
        return
      }
      this.updateGroup = item
      this.showAddGroup = true
      this.newGroupName = item.name
      //get focus
      this.$nextTick(() => {
        this.$refs.groupNameInput.focus()
      })

    },
    async addGroup() {
      if (this.showAddGroup) {
        this.showAddGroup = false
        return
      }
      this.updateGroup = null
      this.showAddGroup = true
      this.newGroupName = 'New Group'
      //get focus
      this.$nextTick(() => {
        this.$refs.groupNameInput.focus()
      })
    },
    async saveGroup() {
      if (this.updateGroup) {
        this.updateGroup.name = this.newGroupName
        this.$service
          .update_group(this.updateGroup)
          .then(() => {
            this.newGroupName = ''
            this.showAddGroup = false
            this.get_groups()
          })
      } else {
        this.$service
          .add_group({
            name: this.newGroupName,
          })
          .then(() => {
            this.newGroupName = ''
            this.showAddGroup = false
            this.get_groups()

          })
      }

    },
    async deleteGroup(id) {
      const yes = await ask(this.$t('deleteGroupConfirm'), this.$t('confirm'));
      if (yes) {
        this.$service
          .delete_group({
            id: id
          })
          .then(() => {
            this.get_groups()
          })
      }

    },
    async moveToGroup(src_id, dst_id) {
      let serials = []
      for (let i = 0; i < this.selections[src_id].length; i++) {
        serials.push(this.selections[src_id][i])
      }
      if (serials.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        for (let i = 0; i < this.groups.length; i++) {
          let view = this.$refs['moveToGroupMenu_' + this.groups[i].id];
          if (view) {
            view[0].removeAttribute('open')
          }
        }
        this.$refs.moveToGroupMenu.removeAttribute('open')
        return
      }
      this.$service.move_to_group({ serials: serials, dst_id: dst_id }).then(res => {
        this.$refs.moveToGroupMenu.removeAttribute('open')
        for (let i = 0; i < this.groups.length; i++) {
          let view = this.$refs['moveToGroupMenu_' + this.groups[i].id];
          if (view) {
            view[0].removeAttribute('open')
          }
        }
        this.devices.map(device => {
          if (serials.includes(device.real_serial)) {
            device.group_id = dst_id
          }
        })
        this.refreshSelections()
      })
    },
    async get_groups() {
      this.$service
        .get_groups()
        .then(res => {
          this.groups = res.data
          this.refreshSelections()
        })
    },
    async uploadFiles() {
      const filePath = await open({
        multiple: true, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Upload Files', extensions: ['mp4', 'jpg', 'png', 'jpeg'] },
        ]
      });

      console.log('Selected file path:', filePath);
      this.$service
        .upload_video({
          files: filePath,
          serials: this.selection
        })
        .then(res => {
          console.log(res)
        })
    },
    async selectApkFile() {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Apk Files', extensions: ['apk'] },
        ]
      });

      console.log('Selected file path:', filePath);
      let args = {
        apk_path: filePath,
      }
      await this.run_task_now('install', args)
    },
    async adb_command(args) {
      this.$service
        .adb_command({
          serials: this.selection,
          args: args
        })
        .then(res => {
          console.log(res)
        })
    },
    async run_task_now(name, args = {}) {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .run_task_now({
          script_name: name,
          serials: this.selection,
          script_args: JSON.stringify(args)
        })
        .then(async res => {
          await this.$emiter('reload_tasks', {})
          await this.$emiter('showToast', `${res.data} ${this.$t('taskCreated')}`)
        })
    },
    async run_now_by_account(name, args = {}) {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .run_now_by_account({
          script_name: name,
          serials: this.selection,
          script_args: JSON.stringify(args)
        })
        .then(async (res) => {
          if (res.code == 40004) {
            await this.$emiter('showToast', this.$t('noAccount'))
            return
          }
          await this.$emiter('reload_tasks', {})
          await this.$emiter('showToast', `${res.data} ${this.$t('taskCreated')}`)
        })
    },
    async selectTab(tab) {
      this.selectedTab = tab
      switch (tab) {
        case 'general':
          this.$refs.general.classList.add('tab-active')
          this.$refs.quickActions.classList.remove('tab-active')
          this.$refs.instools.classList.remove('tab-active')
          this.$refs.tktools.classList.remove('tab-active')
          break
        case 'tktools':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.quickActions.classList.remove('tab-active')
          this.$refs.instools.classList.remove('tab-active')
          this.$refs.tktools.classList.add('tab-active')
          break
        case 'quickActions':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.tktools.classList.remove('tab-active')
          this.$refs.instools.classList.remove('tab-active')
          this.$refs.quickActions.classList.add('tab-active')
          break
        case 'instools':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.tktools.classList.remove('tab-active')
          this.$refs.quickActions.classList.remove('tab-active')
          this.$refs.instools.classList.add('tab-active')
          break
      }
    },
    isSelectAll(id) {
      return this.groupDevices[id].length > 0 && this.selections[id].length == this.groupDevices[id].length
    },
    async selectAll(id) {
      if (!this.isSelectAll(id)) {
        if (id == 0) {
          this.selection = this.devices.map(device => device.real_serial)
        } else {
          this.selection = this.devices.filter(device => device.group_id === id).map(device => device.real_serial)
        }
      } else {
        this.selection = []
      }
      this.refreshSelections()
    },
    async refreshSelections() {
      this.groupDevices[0] = this.devices;
      for (let i = 0; i < this.groups.length; i++) {
        this.selections[this.groups[i].id] = []
        this.groupDevices[this.groups[i].id] = this.devices.filter(device => device.group_id === this.groups[i].id)
      }
      this.selections[0] = this.devices.filter(device => this.selection.includes(device.real_serial)).map(device => device.real_serial)
      for (let i = 0; i < this.groups.length; i++) {
        let group_id = this.groups[i].id
        this.selections[group_id] = this.devices.filter(device => device.group_id === group_id)
          .filter(device => this.selection.includes(device.real_serial)).map(device => device.real_serial)
      }
    },
    async get_menus() {
      this.$service.get_menus().then(res => {
        this.menuItems = this.fullMenuItems.filter(item => res.data.includes(item.name))
      })
    },

    async get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },

    async setText(text) {
      this.$service.set_text({
        text: text,
        serials: this.selection,
      }).then(res => {
        console.log(res)
      })
    },
    async initDevice() {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$refs.init_dialog.showModal()
      for (let i = 0; i < this.selection.length; i++) {
        this.init_progress = `${i + 1}/${this.selection.length}`
        await this.$service.init({
          serials: [this.selection[i]],
        })
      }
      this.$refs.init_dialog.close()
    },


    async batchDM() {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .message_now({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('reload_tasks', {})
          await this.$emiter('showToast', `${res.data} ${this.$t('taskCreated')}`)

        })
    },
    async batchFO() {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .follow_now({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('reload_tasks', {})
          await this.$emiter('showToast', `${res.data} ${this.$t('taskCreated')}`)

        })
    },

    async stop_task() {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .stop_task({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('showToast', this.$t('commandSendSuccess'))
          await this.$emiter('reload_running_tasks', {})
        })
    },
    async send_keycode(keycode) {
      await this.$emiter('eventData', JSON.stringify({
        type: 'keycode',//type=keycode
        operation: 'd',//operation=down
        keycode,
      }));
      setTimeout(async () => {
        await this.$emiter('eventData', JSON.stringify({
          type: 'keycode',//type=keycode
          operation: 'u',//operation=up
          keycode,
        }));
      }, 100);
    },
    async send_screen_mode(mode) {
      await this.$emiter('eventData', JSON.stringify({
        type: 'screen',//type=keycode
        mode
      }));
    },



    async clearGallery() {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .clear_gallery({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('showToast', `${this.$t('commandSendSuccess')}`)
        })
    },

    async copyFromPhone() {
      if (!document.hasFocus()) {
        return
      }
      if (this.selection.length == 0) {
        return
      }

      if (this.selection.length > 1) {
        return
      }
      this.$service
        .read_clipboard({
          serial: this.selection[0],
        })
        .then(async res => {
          if (!res.data) {
            return
          }
          await writeText(res.data)
          await this.$emiter('showToast', this.$t('copySuccess'))
        })
    },
    async pasteToPhone() {
      //check visibility
      if (!document.hasFocus()) {
        return
      }
      if (this.selection.length == 0) {
        return
      }
      const text = await readText()
      this.setText(text)
      await this.$emiter('showToast', this.$t('pasteSuccess'))
    },

  },
  async mounted() {
    this.$i18n.locale = this.locale

    this.version = await getVersion();
    await this.$listen('openDevice', async (e) => {
      console.log("receive openDevice: ", e.payload)
      this.selection = [e.payload.real_serial]
      this.refreshSelections()
    });
    await this.$listen('closeDevice', (e) => {
      this.selection = []
      this.refreshSelections()
    });
    await this.$listen('adbEventData', (e) => {
      console.log("receive adbEventData: ", e.payload, this.selection,)
      this.adb_command(e.payload.args)

    });
    await this.$listen('run_task_now', async (e) => {
      console.log("receive run_task_now: ", e.payload)
      await this.run_task_now(e.payload.name, e.payload.args)
    });
    await this.$listen('run_now_by_account', (e) => {
      console.log("receive run_now_by_account: ", e.payload)
      this.run_now_by_account(e.payload.name, e.payload.args)
    });
    await this.$listen('uploadFiles', (e) => {
      this.uploadFiles()
    });
    await this.$listen('installApks', (e) => {
      this.selectApkFile()
    });
    await this.$listen('initDevice', (e) => {
      this.initDevice()
    });
    await this.$listen('setText', (e) => {
      this.setText(e.payload)
    });
    await this.$listen('eventData', async (e) => {
      let new_data = {
        devices: [...this.selection],
        data: e.payload
      }
      await this.$emiter('syncEventData', new_data)
    });


    await this.$listen('batchDM', (e) => {
      this.batchDM();
    });
    await this.$listen('batchFO', (e) => {
      this.batchFO();
    });

    await this.$listen('stop_task', (e) => {
      this.stop_task();
    });
    await this.$listen('send_keycode', (e) => {
      this.send_keycode(e.payload)
    });
    await this.$listen('send_screen_mode', (e) => {
      this.send_screen_mode(e.payload)
    });
    await this.$listen('clearGallery', () => {
      this.clearGallery()
    });
    document.addEventListener('copy', () => {
      this.copyFromPhone()
    });
    document.addEventListener('paste', () => {
      this.pasteToPhone()
    });
    await this.$listen('agent_started', async () => {
      this.loadLicense()
      this.get_menus()
      this.get_settings()
      this.get_groups()
      this.port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
      console.log('agent_started port:', this.port)
    });
    await this.$listen('reload_group', async () => {
      this.get_groups()
    });
    await this.$listen("LICENSE", async (e) => {
      if (e.payload.reload) {
        await this.loadLicense()
      }

      if (e.payload.show) {
        if (this.license.leftdays <= 0 && !this.license.github_authorized) {
          this.$refs.buyLiscenseDialog.show()
        }
      }
    });
    await this.$emiter('agent_started', {})
  }
}
</script>
