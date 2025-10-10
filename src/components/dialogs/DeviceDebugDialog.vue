<template>
    <TransitionRoot :show="isOpen" as="template">
        <Dialog class="relative z-50" @close="handleClose">
            <!-- 背景遮罩 -->
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            </TransitionChild>

            <!-- 对话框容器 -->
            <div class="fixed inset-0 overflow-y-auto">
                <div class="flex min-h-full items-center justify-center p-4">
                    <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95"
                        enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
                        leave-to="opacity-0 scale-95">
                        <DialogPanel
                            class="w-full max-w-[95vw] h-[90vh] bg-base-100 rounded-lg shadow-xl flex flex-col">
                            <!-- Header -->
                            <div class="flex items-center justify-between p-4 border-b border-base-300">
                                <div class="flex items-center gap-3">
                                    <font-awesome-icon icon="bug" class="text-primary text-xl" />
                                    <div>
                                        <DialogTitle class="text-lg font-semibold">
                                            Device Debug Inspector
                                        </DialogTitle>
                                        <p class="text-xs text-base-content/70">
                                            {{ device.serial || device.real_serial }}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-2">
                                    <!-- 刷新按钮 -->
                                    <button @click="handleDumpHierarchy" :disabled="loading"
                                        class="btn btn-sm btn-ghost" title="Dump Hierarchy">
                                        <font-awesome-icon icon="refresh" :class="{ 'fa-spin': loading }" />
                                        Refresh
                                    </button>

                                    <!-- 关闭按钮 -->
                                    <button @click="handleClose" class="btn btn-sm btn-circle btn-ghost">
                                        <font-awesome-icon icon="times" />
                                    </button>
                                </div>
                            </div>

                            <!-- Content -->
                            <div class="flex-1 flex overflow-hidden">
                                <!-- Left: Screen Canvas -->
                                <div class="w-1/3 h-full p-4 border-r border-base-300 overflow-hidden">
                                    <DeviceScreenCanvas :screenshot="screenshot" :selected-element="selectedElement"
                                        :hovered-element="hoveredElement" :device-width="deviceWidth"
                                        :device-height="deviceHeight" :loading="loading"
                                        @element-click="handleElementClick" @element-hover="handleElementHover"
                                        @element-tap="handleElementTap" @refresh="handleDumpHierarchy"
                                        @dimensions-change="handleCanvasDimensionsChange" />
                                </div>

                                <!-- Middle: Element Inspector -->
                                <div class="w-1/3 p-4 border-r border-base-300 overflow-hidden">
                                    <DeviceElementInspector :element="selectedElement" :device="device"
                                        @tap="handleTapCoordinates" />
                                </div>

                                <!-- Right: Hierarchy Tree -->
                                <div class="w-1/3 p-4 overflow-hidden">
                                    <DeviceHierarchyViewer :hierarchy="hierarchyTree" :selected-node="selectedElement"
                                        @node-select="handleNodeSelect" @node-hover="handleNodeHover" />
                                </div>
                            </div>

                            <!-- Footer -->
                            <div class="flex items-center justify-between p-4 border-t border-base-300 bg-base-200">
                                <div class="text-xs text-base-content/70">
                                    Device: {{ deviceSerial }}
                                </div>

                                <div v-if="error" class="text-xs text-error">
                                    {{ error }}
                                </div>

                                <div class="text-xs text-base-content/70">
                                    Double-click on canvas to tap
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    TransitionRoot,
    TransitionChild
} from '@headlessui/vue'
import DeviceScreenCanvas from '../device/DeviceScreenCanvas.vue'
import DeviceElementInspector from '../device/DeviceElementInspector.vue'
import DeviceHierarchyViewer from '../device/DeviceHierarchyViewer.vue'
import { useDeviceDebugService } from '@/service/debugService'
import { parseXmlHierarchy, flattenTree } from '@/utils/hierarchyParser'
import { isPointInBounds } from '@/utils/canvasDrawer'

const props = defineProps({
    device: {
        type: Object,
        required: true
    },
    modelValue: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// 调试服务
const deviceSerial = computed(() => props.device.serial || props.device.real_serial)
const {
    loading,
    screenshot,
    hierarchy,
    error,
    dumpHierarchy,
    getScreenshot,
    tap
} = useDeviceDebugService(deviceSerial.value)

// 状态
const hierarchyTree = ref(null)
const selectedElement = ref(null)
const hoveredElement = ref(null)
const deviceWidth = ref(1080)
const deviceHeight = ref(1920)

// 监听 hierarchy 变化
watch(hierarchy, (newHierarchy) => {
    if (newHierarchy) {
        try {
            hierarchyTree.value = parseXmlHierarchy(newHierarchy)
            console.log('Hierarchy parsed:', hierarchyTree.value)
        } catch (err) {
            console.error('Failed to parse hierarchy:', err)
            error.value = 'Failed to parse hierarchy'
        }
    }
})

// 初始化
onMounted(async () => {
    try {
        await handleDumpHierarchy()
    } catch (err) {
        console.error('Failed to initialize debug dialog:', err)
    }
})

// 清理
onUnmounted(() => {
    // 清理资源
})

// Dump Hierarchy
const handleDumpHierarchy = async () => {
    try {
        await dumpHierarchy()
        await getScreenshot()
    } catch (err) {
        console.error('Failed to dump hierarchy:', err)
    }
}

// 点击画布上的元素
const handleElementClick = (coordinates) => {
    if (!hierarchyTree.value) return

    // 查找点击位置的元素
    const allNodes = flattenTree(hierarchyTree.value)

    // 从最底层开始查找（最后面的元素在最上层）
    for (let i = allNodes.length - 1; i >= 0; i--) {
        const node = allNodes[i]
        if (node.bounds && isPointInBounds(coordinates.x, coordinates.y, node.bounds)) {
            selectedElement.value = node
            console.log('Selected element:', node)
            break
        }
    }
}

// 鼠标悬浮在画布上的元素
const handleElementHover = (coordinates) => {
    if (!coordinates || !hierarchyTree.value) {
        hoveredElement.value = null
        return
    }

    // 查找悬停位置的元素
    const allNodes = flattenTree(hierarchyTree.value)

    // 从最底层开始查找（最后面的元素在最上层）
    let foundNode = null
    for (let i = allNodes.length - 1; i >= 0; i--) {
        const node = allNodes[i]
        if (node.bounds && isPointInBounds(coordinates.x, coordinates.y, node.bounds)) {
            foundNode = node
            break
        }
    }

    hoveredElement.value = foundNode
}

// 双击画布触发 tap
const handleElementTap = async (coordinates) => {
    try {
        await tap(coordinates.x, coordinates.y)
        console.log('Tapped at:', coordinates)

        await new Promise(resolve => setTimeout(resolve, 500))
        await handleDumpHierarchy()
    } catch (err) {
        console.error('Failed to tap:', err)
    }
}

// 点击坐标
const handleTapCoordinates = async (coordinates) => {
    await handleElementTap(coordinates)
}

// 选择树节点
const handleNodeSelect = (node) => {
    selectedElement.value = node
    console.log('Node selected from tree:', node)
}

// 树节点悬浮
const handleNodeHover = (node) => {
    hoveredElement.value = node
}

// 画布尺寸更新
const handleCanvasDimensionsChange = ({ width, height }) => {
    if (width && height) {
        deviceWidth.value = width
        deviceHeight.value = height
    }
}

// 关闭对话框
const handleClose = () => {
    isOpen.value = false
    emit('close')
}
</script>

<style scoped>
/* 自定义样式 */
</style>
