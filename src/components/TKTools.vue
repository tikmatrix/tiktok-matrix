<template>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'start', '-n', settings.packagename + '/com.ss.android.ugc.aweme.splash.SplashActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 mr-1 text-white" />
        {{ $t('openTiktok') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('adbEventData', { args: ['shell', 'am', 'force-stop', settings.packagename] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 mr-1 text-yellow-500" />
        {{ $t('stopTiktok') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="logout">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 mr-1 text-pink-500" />
        {{ $t('logout') }}
    </button>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="startRegister">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />
        {{ $t('startRegister') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_task_now', { name: 'login', args: {} })">
        <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="h-3 w-3 mr-1" />
        {{ $t('startLogin') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="startFillProfile">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />
        {{ $t('startFillProfile') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_task_now', { name: 'match_account', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-check" class="h-3 w-3 mr-1" />
        {{ $t('matchAccount') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_now_by_account', { name: 'train', args: {} })">
        <font-awesome-icon icon="robot" class="h-3 w-3 mr-1 text-green-500" />
        {{ $t('startTrain') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('run_now_by_account', { name: 'publish', args: {} })">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3 mr-1 text-green-500" />
        {{ $t('startPublish') }}
    </button>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$refs.userActionsDialog.showModal">
        <font-awesome-icon icon="fa fa-user-plus" class="h-3 w-3 mr-1 text-green-500" />{{ $t('userActions') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$refs.postActionsDialog.showModal">
        <font-awesome-icon icon="fa-solid fa-share" class="h-3 w-3 mr-1 text-green-500" />
        {{ $t('postActions') }}
    </button>

    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="startMessage">
        <font-awesome-icon icon="fa-solid fa-message" class="h-3 w-3 mr-1" />{{ $t('startMessage') }}
    </button>
    <dialog ref="postActionsDialog" class="modal">
        <div class="modal-box">
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-md flex-1" type="text" v-model="target_post_url"
                    :placeholder="$t('postUrl')" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="startLike">
                {{ $t('like') }}
            </button>
            <button class="btn btn-sm btn-success ml-2" @click="startComment">
                {{ $t('comment') }}
            </button>
            <button class="btn btn-sm btn-success ml-2" @click="startFavorite">
                {{ $t('favorite') }}
            </button>
            <button class="btn btn-sm btn-success ml-2" @click="startView">
                {{ $t('view') }}
            </button>
            <button class="btn btn-sm btn-success ml-2" @click="startShare">
                {{ $t('share') }}
            </button>

        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="userActionsDialog" class="modal">
        <div class="modal-box">
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-sm" type="text" v-model="target_username"
                    :placeholder="$t('targetUsername')" />
            </div>
            <button class="btn btn-sm btn-primary ml-2" @click="startFollow">
                {{ $t('follow') }}
            </button>
            <button class="btn btn-sm btn-secondary ml-2" @click="startUnFollow">
                {{ $t('unFollow') }}
            </button>
            <button class="btn btn-sm btn-success ml-2" @click="startScrape">{{
                $t('scrapeFollowers') }}</button>
            <a class="link text-xs float-right flex items-center link-success ml-2" @click="open_dir('download')">{{
                $t('openDownloadDir') }}</a>

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
            target_username: '',
            target_post_url: ''
        }
    },
    methods: {
        open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        async startMessage() {
            this.$emitter.emit('menuSelected', { name: 'messageSettings' });
        },
        async startFillProfile() {
            this.$emitter.emit('menuSelected', { name: 'profileSettings' });

        },
        async startRegister() {
            this.$emitter.emit('menuSelected', { name: 'registerSettings' });
        },
        async logout() {
            let yes = await ask(this.$t('logoutConfirm'), this.$t('confirm'));
            if (yes) {
                this.$emitter.emit('adbEventData', { args: ['shell', 'pm', 'clear', this.settings.packagename] })
            }
        },
        open_dir(name) {
            invoke("open_dir", {
                name
            });
        },

        startFollow() {
            if (this.target_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return;
            }
            if (!this.target_username.startsWith('@')) {
                this.target_username = '@' + this.target_username
            }

            this.$emitter.emit('run_now_by_account', { name: 'follow', args: { target_username: this.target_username } })
            this.$refs.userActionsDialog.close()
        },
        startUnFollow() {
            if (this.target_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return;
            }
            if (this.target_username.startsWith('@')) {
                this.target_username = this.target_username.replace('@', '')
            }

            this.$emitter.emit('run_now_by_account', { name: 'unfollow', args: { target_username: this.target_username } })
            this.$refs.userActionsDialog.close()
        },
        startScrape() {
            if (this.target_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return;
            }
            if (!this.target_username.startsWith('@')) {
                this.target_username = '@' + this.target_username
            }
            this.$emitter.emit('run_now_by_account', { name: 'scrape_fans', args: { target_username: this.target_username } })
            this.$refs.scrapeUsersDialog.close()
        },
        startShare() {
            if (this.target_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return;
            } this.$emitter.emit('run_now_by_account', { name: 'share', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        startLike() {
            if (this.target_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return;
            } this.$emitter.emit('run_now_by_account', { name: 'like', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        startComment() {
            if (this.target_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return;
            } this.$emitter.emit('run_now_by_account', { name: 'comment', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        startFavorite() {
            if (this.target_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return;
            } this.$emitter.emit('run_now_by_account', { name: 'favorite', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        startView() {
            if (this.target_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return;
            } this.$emitter.emit('run_now_by_account', { name: 'view', args: { post_url: this.target_post_url } })

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