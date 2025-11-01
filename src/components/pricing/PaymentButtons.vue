<template>
    <div class="space-y-2">
        <!-- 主要订阅按钮 -->
        <button v-if="license.is_stripe_active == 1" @click="$emit('manage-subscription')"
            class="btn btn-success btn-block btn-md hover:btn-success-focus transition-all duration-200">
            <font-awesome-icon icon="fas fa-cog" class="mr-1 w-3 h-3" />
            {{ $t('manageSubscription') }}
        </button>

        <button v-else @click="handleStripeCheckout"
            class="btn btn-outline btn-block btn-md hover:btn-secondary-focus transition-all duration-200"
            :class="stripeButtonClass">
            <div class="flex items-center justify-center gap-2">
                <font-awesome-icon icon="fas fa-credit-card" class="w-4 h-4" />
                <span>{{ $t('creditCard') }}</span>
            </div>
        </button>

        <!-- 支付宝支付按钮 -->
        <button v-if="license.is_stripe_active == 0" @click="handleAlipayCheckout"
            class="btn btn-outline btn-block btn-md hover:btn-secondary-focus transition-all duration-200">
            <div class="flex items-center justify-center gap-2">
                <font-awesome-icon icon="fab fa-alipay" class="w-4 h-4" />
                <span>{{ $t('alipayPayment') }}</span>
            </div>
        </button>

        <!-- USDT支付选项 -->
        <div v-if="license.is_stripe_active == 0" ref="usdtDropdown"
            :class="['dropdown', 'dropdown-top', 'w-full', { 'dropdown-open': showNetworkOptions }]">
            <button @click.stop="toggleNetworkOptions"
                class="btn btn-outline btn-block btn-md hover:btn-secondary transition-all duration-200 flex items-center justify-center gap-2">
                <font-awesome-icon icon="fas fa-coins" class="w-4 h-4" />
                <span>{{ $t('usdtPayment') }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            <div tabindex="0" class="dropdown-content z-[1] w-full">
                <div class="p-2 space-y-2 bg-base-100 rounded-box shadow">
                    <UsdtPaymentButton network="TRC20" :amount="amount" :plan-id="planId" :plan-interval="planInterval"
                        @create-order="handleNetworkOrder" />

                    <UsdtPaymentButton network="BEP20" :amount="amount" :plan-id="planId" :plan-interval="planInterval"
                        @create-order="handleNetworkOrder" />
                </div>
            </div>
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
    emits: ['manage-subscription', 'create-stripe-checkout', 'create-alipay-checkout', 'create-order'],
    data() {
        return {
            showNetworkOptions: false
        }
    },
    computed: {
        stripeButtonClass() {
            // Use outline base style; keep empty so we don't add solid color classes that conflict
            return ''
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside)
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
    },
    methods: {
        handleStripeCheckout() {
            this.$emit('create-stripe-checkout', this.priceId, this.planInterval);
        },
        handleCreateOrder(price, planId, planInterval, network) {
            this.$emit('create-order', price, planId, planInterval, network);
        },
        handleAlipayCheckout() {
            this.$emit('create-alipay-checkout', this.planId, this.planInterval);
        },
        toggleNetworkOptions() {
            this.showNetworkOptions = !this.showNetworkOptions
        },
        handleNetworkOrder(price, planId, planInterval, network) {
            this.showNetworkOptions = false
            this.handleCreateOrder(price, planId, planInterval, network)
        },
        handleClickOutside(event) {
            if (this.showNetworkOptions) {
                const dropdown = this.$refs.usdtDropdown
                if (dropdown && !dropdown.contains(event.target)) {
                    this.showNetworkOptions = false
                }
            }
        }
    }
}
</script>