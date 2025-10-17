<template>
    <div class="flex items-center justify-center gap-3">
        <div class="text-error font-mono text-xl font-bold countdown">
            {{ formattedTime }}
        </div>
        <button @click="$emit('close-order')"
            class="btn btn-md btn-outline btn-error hover:btn-error hover:text-white transition-all duration-200 gap-1">
            <font-awesome-icon icon="fas fa-times-circle" class="w-4 h-4" />
            {{ $t('closeOrder') }}
        </button>
    </div>
    <p class="text-md text-base-content/70 mt-1">{{ $t('paymentTimeRemaining') }}</p>
</template>

<script>
export default {
    name: 'CountdownTimer',
    props: {
        remainingTime: {
            type: Number,
            required: true
        }
    },
    emits: ['close-order'],
    computed: {
        formattedTime() {
            const minutes = Math.floor((this.remainingTime % 3600) / 60).toString().padStart(2, '0')
            const seconds = (this.remainingTime % 60).toString().padStart(2, '0')
            return `${minutes}:${seconds}`
        }
    }
}
</script>