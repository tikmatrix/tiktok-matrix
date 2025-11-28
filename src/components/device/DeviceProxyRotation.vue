<template>
    <dialog ref="modal" class="modal">
        <div class="modal-box bg-base-300 max-w-3xl">
            <h3 class="font-bold text-lg mb-4">{{ $t('proxyRotationConfig') }}
                <span v-if="form.device_label" class="text-sm text-base-content/70 ml-2">({{ form.device_label
                    }})</span>
            </h3>
            <form class="space-y-4" @submit.prevent="onSave">
                <div class="form-control">
                    <label class="label"><span class="label-text font-semibold">{{ $t('proxyRotationUrl')
                            }}</span></label>
                    <input class="input input-bordered input-md w-full" type="url" v-model.trim="form.rotation_url"
                        required />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-control">
                        <label class="label"><span class="label-text font-semibold">{{ $t('requestMethod')
                                }}</span></label>
                        <select class="select select-bordered" v-model="form.method">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label class="label"><span class="label-text font-semibold">{{ $t('requestTimeout')
                                }}</span></label>
                        <input class="input input-bordered input-md" type="number" min="1000"
                            v-model.number="form.timeout_ms" />
                    </div>
                </div>

                <div class="form-control">
                    <label class="label"><span class="label-text font-semibold">{{ $t('requestHeadersJson')
                            }}</span></label>
                    <textarea class="textarea textarea-bordered font-mono" rows="4" v-model.trim="form.headers_json"
                        :placeholder="$t('requestHeadersPlaceholder', { authorizationHeader: requestHeadersSample })"></textarea>
                </div>

                <div class="form-control" v-if="form.method === 'POST'">
                    <label class="label"><span class="label-text font-semibold">{{ $t('requestBodyJson')
                            }}</span></label>
                    <textarea class="textarea textarea-bordered font-mono" rows="4" v-model.trim="form.body_json"
                        :placeholder="$t('requestBodyPlaceholder')"></textarea>
                </div>

                <div class="modal-action">
                    <button type="button" class="btn" @click="onClose">{{ $t('cancel') }}</button>
                    <button type="button" class="btn btn-error" v-if="canClear" @click="onClear">{{
                        $t('clearConfiguration') }}</button>
                    <button type="submit" class="btn btn-primary" :class="{ 'loading': saving }">
                        <span v-if="!saving">{{ $t('save') }}</span>
                    </button>
                </div>
            </form>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
</template>

<script>
export default {
    name: 'DeviceProxyRotation',
    props: {},
    data() {
        return {
            form: {
                device_serial: '',
                device_label: '',
                rotation_url: '',
                method: 'GET',
                headers_json: '',
                body_json: '',
                timeout_ms: 10000,
            },
            saving: false,
            requestHeadersSample: '{ "Authorization": "Bearer token" }'
        }
    },
    computed: {
        canClear() {
            return !!this.form.device_serial
        }
    },
    methods: {
        show(config = {}) {
            // Fill form from provided config
            this.form = Object.assign({
                device_serial: '',
                device_label: '',
                rotation_url: '',
                method: 'GET',
                headers_json: '',
                body_json: '',
                timeout_ms: 10000,
            }, config)
            // show the underlying dialog element
            if (this.$refs.modal?.showModal) {
                this.$refs.modal.showModal()
            } else if (this.$refs.modal?.show) {
                this.$refs.modal.show()
            }
        },
        close() {
            if (this.$refs.modal?.close) {
                this.$refs.modal.close()
            }
        },
        onClose() {
            this.close()
            this.$emit('cancel')
        },
        onClear() {
            const serial = this.form.device_serial
            this.close()
            this.$emit('clear', serial)
        },
        async onSave() {
            this.saving = true
            try {
                // emit raw form back to parent for parsing/persisting
                this.$emit('save', { ...this.form })
                this.close()
            } catch (err) {
                // emit error up for notification
                this.$emit('error', err)
            } finally {
                this.saving = false
            }
        }
    }
}
</script>
