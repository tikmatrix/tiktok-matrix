<template>
    <div class="bg-linear-to-br from-warning/10 to-error/10 rounded-xl shadow-md border border-warning/20 p-4 mb-4">
        <div class="text-center mb-4">
            <h3 class="text-xl font-bold text-warning mb-3">{{ $t('pendingPayment') }}</h3>

            <!-- 突出显示支付信息 -->
            <div class="bg-warning/20 rounded-lg p-3 mb-3 border border-warning/30">
                <div class="flex items-center justify-center gap-4 mb-2">
                    <div class="badge badge-primary badge-lg gap-2">
                        <font-awesome-icon icon="fas fa-network-wired" class="w-4 h-4" />
                        <span class="font-semibold">{{ order.network }}</span>
                    </div>
                    <div class="badge badge-success badge-lg gap-2">
                        <font-awesome-icon icon="fas fa-dollar-sign" class="w-4 h-4" />
                        <span class="font-semibold">{{ order.amount }} USDT</span>
                    </div>
                </div>

                <!-- 倒计时 -->
                <CountdownTimer :remaining-time="remainingTime" @close-order="$emit('close-order')" />
            </div>
        </div>

        <!-- QR码和地址 -->
        <div class="flex flex-col items-center gap-4">
            <QRCodeDisplay :qr-code="order.qrcode" />

            <PaymentAddress :address="order.to_address" @copy-text="$emit('copy-text', $event)" />

            <!-- 支付提示 -->
            <PaymentTips :network="order.network" :amount="order.amount" />
        </div>
    </div>
</template>

<script>
import CountdownTimer from './CountdownTimer.vue'
import QRCodeDisplay from './QRCodeDisplay.vue'
import PaymentAddress from './PaymentAddress.vue'
import PaymentTips from './PaymentTips.vue'

export default {
    name: 'OrderDisplay',
    components: {
        CountdownTimer,
        QRCodeDisplay,
        PaymentAddress,
        PaymentTips
    },
    props: {
        order: {
            type: Object,
            required: true
        },
        remainingTime: {
            type: Number,
            required: true
        }
    },
    emits: ['close-order', 'copy-text']
}
</script>