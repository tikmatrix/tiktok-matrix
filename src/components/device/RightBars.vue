<template>
    <div class="flex flex-col justify-start">
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emitter.emit('adbEventData',{args:['shell', 'input', 'keyevent', 'KEYCODE_POWER']})">
        <font-awesome-icon icon="fa fa-lightbulb" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('power') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 tooltip p-1"
      @click="$emitter.emit('adbEventData',{args:['shell', 'reboot']})">
        <font-awesome-icon icon="fa fa fa-refresh" class="h-4 w-4 text-red-500" />
        <span class="text-xs block font-normal">{{ $t('reboot') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emitter.emit('adbEventData',{args:['shell', 'input', 'swipe', '500', '1000', '500', '500', '300']})">
        <font-awesome-icon icon="fa-arrow-up" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('up') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emitter.emit('adbEventData',{args:['shell', 'input', 'swipe', '500', '500', '500', '1000', '300']})">
        <font-awesome-icon icon="fa-arrow-down" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('down') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emitter.emit('adbEventData',{args:['shell', 'input','swipe', '1000', '500', '500', '500', '300' ]})">
        <font-awesome-icon icon="fa-arrow-left" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('left') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="$emitter.emit('adbEventData',{args:['shell', 'input','swipe', '500', '500', '1000', '500', '300']})">
        <font-awesome-icon icon="fa-arrow-right" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('right') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block tooltip" :data-tip="$t('showTimeSetting')"
        @click="$emitter.emit('adbEventData',{args:['shell', 'am', 'start', '-a', 'android.settings.DATE_SETTINGS']})">
        <font-awesome-icon icon="fa fa-clock" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('time') }}</span>
        </button>
        <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block tooltip" :data-tip="$t('showLanguageSetting')"
        @click="$emitter.emit('adbEventData',{args:['shell', 'am', 'start', '-n', 'com.android.settings/.LanguageSettings']})">
        <font-awesome-icon icon="fa fa-language" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('language') }}</span>
        </button>
        <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block tooltip" :data-tip="$t('showSimInfo')"
        @click="$emitter.emit('adbEventData',{args:['shell', 'am', 'start', '-a', 'android.settings.DEVICE_INFO_SETTINGS']})">
        <font-awesome-icon icon="fa fa-mobile" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('sim') }}</span>
        </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="uploadVideo">
        <font-awesome-icon icon="fa fa-upload" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('upload') }}</span>
        <input id="upload_video_input" type="file" v-on:change="on_upload_video" multiple hidden />
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block tooltip" :data-tip="$t('installAPK')"
        @click="app_install">
        <font-awesome-icon icon="fa-brands fa-android" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('apk') }}</span>
        <input id="app_install_input" type="file" v-on:change="on_app_install" multiple hidden />
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block"
      @click="show_text_input_dialog">
        <font-awesome-icon icon="fa fa-keyboard" class="h-4 w-4 text-blue-500" />
        <span class="text-xs block font-normal">{{ $t('input') }}</span>
      </button>
      <button class="btn bg-transparent hover:bg-transparent border-0 text-black-500 hover:text-blue-700 p-0 block tooltip" :data-tip="$t('enableTCP')"
      @click="$emitter.emit('adbEventData',{args:['tcpip', '5555']})">
      <font-awesome-icon icon="fa-solid fa-network-wired" class="h-4 w-4 text-blue-500" />
      <span class="text-xs block font-normal">{{ $t('tcp') }}</span>
      </button>
    </div>
    <dialog ref="input_dialog" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">{{ input_dialog_title }}</h3>
        <label class="input input-bordered flex items-center gap-2 my-4">
          <input type="text" class="grow" placeholder="" v-model="input_dialog_text" v-on:keyup.enter="input_callback" />
        </label>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="input_callback">{{ $t('enter') }}</button>
          </form>
        </div>
      </div>
    </dialog>
</template>
<script>
export default {
  name: 'RightBars',
  data() {
    return {
      input_dialog_text: '',
      input_dialog_title: '',
      input_callback: () => {},
    }
  },
  methods: {
    show_text_input_dialog() {
      this.$refs.input_dialog.showModal()
      this.input_dialog_title = 'Input Text'
      this.input_callback = this.post_input_dialog
    },
    show_adb_input_dialog() {
      this.$refs.input_dialog.showModal()
      this.input_dialog_title = 'ADB Input'
      this.input_callback = this.post_adb_input_dialog
    },
    post_input_dialog() {
      // let encodedText = btoa(encodeURIComponent(this.input_dialog_text));
      // this.$emitter.emit('adbEventData',{args:['shell', 'am', 'broadcast', '-a', 'ADB_INPUT_TEXT', '--es', 'text', `"${encodedText}"`]})
      this.$emitter.emit('setText',this.input_dialog_text)
      this.input_dialog_text = ''
      this.$refs.input_dialog.close()
    },
    post_adb_input_dialog() {
      let args = this.input_dialog_text.split(' ')
      this.$emitter.emit('adbEventData',{args:args})
      this.input_dialog_text = ''
      this.$refs.input_dialog.close()
    },
    uploadVideo() {
      document.getElementById('upload_video_input').click()
    },
    on_upload_video(e) {
      console.log(e.target.files)
      this.$emitter.emit('uploadFiles',e.target.files)
    },
    app_install() {
      document.getElementById('app_install_input').click()
    },
    on_app_install(e) {
      this.$emitter.emit('installApks',e.target.files)
    },
  }
}
</script>
