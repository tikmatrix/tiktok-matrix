<template>
    <div class="flex items-center flex-row gap-2 w-full">
        <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
                <div class="badge badge-success badge-md gap-1 px-3 py-2">
                    <font-awesome-icon icon="fa-solid fa-crown" class="text-yellow-300 text-sm" />
                    <span class="font-medium">{{ license.plan_name }}</span>
                </div>

                <button @click="$emit('manage-subscription')"
                    class="btn btn-primary btn-sm hover:btn-primary-focus transition-all duration-200">
                    <font-awesome-icon icon="fas fa-cog" class="mr-1" />
                    {{ $t('manageSubscription') }}
                </button>

                <button @click="$emit('show-license-migration')"
                    class="btn btn-outline btn-warning btn-sm hover:btn-warning transition-all duration-200">
                    <font-awesome-icon icon="fas fa-exchange-alt" class="mr-1 w-3 h-3" />
                    {{ $t('migrateLicense') }}
                </button>

                <!-- 订阅状态信息 -->
                <div class="text-xs" v-if="license.stripe_cancel_at">
                    <div class="badge badge-warning gap-1">
                        <font-awesome-icon icon="fas fa-exclamation-triangle" class="w-3 h-3" />
                        {{ $t('cancelAt', {
                            date: new Date(license.stripe_cancel_at * 1000).toLocaleDateString()
                        }) }}
                    </div>
                </div>
                <div class="text-xs" v-else>
                    <div class="badge badge-info gap-1">
                        <font-awesome-icon icon="fas fa-calendar-alt" class="w-3 h-3" />
                        {{ $t('renewAt', {
                            date: new Date(license.stripe_renew_at * 1000).toLocaleDateString()
                        }) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SubscriptionStatus',
    props: {
        license: {
            type: Object,
            required: true
        }
    },
    emits: ['manage-subscription', 'show-license-migration']
}
</script>