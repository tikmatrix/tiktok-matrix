<template>
    <div class="bg-base-100 rounded-lg shadow-sm p-3 border border-base-300">
        <div class="flex items-center justify-center">
            <div class="form-control">
                <label class="label cursor-pointer flex items-center gap-2">
                    <input type="checkbox" id="agreePolicy" :checked="modelValue"
                        @change="$emit('update:modelValue', $event.target.checked)"
                        class="checkbox checkbox-primary checkbox-sm" />
                    <span class="label-text text-sm">
                        {{ $t('iAgreeWith') }}
                        <a href="https://tikmatrix.com/privacy-policy" target="_blank"
                            class="link link-primary font-medium hover:link-hover transition-all duration-200">
                            {{ $t('privacyPolicy') }}
                        </a>
                        {{ $t('and') }}
                        <a href="https://tikmatrix.com/terms-of-service" target="_blank"
                            class="link link-primary font-medium hover:link-hover transition-all duration-200">
                            {{ $t('termsOfService') }}
                        </a>
                    </span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PrivacyAgreement',
    props: {
        modelValue: {
            type: Boolean,
            required: true
        }
    },
    emits: ['update:modelValue']
}
</script>