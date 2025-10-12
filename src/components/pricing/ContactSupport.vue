<template>
    <div class="flex items-center gap-2">
        <button class="btn btn-outline btn-xs btn-info shrink whitespace-nowrap"
            :href="whitelabelConfig.branding?.telegramSupport" target="_blank"
            v-if="whitelabelConfig.branding?.telegramSupport">
            <font-awesome-icon icon="fab fa-telegram" class="text-sm" />
            {{ $t('telegramSupport') }}
        </button>
        <button class="btn btn-outline btn-xs btn-success shrink whitespace-nowrap"
            :href="whitelabelConfig.branding?.whatsappSupport" target="_blank"
            v-if="whitelabelConfig.branding?.whatsappSupport">
            <font-awesome-icon icon="fab fa-whatsapp" class="text-sm" />
            {{ $t('whatsappSupport') }}
        </button>
        <button class="btn btn-outline btn-xs btn-secondary shrink" @click="copyEmail"
            v-if="whitelabelConfig.branding?.emailSupport">
            <font-awesome-icon icon="fas fa-envelope" class="text-sm" />
            <span class="hidden lg:inline " :title="whitelabelConfig.branding?.emailSupport">{{
                whitelabelConfig.branding?.emailSupport }}</span>
        </button>
    </div>
</template>

<script>
import { getWhiteLabelConfig } from '../../config/whitelabel.js';
import { writeText } from '@tauri-apps/api/clipboard';
export default {
    name: 'ContactSupport',
    data() {
        return {
            whitelabelConfig: getWhiteLabelConfig(),
        }
    },
    methods: {
        async copyEmail() {
            await writeText(this.whitelabelConfig.branding?.emailSupport);
            await this.$emiter('NOTIFY', {
                type: 'success',
                message: this.$t('copied'),
                timeout: 2000
            });
        }
    }
}
</script>