<template>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', 'moe.nb4a/io.nekohasekai.sagernet.ui.MainActivity'] })">
        {{ $t('openNekoBox') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'ime', 'set', 'com.github.tikmatrix/.FastInputIME'] })">
        <font-awesome-icon icon="fa fa-keyboard" class="h-3 w-3 text-white" />
        {{ $t('setFastInput') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="app_install">
        <font-awesome-icon icon="fa-brands fa-android" class="h-3 w-3 text-white" />
        {{ $t('installApk') }}
        <input id="app_install_input" type="file" v-on:change="on_app_install" multiple hidden />
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="uploadVideo">
        <font-awesome-icon icon="fa fa-upload" class="h-3 w-3 text-white" />
        {{ $t('uploadToGallery') }}
        <input id="upload_video_input" type="file" v-on:change="on_upload_video" multiple hidden />
    </button>
    <!-- <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'rm', '-rf', '/storage/emulated/0/DCIM/*'] })">
        <font-awesome-icon icon="fa fa-eraser" class="h-3 w-3 text-white" />
        {{ $t('clearGallery') }}
    </button> -->

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'https://ip.niostack.com'] })">
        <font-awesome-icon icon="fa-brands fa-wikipedia-w" class="h-3 w-3 text-white" />
        {{ $t('openIpChecker') }}
    </button>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('initDevice')">
        <font-awesome-icon icon="fa-solid fa-arrows-rotate" class="h-3 w-3" />{{ $t('initApp') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        :data-tip="$t('showTimeSetting')"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.settings.DATE_SETTINGS'] })">
        <font-awesome-icon icon="fa fa-clock" class="h-3 w-3" />
        {{ $t('showTimeSetting') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        :data-tip="$t('showLanguageSetting')"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.android.settings/.LanguageSettings'] })">
        <font-awesome-icon icon="fa fa-language" class="h-3 w-3" />
        {{ $t('showLanguageSetting') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        :data-tip="$t('showSimInfo')"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.settings.DEVICE_INFO_SETTINGS'] })">
        <font-awesome-icon icon="fa fa-mobile" class="h-3 w-3" />
        {{ $t('showSimInfo') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        :data-tip="$t('enableTCP')" @click="$emitter.emit('adbEventData', { args: ['tcpip', '5555'] })">
        <font-awesome-icon icon="fa-solid fa-network-wired" class="h-3 w-3" />
        {{ $t('enableTCP') }}
    </button>

</template>
<script>
export default {
    name: 'Tools',
    props: ['settings'],
    methods: {
        app_install() {
            document.getElementById('app_install_input').click()
        },
        on_app_install(e) {
            this.$emitter.emit('installApks', e.target.files)
        },
        uploadVideo() {
            document.getElementById('upload_video_input').click()
        },
        on_upload_video(e) {
            console.log(e.target.files)
            this.$emitter.emit('uploadFiles', e.target.files)
        },
    }
}
</script>