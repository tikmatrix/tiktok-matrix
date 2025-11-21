<template>
  <div
    class="flex flex-col justify-start h-full bg-base-200/90 backdrop-blur-md shadow-lg rounded-r-xl border border-l-0 border-base-300 group min-w-[2.5rem] max-w-[2.5rem] hover:max-w-md transition-all duration-300 ease-in-out overflow-hidden relative">

    <!-- 展开指示器 -->
    <div
      class="absolute right-0 top-4 transform translate-x-full bg-primary text-primary-content p-1 rounded-r-md shadow-md opacity-75 group-hover:opacity-100 transition-all duration-300 z-10">
      <font-awesome-icon icon="fa-solid fa-chevron-right"
        class="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
    </div>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none first:rounded-t-xl tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('task')" @click="$emiter('send_keycode', 'task')">
      <font-awesome-icon icon="fa fa-window-restore" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('task') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('home')" @click="$emiter('send_keycode', 'home')">
      <font-awesome-icon icon="fa-solid fa-home" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('home') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('back')" @click="$emiter('send_keycode', 'back')">
      <font-awesome-icon icon="fa fa-reply" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('back') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('power')"
      @click="$emiter('adbEventData', { args: ['shell', 'input', 'keyevent', 'KEYCODE_POWER'] })">
      <font-awesome-icon icon="fa fa-lightbulb" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('power') }}</span>
    </button>
    <!-- 分隔线 -->
    <div class="divider my-0 opacity-30"></div>

    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('up')"
      @click="$emiter('adbEventData', { args: ['shell', 'input', 'swipe', '500', '1000', '500', '500', '300'] })">
      <font-awesome-icon icon="fa-arrow-up" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('up') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('down')"
      @click="$emiter('adbEventData', { args: ['shell', 'input', 'swipe', '500', '500', '500', '1000', '300'] })">
      <font-awesome-icon icon="fa-arrow-down" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('down') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('left')"
      @click="$emiter('adbEventData', { args: ['shell', 'input', 'swipe', '1000', '500', '500', '500', '300'] })">
      <font-awesome-icon icon="fa-arrow-left" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('left') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('right')"
      @click="$emiter('adbEventData', { args: ['shell', 'input', 'swipe', '500', '500', '1000', '500', '300'] })">
      <font-awesome-icon icon="fa-arrow-right" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('right') }}</span>
    </button>

    <!-- 分隔线 -->
    <div class="divider my-0 opacity-30"></div>

    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('input')" @click="show_text_input_dialog">
      <font-awesome-icon icon="fa fa-keyboard" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('input') }}</span>
    </button>

    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('debug')" @click="openDebugWindow">
      <font-awesome-icon icon="fa-solid fa-bug" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('debug') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('logs')" @click="showLogs">
      <font-awesome-icon icon="fa-solid fa-file-text" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('logs') }}</span>
    </button>
    <button
      class="btn bg-transparent hover:bg-primary hover:text-primary-content border-0 text-base-content p-2 min-h-0 h-12 w-full flex-col justify-center items-center gap-1 rounded-none last:rounded-b-xl tooltip tooltip-right transition-all duration-200 group-hover:flex-row group-hover:justify-start group-hover:gap-2"
      :data-tip="$t('workProfile')" @click="show_work_profile_user_dialog">
      <font-awesome-icon icon="fa-solid fa-briefcase" class="h-4 w-4 flex-shrink-0" />
      <span
        class="text-md font-medium max-w-0 opacity-0 overflow-hidden whitespace-nowrap group-hover:max-w-md group-hover:opacity-100 transition-all duration-300">{{
          $t('workProfile') }}</span>
    </button>
  </div>

  <dialog ref="input_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-md btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ input_dialog_title }}</h3>
      <label class="input input-bordered flex items-center gap-2 my-4">
        <input id="input_dialog_text" type="text" class="grow" placeholder="" v-model="input_dialog_text"
          v-on:keyup.enter="input_callback" />
      </label>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-primary" @click="input_callback">{{ $t('enter') }}</button>
        </form>
      </div>
    </div>
  </dialog>
  <dialog ref="log_dialog" class="modal">
    <div class="modal-box w-11/12 max-w-5xl">
      <form method="dialog">
        <button class="btn btn-md btn-circle btn-ghost absolute right-2 top-2" @click="stopAutoRefresh">✕</button>
      </form>
      <h3 class="font-bold text-lg">logs/{{ real_serial }}.log</h3>

      <!-- 控制按钮区域 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <MyButton icon="fa fa-refresh" @click="loadLogs" label="refresh" />

          <!-- 自动刷新开关 -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="toggle toggle-primary" v-model="auto_refresh_logs"
              @change="toggleAutoRefresh" />
            <span class="text-md font-medium">{{ $t('autoRefresh') || 'Auto Refresh' }}</span>
          </label>

          <!-- 刷新间隔显示 -->
          <span v-if="auto_refresh_logs" class="text-md text-base-content/70">
            ({{ $t('every') || 'Every' }} 3s)
          </span>
        </div>

        <!-- 状态指示器 -->
        <div v-if="auto_refresh_logs" class="flex items-center gap-2">
          <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span class="text-md text-success font-medium">{{ $t('autoRefreshing') || 'Auto Refreshing' }}</span>
        </div>
      </div>

      <pre ref="log_dialog_body"
        class="text-md h-96 overflow-y-scroll border rounded-lg p-3 bg-base-200">{{ logs }}</pre>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="stopAutoRefresh">close</button>
    </form>
  </dialog>
  <dialog ref="work_profile_user_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-md btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg">{{ $t('setWorkProfileUser') }}</h3>
      <p class="py-4">{{ $t('setWorkProfileUserDesc') }}</p>
      <label class="input input-bordered flex items-center gap-2 my-4">
        <input id="work_profile_user_input" type="text" class="grow" :placeholder="$t('workProfileUserPlaceholder')"
          v-model="work_profile_user_id" v-on:keyup.enter="save_work_profile_user" />
      </label>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-primary" @click="save_work_profile_user">{{ $t('save') }}</button>
          <button class="btn">{{ $t('cancel') }}</button>
        </form>
      </div>
    </div>
  </dialog>
