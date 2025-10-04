<template>
    <div class="space-y-2">
        <!-- 主要订阅按钮 -->
        <button v-if="license.is_stripe_active == 1" @click="$emit('manage-subscription')"
            class="btn btn-success btn-block btn-sm hover:btn-success-focus transition-all duration-200">
            <font-awesome-icon icon="fas fa-cog" class="mr-1 w-3 h-3" />
            {{ $t('manageSubscription') }}
        </button>

        <button v-else @click="handleStripeCheckout"
            class="btn btn-block btn-sm hover:btn-primary-focus transition-all duration-200" :class="stripeButtonClass">
            <div class="flex items-center justify-center gap-1">
                <div class="flex -space-x-0.5">
                    <font-awesome-icon icon="fas fa-credit-card" class="text-sm" />
                    <font-awesome-icon icon="fab fa-cc-visa" class="text-sm" />
                    <font-awesome-icon icon="fab fa-cc-mastercard" class="text-sm" />
                </div>
                <span>{{ $t('subscribe') }}</span>
            </div>
        </button>

        <!-- USDT支付选项 -->
        <div v-if="license.is_stripe_active == 0" class="space-y-1">
            <UsdtPaymentButton network="TRC20" :amount="amount" :plan-id="planId" :plan-interval="planInterval"
                @create-order="handleCreateOrder" />

            <UsdtPaymentButton network="BEP20" :amount="amount" :plan-id="planId" :plan-interval="planInterval"
                @create-order="handleCreateOrder" />
        </div>
    </div>
</template>

<script>
import UsdtPaymentButton from './UsdtPaymentButton.vue'

export default {
    name: 'PaymentButtons',
    components: {
        UsdtPaymentButton
    },
    props: {
        license: {
            type: Object,
            required: true
        },
        priceId: {
            type: String,
            required: true
        },
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
        },
        planType: {
            type: String,
            default: 'monthly'
        }
    },
    emits: ['manage-subscription', 'create-stripe-checkout', 'create-order'],
    computed: {
        stripeButtonClass() {
            return this.planType === 'monthly' ? 'btn-primary' : 'btn-accent'
        }
    },
    methods: {
        handleStripeCheckout() {
            this.$emit('create-stripe-checkout', this.priceId, this.planInterval);
        },
        handleCreateOrder(price, planId, planInterval, network) {
            this.$emit('create-order', price, planId, planInterval, network);
        }
    }
}
</script>