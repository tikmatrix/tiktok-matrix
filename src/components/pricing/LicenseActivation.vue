<template>
    <div class="flex items-center flex-row gap-2 w-full">
        <div class="flex-1">
            <div class="flex items-center gap-2">
                <div class="flex items-center gap-2 min-w-max">
                    <div class="w-1 h-6 bg-secondary rounded-full"></div>
                    <label class="font-semibold text-base">{{ $t('licenseCode') }}:</label>
                </div>
                <input type="text" placeholder="xxxx-xxxx-xxxx-xxxx" :disabled="license.leftdays > 0"
                    class="input input-md input-bordered flex-1 font-mono"
                    :class="license.leftdays > 0 ? 'bg-base-200' : 'focus:border-primary'"
                    v-model="license.license_code" />
                <button @click="$emit('activate', $event)"
                    class="btn btn-md btn-success hover:btn-success-focus transition-all duration-200"
                    v-if="license.leftdays <= 0">
                    <font-awesome-icon icon="fas fa-check" class="mr-1" />
                    {{ $t('activate') }}
                </button>
                <button @click="$emit('copy-text', license.license_code)"
                    class="btn btn-md btn-primary hover:btn-primary-focus transition-all duration-200" v-else>
                    <font-awesome-icon icon="fas fa-copy" class="mr-1" />
                    {{ $t('copy') }}
                </button>
            </div>

            <!-- 许可证状态信息 -->
            <div class="mt-1 flex items-center justify-between" v-if="license.leftdays > 0">
                <div class="badge badge-success gap-1">
                    <font-awesome-icon icon="fas fa-calendar-check" class="w-3 h-3" />
                    <span class="text-md">{{ $t('expiredAt', {
                        date: new Date(new Date().getTime() + license.leftdays * 24 * 60 * 60 *
                            1000).toLocaleDateString()
                    }) }}</span>
                </div>

                <!-- License迁移按钮 -->
                <button @click="$emit('show-license-migration')" v-if="license.is_stripe_active != 1"
                    class="btn btn-warning btn-md gap-1 hover:btn-warning-focus transition-all duration-200">
                    <div class="w-3 h-3 rounded-full bg-warning-content/20 flex items-center justify-center">
                        <font-awesome-icon icon="fas fa-exchange-alt" class="w-2 h-2 text-warning-content" />
                    </div>
                    <span class="text-md">{{ $t('migrateLicense') }}</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LicenseActivation',
    props: {
        license: {
            type: Object,
            required: true
        }
    },
    emits: ['activate', 'copy-text', 'show-license-migration']
}
</script>