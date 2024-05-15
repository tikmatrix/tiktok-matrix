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
            <br>
            <span class="text-xs text-white font-sans">www.tikmatrix.com</span>
            <span class="text-xs text-white ml-2">v{{ settings.version }}</span>
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
            <svg class="swap-off fill-current w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            <!-- moon icon -->
            <svg class="swap-on fill-current w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
          <font-awesome-icon icon="fa-solid fa-angle-left"
            class="text-white h-6 w-6 bg-blue-300 p-2 rounded-lg cursor-pointer" @click="showSidebar = false" />
        </div>
      </div>
      <div class="p-4">
        <div class="flex flex-row">
          <div class="flex-1"></div>
          <a class="link link-primary text-sm float-right" href="https://doc.tikmatrix.com" target="_blank">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="text-blue-500 h-4 w-4" />
            {{ $t('document') }}
          </a>
        </div>

        <div role="tablist" class="tabs tabs-lifted">
          <a ref="settings" role="tab" class="tab tab-active" @click="selectTab('settings')">{{ $t('general') }}</a>
          <a ref="tools" role="tab" class="tab" @click="selectTab('tools')">{{ $t('toolbox') }}</a>
        </div>
        <div class="flex flex-row flex-wrap mt-2" v-if="selectedTab === 'settings'">
          <button v-for="(item, index) in menuItems" :key="index"
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="selectItem(item)">
            <font-awesome-icon :icon="item.icon" class="h-3 w-3" />{{ $t(`${item.name}`) }}
          </button>
          <button
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="open_dir('logs')">
            <font-awesome-icon icon="fa-solid fa-file-lines" class="h-3 w-3" />{{ $t('logs') }}
          </button>
          <button
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="showHiddenDevices">
            <font-awesome-icon icon="fa-solid fa-eye" class="h-3 w-3" />{{ $t('showHiddenDevices') }}
          </button>
        </div>
        <div class="flex flex-row flex-wrap mt-2" v-if="selectedTab === 'tools'">
          <button
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="$emitter.emit('scriptEventData', { name: 'register', args: ['1'] })">
            <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />{{ $t('register') }}
          </button>
          <button
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="$emitter.emit('scriptEventData', { name: 'profile', args: [] })">
            <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />{{ $t('profile') }}
          </button>
          <button
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="$emitter.emit('scriptEventData', { name: 'login', args: [] })">
            <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />{{ $t('login') }}
          </button>
          <button
            class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
            @click="$emitter.emit('train')">
            <font-awesome-icon icon="fa-solid fa-graduation-cap" class="h-3 w-3" />{{ $t('train') }}
          </button>
        </div>
        <div class="flex flex-col">
          <span class="font-sans mt-4 mb-4">{{ $t('groups') }}</span>
          <div class="cursor-pointer items-center" @click="showAddGroup = !showAddGroup">
            <font-awesome-icon icon="fa-solid fa-plus" class="h-4 w-4 text-blue-500" />
            <span class="text-xs text-blue-500">{{ $t('addGroup') }}</span>
          </div>
          <input v-if="showAddGroup" class="input input-sm input-bordered w-full max-w-xs" type="text"
            v-model="newGroupName" v-on:keyup.enter="addGroup" />
          <div class="flex flex-row form-control items-center" v-for="(item, index) in groups" :key="item.id">
            <label class="label cursor-pointer">
              <input type="checkbox" class="checkbox checkbox-sm" @change="selectAll(item.id)"
                :checked="isSelectAll(item.id)" />
              <span class="label-text text-blue-500  text-xs">{{ item.name }}({{ groupDevices[item.id].length }})</span>
            </label>
            <div class="tooltip" :data-tip="$t('editGroup')">
              <font-awesome-icon icon="fa-solid fa-edit" class="text-blue-500 cursor-pointer ml-2"
                @click="selectItem({ name: 'editGroup', group: item })"></font-awesome-icon>
            </div>
            <div class="tooltip" :data-tip="$t('uploadVideo')">
              <font-awesome-icon icon="fa-solid fa-film" class="text-blue-500 cursor-pointer ml-2"
                @click="selectItem({ name: 'materials', group: item })"></font-awesome-icon>
            </div>

            <div class="tooltip" :data-tip="$t('deleteGroup')">
              <font-awesome-icon icon="fa-solid fa-trash" class="text-red-500 cursor-pointer ml-2"
                @click="deleteGroup(item.id)"></font-awesome-icon>
            </div>

            <span class="label-text text-xs text-right flex-1">{{ $t('selected') }}
              {{ selections[item.id].length }}
              {{ $t('units') }}
            </span>
            <div class="tooltip" :data-tip="$t('moveToGroup')">
              <details :ref="'moveToGroupMenu_' + item.id" class="dropdown dropdown-top">
                <summary class="btn btn-xs bg-transparent hover:bg-transparent border-0">
                  <font-awesome-icon icon="fa-solid fa-share" class="text-blue-500"></font-awesome-icon>
                </summary>
                <ul class="dropdown-content z-[10] menu menu-sm p-2 shadow bg-base-200 rounded-box w-52">
                  <li v-for="(subitem, index) in groups" :key="subitem.id"><a
                      @click="moveToGroup(item.id, subitem.id)">{{
                        subitem.name }}</a>
                  </li>
                </ul>
              </details>
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
            <drag-select-option v-for="(item, index) in devices" :value="item.serial" :key="item.serial">
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
import { invoke } from "@tauri-apps/api/tauri";
export default {
  name: 'Sidebar',
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },

  data() {
    return {
      showSidebar: true,
      menuItems: [],
      fullMenuItems: [
        // { name: 'dashboard', icon: 'tachometer-alt' },
        { name: 'accounts', icon: 'user' },
        { name: 'analytics', icon: 'chart-bar' },
        { name: 'comments', icon: 'comment' },
        { name: 'proxys', icon: 'globe' },
        { name: 'postBots', icon: 'upload' },
        { name: 'editBots', icon: 'video' },
        { name: 'musics', icon: 'music' },
        { name: 'publishJobs', icon: 'robot' },
        { name: 'trainJobs', icon: 'sync-alt' },
        { name: 'dialogWatcher', icon: 'exclamation-circle' },
        { name: 'settings', icon: 'cogs' },
      ],
      settings: {
        version: '0.0.1',
      },
      selection: [],
      newGroupName: '',
      showAddGroup: false,
      groups: [],
      selections: {
        0: [],
      },
      selectedTab: 'settings',
      groupDevices: {
        0: [],
      },
      locale: util.getData('locale') || 'en'
    }
  },

  emits: ['menu_selected'],
  watch: {
    locale() {
      util.setData('locale', this.locale)
      this.$i18n.locale = this.locale
    }
  },
  methods: {

    showHiddenDevices() {
      this.$emitter.emit('show-hidden-devices')
    },
    open_dir(name) {
      invoke("open_dir", {
        name
      });
    },
    addGroup() {
      this.$service
        .add_group({
          name: this.newGroupName,
          auto_train: 0,
          auto_publish: 0,
          publish_start_time: '',
          train_start_time: '',
          title: '',
          publish_type: 0,
          product_link: '',
          floow_probable: 0,
          like_probable: 0,
          collect_probable: 0,
          train_duration: 0,
          topic: ''
        })
        .then(() => {
          this.newGroupName = ''
          this.showAddGroup = false
          this.get_groups()

        })
    },
    deleteGroup(id) {
      this.$service
        .delete_group({
          id: id
        })
        .then(() => {
          this.get_groups()
        })
    },
    moveToGroup(src_id, dst_id) {
      let serials = []
      for (let i = 0; i < this.selections[src_id].length; i++) {
        serials.push(this.selections[src_id][i])
      }
      if (serials.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        for (let i = 0; i < this.groups.length; i++) {
          this.$refs['moveToGroupMenu_' + this.groups[i].id][0].removeAttribute('open')
        }
        this.$refs.moveToGroupMenu.removeAttribute('open')
        return
      }
      this.$service.move_to_group({ serials: serials, dst_id: dst_id }).then(res => {
        this.$refs.moveToGroupMenu.removeAttribute('open')
        for (let i = 0; i < this.groups.length; i++) {
          this.$refs['moveToGroupMenu_' + this.groups[i].id][0].removeAttribute('open')
        }
        this.devices.map(device => {
          if (serials.includes(device.serial)) {
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
        })
    },
    uploadFiles(files) {
      const formData = new FormData()
      formData.append('serials', this.selection)
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }
      this.$service
        .upload_video(formData)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
    },
    installApks(files) {
      const formData = new FormData()
      formData.append('serials', this.selection)
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }
      this.$service
        .install(formData)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
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
    script(name, args = []) {
      if (this.selection.length == 0) {
        this.$emitter.emit('showToast', this.$t('noDevicesSelected'))
        return
      }
      this.$service
        .script({
          name: name,
          serials: this.selection,
          args: args
        })
        .then(res => {
          console.log(res)
          this.$emitter.emit('showToast', this.$t('commandSendSuccess'))

        })
        .catch(err => {
          console.log(err)
        })
    },
    selectTab(tab) {
      this.selectedTab = tab
      switch (tab) {
        case 'settings':
          this.$refs.settings.classList.add('tab-active')
          this.$refs.tools.classList.remove('tab-active')
          break
        case 'tools':
          this.$refs.settings.classList.remove('tab-active')
          this.$refs.tools.classList.add('tab-active')
          break
      }
    },
    isSelectAll(id) {
      return this.groupDevices[id].length > 0 && this.selections[id].length == this.groupDevices[id].length
    },
    selectAll(id) {
      // if (this.isSelectAll(id)) {
      //   this.selectedAlls[id]=false
      // }else{
      //   this.selectedAlls[id]=true
      // }
      // this.selectedAlls[id] = !this.selectedAlls[id]
      // console.log(this.selectedAlls[id]);
      if (!this.isSelectAll(id)) {
        if (id == 0) {
          this.selection = this.devices.map(device => device.serial)
        } else {
          this.selection = this.devices.filter(device => device.group_id === id).map(device => device.serial)
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
        // this.selectedAlls[this.groups[i].id] = false
        this.groupDevices[this.groups[i].id] = this.devices.filter(device => device.group_id === this.groups[i].id)
      }
      this.selections[0] = this.devices.filter(device => this.selection.includes(device.serial)).map(device => device.serial)
      // this.selectedAlls[0] = this.selections[0].length > 0
      for (let i = 0; i < this.groups.length; i++) {
        let group_id = this.groups[i].id
        this.selections[group_id] = this.devices.filter(device => device.group_id === group_id)
          .filter(device => this.selection.includes(device.serial)).map(device => device.serial)
        // this.selectedAlls[group_id] = this.selections[group_id].length > 0
      }
    },
    get_menus() {
      this.$service.get_menus().then(res => {
        this.menuItems = this.fullMenuItems.filter(item => res.data.includes(item.name))
      })
    },
    selectItem(item) {
      this.$emit('menu_selected', item)
    },
    get_settings() {
      this.$service.get_settings().then(res => {
        this.settings = res.data
      })
    },
    update_setting() {
      this.$service
        .update_settings(this.settings)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
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
    initDevice() {
      this.$emitter.emit('showToast', this.$t('initStart'))
      this.adb_command(['uninstall', 'com.github.tikmatrix'])
      this.adb_command(['uninstall', 'com.github.tikmatrix.test'])
      setTimeout(() => {
        this.adb_command(['install', '-r', '-t', '-g', 'bin/apk/com.github.tikmatrix.apk'])
        this.adb_command(['install', '-r', '-t', '-g', 'bin/apk/com.github.tikmatrix.test.apk'])
        this.$emitter.emit('showToast', this.$t('initSuccess'))
      }, 3000)

    },
    train() {
      this.$emitter.emit('scriptEventData', {
        name: 'train', args: [
          '0',
          '',
        ]
      })
    },
  },
  mounted() {
    this.$i18n.locale = this.locale
    this.get_menus()
    this.get_settings()
    this.get_groups()
    this.$emitter.on('openDevice', (device) => {
      this.selection = [device.serial]
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
    this.$emitter.on('uploadFiles', (files) => {
      this.uploadFiles(files)
    });
    this.$emitter.on('installApks', (files) => {
      this.installApks(files)
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
    this.$emitter.on('train', () => {
      this.train();
    });
  }
}
</script>
