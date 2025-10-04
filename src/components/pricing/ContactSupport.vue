<template>
    <div class="flex items-center gap-2">
        <a class="link link-primary text-md flex items-center gap-1 min-w-max" href="https://wa.me/6588387587"
            target="_blank">
            <font-awesome-icon icon="fab fa-whatsapp" class="h-5 w-5" />
            WhatsApp Support
        </a>
        <button
            class="btn btn-outline btn-xs btn-secondary hover:btn-secondary transition-all duration-200 flex items-center gap-1"
            @click="copyEmail">
            <font-awesome-icon icon="fas fa-envelope" class="text-sm" />
            <span class="hidden sm:inline">admin@tikzenx.com</span>
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
            this.$emit('copy-text', 'admin@tikzenx.com')
        }
    }
}
</script>