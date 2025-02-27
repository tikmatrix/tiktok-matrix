<template>

    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'start', '-n', settings.packagename + '/com.ss.android.ugc.aweme.splash.SplashActivity'] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-primary-content" />
        {{ $t('openTiktok') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('adbEventData', { args: ['shell', 'am', 'force-stop', settings.packagename] })">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-yellow-500" />
        {{ $t('stopTiktok') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="logout">
        <font-awesome-icon icon="fa-brands fa-tiktok" class="h-3 w-3 text-pink-500" />
        {{ $t('logout') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="startRegister">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
        {{ $t('startRegister') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('run_task_now', { name: 'login', args: {} })">
        <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="h-3 w-3" />
        {{ $t('startLogin') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="startFillProfile">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
        {{ $t('startFillProfile') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('run_task_now', { name: 'match_account', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-check" class="h-3 w-3" />
        {{ $t('matchAccount') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('run_now_by_account', { name: 'train', args: {} })">
        <font-awesome-icon icon="robot" class="h-3 w-3 text-success" />
        {{ $t('startTrain') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('run_now_by_account', { name: 'publish', args: {} })">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3 text-success" />
        {{ $t('startPublish') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.deletePostDialog.showModal">
        <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3 text-error" />
        {{ $t('deletePost') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.userActionsDialog.showModal">
        <font-awesome-icon icon="fa fa-user-plus" class="h-3 w-3 text-success" />{{ $t('userActions') }}
    </button>


    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.postActionsDialog.showModal">
        <font-awesome-icon icon="fa-solid fa-thumbs-up" class="h-3 w-3 text-success" />
        {{ $t('postActions') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="batchDM">
        <font-awesome-icon icon="fa-solid fa-message" class="h-3 w-3" />{{ $t('batchDM') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$refs.scrapeUsersDialog.showModal">
        <font-awesome-icon icon="fas fa-spider" class="h-3 w-3 mr-1" />{{ $t('scrapeFans') }}
    </button>
    <dialog ref="scrapeUsersDialog" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">{{ $t('scrapeTitle') }}</h3>
            <div class="flex flex-row items-center p-2">
                <input class="input input-bordered input-sm" type="text" v-model="target_username"
                    :placeholder="$t('targetUsername')" />
            </div>
            <button class="btn btn-sm btn-success ml-2" @click="startScrape">{{
                $t('startScript') }}</button>
            <button class="btn btn-sm btn-success ml-2" @click="open_dir('download')">{{ $t('openDownloadDir')
            }}</button>

        </div>

        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="postActionsDialog" class="modal">
        <div class="modal-box max-w-5xl">
            <div class="flex flex-row items-center p-2">
                <textarea class="textarea textarea-success grow  h-32 leading-tight"
                    :placeholder="$t('targetPostUrlTips')" autocomplete="off" v-model="target_post_url"> </textarea>
            </div>
            <button class="btn btn-sm btn-success ml-2 mt-2" @click="startLike">
                <font-awesome-icon icon="fa-solid fa-heart" class="h-3 w-3" />
                {{ $t('like') }}
            </button>
            <button class="btn btn-sm btn-success ml-2 mt-2" @click="startComment">
                <font-awesome-icon icon="fa-solid fa-comment" class="h-3 w-3" />
                {{ $t('comment') }}
            </button>
            <button class="btn btn-sm btn-success ml-2 mt-2" @click="startFavorite">
                <font-awesome-icon icon="fa-solid fa-star" class="h-3 w-3" />
                {{ $t('favorite') }}
            </button>
            <button class="btn btn-sm btn-success ml-2 mt-2" @click="startView">
                <font-awesome-icon icon="fa-solid fa-eye" class="h-3 w-3" />
                {{ $t('view') }}
            </button>
            <button class="btn btn-sm btn-success ml-2 mt-2" @click="startShare">
                <font-awesome-icon icon="fa-solid fa-share" class="h-3 w-3" />
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
                <textarea class="textarea textarea-success grow  h-32 leading-tight"
                    :placeholder="$t('targetUsernameTips')" autocomplete="off" v-model="target_username"> </textarea>
            </div>
            <button class="btn btn-sm btn-primary ml-2" @click="startFollow">
                <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
                {{ $t('follow') }}
            </button>
            <button class="btn btn-sm btn-secondary ml-2" @click="startUnFollow">
                <font-awesome-icon icon="fa-solid fa-user-minus" class="h-3 w-3" />
                {{ $t('unFollow') }}
            </button>


        </div>

        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <dialog ref="deletePostDialog" class="modal">
        <div class="modal-box">
            <div class="flex flex-row items-center p-2">
                <span>
                    {{ $t('maxViews') }}:
                </span>
                <input class="input ring input-sm ml-2" type="number" v-model="maxViews"
                    :placeholder="$t('maxViews')" />

            </div>
            <div role="alert" class="alert col-span-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-info shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ $t('maxViewsTips') }}</span>
            </div>
            <button class="btn btn-md btn-error mt-2" @click="deletePost">
                {{ $t('delete') }}
            </button>
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
            target_post_url: '',
            maxViews: 0
        }
    },
    methods: {
        async open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        async deletePost() {
            await this.$emiter('run_now_by_account', { name: 'delete_post', args: { max_views: this.maxViews } })
            this.$refs.deletePostDialog.close()
        },
        async batchDM() {
            await this.$emiter('menuSelected', { name: 'messageSettings' });
        },
        async batchFO() {
            await this.$emiter('menuSelected', { name: 'followSettings' });
        },
        async startFillProfile() {
            await this.$emiter('menuSelected', { name: 'profileSettings' });

        },
        async startRegister() {
            await this.$emiter('menuSelected', { name: 'registerSettings' });
        },
        async logout() {
            let yes = await ask(this.$t('logoutConfirm'), this.$t('confirm'));
            if (yes) {
                await this.$emiter('adbEventData', { args: ['shell', 'pm', 'clear', this.settings.packagename] })
            }
        },
        async open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        filterTargetUsername() {
            if (this.target_username == '') {
                alert(this.$t('targetUsernameRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_username.split('\n').filter(line => line.trim() != '')
            if (lines.length == 0) {
                alert(this.$t('targetUsernameRequired'))
                return false;
            }
            //add @ to usernames
            lines = lines.map(line => {
                if (!line.startsWith('@')) {
                    return '@' + line
                }
                return line
            })
            this.target_username = lines.join('\n')
            return true;
        },
        filterTargetPostUrl() {
            if (this.target_post_url == '') {
                alert(this.$t('postUrlRequired'))
                return false;
            }
            //filter empty lines
            let lines = this.target_post_url.split('\n').filter(line => line.trim() != '')
            if (lines.length == 0) {
                alert(this.$t('postUrlRequired'))
                return false;
            }
            //remove query string
            lines = lines.map(line => {
                let url = new URL(line)
                return url.origin + url.pathname
            })
            this.target_post_url = lines.join('\n')
            return true;
        },
        async startFollow() {
            if (!this.filterTargetUsername()) {
                return;
            }

            await this.$emiter('run_now_by_account', { name: 'follow', args: { target_username: this.target_username } })
            this.$refs.userActionsDialog.close()
        },
        async startUnFollow() {
            if (!this.filterTargetUsername()) {
                return;
            }

            await this.$emiter('run_now_by_account', { name: 'unfollow', args: { target_username: this.target_username } })
            this.$refs.userActionsDialog.close()
        },
        async startScrape() {
            if (!this.filterTargetUsername()) {
                return;
            }
            await this.$emiter('run_now_by_account', { name: 'scrape_fans', args: { target_username: this.target_username } })
            this.$refs.scrapeUsersDialog.close()
        },
        async startShare() {
            if (!this.filterTargetPostUrl()) {
                return;
            }
            await this.$emiter('run_now_by_account', { name: 'share', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        async startLike() {
            if (!this.filterTargetPostUrl()) {
                return;
            }
            await this.$emiter('run_now_by_account', { name: 'like', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        async startComment() {
            if (!this.filterTargetPostUrl()) {
                return;
            }
            await this.$emiter('run_now_by_account', { name: 'comment', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        async startFavorite() {
            if (!this.filterTargetPostUrl()) {
                return;
            }
            await this.$emiter('run_now_by_account', { name: 'favorite', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },
        async startView() {
            if (!this.filterTargetPostUrl()) {
                return;
            }
            await this.$emiter('run_now_by_account', { name: 'view', args: { post_url: this.target_post_url } })

            this.$refs.shareDialog.close()
        },

        async app_install() {
            document.getElementById('app_install_input').click()
        },
        async on_app_install(e) {
            await this.$emiter('installApks', e.target.files)
        },
        async uploadVideo() {
            document.getElementById('upload_video_input').click()
        },
        async on_upload_video(e) {
            console.log(e.target.files)
            await this.$emiter('uploadFiles', e.target.files)
        },
    }
}
</script>