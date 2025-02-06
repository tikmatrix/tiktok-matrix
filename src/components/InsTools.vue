<template>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', settings.ins_packagename + '/com.instagram.mainactivity.LauncherActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 mr-1 text-white" />
        {{ $t('openInstagram') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'force-stop', settings.ins_packagename] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 mr-1 text-yellow-500" />
        {{ $t('stopInstagram') }}
    </button>


    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_task_now', { name: 'ins_match_account', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-check" class="h-3 w-3 mr-1" />
        {{ $t('matchAccount') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_now_by_account', { name: 'ins_train', args: {} })">
        <font-awesome-icon icon="robot" class="h-3 w-3 mr-1 text-green-500" />
        {{ $t('startTrain') }}
    </button>


</template>
<script>
export default {
    name: 'Tools',
    props: ['settings'],
    data() {
        return {
            target_username: '',
            target_post_url: ''
        }
    },
    methods: {


    }
}
</script>