<template>
  <div class="sidebar bg-base-100 m-1 flex flex-col rounded-lg shadow w-1/4 h-screen overflow-y-scroll no-scrollbar">
    <div class="pl-2 pr-2 pt-2 pb-14">
      <div role="tablist" class="tabs tabs-lifted mt-2 bg-base-200 rounded-md">
        <a ref="general" role="tab" class="tab tab-active" @click="selectTab('general')">{{ $t('general') }}</a>
        <a ref="quickActions" role="tab" class="tab" @click="selectTab('quickActions')">{{ $t('quickActions') }}</a>
        <a ref="tktools" role="tab" class="tab" @click="selectTab('tktools')">{{ $t('tktools') }}</a>
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
      </div>
      <div class="flex flex-col">
        <span class="font-sans p-2 bg-base-200 rounded-md font-bold mt-2">{{ $t('tasks') }}</span>
        <div class="flex flex-row flex-wrap border border-base-300 bg-base-500 rounded-md shadow-lg p-2">
          <Tasks :settings="settings" />
        </div>
      </div>
      <div class="flex flex-col">
        <span class="font-sans p-2 bg-base-200 rounded-md font-bold mt-2">{{ $t('groups') }}</span>
        <button class="btn btn-sm btn-primary border-1 border-success text-primary-content p-0 mt-1" @click="addGroup">
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
          <div ref="moveToGroupMenu" class="dropdown dropdown-top label-text text-xs text-right flex-1">
            <div tabindex="0" role="button" class="btn bg-transparent hover:bg-transparent border-none text-primary">
              <span class="text-xs">{{ $t('moveToGroup') }}</span>
              <font-awesome-icon icon="fa-solid fa-share" class="text-primary"></font-awesome-icon>
            </div>
            <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow ring">
              <li v-for="(item, index) in groups" :key="item.id">
                <a @click="moveToGroup(0, item.id)">{{
                  item.name }}</a>
              </li>
            </ul>

          </div>
          <span class="label-text text-xs text-right">{{ $t('selected') }}
            {{ selections[0].length }}
            {{ $t('units') }}
          </span>

        </div>
        <drag-select v-model="selection">
          <drag-select-option v-for="(item, index) in devices" :value="item.real_serial" :key="index">
            {{ index + 1 }}
          </drag-select-option>
        </drag-select>

      </div>
      <div class="mt-4 ring-1 ring-base-300 rounded-lg overflow-hidden relative" v-if="!hideAd">
        <a href="https://gou.niaozun.com/products/samsung-s10-mobile-farm-b8wu4pb1-1x414m0f-ahisqnqd?variant=466&f_tracking_id=tikmatrix"
          target="_blank" class="block w-full h-full relative hover:opacity-90 transition-opacity">
          <img src="https://gou.niaozun.com/media/product/1/image/2024/06/26/e4c4d51d0598b76eeb0e2f4ef84bdea2.png"
            class="w-full h-full object-cover" />
        </a>
        <div class="absolute top-10 bg-black/50 text-white text-xs p-1 text-center">
          <span class="text-sm font-bold">
            {{ $t('adTips') }}
          </span>
        </div>
        <div class="absolute top-0 right-0">
          <button class="btn btn-sm btn-primary" @click="hideAd = true">
            {{ $t('close') }}
          </button>
        </div>
      </div>
    </div>
  </div>

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
<script>

