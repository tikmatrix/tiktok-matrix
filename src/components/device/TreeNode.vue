<template>
    <div class="tree-node">
        <div class="node-content" :data-node-id="node.id" :class="{
            'selected': isSelected,
            'highlighted': isHighlighted && !isSelected
        }" @click.stop="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <!-- 展开/折叠图标 - 所有节点都可以展开查看属性 -->
            <span class="toggle-icon" @click.stop="toggleExpanded">
                <font-awesome-icon :icon="isExpanded ? 'chevron-down' : 'chevron-right'" class="text-md" />
            </span>

            <!-- 节点图标 -->
            <span class="node-icon">
                <font-awesome-icon :icon="nodeIcon" class="text-md" />
            </span>

            <!-- 节点文本 -->
            <span class="node-text" :title="nodeFullText">
                {{ nodeDisplayText }}
            </span>

            <!-- 节点标签 -->
            <span v-if="node.clickable" class="node-badge" title="Clickable">
                <font-awesome-icon icon="hand-pointer" class="text-md" />
            </span>
            <span v-if="node.scrollable" class="node-badge" title="Scrollable">
                <font-awesome-icon icon="arrows-alt-v" class="text-md" />
            </span>
        </div>

        <!-- 子节点 -->
        <transition name="expand">
            <div v-if="isExpanded" class="node-children">
                <!-- 显示子节点 -->
                <TreeNode v-for="(child, index) in node.children" :key="child.id" :node="child"
                    :selected-id="selectedId" :search-results="searchResults" @select="$emit('select', $event)"
                    @hover="$emit('hover', $event)" />

                <!-- 如果没有子节点，显示节点属性 -->
                <div v-if="!hasChildren" class="node-properties">
                    <div v-if="node.text !== undefined && node.text !== ''" class="property-row">
                        <span class="property-key">text:</span>
                        <span class="property-value">{{ node.text }}</span>
                    </div>
                    <div v-if="node.contentDesc" class="property-row">
                        <span class="property-key">contentDesc:</span>
                        <span class="property-value">{{ node.contentDesc }}</span>
                    </div>
                    <div v-if="node.resourceId" class="property-row">
                        <span class="property-key">resourceId:</span>
                        <span class="property-value">{{ node.resourceId }}</span>
                    </div>
                    <div v-if="node.className" class="property-row">
                        <span class="property-key">className:</span>
                        <span class="property-value">{{ node.className }}</span>
                    </div>
                    <div v-if="node.bounds" class="property-row">
                        <span class="property-key">bounds:</span>
                        <span class="property-value">[{{ node.bounds.x }}, {{ node.bounds.y }}] [{{ node.bounds.x2 }},
                            {{ node.bounds.y2 }}]</span>
                    </div>
                    <div v-if="node.clickable !== undefined" class="property-row">
                        <span class="property-key">clickable:</span>
                        <span class="property-value">{{ node.clickable }}</span>
                    </div>
                    <div v-if="node.enabled !== undefined" class="property-row">
                        <span class="property-key">enabled:</span>
                        <span class="property-value">{{ node.enabled }}</span>
                    </div>
                    <div v-if="node.focusable !== undefined" class="property-row">
                        <span class="property-key">focusable:</span>
                        <span class="property-value">{{ node.focusable }}</span>
                    </div>
                    <div v-if="node.scrollable !== undefined" class="property-row">
                        <span class="property-key">scrollable:</span>
                        <span class="property-value">{{ node.scrollable }}</span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getNodeDisplayText } from '@/utils/hierarchyParser'

