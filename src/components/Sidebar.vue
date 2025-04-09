<template>
  <div class="sidebar bg-base-100 m-1 flex flex-col rounded-lg shadow w-1/4 h-screen overflow-y-scroll no-scrollbar">
    <div class="pl-2 pr-2 pt-2 pb-14">

      <div class="tabs tabs-md tabs-border border border-base-300 bg-base-500 rounded-md shadow-lg p-2">
        <input type="radio" name="my_tabs_3" class="tab" :aria-label="$t('general')" checked="checked" />
        <div class="tab-content mt-2">
          <General :settings="settings" />
        </div>
        <input type="radio" name="my_tabs_3" class="tab" :aria-label="$t('customCommands')" />
        <div class="tab-content mt-2">
          <CustomCommands :settings="settings" />
        </div>
        <input type="radio" name="my_tabs_3" class="tab" :aria-label="$t('scripts')" />
        <div class="tab-content mt-2">
          <Scripts :settings="settings" />
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
        <button class="btn btn-md btn-primary border-1 border-success text-primary-content p-0 mt-1" @click="addGroup">
          <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4" />
          <span class="text-md">{{ $t('addGroup') }}</span>
        </button>
        <input ref="groupNameInput" v-if="showAddGroup"
          class="input input-md input-bordered w-full max-w-xs mt-2 ring-1 ring-success" type="text"
          v-model="newGroupName" v-on:keyup.enter="saveGroup" @focus="(event) => event.target.select()" />
        <div class="bg-base-300 rounded-md mt-2 shadow-lg ring-1">
          <div class="flex flex-row form-control items-center">
            <label class="label cursor-pointer m-1">
              <input type="checkbox" class="checkbox checkbox-md ring-1 mr-1" @change="selectAll(0)"
                :checked="isSelectAll(0)" />
              <span class="label-text text-primary text-md">{{ $t('allDevices') }} ({{ groupDevices[0].length
                }})</span>
            </label>

            <div ref="moveToGroupMenu" class="dropdown dropdown-top label-text text-md text-right flex-1">
              <div tabindex="0" role="button" class="text-primary cursor-pointer">
                <span class="text-md">{{ $t('moveToGroup') }}</span>
                <font-awesome-icon icon="fa-solid fa-share" class="text-primary ml-1"></font-awesome-icon>
              </div>

              <ul tabindex="0"
                class="dropdown-content flex-col bg-base-100 max-h-96 max-w-48 overflow-y-auto text-left p-2 rounded-md shadow-lg ring-1 space-y-1">
                <li @click="moveToGroup(0, item.id)" v-for="(item, index) in groups" :key="item.id"
                  :class="['px-2 py-1 link w-full border-b border-base-300 last:border-none rounded-md', index % 2 == 0 ? 'bg-primary/10' : 'bg-primary/20']">
                  {{ item.name }}
                </li>
              </ul>
            </div>
            <span class="label-text text-md text-right flex-1 mr-2">{{ $t('selected') }}
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

        <div class="bg-base-300 rounded-md mt-2 shadow-lg ring-1" v-for="(item, index) in sortedGroups" :key="item.id">
          <div class="flex flex-row form-control items-center">
            <label class="label cursor-pointer m-1">
              <input type="checkbox" class="checkbox checkbox-md ring-1 mr-1" @change="selectAll(item.id)"
                :checked="isSelectAll(item.id)" />
              <span class="label-text text-primary  text-md">{{ item.name }}({{ groupDevices[item.id].length
              }})</span>
            </label>
            <font-awesome-icon icon="fa-solid fa-edit" class="text-primary cursor-pointer ml-2"
              @click="renameGroup(item)"></font-awesome-icon>
            <div class="tooltip" :data-tip="$t('deleteGroup')">
              <font-awesome-icon icon="fa-solid fa-trash" class="text-error cursor-pointer ml-2"
                @click="deleteGroup(item.id)"></font-awesome-icon>
            </div>

            <span class="label-text text-md text-right flex-1 mr-2">{{ $t('selected') }}
              {{ selections[item.id].length }}
              {{ $t('units') }}
            </span>

          </div>

          <div class="flex flex-row form-control items-center mt-1">
            <button class="btn btn-md btn-primary ml-1 mb-1"
              @click="$emiter('showDialog', { name: 'trainSettings', group: item })">
              <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('trainSettings') }}
            </button>
            <button class="btn btn-md btn-primary ml-1 mb-1"
              @click="$emiter('showDialog', { name: 'publishSettings', group: item })">
              <font-awesome-icon icon="cog" class="h-3 w-3" />{{ $t('publishSettings') }}
            </button>
            <button class="btn btn-md btn-primary ml-1 mb-1"
              @click="$emiter('showDialog', { name: 'materials', group: item })">
              <font-awesome-icon icon="fa-solid fa-film" class="h-3 w-3" />{{ $t('materials') }}
            </button>
          </div>
        </div>



      </div>
      <div class="mt-4 ring-1 ring-base-300 rounded-lg overflow-hidden relative" v-if="!hideAd">
        <a href="https://gou.niaozun.com/products/samsung-s10-mobile-farm-b8wu4pb1-1x414m0f-ahisqnqd?variant=466&f_tracking_id=tikmatrix"
          target="_blank" class="block w-full h-full relative hover:opacity-90 transition-opacity">
          <img src="https://gou.niaozun.com/media/product/1/image/2024/06/26/e4c4d51d0598b76eeb0e2f4ef84bdea2.png"
            class="w-full h-full object-cover" />
        </a>
        <div class="absolute top-10 bg-black/50 text-white text-md p-1 text-center">
          <span class="text-md font-bold">
            {{ $t('adTips') }}
          </span>
        </div>
        <div class="absolute top-0 right-0">
          <button class="btn btn-md btn-primary" @click="hideAd = true">
            {{ $t('close') }}
          </button>
        </div>
      </div>
    </div>
  </div>


