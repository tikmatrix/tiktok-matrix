<template>
    <button @click="handleCreateOrder"
        class="btn btn-outline btn-block btn-xs hover:btn-secondary transition-all duration-200" :class="buttonClass">
        <component :is="iconComponent" class="w-3 h-3 mr-1 fill-current" />
        {{ buttonText }}
    </button>
</template>

<script>
export default {
    name: 'UsdtPaymentButton',
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
    computed: {
        buttonClass() {
            return this.network === 'TRC20' ? 'btn-secondary' : 'btn-warning'
        },
        buttonText() {
            return this.network === 'TRC20' ? this.$t('usdttrc20') : this.$t('usdtbep20')
        },
        iconComponent() {
            return this.network === 'TRC20' ? 'TronIcon' : 'BscIcon'
        }
    },
    methods: {
        handleCreateOrder() {
            this.$emit('create-order', this.amount, this.planId, this.planInterval, this.network)
        }
    },
    components: {
        TronIcon: {
            template: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
          <path d="M61.55,19.28c-3-2.77-7.15-7-10.53-10l-.2-.14a3.82,3.82,0,0,0-1.11-.62l0,0C41.56,7,3.63-.09,2.89,0a1.4,1.4,0,0,0-.58.22L2.12.37a2.23,2.23,0,0,0-.52.84l-.05.13v.71l0,.11C5.82,14.05,22.68,53,26,62.14c.2.62.58,1.8,1.29,1.86h.16c.38,0,2-2.14,2-2.14S58.41,26.74,61.34,23a9.46,9.46,0,0,0,1-1.48A2.41,2.41,0,0,0,61.55,19.28ZM36.88,23.37,49.24,13.12l7.25,6.68Zm-4.8-.67L10.8,5.26l34.43,6.35ZM34,27.27l21.78-3.51-24.9,30ZM7.91,7,30.3,26,27.06,53.78Z" />
        </svg>
      `
        },
        BscIcon: {
            template: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 336.41 337.42">
          <g>
            <path d="M168.2.71l41.5,42.5L105.2,147.71l-41.5-41.5Z" />
            <path d="M231.2,63.71l41.5,42.5L105.2,273.71l-41.5-41.5Z" />
            <path d="M42.2,126.71l41.5,42.5-41.5,41.5L.7,169.21Z" />
            <path d="M294.2,126.71l41.5,42.5L168.2,336.71l-41.5-41.5Z" />
          </g>
        </svg>
      `
        }
    }
}
</script>