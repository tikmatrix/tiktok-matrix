<template>
    <div class="w-full max-w-xl">
        <label class="label py-1">
            <span class="label-text font-medium text-md">{{ $t('depositAddress') }}</span>
        </label>
        <div class="join w-full">
            <input type="text" class="input input-md input-bordered join-item flex-1 font-mono bg-base-200 text-center"
                :value="address" readonly disabled />
            <button @click="$emit('copy-text', address)"
                class="btn btn-md btn-primary join-item hover:btn-primary-focus transition-all duration-200">
                <font-awesome-icon icon="fas fa-copy" class="mr-1" />
                {{ $t('copy') }}
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PaymentAddress',
    props: {
        address: {
            type: String,
            required: true
        }
    },
    emits: ['copy-text']
}
</script>