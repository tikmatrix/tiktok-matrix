<template>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'trainJobs' })">
        <font-awesome-icon icon="random" class="h-3 w-3" />{{ $t('trainJobs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'publishJobs' })">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3" />{{ $t('publishJobs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'messageJobs' })">
        <font-awesome-icon icon="fa-solid fa-message" class="h-3 w-3" />{{ $t('messageJobs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'shareJobs' })">
        <font-awesome-icon icon="fa-solid fa-share" class="h-3 w-3" />{{ $t('shareJobs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'followJobs' })">
        <font-awesome-icon icon="fa fa-user-plus" class="h-3 w-3" />{{ $t('followJobs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('menuSelected', { name: 'scrapeFansJobs' })">
        <font-awesome-icon icon="fas fa-spider" class="h-3 w-3" />{{ $t('scrapeFansJobs') }}
    </button>
    <button
        class="btn btn-sm bg-blue-500 hover:bg-blue-300 border-0 text-white text-xs block font-normal ml-1 mb-1 min-w-max"
        @click="$emitter.emit('stop_task')">
        <font-awesome-icon icon="fa fa-stop" class="h-3 w-3 text-pink-500" />{{ $t('stopTask') }}
    </button>

</template>
<script>
import { invoke } from "@tauri-apps/api/tauri";
export default {
    name: 'Tools',
    props: ['settings'],
    data() {
        return {
            tartget_username: '',
        }
    },
    methods: {
        open_dir(name) {
            invoke("open_dir", {
                name
            });
        },
        startScrape() {
            this.$emitter.emit('scrape_fans', this.tartget_username)
        },
        scrapeUsers() {
            this.$refs.scrapeUsersDialog.showModal()
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