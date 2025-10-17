<template>
    <button @click="handleCreateOrder"
        class="btn btn-outline btn-block btn-md hover:btn-secondary transition-all duration-200" :class="buttonClass">
        <component :is="iconComponent" class="w-3 h-3 mr-1 fill-current" />
        {{ buttonText }}
    </button>
</template>

<script>
import TronIcon from '../icons/TronIcon.vue'
import BscIcon from '../icons/BscIcon.vue'

export default {
    name: 'UsdtPaymentButton',
    components: {
        TronIcon,
        BscIcon
    },
    props: {
        network: {
            type: String,
            required: true,
            validator: value => ['TRC20', 'BEP20'].includes(value)
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
        }
    },
    emits: ['create-order'],
    data() {
        return {
            // Cache translated texts in data to avoid calling $t in computed
            trc20Text: '',
            bep20Text: ''
        }
    },
    created() {
        // Initialize translations in lifecycle hook where $t is safe to use
        this.trc20Text = this.$t('usdttrc20')
        this.bep20Text = this.$t('usdtbep20')
    },
    computed: {
        buttonClass() {
            return this.network === 'TRC20' ? 'btn-secondary' : 'btn-warning'
        },
        buttonText() {
            return this.network === 'TRC20' ? this.trc20Text : this.bep20Text
        },
        iconComponent() {
            return this.network === 'TRC20' ? 'TronIcon' : 'BscIcon'
        }
    },
    methods: {
        handleCreateOrder() {
            this.$emit('create-order', this.amount, this.planId, this.planInterval, this.network)
        }
    }
}
</script>