<template>
    <div class="device-screen-canvas h-full">
        <!-- Canvas 容器 -->
        <div ref="containerRef"
            class="canvas-container relative bg-base-200 rounded-lg overflow-hidden border border-base-300">
            <!-- 操作按钮 -->
            <div class="absolute top-2 right-2 z-10 flex gap-2">
                <button @click="handleRefresh" :disabled="loading"
                    class="btn btn-md btn-circle bg-base-100/80 backdrop-blur hover:bg-base-200"
                    title="Refresh Screenshot">
                    <font-awesome-icon icon="refresh" :class="{ 'fa-spin': loading }" />
                </button>
                <button @click="handleClear"
                    class="btn btn-md btn-circle bg-base-100/80 backdrop-blur hover:bg-base-200"
                    title="Clear Highlights">
                    <font-awesome-icon icon="eraser" />
                </button>
            </div>

            <!-- 背景层 - 显示截图 -->
            <canvas ref="bgCanvasRef" :style="canvasStyle" />

            <!-- 前景层 - 显示高亮 -->
            <canvas ref="fgCanvasRef" :style="canvasStyle" class="cursor-crosshair" @click="handleCanvasClick"
                @dblclick="handleCanvasDoubleClick" @mousemove="handleCanvasMouseMove"
                @mouseleave="handleCanvasMouseLeave" />

            <!-- 加载指示器 -->
            <div v-if="loading"
                class="absolute inset-0 flex items-center justify-center bg-base-300/50 backdrop-blur-md">
                <span class="loading loading-spinner loading-lg"></span>
            </div>

            <!-- 坐标显示 -->
            <div v-if="cursorPosition"
                class="absolute bottom-2 left-2 bg-base-100/80 backdrop-blur px-2 py-1 rounded text-md font-mono">
                {{ cursorPosition.x }}, {{ cursorPosition.y }}
            </div>

            <!-- 设备信息 -->
            <div v-if="deviceInfo"
                class="absolute top-2 left-2 bg-base-100/80 backdrop-blur px-2 py-1 rounded text-md font-mono">
                {{ deviceInfo.width }} x {{ deviceInfo.height }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
    drawScreenshot,
    drawHighlight,
    drawHoverHighlight,
    clearCanvas,
    scaleBoundsToCanvas
} from '@/utils/canvasDrawer'

const props = defineProps({
    screenshot: String,
    selectedElement: Object,
    hoveredElement: Object,
    deviceWidth: {
        type: Number,
        default: 1080
    },
    deviceHeight: {
        type: Number,
        default: 1920
    },
    loading: Boolean
})

const emit = defineEmits(['element-click', 'element-tap', 'element-hover', 'refresh', 'dimensions-change'])

const bgCanvasRef = ref(null)
const fgCanvasRef = ref(null)
const containerRef = ref(null)
const canvasStyle = ref({})
const deviceInfo = ref(null)
const cursorPosition = ref(null)
const renderedWidth = ref(props.deviceWidth)
const renderedHeight = ref(props.deviceHeight)

