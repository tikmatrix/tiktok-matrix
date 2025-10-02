<template>
    <div class="flex items-center gap-2">
        <a class="btn btn-outline btn-xs btn-info hover:btn-info transition-all duration-200 flex items-center gap-1"
            href="https://t.me/tikmatrix" target="_blank">
            <font-awesome-icon icon="fab fa-telegram" class="text-sm" />
            {{ $t('telegramSupport') }}
        </a>
        <button
            class="btn btn-outline btn-xs btn-secondary hover:btn-secondary transition-all duration-200 flex items-center gap-1"
            @click="copyEmail">
            <font-awesome-icon icon="fas fa-envelope" class="text-sm" />
            <span class="hidden sm:inline">support@tikmatrix.com</span>
            <span class="sm:hidden">Email</span>
        </button>
    </div>
</template>

<script>
export default {
    name: 'ContactSupport',
    emits: ['copy-text'],
    methods: {
        copyEmail() {
            this.$emit('copy-text', 'support@tikmatrix.com')
        }
    }
}
</script>