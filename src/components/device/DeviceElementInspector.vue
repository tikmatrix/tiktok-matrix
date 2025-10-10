<template>
    <div class="device-element-inspector flex flex-col h-full">
        <!-- 标题 -->
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold">Element Inspector</h3>
        </div>

        <!-- 内容 -->
        <div v-if="element" class="flex-1 overflow-y-auto space-y-2">
            <!-- 主要属性 -->
            <div class="divider text-xs">Main Properties</div>

            <div v-if="element.className" class="property-item">
                <div class="property-label">Class</div>
                <div class="property-value font-mono">{{ element.className }}</div>
            </div>

            <div v-if="element.text" class="property-item">
                <div class="property-label">Text</div>
                <div class="property-value">{{ element.text }}</div>
            </div>

            <div v-if="element.contentDesc" class="property-item">
                <div class="property-label">Content Description</div>
                <div class="property-value">{{ element.contentDesc }}</div>
            </div>

            <div v-if="element.resourceId" class="property-item">
                <div class="property-label">Resource ID</div>
                <div class="property-value font-mono text-xs">{{ element.resourceId }}</div>
            </div>

            <!-- Bounds -->
            <div v-if="element.bounds" class="property-item">
                <div class="property-label">Bounds</div>
                <div class="property-value font-mono text-xs">
                    [{{ element.bounds.x }}, {{ element.bounds.y }}]
                    [{{ element.bounds.x2 }}, {{ element.bounds.y2 }}]
                </div>
            </div>

            <div v-if="element.bounds" class="property-item">
                <div class="property-label">Size</div>
                <div class="property-value">
                    {{ element.bounds.width }} x {{ element.bounds.height }}
                </div>
            </div>

            <div v-if="element.bounds" class="property-item">
                <div class="property-label">Center</div>
                <div class="property-value">
                    ({{ Math.round(element.bounds.centerX) }}, {{ Math.round(element.bounds.centerY) }})
                    <button @click="handleTapCenter" class="btn btn-xs btn-ghost ml-2" title="Tap on center">
                        <font-awesome-icon icon="hand-pointer" />
                    </button>
                </div>
            </div>

            <!-- 状态属性 -->
            <div class="divider text-xs">State</div>

            <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.clickable" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Clickable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.enabled" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Enabled</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.focusable" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Focusable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.focused" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Focused</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.scrollable" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Scrollable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.selected" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Selected</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.checkable" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Checkable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.checked" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Checked</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.longClickable" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Long-clickable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.password" disabled class="checkbox checkbox-xs" />
                    <span class="text-xs">Password</span>
                </div>
            </div>

            <!-- 其他属性 -->
            <div v-if="Object.keys(filteredAttributes).length > 0" class="divider text-xs">Other Attributes</div>

            <div v-for="(value, key) in filteredAttributes" :key="key" class="property-item-compact">
                <span class="property-label-compact">{{ key }}:</span>
                <span class="property-value-compact">{{ value }}</span>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex-1 flex items-center justify-center text-base-content/50">
            <div class="text-center">
                <font-awesome-icon icon="mouse-pointer" class="text-4xl mb-2" />
                <p class="text-sm">Click on an element to inspect</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    element: Object,
    device: Object
})

const emit = defineEmits(['tap'])

// 过滤后的属性（排除已显示的主要属性）
const filteredAttributes = computed(() => {
    if (!props.element || !props.element.attributes) return {}

    const mainProps = [
        'class',
        'text',
        'content-desc',
        'resource-id',
        'bounds',
        'clickable',
        'enabled',
        'focusable',
        'focused',
        'scrollable',
        'selected',
        'checkable',
        'checked',
        'long-clickable',
        'password'
    ]

    const filtered = {}
    for (const [key, value] of Object.entries(props.element.attributes)) {
        if (!mainProps.includes(key)) {
            filtered[key] = value
        }
    }

    return filtered
})

// 点击中心点
const handleTapCenter = () => {
    if (props.element && props.element.bounds) {
        emit('tap', {
            x: Math.round(props.element.bounds.centerX),
            y: Math.round(props.element.bounds.centerY)
        })
    }
}
</script>

<style scoped>
.device-element-inspector {
    font-size: 0.875rem;
}

.property-item {
    background-color: hsl(var(--b2));
    border-radius: 0.5rem;
    padding: 0.75rem;
}

.property-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(var(--bc) / 0.7);
    margin-bottom: 0.25rem;
}

.property-value {
    font-size: 0.875rem;
    color: hsl(var(--bc));
}

.property-item-compact {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
}

.property-item-compact:hover {
    background-color: hsl(var(--b2));
}

.property-label-compact {
    font-family: 'Courier New', monospace;
    color: hsl(var(--bc) / 0.6);
    flex-shrink: 0;
}

.property-value-compact {
    font-family: 'Courier New', monospace;
    color: hsl(var(--bc));
    text-align: right;
    word-break: break-all;
}

.divider {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>