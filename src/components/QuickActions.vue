<template>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.HOME'] })">
        <font-awesome-icon icon="fa fa-home" class="h-3 w-3 text-primary-content" />
        {{ $t('home') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', 'moe.nb4a/io.nekohasekai.sagernet.ui.MainActivity'] })">
        <font-awesome-icon icon="fa fa-cube" class="h-3 w-3 text-primary-content" />
        {{ $t('openNekoBox') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="app_install">
        <font-awesome-icon icon="fa fa-download" class="h-3 w-3 text-primary-content" />
        {{ $t('installApk') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.uninstall_dialog.showModal()">
        <font-awesome-icon icon="fa-brands fa-android" class="h-3 w-3 text-primary-content" />
        {{ $t('uninstallApk') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="uploadVideo">
        <font-awesome-icon icon="fa fa-upload" class="h-3 w-3 text-primary-content" />
        {{ $t('uploadToGallery') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="clearGallery">
        <font-awesome-icon icon="fa fa-eraser" class="h-3 w-3 text-primary-content" />
        {{ $t('clearGallery') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" :data-tip="$t('showTimeSetting')"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.settings.DATE_SETTINGS'] })">
        <font-awesome-icon icon="fa fa-clock" class="h-3 w-3" />
        {{ $t('showTimeSetting') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" :data-tip="$t('showLanguageSetting')"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', 'com.android.settings/.LanguageSettings'] })">
        <font-awesome-icon icon="fa fa-language" class="h-3 w-3" />
        {{ $t('showLanguageSetting') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" :data-tip="$t('showSimInfo')"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-a', 'android.settings.DEVICE_INFO_SETTINGS'] })">
        <font-awesome-icon icon="fa fa-sim-card" class="h-3 w-3" />
        {{ $t('showSimInfo') }}
    </button>

    <dialog ref="uninstall_dialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('inputPackageName') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-sm" type="text" v-model="uninstall_package" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="uninstallApk">{{
                $t('confirm') }}</button>

        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>
<script>
export default {
    name: 'Tools',
    props: ['settings'],
    data() {
        return {
            uninstall_package: '',
        }
    },
    methods: {
        async app_install() {
            await this.$emiter('installApks', {})
        },
        async uploadVideo() {
            await this.$emiter('uploadFiles', {})
        },
        async uninstallApk() {
            this.$refs.uninstall_dialog.close()
            await this.$emiter('adbEventData', { args: ['shell', 'pm', 'uninstall', this.uninstall_package] })
        },
        async clearGallery() {
            await this.$emiter('clearGallery', {})
        }
    }
}
</script>