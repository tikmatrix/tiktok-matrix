<template>
    <div class="device-hierarchy-viewer flex flex-col h-full">
        <!-- 搜索栏 -->
        <div class="mb-4">
            <div class="form-control">
                <div class="input-group input-group-sm">
                    <input v-model="searchQuery" type="text" placeholder="Search nodes..."
                        class="input input-sm input-bordered flex-1" @keydown.enter.prevent="goToNextSearchResult" />
                    <button class="btn btn-sm btn-square" type="button" :disabled="searchResults.length === 0"
                        @click="goToNextSearchResult" :title="searchResults.length > 1 ? 'Next match' : 'Search'">
                        <font-awesome-icon icon="search" />
                    </button>
                </div>
            </div>
            <div v-if="searchResults.length > 0"
                class="text-xs text-base-content/70 mt-1 flex items-center justify-between gap-2">
                <span>
                    Found {{ searchResults.length }} node(s)
                    <template v-if="searchResults.length > 1">
                        · {{ activeSearchIndex + 1 }} / {{ searchResults.length }}
                    </template>
                </span>
                <div v-if="searchResults.length > 1" class="join">
                    <button type="button" class="btn btn-ghost btn-xs join-item" title="Previous match"
                        @click="goToPreviousSearchResult">
                        <font-awesome-icon icon="chevron-up" />
                    </button>
                    <button type="button" class="btn btn-ghost btn-xs join-item" title="Next match"
                        @click="goToNextSearchResult">
                        <font-awesome-icon icon="chevron-down" />
                    </button>
                </div>
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
const activeSearchIndex = ref(0)
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

const focusSearchResult = async (index) => {
    if (!searchResults.value.length) return
    const total = searchResults.value.length
    const normalizedIndex = ((index % total) + total) % total
    activeSearchIndex.value = normalizedIndex
    const targetNode = searchResults.value[normalizedIndex]

    // 先触发选中事件，让树节点自动展开
    emit('node-select', targetNode)

    // 等待 DOM 更新后再滚动
    await nextTick()
    await scrollToSelectedNode(targetNode.id)
}

const goToNextSearchResult = () => {
    focusSearchResult(activeSearchIndex.value + 1)
}

const goToPreviousSearchResult = () => {
    focusSearchResult(activeSearchIndex.value - 1)
}

// 总节点数
const totalNodes = computed(() => {
    if (!hierarchyTree.value) return 0
    return flattenTree(hierarchyTree.value).length
})

// 滚动到选中的节点
const scrollToSelectedNode = async (nodeId) => {
    if (!nodeId) return

    // 等待 DOM 更新
    await nextTick()

    // 额外延迟一下，确保展开动画完成
    await new Promise(resolve => setTimeout(resolve, 50))

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
watch(() => props.selectedNode?.id, async (newId) => {
    if (newId) {
        // 延迟滚动，确保树节点已经展开
        await new Promise(resolve => setTimeout(resolve, 100))
        await scrollToSelectedNode(newId)

        // 如果有搜索结果，更新当前搜索索引
        if (searchResults.value.length) {
            const matchedIndex = searchResults.value.findIndex(result => result.id === newId)
            if (matchedIndex !== -1) {
                activeSearchIndex.value = matchedIndex
            }
        }
    }
}, { immediate: true })

// 当层级数据变化时，重新定位选中节点
watch(() => props.hierarchy, async () => {
    if (props.selectedNode?.id) {
        await new Promise(resolve => setTimeout(resolve, 100))
        await scrollToSelectedNode(props.selectedNode.id)
    }
})

watch(searchQuery, (newQuery) => {
    if (!newQuery) {
        activeSearchIndex.value = 0
        return
    }
    focusSearchResult(0)
})

watch(searchResults, (results) => {
    if (!results.length) {
        activeSearchIndex.value = 0
        return
    }
    if (activeSearchIndex.value >= results.length) {
        focusSearchResult(0)
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
