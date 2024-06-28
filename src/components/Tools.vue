<template>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.zhiliaoapp.musically/com.ss.android.ugc.aweme.splash.SplashActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-white" />
        {{ $t('openTiktok') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'force-stop', 'com.zhiliaoapp.musically'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-yellow-500" />
        {{ $t('stopTiktok') }}
    </button>
    <!-- <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'pm', 'clear', 'com.zhiliaoapp.musically'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-pink-500" />
        {{ $t('clearTiktok') }}
    </button> -->

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('scriptEventData', { name: 'register', args: ['1'] })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />{{ $t('startRegister') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('scriptEventData', { name: 'profile', args: [] })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />{{ $t('fillProfile') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('scriptEventData', { name: 'login', args: [] })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />{{ $t('startLogin') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('train')">
        <font-awesome-icon icon="fa-solid fa-graduation-cap" class="h-3 w-3" />{{ $t('startTrain') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('publish')">
        <font-awesome-icon icon="fa-solid fa-add" class="h-3 w-3" />{{ $t('startPublish') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('message')">
        <font-awesome-icon icon="fa-solid fa-paper-plane" class="h-3 w-3" />{{ $t('message') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('stop_task')">
        <font-awesome-icon icon="fa fa-stop" class="h-3 w-3 text-pink-500" />{{ $t('stopTask') }}</button>
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