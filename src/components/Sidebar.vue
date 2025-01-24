<template>
  <div class="z-50 top-12 left-0 fixed" v-if="!showSidebar">
    <font-awesome-icon icon="fa-solid fa-angle-right"
      class="text-white h-6 w-6 bg-blue-300 p-2 rounded-lg cursor-pointer" @click="showSidebar = true" />
  </div>
  <transition name="fade">
    <div class="bg-base-100 m-4 flex flex-col rounded-lg shadow max-w-96" v-if="showSidebar">
      <div class="bg-blue-500 p-4 rounded-t-lg">
        <div class="flex flex-row items-center">
          <font-awesome-icon icon="fa-brands fa-tiktok" class="text-white h-8 w-8 mr-2" />
          <div>
            <span class="text-xl text-white font-bold">{{ $t('siteName') }}</span>
            <span class="text-xs text-white ml-2">v{{ version }}</span>
            <br>
            <span class="text-xs text-white font-sans">{{ $t('siteUrl') }}</span>

          </div>
          <div class="ml-2">
            <select class="select select-info select-sm" v-model="locale">
              <option selected value="en">English</option>
              <option value="zh-CN">简体中文</option>
            </select>
          </div>
          <label class="swap swap-rotate ml-2">
            <!-- this hidden checkbox controls the state -->
            <input type="checkbox" class="theme-controller" value="dark" />
            <input type="checkbox" class="theme-controller" value="dark" />
            <!-- sun icon -->
            <font-awesome-icon icon="fa-solid fa-sun" class="swap-off fill-current w-6 h-6 text-white" />
            <!-- moon icon -->
            <font-awesome-icon icon="fa-solid fa-moon" class="swap-on fill-current w-6 h-6 text-white" />
          </label>
          <font-awesome-icon icon="fa-solid fa-angle-left"
            class="text-white h-6 w-6 bg-blue-300 p-2 ml-2 rounded-lg cursor-pointer" @click="showSidebar = false" />
        </div>
      </div>
      <div class="p-4">
        <div class="flex flex-row p-2 bg-base-300 rounded-md">
          <a class="link link-primary text-xs float-right flex items-center mr-1"
            @click="$emitter.emit('menuSelected', { name: 'buyLicense' })" v-if="license.left_days > 0">
            <font-awesome-icon icon="fa fa-key" class="text-blue-500 h-4 w-4 mr-1" />
            {{ $t('left_days') }}:
            <label class="text-green-500 font-bold">{{ license.left_days }}</label>
          </a>
          <a class="link link-primary text-xs float-right flex items-center mr-1"
            @click="$emitter.emit('menuSelected', { name: 'buyLicense' })" v-else>
            <font-awesome-icon icon="fa fa-key" class="text-blue-500 h-4 w-4 mr-1" />
            {{ $t('buyLicense') }}
          </a>
          <a class="link link-primary text-xs float-right flex items-center mr-1" :href="$t('siteUrl') + '/docs/intro'"
            target="_blank">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="text-blue-500 h-4 w-4 mr-1" />
            {{ $t('tutorial') }}
          </a>
          <a class="link link-primary text-xs float-right flex items-center mr-1"
            :href="'http://127.0.0.1:' + port + '/swagger-ui/'" target="_blank">
            <font-awesome-icon icon="fa-solid fa-globe" class="text-blue-500 h-4 w-4 mr-1" />
            API Doc
          </a>
        </div>

        <div role="tablist" class="tabs tabs-lifted mt-2 bg-base-200 rounded-md">
          <a ref="general" role="tab" class="tab tab-active" @click="selectTab('general')">{{ $t('general') }}</a>
          <a ref="quickActions" role="tab" class="tab" @click="selectTab('quickActions')">{{ $t('quickActions') }}</a>
          <a ref="tktools" role="tab" class="tab" @click="selectTab('tktools')">{{ $t('tktools') }}</a>
          <a ref="instools" role="tab" class="tab" @click="selectTab('instools')">{{ $t('instools') }}</a>
        </div>
        <div class="border border-base-300 bg-base-500 rounded-md shadow-lg p-2">
          <div class="flex flex-row flex-wrap" v-if="selectedTab === 'general'">
            <General :menuItems="menuItems" />
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
          <button
            class="btn btn-sm bg-transparent hover:bg-transparent border-1 border-success text-black-500 hover:text-blue-700 p-0 mt-1 block"
            @click="addGroup">
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 text-blue-500" />
            <span class="text-xs text-blue-500">{{ $t('addGroup') }}</span>
          </button>
          <input ref="groupNameInput" v-if="showAddGroup" class="input input-sm input-bordered w-full max-w-xs mt-2"
            type="text" v-model="newGroupName" v-on:keyup.enter="saveGroup" @focus="(event) => event.target.select()" />
          <div class="border border-base-300 bg-base-500 rounded-md mt-2 shadow-lg" v-for="(item, index) in groups"
            :key="item.id">
            <div class="flex flex-row form-control items-center">
              <label class="label cursor-pointer">
                <input type="checkbox" class="checkbox checkbox-sm" @change="selectAll(item.id)"
                  :checked="isSelectAll(item.id)" />
                <span class="label-text text-blue-500  text-xs">{{ item.name }}({{ groupDevices[item.id].length
                  }})</span>
              </label>
              <font-awesome-icon icon="fa-solid fa-edit" class="text-blue-500 cursor-pointer ml-2"
                @click="renameGroup(item)"></font-awesome-icon>



              <div class="tooltip" :data-tip="$t('deleteGroup')">
                <font-awesome-icon icon="fa-solid fa-trash" class="text-red-500 cursor-pointer ml-2"
                  @click="deleteGroup(item.id)"></font-awesome-icon>
              </div>

              <span class="label-text text-xs text-right flex-1 mr-2">{{ $t('selected') }}
                {{ selections[item.id].length }}
                {{ $t('units') }}
              </span>

            </div>

            <div class="flex flex-row form-control items-center">
              <button
                class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
                @click="$emitter.emit('menuSelected', { name: 'trainSettings', group: item })">
                <font-awesome-icon icon="cog" class="h-3 w-3 mr-1" />{{ $t('trainSettings') }}
              </button>
              <button
                class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
                @click="$emitter.emit('menuSelected', { name: 'publishSettings', group: item })">
                <font-awesome-icon icon="cog" class="h-3 w-3 mr-1" />{{ $t('publishSettings') }}
              </button>
              <button
                class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
                @click="$emitter.emit('menuSelected', { name: 'materials', group: item })">
                <font-awesome-icon icon="fa-solid fa-film" class="h-3 w-3 mr-1" />{{ $t('materials') }}
              </button>
            </div>
          </div>

          <div class="flex flex-row form-control items-center">
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm" @change="selectAll(0)" :checked="isSelectAll(0)" />
              <span class="label-text text-blue-500 text-xs">{{ $t('allDevices') }} ({{ groupDevices[0].length
                }})</span>
            </label>

            <span class="label-text text-xs text-right flex-1">{{ $t('selected') }}
              {{ selections[0].length }}
              {{ $t('units') }}
            </span>
            <div class="tooltip" :data-tip="$t('moveToGroup')">
              <details ref="moveToGroupMenu" class="dropdown dropdown-top">
                <summary class="btn btn-xs bg-transparent hover:bg-transparent border-0">
                  <font-awesome-icon icon="fa-solid fa-share" class="text-blue-500"></font-awesome-icon>
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
            <drag-select-option v-for="(item, index) in devices" :value="item.real_serial" :key="item.real_serial">
              {{ index + 1 }}
            </drag-select-option>
          </drag-select>
        </div>
      </div>
    </div>
  </transition>


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
import { inject } from 'vue'
import * as util from '../utils'
import General from './General.vue'
import TKTools from './TKTools.vue'
import InsTools from './InsTools.vue'
import Tasks from './Tasks.vue'
import QuickActions from './QuickActions.vue';
import { open, ask } from '@tauri-apps/api/dialog';
import { getVersion } from '@tauri-apps/api/app';
import { readText, writeText } from '@tauri-apps/api/clipboard';
import { appDataDir } from '@tauri-apps/api/path';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'
export default {
  name: 'Sidebar',
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  components: {
    General,
    Tasks,
    TKTools,
    InsTools,
    QuickActions
  },
  props: {
    license: Object
  },
  data() {
    return {
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
      port: -1
    }
  },

  watch: {
    locale() {
      util.setData('locale', this.locale)
      this.$i18n.locale = this.locale
    },
    selection() {
      this.refreshSelections()
    }
  },
  methods: {
    renameGroup(item) {
      if (this.showAddGroup) {
        this.showAddGroup = false
        return
      }
      this.updateGroup = item
      this.showAddGroup = true
      this.newGroupName = item.name

    },
    addGroup() {
      if (this.showAddGroup) {
        this.showAddGroup = false
        return
      }
      this.updateGroup = null
      this.showAddGroup = true
      this.newGroupName = ''
    },
    saveGroup() {
      if (this.updateGroup) {
        const group = this.updateGroup
        this.$service
          .update_group({
            id: group.id,
            name: this.newGroupName,
            auto_train: Number(group.auto_train),
            auto_publish: Number(group.auto_publish),
            publish_start_time: group.publish_start_time,
            train_start_time: group.train_start_time,
            title: group.title,
            publish_type: Number(group.publish_type),
            floow_probable: Number(group.floow_probable),
            like_probable: Number(group.like_probable),
            collect_probable: Number(group.collect_probable),
            comment_probable: Number(group.comment_probable),
            train_duration: Number(group.train_duration),
            min_duration: Number(group.min_duration),
            max_duration: Number(group.max_duration),
            topic: group.topic,
            comment: group.comment,
            image_count: Number(group.image_count),
            add_sound: Number(group.add_sound),
            origin_sound_volume: Number(group.origin_sound_volume),
            add_sound_volume: Number(group.add_sound_volume),
            add_product_link: Number(group.add_product_link),
          })
          .then(() => {
            this.newGroupName = ''
            this.showAddGroup = false
            this.get_groups()
          })
      } else {
        this.$service
          .add_group({
            name: this.newGroupName,
            auto_train: 0,
            auto_publish: 0,
            publish_start_time: '',
            train_start_time: '',
            title: '',
            comment: '',
            publish_type: 0,
            floow_probable: 0,
            like_probable: 0,
            collect_probable: 0,
            comment_probable: 0,
            train_duration: 0,
            min_duration: 10,
            max_duration: 30,
            topic: '',
            image_count: 2,
            add_sound: 0,
            origin_sound_volume: 0,
            add_sound_volume: 0,
            add_product_link: 0,
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
      console.log("result:" + yes);
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
    moveToGroup(src_id, dst_id) {
      let serials = []
      for (let i = 0; i < this.selections[src_id].length; i++) {
        serials.push(this.selections[src_id][i])
      }
      if (serials.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
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
    get_groups() {
      this.$service
        .get_groups()
        .then(res => {
          this.groups = res.data
          this.refreshSelections()
        }).catch(err => {
          console.log(err)

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
        .catch(err => {
          console.log(err)
        })
    },
    async selectApkFile() {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
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
      this.$service
        .install_now({
          apk_path: filePath,
          serials: this.selection
        })
        .then(res => {
          console.log(res)
        })
    },
    adb_command(args) {
      this.$service
        .adb_command({
          serials: this.selection,
          args: args
        })
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    script(name, args = {}) {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .run_task_now({
          script_name: name,
          serials: this.selection,
          script_args: JSON.stringify(args)
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)
        })
        .catch(err => {
          console.log(err)
        })
    },
    selectTab(tab) {
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
    selectAll(id) {

      if (!this.isSelectAll(id)) {
        if (id == 0) {
          this.selection = this.devices.map(device => device.real_serial)
        } else {
          this.selection = this.devices.filter(device => device.group_id === id).map(device => device.real_serial)
        }
      } else {
        this.selection = []
      }
      console.log(this.selection);
      this.refreshSelections()
    },
    refreshSelections() {
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
    get_menus() {
      this.$service.get_menus().then(res => {
        this.menuItems = this.fullMenuItems.filter(item => res.data.includes(item.name))
      }).catch(err => {
        console.log(err)

      })
    },

    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      }).catch(err => {
        console.log(err)

      })
    },

    setText(text) {
      this.$service.set_text({
        text: text,
        serials: this.selection,
      }).then(res => {
        console.log(res)
      })
    },
    async initDevice() {
      const yes = await ask(this.$t('initDeviceConfirm'), this.$t('confirm'));
      if (!yes) {
        return
      }
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      let work_path = await appDataDir();
      this.$emitter.emit('showToast', this.$t('initStart'))
      this.adb_command(['uninstall', 'com.github.tikmatrix'])
      this.adb_command(['uninstall', 'com.github.tikmatrix.test'])
      setTimeout(() => {
        this.adb_command(['install', '-r', '-t', '-g', work_path + 'bin/com.github.tikmatrix.apk'])
        this.adb_command(['install', '-r', '-t', '-g', work_path + 'bin/com.github.tikmatrix.test.apk'])
      }, 3000)

    },
    train(platform) {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .train_now({
          platform: platform,
          serials: this.selection,
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)
        })
    },
    publish() {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .publish_now({
          serials: this.selection,
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)
        })
    },
    message() {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .message_now({
          serials: this.selection,
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)

        })
    },
    share(postUrl) {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .share_now({
          serials: this.selection,
          post_url: postUrl
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)
        })
    },
    stop_task() {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .stop_task({
          serials: this.selection,
        })
        .then(res => {
          this.$emitter.emit('showToast', this.$t('commandSendSuccess'))
        })
    },
    send_keycode(keycode) {
      this.$emitter.emit('eventData', JSON.stringify({
        type: 'keycode',//type=keycode
        operation: 'd',//operation=down
        keycode,
      }));
      setTimeout(() => {
        this.$emitter.emit('eventData', JSON.stringify({
          type: 'keycode',//type=keycode
          operation: 'u',//operation=up
          keycode,
        }));
      }, 100);
    },
    send_screen_mode(mode) {
      this.$emitter.emit('eventData', JSON.stringify({
        type: 'screen',//type=keycode
        mode
      }));
    },
    scrape_fans(targetUsername) {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      if (this.selection.length > 1) {
        this.$emitter.emit('showToast', this.$t('onlyOneDeviceSelected'))
        return
      }
      this.$service
        .scrape_now({
          serial: this.selection[0],
          target_username: targetUsername
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)

        })
    },
    follow(targetUsername) {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }

      this.$service
        .follow_now({
          serials: this.selection,
          target_username: targetUsername
        })
        .then(res => {
          this.$emitter.emit('reload_tasks', {})
          this.$emitter.emit('showToast', `${res.data} ${this.$t('taskCreated')}`)

        })
    },
    clearGallery() {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .clear_gallery({
          serials: this.selection,
        })
        .then(res => {
          this.$emitter.emit('showToast', `${this.$t('commandSendSuccess')}`)
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
          this.$emitter.emit('showToast', this.$t('copySuccess'))
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
      this.$emitter.emit('showToast', this.$t('pasteSuccess'))
    },
  },
  async mounted() {
    this.$i18n.locale = this.locale

    this.version = await getVersion();
    this.$emitter.on('openDevice', (device) => {
      this.selection = [device.real_serial]
      this.refreshSelections()
    });
    this.$emitter.on('closeDevice', (device) => {
      this.selection = []
      this.refreshSelections()
    });
    this.$emitter.on('adbEventData', (data) => {
      console.log("receive adbEventData: ", data, this.selection,)
      this.adb_command(data.args)

    });
    this.$emitter.on('scriptEventData', (data) => {
      console.log("receive scriptEventData: ", data)
      this.script(data.name, data.args)
    });
    this.$emitter.on('uploadFiles', () => {
      this.uploadFiles()
    });
    this.$emitter.on('installApks', () => {
      this.selectApkFile()
    });
    this.$emitter.on('initDevice', () => {
      this.initDevice()
    });
    this.$emitter.on('setText', (text) => {
      this.setText(text)
    });
    this.$emitter.on('eventData', (data) => {
      let new_data = {
        devices: [...this.selection],
        data: data
      }
      this.$emitter.emit('syncEventData', new_data)
    });
    this.$emitter.on('train', (platform) => {
      this.train(platform);
    });
    this.$emitter.on('publish', () => {
      this.publish();
    });
    this.$emitter.on('message', () => {
      this.message();
    });
    this.$emitter.on('share', (postUrl) => {
      this.share(postUrl);
    });
    this.$emitter.on('stop_task', () => {
      this.stop_task();
    });
    this.$emitter.on('send_keycode', (code) => {
      this.send_keycode(code)
    });
    this.$emitter.on('scrape_fans', (targetUsername) => {
      this.scrape_fans(targetUsername)
    });
    this.$emitter.on('follow', (targetUsername) => {
      this.follow(targetUsername)
    });
    this.$emitter.on('send_screen_mode', (mode) => {
      this.send_screen_mode(mode)
    });
    this.$emitter.on('clearGallery', () => {
      this.clearGallery()
    });
    document.addEventListener('copy', () => {
      this.copyFromPhone()
    });

    document.addEventListener('paste', () => {
      this.pasteToPhone()
    });
    this.$emitter.on('reload_sidebar', async () => {
      this.get_menus()
      this.get_settings()
      this.get_groups()
      this.port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });
      console.log('reload_sidebar port:', this.port)
    });
    this.get_menus()
    this.get_settings()
    this.get_groups()
    this.port = await readTextFile('port.txt', { dir: BaseDirectory.AppData });

  }
}
</script>
