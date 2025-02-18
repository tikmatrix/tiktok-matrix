<template>

    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', settings.ins_packagename + '/com.instagram.mainactivity.LauncherActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-primary-content" />
        {{ $t('openInstagram') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'force-stop', settings.ins_packagename] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-yellow-500" />
        {{ $t('stopInstagram') }}
    </button>


    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('run_task_now', { name: 'ins_match_account', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-check" class="h-3 w-3" />
        {{ $t('matchAccount') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('run_now_by_account', { name: 'ins_train', args: {} })">
        <font-awesome-icon icon="robot" class="h-3 w-3 text-success" />
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