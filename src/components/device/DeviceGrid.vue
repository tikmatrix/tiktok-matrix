<template>
    <div :style="gridStyle" class="grid auto-rows-fr gap-4">
        <div v-for="(device, index) in renderedDevices" :key="deviceKey(device, index)" class="device-card-appear">
            <Miniremote :device="device" :no="device?.key" @sizeChanged="handleSizeChanged" />
        </div>
    </div>
</template>

<script>
import Miniremote from './Miniremote.vue'

const DEFAULT_MIN_WIDTH = 150
const DEFAULT_BATCH_SIZE = 1
const DEFAULT_RENDER_INTERVAL = 300

export default {
    name: 'DeviceGrid',
    components: {
        Miniremote
    },
    props: {
        devices: {
            type: Array,
            default: () => []
        },
        minWidth: {
            type: Number,
            default: DEFAULT_MIN_WIDTH
        },
        batchSize: {
            type: Number,
            default: DEFAULT_BATCH_SIZE
        },
        renderInterval: {
            type: Number,
            default: DEFAULT_RENDER_INTERVAL
        }
    },
    emits: ['minWidthStabilized'],
    data() {
        return {
            // Map of serial -> device for rendered cards
            renderedDeviceMap: new Map(),
            // Queue of devices waiting to be rendered (producer adds, consumer removes)
            pendingQueue: [],
            // Timer for consumer loop
            consumeTimerId: null,
            // Track if consumer is running
            isConsuming: false,
            // Width tracking
            deviceWidthMap: {
                '__default__': this.minWidth || DEFAULT_MIN_WIDTH
            },
            // Previous device serial set for diff detection
            prevDeviceSerials: new Set()
        }
    },
    computed: {
        // Convert map values to sorted array for v-for
        renderedDevices() {
            const devices = Array.from(this.renderedDeviceMap.values())
            return devices.sort((a, b) => {
                const sortA = Number(a?.sort) || 0
                const sortB = Number(b?.sort) || 0
                const groupA = Number(a?.group_id) || 0
                const groupB = Number(b?.group_id) || 0
                const serialA = String(a?.serial || '')
                const serialB = String(b?.serial || '')
                return sortA - sortB || groupA - groupB || serialA.localeCompare(serialB)
            })
        },
        gridStyle() {
            const total = Array.isArray(this.devices) ? this.devices.length : 0
            if (total > 0 && total <= 5) {
                return {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${total}, minmax(${this.minWidth}px, auto))`,
                    justifyContent: 'flex-start',
                    autoRows: 'auto',
                    gap: '1rem',
                    flex: 1
                }
            }
            return {
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${this.minWidth}px, 1fr))`,
                autoRows: 'auto',
                gap: '1.25rem',
                flex: 1
            }
        }
    },
    watch: {
        devices: {
            handler(newDevices) {
                this.updateQueue(newDevices)
            },
            deep: true,
            immediate: true
        },
        minWidth(newValue) {
            const nextWidth = Number(newValue) || DEFAULT_MIN_WIDTH
            this.deviceWidthMap = {
                ...this.deviceWidthMap,
                '__default__': nextWidth
            }
        }
    },
    beforeUnmount() {
        this.stopConsumer()
    },
    methods: {
        // Get unique key for a device
        getDeviceSerial(device) {
            return device?.real_serial || device?.serial || device?.key || null
        },

        // Producer: update the queue based on device list changes
        updateQueue(newDevices) {
            const normalized = Array.isArray(newDevices) ? newDevices : []
            const newSerials = new Set(normalized.map(d => this.getDeviceSerial(d)).filter(Boolean))

            // Detect removed devices and remove from rendered map
            for (const serial of this.prevDeviceSerials) {
                if (!newSerials.has(serial)) {
                    this.renderedDeviceMap.delete(serial)
                }
            }

            // Update existing devices in-place (no re-render needed)
            for (const device of normalized) {
                const serial = this.getDeviceSerial(device)
                if (serial && this.renderedDeviceMap.has(serial)) {
                    // Update existing device reference
                    this.renderedDeviceMap.set(serial, device)
                }
            }

            // Find new devices that need to be queued for progressive render
            const newToRender = normalized.filter(d => {
                const serial = this.getDeviceSerial(d)
                return serial && !this.renderedDeviceMap.has(serial) && !this.isInPendingQueue(serial)
            })

            if (newToRender.length > 0) {
                // Add new devices to queue
                this.pendingQueue.push(...newToRender)
                // Start consumer if not running
                this.startConsumer()
            }

            // Trigger reactivity for renderedDeviceMap
            this.renderedDeviceMap = new Map(this.renderedDeviceMap)
            this.prevDeviceSerials = newSerials
        },

        // Check if device is already in pending queue
        isInPendingQueue(serial) {
            return this.pendingQueue.some(d => this.getDeviceSerial(d) === serial)
        },

        // Consumer: start the render loop
        startConsumer() {
            if (this.isConsuming) return
            this.isConsuming = true
            this.consumeBatch()
        },

        // Consumer: stop the render loop
        stopConsumer() {
            this.isConsuming = false
            if (this.consumeTimerId) {
                clearTimeout(this.consumeTimerId)
                this.consumeTimerId = null
            }
        },

        // Consumer: render next batch from queue
        consumeBatch() {
            if (!this.isConsuming) return

            const batch = this.pendingQueue.splice(0, this.batchSize)
            if (batch.length > 0) {
                for (const device of batch) {
                    const serial = this.getDeviceSerial(device)
                    if (serial) {
                        this.renderedDeviceMap.set(serial, device)
                    }
                }
                // Trigger reactivity
                this.renderedDeviceMap = new Map(this.renderedDeviceMap)
            }

            // Continue if more in queue
            if (this.pendingQueue.length > 0) {
                this.consumeTimerId = setTimeout(() => {
                    this.consumeBatch()
                }, this.renderInterval)
            } else {
                this.isConsuming = false
                this.consumeTimerId = null
            }
        },
        deviceKey(device, index) {
            return device?.real_serial || device?.serial || device?.key || `device-${index}`
        },
        handleSizeChanged(payload) {
            const { width, deviceSerial } = this.normalizeSizePayload(payload)
            if (!Number.isFinite(width) || width <= 0) {
                return
            }
            const serialKey = deviceSerial || '__default__'
            if (this.deviceWidthMap[serialKey] === width) {
                return
            }
            this.deviceWidthMap = {
                ...this.deviceWidthMap,
                [serialKey]: width
            }
            this.emitWidthIfNeeded()
        },
        normalizeSizePayload(payload) {
            if (typeof payload === 'number') {
                return { width: payload, deviceSerial: null }
            }
            if (payload && typeof payload === 'object') {
                const width = Number(payload.width)
                const deviceSerial = payload.deviceSerial || payload.serial || null
                return { width, deviceSerial }
            }
            const fallbackWidth = Number(payload)
            return { width: fallbackWidth, deviceSerial: null }
        },
        emitWidthIfNeeded() {
            const values = Object.values(this.deviceWidthMap || {})
                .map(value => Number(value))
                .filter(value => Number.isFinite(value) && value > 0)
            if (values.length === 0) {
                return
            }
            const nextWidth = Math.max(...values)
            if (Math.abs(nextWidth - this.minWidth) > 0.5) {
                this.$emit('minWidthStabilized', nextWidth)
            }
        }
    }
}
</script>
