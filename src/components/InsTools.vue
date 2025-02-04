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
    <!-- <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'pm', 'clear', settings.packagename] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 mr-1 text-pink-500" />
        {{ $t('clearTiktok') }}
    </button> -->

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$emitter.emit('run_task_now', { name: 'register', args: { count: 1 } })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />{{ $t('startRegister') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$refs.scrapeUsersDialog.showModal">
        <font-awesome-icon icon="fas fa-spider" class="h-3 w-3 mr-1" />{{ $t('scrapeFans') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$emitter.emit('run_task_now', { name: 'profile', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />{{ $t('startFillProfile') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_task_now', { name: 'ins_match_account', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />{{ $t('matchAccount') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$emitter.emit('run_task_now', { name: 'login', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />{{ $t('startLogin') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('train', 'instagram')">
        <font-awesome-icon icon="random" class="h-3 w-3 mr-1" />{{ $t('startTrain') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$emitter.emit('publish', false)">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3 mr-1" />{{ $t('startPublish') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="startPublish">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3 mr-1" />{{ $t('startPublishBeta') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$emitter.emit('message')">
        <font-awesome-icon icon="fa-solid fa-message" class="h-3 w-3 mr-1" />{{ $t('startMessage') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$refs.shareDialog.showModal">
        <font-awesome-icon icon="fa-solid fa-share" class="h-3 w-3 mr-1" />{{ $t('startShare') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        disabled @click="$refs.followDialog.showModal">
        <font-awesome-icon icon="fa fa-user-plus" class="h-3 w-3 mr-1" />{{ $t('startFollow') }}
    </button>

    <dialog ref="scrapeUsersDialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('scrapeTitle') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-sm" type="text" v-model="tartget_username"
                    :placeholder="$t('targetUsername')" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="startScrape">{{
                $t('startScrape') }}</button>


        </div>

        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="shareDialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('shareTitle') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-md flex-1" type="text" v-model="share_post_url"
                    :placeholder="$t('postUrl')" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="startShare">{{
                $t('startShare') }}</button>

        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="followDialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('followTitle') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-sm" type="text" v-model="tartget_username"
                    :placeholder="$t('targetUsername')" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="startFollow">{{
                $t('startFollow') }}</button>

        </div>

        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";
import { ask } from '@tauri-apps/api/dialog';
export default {
    name: 'Tools',
    props: ['settings'],
    data() {
        return {
            tartget_username: '',
            share_post_url: ''
        }
    },
    methods: {
        open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        async startPublish() {
            const yes = await ask(this.$t('addProductLinkConfirm'), this.$t('confirm'));
            if (yes) {
                this.$emitter.emit('publish', true)
            }
        },
        startFollow() {
            if (this.tartget_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return;
            }
            if (!this.tartget_username.startsWith('@')) {
                this.tartget_username = '@' + this.tartget_username
            }

            this.$emitter.emit('follow', this.tartget_username)
            this.$refs.followDialog.close()
        },

        startScrape() {
            if (this.tartget_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return;
            }
            if (!this.tartget_username.startsWith('@')) {
                this.tartget_username = '@' + this.tartget_username
            }

            this.$emitter.emit('scrape_fans', this.tartget_username)
            this.$refs.scrapeUsersDialog.close()
        },
        startShare() {
            if (this.share_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return;
            }
            this.$emitter.emit('share', this.share_post_url)

            this.$refs.shareDialog.close()
        },

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