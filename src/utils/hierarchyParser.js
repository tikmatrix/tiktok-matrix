// 解析 XML 层次结构
export function parseXmlHierarchy(xmlString) {
    if (!xmlString) return null

    try {
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror')
        if (parserError) {
            console.error('XML parsing error:', parserError.textContent)
            return null
        }

        return nodeToTree(xmlDoc.documentElement, 0)
    } catch (error) {
        console.error('Failed to parse hierarchy:', error)
        return null
    }
}

// 递归转换 DOM 节点为树结构
function nodeToTree(node, index = 0, parent = null) {
    if (!node || node.nodeType !== 1) return null

    const id = generateNodeId()
    const treeNode = {
        id: id,
        index: index,
        tag: node.tagName,
        className: node.getAttribute('class') || '',
        text: node.getAttribute('text') || '',
        contentDesc: node.getAttribute('content-desc') || '',
        resourceId: node.getAttribute('resource-id') || '',
        package: node.getAttribute('package') || '',
        checkable: node.getAttribute('checkable') === 'true',
        checked: node.getAttribute('checked') === 'true',
        clickable: node.getAttribute('clickable') === 'true',
        enabled: node.getAttribute('enabled') === 'true',
        focusable: node.getAttribute('focusable') === 'true',
        focused: node.getAttribute('focused') === 'true',
        scrollable: node.getAttribute('scrollable') === 'true',
        longClickable: node.getAttribute('long-clickable') === 'true',
        password: node.getAttribute('password') === 'true',
        selected: node.getAttribute('selected') === 'true',
        bounds: parseBounds(node.getAttribute('bounds')),
        attributes: {},
        children: [],
        parent: parent
    }

    // 存储所有属性
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i]
        treeNode.attributes[attr.name] = attr.value
    }

    // 递归处理子节点
    let childIndex = 0
    for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = nodeToTree(node.childNodes[i], childIndex, treeNode)
        if (childNode) {
            treeNode.children.push(childNode)
            childIndex++
        }
    }

    return treeNode
}

// 解析 bounds 字符串 "[x1,y1][x2,y2]" 为对象
function parseBounds(boundsStr) {
    if (!boundsStr) return null

    try {
        const regex = /\[(\d+),(\d+)\]\[(\d+),(\d+)\]/
        const match = boundsStr.match(regex)

        if (match) {
            const x1 = parseInt(match[1])
            const y1 = parseInt(match[2])
            const x2 = parseInt(match[3])
            const y2 = parseInt(match[4])

            return {
                x: x1,
                y: y1,
                width: x2 - x1,
                height: y2 - y1,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                centerX: (x1 + x2) / 2,
                centerY: (y1 + y2) / 2
            }
        }
    } catch (error) {
        console.error('Failed to parse bounds:', error)
    }

    return null
}

// 生成唯一 ID
let nodeIdCounter = 0
function generateNodeId() {
    return `node-${Date.now()}-${nodeIdCounter++}`
}

// 生成 XPath (Lite 版本)
export function generateXPathLite(node) {
    if (!node) return ''

    const parts = []
    let current = node

    while (current) {
        let part = current.tag || '*'

        // 添加识别属性
        const conditions = []

        if (current.resourceId) {
            conditions.push(`@resource-id='${current.resourceId}'`)
        } else if (current.text) {
            conditions.push(`@text='${current.text}'`)
        } else if (current.contentDesc) {
            conditions.push(`@content-desc='${current.contentDesc}'`)
        } else if (current.className) {
            conditions.push(`@class='${current.className}'`)
        }

        // 添加索引（如果有兄弟节点）
        if (current.parent && current.parent.children) {
            const siblings = current.parent.children.filter(
                c => c.tag === current.tag
            )
            if (siblings.length > 1) {
                const index = siblings.findIndex(s => s.id === current.id)
                if (index >= 0) {
                    conditions.push(`${index + 1}`)
                }
            }
        }

        if (conditions.length > 0) {
            part += `[${conditions.join(' and ')}]`
        }

        parts.unshift(part)
        current = current.parent
    }

    return '//' + parts.join('/')
}

// 查找所有匹配的节点
export function findNodesByPredicate(root, predicate) {
    const results = []

    function traverse(node) {
        if (!node) return

        if (predicate(node)) {
            results.push(node)
        }

        if (node.children) {
            node.children.forEach(child => traverse(child))
        }
    }

    traverse(root)
    return results
}

// 根据文本查找节点
export function findNodesByText(root, text) {
    return findNodesByPredicate(
        root,
        node => node.text && node.text.toLowerCase().includes(text.toLowerCase())
    )
}

// 根据 resource-id 查找节点
export function findNodeById(root, resourceId) {
    return findNodesByPredicate(
        root,
        node => node.resourceId === resourceId
    )
}

// 根据 className 查找节点
export function findNodesByClassName(root, className) {
    return findNodesByPredicate(
        root,
        node => node.className === className
    )
}

// 扁平化树结构
export function flattenTree(root) {
    const result = []

    function traverse(node) {
        if (!node) return
        result.push(node)
        if (node.children) {
            node.children.forEach(child => traverse(child))
        }
    }

    traverse(root)
    return result
}

// 获取节点的显示文本
export function getNodeDisplayText(node) {
    if (!node) return 'Unknown'

    // 使用 className 作为主要显示名称
    let text = node.className || node.tag || 'Unknown'

    // 如果有 name 或 label，添加到后面
    if (node.name) {
        text += ' - ' + node.name
    } else if (node.label) {
        text += ' - ' + node.label
    }

    // 如果有 resourceId，添加到后面
    if (node.resourceId) {
        const shortId = node.resourceId.split('/').pop()
        text += ' - ' + shortId
    }

    return text
}

// 检查节点是否在视口内
export function isNodeVisible(node, viewportWidth, viewportHeight) {
    if (!node || !node.bounds) return false

    const bounds = node.bounds
    return (
        bounds.x2 > 0 &&
        bounds.y2 > 0 &&
        bounds.x1 < viewportWidth &&
        bounds.y1 < viewportHeight
    )
}
