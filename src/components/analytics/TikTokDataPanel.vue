<template>
    <div class="flex items-center gap-2">
        <span v-if="loading" class="loading loading-spinner loading-xs"></span>
        <template v-else-if="data">
            <span class="badge badge-accent">{{ formatValue(data) }}</span>
        </template>
        <template v-else>
            <span class="text-base-content">{{ fallback || '-' }}</span>
        </template>
    </div>
</template>

<script>
export default {
    name: 'TikTokDataPanel',
    props: {
        data: {
            type: [String, Number],
            default: null
        },
        fallback: {
            type: [String, Number],
            default: '-'
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        formatValue(val) {
            if (val === null || val === undefined) return '-';
            return val;
        }
    }
}
</script>
