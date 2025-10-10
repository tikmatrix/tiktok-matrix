<template>
    <div class="flex items-center gap-2">
        <a class="btn btn-outline btn-xs btn-info hover:btn-info transition-all duration-200 flex items-center gap-1"
            :href="supportTelegram" target="_blank" v-if="supportTelegram">
            <font-awesome-icon icon="fab fa-telegram" class="text-sm" />
            {{ $t('telegramSupport') }}
        </a>
        <a class="btn btn-outline btn-xs btn-success hover:btn-success transition-all duration-200 flex items-center gap-1"
            :href="supportWhatsapp" target="_blank" v-if="supportWhatsapp">
            <font-awesome-icon icon="fab fa-whatsapp" class="text-sm" />
            {{ $t('whatsappSupport') }}
        </a>
        <button
            class="btn btn-outline btn-xs btn-secondary hover:btn-secondary transition-all duration-200 flex items-center gap-1"
            @click="copyEmail" v-if="supportEmail">
            <font-awesome-icon icon="fas fa-envelope" class="text-sm" />
            <span class="hidden sm:inline">{{ supportEmail }}</span>
            <span class="sm:hidden">Email</span>
        </button>
    </div>
</template>

<script>
export default {
    name: 'ContactSupport',
    emits: ['copy-text'],
    data() {
        return {
            supportEmail: 'support@tikmatrix.com',
            supportTelegram: 'https://t.me/tikmatrix',
            supportWhatsapp: ''
        }
    },
    methods: {
        copyEmail() {
            this.$emit('copy-text', this.supportEmail)
        }
    }
}
</script>