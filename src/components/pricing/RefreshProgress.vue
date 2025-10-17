<template>
    <div class="w-full max-w-md">
        <progress class="progress progress-primary w-full" :value="refreshTime" max="10"></progress>
        <p class="text-center text-md text-base-content/70 mt-1">
            {{ $t('autoRefreshIn') }} {{ refreshTime }}s
        </p>
    </div>
</template>

<script>
export default {
    name: 'RefreshProgress',
    props: {
        refreshTime: {
            type: Number,
            required: true
        }
    }
}
</script>