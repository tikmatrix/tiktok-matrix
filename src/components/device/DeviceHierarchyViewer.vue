<template>
    <div class="device-hierarchy-viewer flex flex-col h-full">
        <!-- 搜索栏 -->
        <div class="mb-4">
            <div class="form-control">
                <div class="input-group input-group-sm">
                    <input v-model="searchQuery" type="text" placeholder="Search nodes..."
                        class="input input-sm input-bordered flex-1" />
                    <button class="btn btn-sm btn-square">
                        <font-awesome-icon icon="search" />
                    </button>
                </div>
            </div>
            <div v-if="searchResults.length > 0" class="text-xs text-base-content/70 mt-1">
                Found {{ searchResults.length }} node(s)
            </div>
        </div>

        <!-- 树形结构 -->
        <div class="flex-1 overflow-auto" ref="scrollContainer">
            <div v-if="hierarchyTree" class="tree-view">
                <TreeNode :node="hierarchyTree" :selected-id="selectedNode?.id" :search-results="searchResults"
                    @select="handleNodeSelect" @hover="handleNodeHover" />
            </div>
            <div v-else class="flex items-center justify-center h-full text-base-content/50">
                <div class="text-center">
                    <font-awesome-icon icon="sitemap" class="text-4xl mb-2" />
                    <p class="text-sm">No hierarchy data</p>
                </div>
            </div>
        </div>

        <!-- 统计信息 -->
        <div v-if="hierarchyTree" class="mt-2 text-xs text-base-content/70">
            Total nodes: {{ totalNodes }}
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import TreeNode from './TreeNode.vue'
import { flattenTree } from '@/utils/hierarchyParser'

const props = defineProps({
    hierarchy: Object,
    selectedNode: Object
})

const emit = defineEmits(['node-select', 'node-hover'])

const searchQuery = ref('')
const hierarchyTree = ref(null)
const scrollContainer = ref(null)

// 监听 hierarchy 变化
watch(() => props.hierarchy, (newHierarchy) => {
    hierarchyTree.value = newHierarchy
    searchQuery.value = ''
}, { immediate: true })

// 搜索结果
const searchResults = computed(() => {
    if (!searchQuery.value || !hierarchyTree.value) {
        return []
    }

    const query = searchQuery.value.toLowerCase()
    const allNodes = flattenTree(hierarchyTree.value)

    return allNodes.filter(node => {
        return (
            (node.text && node.text.toLowerCase().includes(query)) ||
            (node.contentDesc && node.contentDesc.toLowerCase().includes(query)) ||
            (node.resourceId && node.resourceId.toLowerCase().includes(query)) ||
            (node.className && node.className.toLowerCase().includes(query))
        )
    })
})

// 总节点数
const totalNodes = computed(() => {
    if (!hierarchyTree.value) return 0
    return flattenTree(hierarchyTree.value).length
})

// 滚动到选中的节点
const scrollToSelectedNode = async (nodeId) => {
    if (!nodeId) return
    await nextTick()
    const container = scrollContainer.value
    if (!container) return

    const target = container.querySelector(`[data-node-id="${nodeId}"]`)
    if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
}

// 选择节点
const handleNodeSelect = (node) => {
    emit('node-select', node)
}

// 悬浮节点
const handleNodeHover = (node) => {
    emit('node-hover', node)
}

// 监听选中节点变化以自动滚动
watch(() => props.selectedNode?.id, (newId) => {
    if (newId) {
        scrollToSelectedNode(newId)
    }
})

// 当层级数据变化时，重新定位选中节点
watch(() => props.hierarchy, () => {
    if (props.selectedNode?.id) {
        scrollToSelectedNode(props.selectedNode.id)
    }
})
</script>

<style scoped>
.device-hierarchy-viewer {
    font-size: 0.875rem;
}

.tree-view {
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    min-width: max-content;
    display: inline-block;
    width: 100%;
}
</style>