// 调整 canvas 显示尺寸
const resizeCanvas = () => {
    if (!containerRef.value) return

    const container = containerRef.value
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    if (!containerWidth || !containerHeight) return

    const baseWidth = renderedWidth.value || props.deviceWidth || 1
    const baseHeight = renderedHeight.value || props.deviceHeight || 1

    const canvasRatio = baseWidth / baseHeight
    const containerRatio = containerWidth / containerHeight

    let displayWidth, displayHeight

    if (canvasRatio > containerRatio) {
        displayWidth = containerWidth
        displayHeight = Math.floor(containerWidth / canvasRatio)
    } else {
        displayHeight = containerHeight
        displayWidth = Math.floor(containerHeight * canvasRatio)
    }

    canvasStyle.value = {
        width: displayWidth + 'px',
        height: displayHeight + 'px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    }
}

// 监听截图变化
watch(() => props.screenshot, async (newScreenshot) => {
    if (newScreenshot && bgCanvasRef.value) {
        try {
            const { width, height } = await drawScreenshot(bgCanvasRef.value, newScreenshot)

            renderedWidth.value = width
            renderedHeight.value = height

            if (fgCanvasRef.value) {
                fgCanvasRef.value.width = width
                fgCanvasRef.value.height = height
                clearCanvas(fgCanvasRef.value)
            }

            await nextTick()

            resizeCanvas()
            deviceInfo.value = {
                width,
                height
            }

            emit('dimensions-change', { width, height })

            redrawForeground()
        } catch (error) {
            console.error('Failed to draw screenshot:', error)
        }
    }
})

// 监听选中元素变化
watch(() => props.selectedElement, (element) => {
    redrawForeground()
})

// 监听悬停元素变化
watch(() => props.hoveredElement, (element) => {
    redrawForeground()
})

// 重绘前景层
const redrawForeground = () => {
    if (!fgCanvasRef.value) return

    clearCanvas(fgCanvasRef.value)

    const resolveBounds = (bounds) => {
        if (!bounds) return null

        const canvasWidth = renderedWidth.value
        const canvasHeight = renderedHeight.value
        if (!canvasWidth || !canvasHeight) {
            return bounds
        }

        const boundsMaxX = bounds.x2 ?? (bounds.x != null && bounds.width != null ? bounds.x + bounds.width : null)
        const boundsMaxY = bounds.y2 ?? (bounds.y != null && bounds.height != null ? bounds.y + bounds.height : null)

        const fallbackWidth = props.deviceWidth || renderedWidth.value
        const fallbackHeight = props.deviceHeight || renderedHeight.value
        const deviceWidth = Math.max(fallbackWidth || 0, boundsMaxX || 0, canvasWidth)
        const deviceHeight = Math.max(fallbackHeight || 0, boundsMaxY || 0, canvasHeight)

        if (Math.abs(deviceWidth - canvasWidth) < 0.5 && Math.abs(deviceHeight - canvasHeight) < 0.5) {
            return bounds
        }

        return scaleBoundsToCanvas(bounds, canvasWidth, canvasHeight, deviceWidth, deviceHeight)
    }

    // 绘制悬停元素
    if (props.hoveredElement && props.hoveredElement.bounds) {
        const bounds = resolveBounds(props.hoveredElement.bounds)
        if (bounds) {
            drawHoverHighlight(fgCanvasRef.value, bounds)
        }
    }

    // 绘制选中元素
    if (props.selectedElement && props.selectedElement.bounds) {
        const bounds = resolveBounds(props.selectedElement.bounds)
        if (bounds) {
            drawHighlight(fgCanvasRef.value, bounds)
        }
    }
}

// 画布点击
const handleCanvasClick = (event) => {
    const canvas = fgCanvasRef.value
    const rect = canvas.getBoundingClientRect()

    // 计算在显示的 canvas 上的点击位置
    const displayX = event.clientX - rect.left
    const displayY = event.clientY - rect.top

    // 转换为设备坐标 (canvas 实际尺寸)
    const logicalWidth = canvas?.width || renderedWidth.value || props.deviceWidth
    const logicalHeight = canvas?.height || renderedHeight.value || props.deviceHeight
    const scaleX = logicalWidth / rect.width
    const scaleY = logicalHeight / rect.height

    const deviceX = Math.round(displayX * scaleX)
    const deviceY = Math.round(displayY * scaleY)

    emit('element-click', { x: deviceX, y: deviceY })
}

// 画布双击 - 触发 tap
const handleCanvasDoubleClick = (event) => {
    const canvas = fgCanvasRef.value
    const rect = canvas.getBoundingClientRect()

    const displayX = event.clientX - rect.left
    const displayY = event.clientY - rect.top

    const logicalWidth = canvas?.width || renderedWidth.value || props.deviceWidth
    const logicalHeight = canvas?.height || renderedHeight.value || props.deviceHeight
    const scaleX = logicalWidth / rect.width
    const scaleY = logicalHeight / rect.height

    const deviceX = Math.round(displayX * scaleX)
    const deviceY = Math.round(displayY * scaleY)

    emit('element-tap', { x: deviceX, y: deviceY })
}

// 鼠标移动
const handleCanvasMouseMove = (event) => {
    const canvas = fgCanvasRef.value
    const rect = canvas.getBoundingClientRect()

    const displayX = event.clientX - rect.left
    const displayY = event.clientY - rect.top

    const logicalWidth = canvas?.width || renderedWidth.value || props.deviceWidth
    const logicalHeight = canvas?.height || renderedHeight.value || props.deviceHeight
    const scaleX = logicalWidth / rect.width
    const scaleY = logicalHeight / rect.height

    const deviceX = Math.round(displayX * scaleX)
    const deviceY = Math.round(displayY * scaleY)

    cursorPosition.value = { x: deviceX, y: deviceY }

    // 触发 hover 事件,让父组件查找悬浮的元素
    emit('element-hover', { x: deviceX, y: deviceY })
}

// 鼠标离开
const handleCanvasMouseLeave = () => {
    cursorPosition.value = null
    // 清除悬浮状态
    emit('element-hover', null)
}

// 刷新
const handleRefresh = () => {
    emit('refresh')
}

// 清除高亮
const handleClear = () => {
    clearCanvas(fgCanvasRef.value)
}

onMounted(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.device-screen-canvas {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.canvas-container {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: crisp-edges;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
}
</style>
