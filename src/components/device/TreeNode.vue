<template>
    <div class="tree-node">
        <div class="node-content" :class="{
            'selected': isSelected,
            'highlighted': isHighlighted
        }" @click.stop="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <!-- 展开/折叠图标 -->
            <span v-if="hasChildren" class="toggle-icon" @click.stop="toggleExpanded">
                <font-awesome-icon :icon="isExpanded ? 'chevron-down' : 'chevron-right'" class="text-xs" />
            </span>
            <span v-else class="toggle-icon-placeholder"></span>

            <!-- 节点图标 -->
            <span class="node-icon">
                <font-awesome-icon :icon="nodeIcon" class="text-xs" />
            </span>

            <!-- 节点文本 -->
            <span class="node-text" :title="nodeFullText">
                {{ nodeDisplayText }}
            </span>

            <!-- 节点标签 -->
            <span v-if="node.clickable" class="node-badge" title="Clickable">
                <font-awesome-icon icon="hand-pointer" class="text-xs" />
            </span>
            <span v-if="node.scrollable" class="node-badge" title="Scrollable">
                <font-awesome-icon icon="arrows-alt-v" class="text-xs" />
            </span>
        </div>

        <!-- 子节点 -->
        <div v-if="hasChildren && isExpanded" class="node-children">
            <TreeNode v-for="(child, index) in node.children" :key="child.id" :node="child" :selected-id="selectedId"
                :search-results="searchResults" @select="$emit('select', $event)" @hover="$emit('hover', $event)" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const isExpanded = ref(true) // 默认展开

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
}

.node-content:hover {
    background-color: hsl(var(--b2));
}

.node-content.selected {
    background-color: hsl(var(--p) / 0.2);
    font-weight: 600;
}

.node-content.highlighted {
    background-color: hsl(var(--a) / 0.2);
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
</style>