import General from './General.vue'
import TKTools from './TKTools.vue'
import Tasks from './Tasks.vue'
import QuickActions from './QuickActions.vue';
import { open, ask, message } from '@tauri-apps/api/dialog';
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
    QuickActions
  },
  data() {
    return {
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
      port: -1,
      init_progress: '0/0',
      listeners: [],
      adImage: '',
      adLink: '',
      adTitle: '',
      hideAd: true,
      // hideAd: localStorage.getItem('hideAd_v1') == 'true' ? true : false,
    }
  },

  watch: {
    hideAd(newVal) {
      localStorage.setItem('hideAd_v1', newVal)
    },
    selection() {
      this.refreshSelections()
    },

  },
  methods: {

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
          .then(async () => {
            this.newGroupName = ''
            this.showAddGroup = false
            await this.$emiter('reload_group', {})
          })
      } else {
        this.$service
          .add_group({
            name: this.newGroupName,
          })
          .then(async () => {
            this.newGroupName = ''
            this.showAddGroup = false
            await this.$emiter('reload_group', {})

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
          .then(async () => {
            await this.$emiter('reload_group', {})
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
        return
      }
      this.$service.move_to_group({ serials: serials, dst_id: dst_id }).then(async res => {
        this.devices.map(device => {
          if (serials.includes(device.real_serial)) {
            device.group_id = dst_id
          }
        })
        this.refreshSelections()
        await this.$emiter('showToast', this.$t('moveSuccess'))
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
        .then(async (res) => {
          if (res.code === 40003) {
            await message(this.$t('needLicense'), { title: 'NeedLicense', type: 'error' });
            return
          }
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
          this.$refs.tktools.classList.remove('tab-active')
          break
        case 'tktools':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.quickActions.classList.remove('tab-active')
          this.$refs.tktools.classList.add('tab-active')
          break
        case 'quickActions':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.tktools.classList.remove('tab-active')
          this.$refs.quickActions.classList.add('tab-active')
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


    async batchDM(args) {
      if (this.selection.length == 0) {
        await this.$emiter('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .message_now({
          serials: this.selection,
          message_content: args.message_content,
          insert_emoji: args.insert_emoji,
          target_username_path: args.target_username_path,
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
          // await this.$emiter('showToast', this.$t('copySuccess'))
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
      // await this.$emiter('showToast', this.$t('pasteSuccess'))
    },


  },
  async mounted() {

    this.listeners.push(await this.$listen('openDevice', async (e) => {
      console.log("receive openDevice: ", e.payload)
      this.selection = [e.payload.real_serial]
      this.refreshSelections()
    }))
    this.listeners.push(await this.$listen('closeDevice', (e) => {
      this.selection = []
      this.refreshSelections()
    }))
    this.listeners.push(await this.$listen('adbEventData', (e) => {
      console.log("receive adbEventData: ", e.payload, this.selection,)
      this.adb_command(e.payload.args)

    }))
    this.listeners.push(await this.$listen('run_task_now', async (e) => {
      console.log("receive run_task_now: ", e.payload)
      await this.run_task_now(e.payload.name, e.payload.args)
    }))
    this.listeners.push(await this.$listen('run_now_by_account', (e) => {
      console.log("receive run_now_by_account: ", e.payload)
      this.run_now_by_account(e.payload.name, e.payload.args)
    }))
    this.listeners.push(await this.$listen('uploadFiles', (e) => {
      this.uploadFiles()
    }))
    this.listeners.push(await this.$listen('installApks', (e) => {
      this.selectApkFile()
    }))
    this.listeners.push(await this.$listen('initDevice', (e) => {
      this.initDevice()
    }))
    this.listeners.push(await this.$listen('setText', (e) => {
      this.setText(e.payload)
    }))
    this.listeners.push(await this.$listen('eventData', async (e) => {
      let new_data = {
        devices: [...this.selection],
        data: e.payload
      }
      await this.$emiter('syncEventData', new_data)
    }))


    this.listeners.push(await this.$listen('batchDM', (e) => {
      this.batchDM(e.payload);
    }))
    this.listeners.push(await this.$listen('batchFO', (e) => {
      this.batchFO();
    }))

    this.listeners.push(await this.$listen('stop_task', (e) => {
      this.stop_task();
    }))
    this.listeners.push(await this.$listen('send_keycode', (e) => {
      this.send_keycode(e.payload)
    }))
    this.listeners.push(await this.$listen('send_screen_mode', (e) => {
      this.send_screen_mode(e.payload)
    }))
    this.listeners.push(await this.$listen('clearGallery', () => {
      this.clearGallery()
    }))
    this.listeners.push(document.addEventListener('copy', () => {
      this.copyFromPhone()
    }))
    this.listeners.push(document.addEventListener('paste', () => {
      this.pasteToPhone()
    }))
    this.listeners.push(await this.$listen('agent_started', async () => {
      this.get_menus()
      this.get_settings()
      this.get_groups()
      this.port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
      console.log('agent_started port:', this.port)
    }))

    this.listeners.push(await this.$listen('reload_group', async () => {
      console.log('reload group')
      this.get_groups()
    }))
    this.get_menus()
    this.get_settings()
    this.get_groups()
    this.port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
    console.log('agent_started port:', this.port)


  },
  unmounted() {
    this.listeners.forEach(listener => {
      if (listener) {
        listener()
      }
    })
    this.listeners = []
  }
}
</script>