</template>
<script>

import General from './General.vue'
import Scripts from './Scripts.vue'
import Tasks from './Tasks.vue'
import QuickActions from './QuickActions.vue';
import CustomCommands from './CustomCommands.vue';
import { open, ask, message } from '@tauri-apps/api/dialog';
import { readText, writeText } from '@tauri-apps/api/clipboard';

export default {
  name: 'Sidebar',
  props: {
    devices: {
      type: Array,
      required: true
    },
    groups: {
      type: Array,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },

  },
  components: {
    General,
    Tasks,
    Scripts,
    QuickActions,
    CustomCommands
  },
  computed: {
    sortedGroups() {
      //sort by device count
      return this.groups.sort((a, b) => this.groupDevices[b.id]?.length - this.groupDevices[a.id]?.length)
    }
  },
  data() {
    return {
      menuItems: [],
      fullMenuItems: [
      ],
      selection: [],
      newGroupName: '',
      showAddGroup: false,
      updateGroup: null,
      selections: {
        0: [],
      },
      selectedTab: 'general',
      groupDevices: {
        0: [],
      },
      port: -1,
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
    selection(newVal) {
      this.$emiter('selecedDevices', newVal)
      this.refreshSelections()
    },
    groups: {
      handler: function (val) {
        this.refreshSelections()
      },
      deep: true
    },
    devices: {
      handler: function (val) {
        this.refreshSelections()
      },
      deep: true
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
      this.$refs.moveToGroupMenu.classList.remove('dropdown-open')
      let serials = []
      for (let i = 0; i < this.selections[src_id].length; i++) {
        serials.push(this.selections[src_id][i])
      }
      if (serials.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      this.$service.move_to_group({ serials: serials, dst_id: dst_id }).then(async res => {
        this.devices.map(device => {
          if (serials.includes(device.real_serial)) {
            device.group_id = dst_id
          }
        })
        this.refreshSelections()
        await this.$emiter('NOTIFY', {
          type: 'success',
          message: this.$t('moveSuccess'),
          timeout: 2000
        });
      })
    },

    async uploadFiles() {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      const filePath = await open({
        multiple: true, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Upload Files', extensions: ['mp4', 'jpg', 'png', 'jpeg'] },
        ]
      });
      if (!filePath) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noFilesSelected'),
          timeout: 2000
        });
        return
      }
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
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [ // 文件过滤器
          { name: 'Apk Files', extensions: ['apk'] },
        ]
      });
      if (!filePath) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noFilesSelected'),
          timeout: 2000
        });
        return
      }
      let args = {
        apk_path: filePath,
      }
      await this.run_now_by_account('install', args)
    },
    async adb_command(args) {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      this.$service
        .adb_command({
          serials: this.selection,
          args: args
        })
        .then(async res => {
          console.log(res)
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('commandSendSuccess'),
            timeout: 2000
          });
        })
    },
    
    async run_now_by_account(name, args = {}) {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
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
            await this.$emiter('NOTIFY', {
              type: 'error',
              message: this.$t('noAccount'),
              timeout: 2000
            });
            return
          }
          await this.$emiter('reload_tasks', {})
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${res.data} ${this.$t('taskCreated')}`,
            timeout: 2000
          });
        })
    },
    async selectTab(tab) {
      this.selectedTab = tab
      switch (tab) {
        case 'general':
          this.$refs.general.classList.add('tab-active')
          this.$refs.quickActions.classList.remove('tab-active')
          this.$refs.scripts.classList.remove('tab-active')
          break
        case 'scripts':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.quickActions.classList.remove('tab-active')
          this.$refs.scripts.classList.add('tab-active')
          break
        case 'quickActions':
          this.$refs.general.classList.remove('tab-active')
          this.$refs.scripts.classList.remove('tab-active')
          this.$refs.quickActions.classList.add('tab-active')
          break

      }
    },
    isSelectAll(id) {
      if (!this.groupDevices[id]) {
        this.refreshSelections()
      }
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
      console.log('refreshSelections')
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
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      for (let i = 0; i < this.selection.length; i++) {
        this.$emiter('NOTIFY', {
          type: 'info',
          message: `${this.$t('initing')} ${this.selection[i]}`,
          timeout: 2000
        });
        this.$service.init({
          serials: [this.selection[i]],
        }).then(async res => {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${this.$t('initSuccess')}`,
            timeout: 2000
          });
        })
      }
    },


    async massDM(args) {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
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
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${res.data} ${this.$t('taskCreated')}`,
            timeout: 2000
          });

        })
    },
    async massComment(args) {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }

      this.$service
        .comment_now({
          serials: this.selection,
          ...args
        })
        .then(async (res) => {
          await this.$emiter('reload_tasks', {})
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${res.data} ${this.$t('taskCreated')}`,
            timeout: 2000
          });
        })
    },

    async massFO() {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }

      this.$service
        .follow_now({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('reload_tasks', {})
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${res.data} ${this.$t('taskCreated')}`,
            timeout: 2000
          });

        })
    },

    async stop_task() {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      this.$service
        .stop_task({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('commandSendSuccess'),
            timeout: 2000
          });
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
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      await this.$emiter('eventData', JSON.stringify({
        type: 'screen',//type=keycode
        mode
      }));
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('commandSendSuccess'),
        timeout: 2000
      });
    },



    async clearGallery() {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      await this.$emiter('NOTIFY', {
        type: 'info',
        message: this.$t('clearGalleryStart'),
        timeout: 2000
      });
      this.$service
        .clear_gallery({
          serials: this.selection,
        })
        .then(async (res) => {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('clearGallerySuccess'),
            timeout: 2000
          });
        })
    },


    async pasteToPhone() {
      //check visibility
      if (!document.hasFocus()) {
        return
      }
      // 检查是否有对话框打开
      const activeDialog = document.querySelector('dialog.modal[open]');
      if (activeDialog) {
        return;
      }
      if (this.selection.length == 0) {
        return
      }
      const text = await readText()
      this.setText(text)
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('pasteSuccess'),
        timeout: 2000
      });
    },
    async massScrape(args) {
      if (this.selection.length == 0) {
        await this.$emiter('NOTIFY', {
          type: 'error',
          message: this.$t('noDevicesSelected'),
          timeout: 2000
        });
        return
      }
      this.$service
        .scrape_now({
          serials: this.selection,
          target_username: args.target_username,
        })
        .then(async (res) => {
          await this.$emiter('reload_tasks', {})
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${res.data} ${this.$t('taskCreated')}`,
            timeout: 2000
          });
        })
    },


  },
  async mounted() {
    this.refreshSelections()
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
      this.adb_command(e.payload.args)

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


    this.listeners.push(await this.$listen('massDM', (e) => {
      this.massDM(e.payload);
    }))
    this.listeners.push(await this.$listen('massComment', (e) => {
      this.massComment(e.payload);
    }))
    this.listeners.push(await this.$listen('massFO', (e) => {
      this.massFO();
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

    this.listeners.push(document.addEventListener('paste', () => {
      this.pasteToPhone()
    }))
    this.listeners.push(await this.$listen('massScrape', (e) => {
      this.massScrape(e.payload);
    }))

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