const props = defineProps({
    node: {
        type: Object,
        required: true
    },
    selectedId: String,
    searchResults: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['select', 'hover'])

const isExpanded = ref(false)

// 初始化展开状态：只有根节点默认展开
const initExpandedState = () => {
    isExpanded.value = !props.node.parent
}

// 初始化
initExpandedState()

// 是否有子节点
const hasChildren = computed(() => {
    return props.node.children && props.node.children.length > 0
})

// 是否被选中
const isSelected = computed(() => {
    return props.node.id === props.selectedId
})

// 是否在搜索结果中
const isHighlighted = computed(() => {
    return props.searchResults.some(n => n.id === props.node.id)
})

// 节点图标
const nodeIcon = computed(() => {
    const tag = props.node.tag?.toLowerCase() || ''

    if (tag.includes('button')) return 'square'
    if (tag.includes('edit') || tag.includes('input')) return 'keyboard'
    if (tag.includes('text')) return 'font'
    if (tag.includes('image')) return 'image'
    if (tag.includes('list')) return 'list'
    if (tag.includes('grid')) return 'th'
    if (tag.includes('scroll')) return 'arrows-alt-v'
    if (tag.includes('web')) return 'globe'
    if (tag.includes('video')) return 'video'

    return 'cube'
})

// 节点显示文本
const nodeDisplayText = computed(() => {
    return getNodeDisplayText(props.node)
})

// 节点完整文本（用于 tooltip）
const nodeFullText = computed(() => {
    const parts = []

    if (props.node.tag) parts.push(`Tag: ${props.node.tag}`)
    if (props.node.text) parts.push(`Text: ${props.node.text}`)
    if (props.node.contentDesc) parts.push(`Desc: ${props.node.contentDesc}`)
    if (props.node.resourceId) parts.push(`ID: ${props.node.resourceId}`)
    if (props.node.className) parts.push(`Class: ${props.node.className}`)

    return parts.join('\n')
})

// 切换展开/折叠
const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
}

// 辅助函数：检查某个节点是否包含指定的子孙节点
const containsDescendant = (node, id) => {
    if (!node || !node.children || node.children.length === 0) return false
    return node.children.some(child => {
        return child.id === id || containsDescendant(child, id)
    })
}

// 当选中的节点改变时，如果当前节点包含被选中的节点，则自动展开
watch(() => props.selectedId, (newId) => {
    if (!newId) return

    // 如果当前节点就是被选中的节点，或者包含被选中的节点，则展开
    if (props.node.id === newId || containsDescendant(props.node, newId)) {
        isExpanded.value = true
    }
}, { immediate: true })

// 当搜索结果改变时，如果当前节点在搜索结果中或包含搜索结果，则自动展开
watch(() => props.searchResults, (results) => {
    if (!results || results.length === 0) return

    const matched = results.some(result => {
        return result.id === props.node.id || containsDescendant(props.node, result.id)
    })

    if (matched) {
        isExpanded.value = true
    }
}, { immediate: true })

// 当节点本身改变时，重置展开状态
watch(() => props.node?.id, () => {
    initExpandedState()
}, { immediate: false })

// 点击节点
const handleClick = () => {
    emit('select', props.node)
}

// 鼠标进入
const handleMouseEnter = () => {
    emit('hover', props.node)
}

// 鼠标离开
const handleMouseLeave = () => {
    emit('hover', null)
}
</script>

<style scoped>
.tree-node {
    user-select: none;
}

.node-content {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background-color 0.15s;
    border-left: 3px solid transparent;
}

.node-content:hover {
    background-color: hsl(var(--b2));
}

.node-content.selected {
    background-color: hsl(var(--p) / 0.2);
    color: hsl(var(--pc));
    font-weight: 600;
    border-left: 3px solid hsl(var(--p));
    box-shadow: inset 0 0 0 1px hsl(var(--p) / 0.4);
}

.node-content.highlighted {
    background-color: hsl(var(--s) / 0.2);
    border-left: 3px solid hsl(var(--s));
    box-shadow: inset 0 0 0 1px hsl(var(--s) / 0.4);
}

.toggle-icon {
    width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: hsl(var(--bc) / 0.5);
}

.toggle-icon-placeholder {
    width: 1rem;
}

.node-icon {
    color: hsl(var(--bc) / 0.6);
}

.node-text {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    font-size: 0.75rem;
}

.node-badge {
    color: hsl(var(--bc) / 0.4);
    margin-left: 0.25rem;
}

.node-children {
    padding-left: 1rem;
    border-left: 1px solid hsl(var(--bc) / 0.1);
    margin-left: 0.5rem;
}

/* 节点属性显示 */
.node-properties {
    padding: 0.5rem 0;
    font-size: 0.7rem;
}

.property-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.25rem 0;
    margin-bottom: 0.25rem;
}

.property-key {
    color: hsl(var(--bc) / 0.6);
    font-weight: 500;
    flex-shrink: 0;
    min-width: 5rem;
}

.property-value {
    color: hsl(var(--bc) / 0.9);
    font-family: 'Courier New', monospace;
    word-break: break-all;
    flex: 1;
}

/* 展开/折叠过渡动画 */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.2s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
    opacity: 1;
    max-height: 10000px;
}
</style>
