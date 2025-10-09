<template>
    <div class="bg-base-100 rounded-xl shadow-md p-4 mb-4 border border-base-300">
        <div class="flex items-start flex-col w-full gap-3">
            <!-- MID 信息行 -->
            <div class="flex items-center flex-row gap-2 w-full">
                <div class="flex items-center gap-2 min-w-max">
                    <div class="w-1 h-6 bg-primary rounded-full"></div>
                    <label class="font-semibold text-base">{{ $t('mid') }}:</label>
                </div>
                <div class="flex-1 flex items-center gap-2">
                    <input id="mid" type="text" placeholder="mid"
                        class="input input-sm input-bordered flex-1 bg-base-200 text-center font-mono"
                        :value="license.mid" readonly disabled />
                    <span v-if="!license.mid" class="text-warning text-xs">{{ $t('networkProblem') }}</span>
                    <button @click="copyText(license.mid)"
                        class="btn btn-sm btn-primary hover:btn-primary-focus transition-all duration-200">
                        <font-awesome-icon icon="fas fa-copy" class="mr-1" />
                        {{ $t('copy') }}
                    </button>
                </div>

                <!-- 联系支持链接 -->
                <ContactSupport @copy-text="copyText" />
            </div>

            <!-- 订阅状态显示 -->
            <SubscriptionStatus v-if="license.is_stripe_active == 1" :license="license"
                @manage-subscription="$emit('manage-subscription')"
                @show-license-migration="$emit('show-license-migration')" />

            <!-- 许可证激活区域 -->
            <LicenseActivation v-else :license="license" @activate="$emit('activate', $event)"
                @show-license-migration="$emit('show-license-migration')" @copy-text="copyText" />
        </div>
    </div>
</template>

<script>
import ContactSupport from './ContactSupport.vue'
import SubscriptionStatus from './SubscriptionStatus.vue'
import LicenseActivation from './LicenseActivation.vue'

export default {
    name: 'UserInfoCard',
    components: {
        ContactSupport,
        SubscriptionStatus,
        LicenseActivation
    },
    props: {
        license: {
            type: Object,
            required: true
        }
    },
    emits: ['manage-subscription', 'show-license-migration', 'activate', 'copy-text'],
    methods: {
        async copyText(text) {
            this.$emit('copy-text', text);
        }
    }
}
</script>