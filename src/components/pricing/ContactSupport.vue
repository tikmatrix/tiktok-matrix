<template>
    <div class="flex items-center gap-2">
        <a class="btn btn-outline btn-xs btn-info hover:btn-info transition-all duration-200 flex items-center gap-1"
            :href="whitelabelConfig.branding?.telegramSupport" target="_blank"
            v-if="whitelabelConfig.branding?.telegramSupport">
            <font-awesome-icon icon="fab fa-telegram" class="text-sm" />
            {{ $t('telegramSupport') }}
        </a>
        <a class="btn btn-outline btn-xs btn-success hover:btn-success transition-all duration-200 flex items-center gap-1"
            :href="whitelabelConfig.branding?.whatsappSupport" target="_blank"
            v-if="whitelabelConfig.branding?.whatsappSupport">
            <font-awesome-icon icon="fab fa-whatsapp" class="text-sm" />
            {{ $t('whatsappSupport') }}
        </a>
        <button
            class="btn btn-outline btn-xs btn-secondary hover:btn-secondary transition-all duration-200 flex items-center gap-1"
            @click="copyEmail" v-if="whitelabelConfig.branding?.emailSupport">
            <font-awesome-icon icon="fas fa-envelope" class="text-sm" />
            <span class="hidden sm:inline">{{ whitelabelConfig.branding?.emailSupport }}</span>
            <span class="sm:hidden">Email</span>
        </button>
    </div>
</template>

<script>
import { getWhiteLabelConfig } from '../../config/whitelabel.js';
export default {
    name: 'ContactSupport',
    emits: ['copy-text'],
    data() {
        return {
            whitelabelConfig: getWhiteLabelConfig(),
        }
    },
    methods: {
        copyEmail() {
            this.$emit('copy-text', this.whitelabelConfig.branding?.emailSupport);
        }
    }
}
</script>