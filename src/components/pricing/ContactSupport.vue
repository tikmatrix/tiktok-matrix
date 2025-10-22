<template>
    <div class="flex items-center gap-2">
        <a class="btn btn-outline btn-md btn-info shrink whitespace-nowrap"
            :href="whitelabelConfig.branding?.telegramSupport" target="_blank"
            v-if="whitelabelConfig.branding?.telegramSupport">
            <font-awesome-icon icon="fab fa-telegram" class="text-md" />
            {{ $t('telegramSupport') }}
        </a>
        <a class="btn btn-outline btn-md btn-success shrink whitespace-nowrap"
            :href="whitelabelConfig.branding?.whatsappSupport" target="_blank"
            v-if="whitelabelConfig.branding?.whatsappSupport">
            <font-awesome-icon icon="fab fa-whatsapp" class="text-md" />
            {{ $t('whatsappSupport') }}
        </a>
        <button class="btn btn-outline btn-md btn-secondary shrink" @click="copyEmail"
            v-if="whitelabelConfig.branding?.emailSupport">
            <font-awesome-icon icon="fas fa-envelope" class="text-md" />
            <span class="hidden lg:inline " :title="whitelabelConfig.branding?.emailSupport">{{
                whitelabelConfig.branding?.emailSupport }}</span>
        </button>
    </div>
</template>

<script>
import { getWhiteLabelConfig, cloneDefaultWhiteLabelConfig } from '../../config/whitelabel.js';
import { writeText } from '@tauri-apps/api/clipboard';
export default {
    name: 'ContactSupport',
    data() {
        return {
            whitelabelConfig: cloneDefaultWhiteLabelConfig(),
        }
    },
    async created() {
        const config = await getWhiteLabelConfig();
        if (config) {
            this.whitelabelConfig = config;
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