</template>
<script>
import { readTextFile, writeTextFile, BaseDirectory, exists, createDir } from '@tauri-apps/api/fs'
import MyButton from '../Button.vue'
export default {
  name: 'RightBars',
  components: {
    MyButton
  },
  props: {
    serial: {
      type: String,
      default: () => {
        return ''
      }
    },
    real_serial: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  data() {
    return {
      input_dialog_text: '',
      input_dialog_title: '',
      input_callback: () => { },
      logs: '',
      work_profile_user_id: '',
      work_profile_users: {},
      auto_refresh_logs: false,
      log_refresh_timer: null
    }
  },
  async mounted() {
    await this.load_work_profile_users()
  },
  beforeUnmount() {
    // 组件销毁前清理定时器
    this.stopAutoRefresh()
  },
  methods: {
    async load_work_profile_users() {
      try {
        const dataExists = await exists('data/work_profile_user.json', { dir: BaseDirectory.AppData })
        if (dataExists) {
          const content = await readTextFile('data/work_profile_user.json', { dir: BaseDirectory.AppData })
          this.work_profile_users = JSON.parse(content)
        } else {
          this.work_profile_users = {}
        }
      } catch (error) {
        console.log('Failed to load work profile users:', error)
        this.work_profile_users = {}
      }
    },
    async save_work_profile_users() {
      try {
        // 确保data目录存在
        const dataDirExists = await exists('data', { dir: BaseDirectory.AppData })
        if (!dataDirExists) {
          await createDir('data', { dir: BaseDirectory.AppData, recursive: true })
        }

        // 保存到JSON文件
        await writeTextFile('data/work_profile_user.json', JSON.stringify(this.work_profile_users, null, 2), {
          dir: BaseDirectory.AppData
        })
      } catch (error) {
        console.error('Failed to save work profile users:', error)
      }
    },
    async show_work_profile_user_dialog() {
      this.work_profile_user_id = this.work_profile_users[this.serial] || ''
      this.$refs.work_profile_user_dialog.showModal()
    },
    async save_work_profile_user() {
      if (this.work_profile_user_id.trim() === '') {
        // 如果输入为空，删除该设备的配置
        delete this.work_profile_users[this.serial]
      } else {
        // 保存该设备的用户配置
        this.work_profile_users[this.serial] = this.work_profile_user_id.trim()
      }

      await this.save_work_profile_users()
      this.$refs.work_profile_user_dialog.close()

      // 显示成功消息
      this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('workProfileUserSaved'),
        timeout: 3000
      })
    },
    async loadLogs() {
      try {
        const logs = await readTextFile(`logs/${this.real_serial}_rCURRENT.log`, { dir: BaseDirectory.AppData });
        //show tail 1000 lines
        this.logs = logs.split('\n').slice(-1000).join('\n')
        this.$nextTick(() => {
          this.$refs.log_dialog_body.scrollTop = this.$refs.log_dialog_body.scrollHeight
        })
      } catch (error) {
        console.error('Failed to load logs:', error)
        this.logs = `Error loading logs: ${error.message}`
      }
    },
    async showLogs() {
      this.$refs.log_dialog.showModal()
      await this.loadLogs()
      // 如果之前有自动刷新，重新启动
      if (this.auto_refresh_logs) {
        this.startAutoRefresh()
      }
    },
    toggleAutoRefresh() {
      if (this.auto_refresh_logs) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },
    startAutoRefresh() {
      // 清除之前的定时器
      if (this.log_refresh_timer) {
        clearInterval(this.log_refresh_timer)
      }

      // 启动新的定时器，每3秒刷新一次
      this.log_refresh_timer = setInterval(async () => {
        if (this.auto_refresh_logs && this.$refs.log_dialog.hasAttribute('open')) {
          await this.loadLogs()
        } else {
          // 如果对话框已关闭，停止自动刷新
          this.stopAutoRefresh()
        }
      }, 3000)
    },
    stopAutoRefresh() {
      this.auto_refresh_logs = false
      if (this.log_refresh_timer) {
        clearInterval(this.log_refresh_timer)
        this.log_refresh_timer = null
      }
    },
    async openDebugWindow() {
      // 触发打开 Debug Dialog
      this.$emiter('openDebugDialog', {
        serial: this.serial,
        real_serial: this.real_serial
      })
    },
    async show_text_input_dialog() {
      this.$refs.input_dialog.showModal()
      this.input_dialog_title = 'Input Text'
      this.input_callback = this.post_input_dialog
    },
    async show_adb_input_dialog() {
      this.$refs.input_dialog.showModal()
      this.input_dialog_title = 'ADB Input'
      this.input_callback = this.post_adb_input_dialog
    },
    async post_input_dialog() {
      await this.$emiter('setText', this.input_dialog_text)
      this.input_dialog_text = ''
      this.$refs.input_dialog.close()
    },
    async post_adb_input_dialog() {
      let args = this.input_dialog_text.split(' ')
      await this.$emiter('adbEventData', { args: args })
      this.input_dialog_text = ''
      this.$refs.input_dialog.close()
    },
    async uploadVideo() {
      document.getElementById('upload_video_input').click()
    },
    async on_upload_video(e) {
      console.log(e.target.files)
      await this.$emiter('uploadFiles', e.target.files)
    },
    async app_install() {
      document.getElementById('app_install_input').click()
    },
    async on_app_install(e) {
      await this.$emiter('installApks', e.target.files)
    },
  }
}
</script>
