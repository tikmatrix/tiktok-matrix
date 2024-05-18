<template>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.zhiliaoapp.musically/com.ss.android.ugc.aweme.splash.SplashActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-4 w-4 text-white" />
        {{ $t('open') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'force-stop', 'com.zhiliaoapp.musically'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-4 w-4 text-yellow-500" />
        {{ $t('stop') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'pm', 'clear', 'com.zhiliaoapp.musically'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-4 w-4 text-pink-500" />
        {{ $t('clear') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', `${settings.proxy_url}`] })">
        <font-awesome-icon icon="fa-solid fa-link" class="h-4 w-4 text-white" />
        {{ $t('proxy') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'settings', 'put', 'global', 'http_proxy', ':0'] })">
        <font-awesome-icon icon="fa-solid fa-unlink" class="h-4 w-4 text-yellow-500" />
        {{ $t('proxy') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'https://whoer.net'] })">
        <font-awesome-icon icon="fa-brands fa-wikipedia-w" class="h-4 w-4 text-white" />
        Whoer
    </button>
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
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('initDevice')">
        <font-awesome-icon icon="fa-solid fa-arrows-rotate" class="h-3 w-3" />{{ $t('init') }}
    </button>
</template>
<script>
export default {
    name: 'Tools',
    props: ['settings'],
}
</script>