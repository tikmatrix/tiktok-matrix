<template>
    <button @click="handleCreateOrder"
        class="btn btn-outline btn-block btn-md hover:btn-secondary transition-all duration-200 flex items-center justify-center gap-2">
        <TronIcon class="w-4 h-4 fill-current" />
        <span>{{ $t('usdtPayment') }} (TRC20)</span>
    </button>
</template>

<script>
import TronIcon from '../icons/TronIcon.vue'

export default {
    name: 'UsdtPaymentButton',
    components: {
        TronIcon
    },
    props: {
        amount: {
            type: Number,
            required: true
        },
        planId: {
            type: String,
            required: true
        },
        planInterval: {
            type: String,
            required: true
        }
    },
    emits: ['create-order'],
    methods: {
        handleCreateOrder() {
            // Always use TRC20
            this.$emit('create-order', this.amount, this.planId, this.planInterval, 'TRC20')
        }
    }
}
</script>