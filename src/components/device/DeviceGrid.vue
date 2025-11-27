<template>
    <div :style="gridStyle" class="grid auto-rows-fr gap-4">
        <div v-for="(device, index) in renderedDevices" :key="deviceKey(device, index)"
            :class="['device-card-appear', isDockedBig(device) ? 'col-span-2 row-span-2 z-20' : 'z-10']">
            <Device :device="device" :no="device?.key" :gridCardWidth="gridCardWidth" />
        </div>
    </div>
</template>

<script>
import Device from './Device.vue'
import { getItem } from '@/utils/storage.js';
const DEFAULT_BATCH_SIZE = 1
const DEFAULT_RENDER_INTERVAL = 300

export default {
    name: 'DeviceGrid',
    components: {
        Device
    },
    props: {
        devices: {
            type: Array,
            default: () => []
        },
        gridCardWidth: {
            type: Number,
            default: 150
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

            // Previous device serial set for diff detection
            prevDeviceSerials: new Set(),
            // Track the docked big screen device serial
            dockedDeviceSerial: null,
            // Event listeners
            listeners: []
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
            const total = Array.isArray(this.renderedDevices) ? this.renderedDevices.length : 0
            if (total > 0 && total <= 5) {
                return {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${total}, minmax(${this.gridCardWidth}px, auto))`,
                    justifyContent: 'flex-start',
                    autoRows: 'auto',
                    gap: '1rem',
                    flex: 1
                }
            }
            return {
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fit, minmax(${this.gridCardWidth}px, 1fr))`,
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
        }
    },
    beforeUnmount() {
        this.stopConsumer()
        // Clean up event listeners
        this.listeners.forEach(listener => {
            if (typeof listener === 'function') {
                listener()
            }
        })
        this.listeners = []
    },
    async mounted() {
        // Listen for openDevice event to track docked big screen device
        this.listeners.push(await this.$listen('openDevice', async (e) => {
            const bigScreen = await getItem('bigScreen') || 'standard'
            if (bigScreen === 'docked') {
                this.dockedDeviceSerial = e.payload?.serial || null
            }
        }))
        // Listen for closeDevice event to clear docked big screen device
        this.listeners.push(await this.$listen('closeDevice', () => {
            this.dockedDeviceSerial = null
        }))
    },
    methods: {
        // Check if device is in docked big screen mode
        isDockedBig(device) {
            if (!this.dockedDeviceSerial) {
                return false
            }
            const serial = this.getDeviceSerial(device)
            return serial === this.dockedDeviceSerial
        },
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
                    console.log(`DeviceGrid: Removed device with serial ${serial} from rendered map, remaining devices: ${this.renderedDeviceMap.size}`)
                }
            }

            // Update existing devices in-place (no re-render needed)
            for (const device of normalized) {
                const serial = this.getDeviceSerial(device)
                if (serial && this.renderedDeviceMap.has(serial)) {
                    // Update existing device reference
                    this.renderedDeviceMap.set(serial, device)
                    console.log(`DeviceGrid: Updated device with serial ${serial} in rendered map, currently rendered devices: ${this.renderedDeviceMap.size}`)
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
                console.log(`DeviceGrid: Queued ${newToRender.length} new devices for rendering, pending queue size: ${this.pendingQueue.length}`)
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
            this.consumeTimerId = setTimeout(() => {
                this.consumeBatch()
            }, this.renderInterval)
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

    }
}
</script>
