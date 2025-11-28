<template>
    <button v-if="isLoading"
        class="btn btn-md flex items-center gap-2 px-4 py-1.5 rounded-full btn-neutral cursor-pointer shadow-md">
        <font-awesome-icon icon="fa-solid fa-spinner" class="h-4 w-4 animate-spin" />
        <span class="font-semibold whitespace-nowrap">{{ $t('loading') }}</span>
    </button>

    <div v-else-if="!isLicensed" class="flex items-center gap-2">
        <div class="tooltip tooltip-bottom" :data-tip="$t('licenseInactiveShort')">
            <button class="btn btn-md btn-warning text-warning-content shadow whitespace-nowrap"
                @click="$emit('open-license')">
                <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="h-4 w-4" />
                {{ $t('activateNow') }}
            </button>
        </div>

        <ContactSupport />
    </div>

    <button v-else
        class="btn btn-md flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer bg-linear-to-r from-emerald-500 to-teal-600 text-white border-none"
        @click="$emit('open-license')">
        <font-awesome-icon icon="fa-solid fa-crown" class="h-5 w-5 text-yellow-200" />
        <span class="font-semibold whitespace-nowrap">{{ licenseData.plan_name }}</span>
        <div class="flex items-center flex-row gap-2 w-full" v-if="Number(licenseData.is_stripe_active) === 1">
            <label class="text-md text-yellow-100" v-if="licenseData.stripe_cancel_at">
                {{ $t('cancelTips', { date: formatTimestamp(licenseData.stripe_cancel_at) }) }}
            </label>
            <label class="text-md text-yellow-100" v-else>
                {{ $t('renewTips', { date: formatTimestamp(licenseData.stripe_renew_at) }) }}
            </label>
        </div>
        <div class="flex items-center flex-row gap-2 w-full" v-else>
            <label class="text-md text-yellow-100" v-if="licenseData.leftdays > 0">
                {{ $t('expiredTips', { date: formatDaysAhead(licenseData.leftdays) }) }}
            </label>
        </div>
    </button>
</template>

<script>
import ContactSupport from './pricing/ContactSupport.vue'

export default {
    name: 'LicenseLifecycle',
    components: {
        ContactSupport
    },
    props: {
        isLoading: {
            type: Boolean,
            default: false
        },

        licenseData: {
            type: Object,
            default: () => ({})
        }
    },
    emits: ['open-license'],
    computed: {
        isLicensed() {
            return this.licenseData.leftdays > 0 || this.licenseData.is_stripe_active == 1;
        },
    },
    methods: {

        formatTimestamp(seconds) {
            if (!seconds) {
                return ''
            }
            return new Date(Number(seconds) * 1000).toLocaleDateString()
        },
        formatDaysAhead(days) {
            if (!days) {
                return ''
            }
            const ms = Number(days) * 24 * 60 * 60 * 1000
            return new Date(Date.now() + ms).toLocaleDateString()
        },

    }
}
</script>
