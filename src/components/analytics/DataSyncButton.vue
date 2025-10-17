<template>
    <button class="btn btn-md btn-ghost btn-circle" @click="$emit('sync')" :disabled="loading"
        :title="$t('syncTikTokData')">
        <span v-if="loading" class="loading loading-spinner text-info"></span>
        <font-awesome-icon v-else icon="fa-solid fa-sync" class="text-info" />
    </button>
</template>

<script>
export default {
    name: 'DataSyncButton',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['sync']
}
</script>
