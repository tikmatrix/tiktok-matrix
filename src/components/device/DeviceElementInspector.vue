<template>
    <div class="device-element-inspector flex flex-col h-full">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-md font-semibold">Element Inspector</h3>
        </div>

        <div v-if="element" class="flex-1 overflow-y-auto space-y-2 inspector-content">
            <div class="divider text-md">Main Properties</div>

            <div v-if="element.className" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Class</div>
                    <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Class"
                        @click="copyToClipboard(element.className, 'Class')">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
                <div class="property-value property-value-mono">{{ element.className }}</div>
            </div>

            <div v-if="element.text !== undefined" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Text</div>
                    <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Text"
                        @click="copyToClipboard(element.text, 'Text')">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
                <div class="property-value property-value-mono">
                    <span class="value-content" :class="whitespaceIndicators(element.text)"
                        v-text="coerceToString(element.text)"></span>
                </div>
                <div class="property-meta" v-if="element.text && element.text.length">
                    Length: {{ element.text.length }}
                </div>
            </div>

            <div v-if="element.contentDesc !== undefined" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Content Description</div>
                    <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Content Description"
                        @click="copyToClipboard(element.contentDesc, 'Content Description')">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
                <div class="property-value property-value-mono">
                    <span class="value-content" :class="whitespaceIndicators(element.contentDesc)"
                        v-text="coerceToString(element.contentDesc)"></span>
                </div>
                <div class="property-meta" v-if="element.contentDesc && element.contentDesc.length">
                    Length: {{ element.contentDesc.length }}
                </div>
            </div>

            <div v-if="element.resourceId" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Resource ID</div>
                    <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Resource ID"
                        @click="copyToClipboard(element.resourceId, 'Resource ID')">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
                <div class="property-value property-value-mono">{{ element.resourceId }}</div>
            </div>

            <div v-if="element.bounds" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Bounds</div>
                    <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Bounds"
                        @click="copyToClipboard(formatBoundsText(element.bounds), 'Bounds')">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
                <div class="property-value property-value-mono">
                    [{{ element.bounds.x }}, {{ element.bounds.y }}]
                    [{{ element.bounds.x2 }}, {{ element.bounds.y2 }}]
                </div>
            </div>

            <div v-if="element.bounds" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Size</div>
                    <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Size"
                        @click="copyToClipboard(formatSizeText(element.bounds), 'Size')">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
                <div class="property-value">
                    {{ formatSizeText(element.bounds) }}
                </div>
            </div>

            <div v-if="element.bounds" class="property-item">
                <div class="property-item-header">
                    <div class="property-label">Center</div>
                    <div class="property-actions">
                        <button type="button" class="btn btn-ghost btn-md copy-button" title="Copy Center"
                            @click="copyToClipboard(formatCenterText(element.bounds), 'Center')">
                            <font-awesome-icon icon="copy" />
                        </button>
                        <button type="button" @click="handleTapCenter" class="btn btn-md btn-ghost"
                            title="Tap on center">
                            <font-awesome-icon icon="hand-pointer" />
                        </button>
                    </div>
                </div>
                <div class="property-value">
                    {{ formatCenterText(element.bounds, true) }}
                </div>
            </div>

            <div class="divider text-md">State</div>

            <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.clickable" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Clickable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.enabled" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Enabled</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.focusable" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Focusable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.focused" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Focused</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.scrollable" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Scrollable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.selected" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Selected</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.checkable" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Checkable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.checked" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Checked</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.longClickable" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Long-clickable</span>
                </div>

                <div class="flex items-center gap-2">
                    <input type="checkbox" :checked="element.password" disabled class="checkbox checkbox-md" />
                    <span class="text-md">Password</span>
                </div>
            </div>

            <div v-if="Object.keys(filteredAttributes).length > 0" class="divider text-md">Other Attributes</div>

            <div v-for="(value, key) in filteredAttributes" :key="key" class="property-item-compact">
                <span class="property-label-compact">{{ key }}:</span>
                <div class="property-compact-value">
                    <span class="property-value-compact value-content" :class="whitespaceIndicators(value)"
                        v-text="coerceToString(value)"></span>
                    <button type="button" class="btn btn-ghost btn-md copy-button" :title="`Copy ${key}`"
                        @click="copyToClipboard(value, key)">
                        <font-awesome-icon icon="copy" />
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="flex-1 flex items-center justify-center text-base-content/50">
            <div class="text-center">
                <font-awesome-icon icon="mouse-pointer" class="text-4xl mb-2" />
                <p class="text-md">Click on an element to inspect</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
    element: Object,
    device: Object
})

const emit = defineEmits(['tap'])

const instance = getCurrentInstance()
const globalEmitter = instance?.proxy?.$emiter

const notify = async (type, message) => {
    if (typeof globalEmitter === 'function') {
        try {
            await globalEmitter('NOTIFY', {
                type,
                message,
                timeout: 2000
            })
        } catch (error) {
            console.error('Notification error:', error)
        }
    }
}

const coerceToString = (value) => (value == null ? '' : String(value))

const whitespaceIndicators = (value) => {
    const str = coerceToString(value)
    return {
        'has-leading-space': /^\s/.test(str),
        'has-trailing-space': /\s$/.test(str),
        'is-empty': str.length === 0
    }
}

const formatBoundsText = (bounds) => {
    if (!bounds) return ''
    return `[${bounds.x}, ${bounds.y}] [${bounds.x2}, ${bounds.y2}]`
}

const formatSizeText = (bounds) => {
    if (!bounds) return ''
    return `${bounds.width} x ${bounds.height}`
}

const formatCenterText = (bounds, withParentheses = false) => {
    if (!bounds) return ''
    const x = Math.round(bounds.centerX)
    const y = Math.round(bounds.centerY)
    return withParentheses ? `(${x}, ${y})` : `${x}, ${y}`
}

const copyToClipboard = async (value, label = 'Value') => {
    const text = coerceToString(value)
    const readableLabel = label || 'Value'

    try {
        const isTauri = typeof window !== 'undefined' && window.__TAURI__
        if (isTauri) {
            const { writeText } = await import('@tauri-apps/api/clipboard')
            await writeText(text)
        } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
        } else if (typeof document !== 'undefined') {
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.focus()
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
        } else {
            throw new Error('Clipboard unavailable')
        }

        await notify('success', `${readableLabel} copied`)
    } catch (error) {
        console.error('Failed to copy value:', error)
        const failureLabel = typeof readableLabel === 'string' ? readableLabel.toLowerCase() : 'value'
        await notify('error', `Failed to copy ${failureLabel}`)
    }
}

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

.inspector-content {
    background-color: hsl(var(--b1));
    border: 1px solid hsl(var(--bc) / 0.1);
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.property-item {
    background-color: hsl(var(--b2));
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px solid hsl(var(--bc) / 0.08);
}

.property-item+.property-item {
    margin-top: 0.5rem;
}

.property-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.property-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(var(--bc) / 0.7);
}

.property-value {
    font-size: 0.85rem;
    color: hsl(var(--bc));
    word-break: break-word;
    overflow-wrap: anywhere;
    background-color: hsl(var(--b2));
    border: 1px solid hsl(var(--bc) / 0.18);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-family: 'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace;
    display: inline-block;
    max-width: 100%;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 3px rgba(15, 23, 42, 0.12);
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.property-value:hover {
    border-color: hsl(var(--p) / 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 3px 8px rgba(15, 23, 42, 0.16);
    transform: translateY(-1px);
}

.property-value-mono {
    background-color: hsl(var(--b1));
    border-color: hsl(var(--bc) / 0.28);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 1px 4px rgba(15, 23, 42, 0.18);
}

.property-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.copy-button {
    padding: 0 0.35rem;
    min-height: 1.5rem;
    height: 1.5rem;
    color: hsl(var(--bc) / 0.6);
}

.copy-button:hover {
    color: hsl(var(--bc));
}

.property-value-mono .value-content,
.property-value-compact.value-content {
    display: inline-block;
    white-space: pre-wrap;
    word-break: break-word;
    position: relative;
    padding: 0.125rem 0;
    --leading-shadow: 0 0 0 0 transparent;
    --trailing-shadow: 0 0 0 0 transparent;
    box-shadow: inset var(--leading-shadow), inset var(--trailing-shadow);
}

.value-content.has-leading-space {
    --leading-shadow: 4px 0 0 0 hsl(var(--in) / 0.4);
    padding-left: 0.25rem;
}

.value-content.has-trailing-space {
    --trailing-shadow: -4px 0 0 0 hsl(var(--in) / 0.4);
    padding-right: 0.25rem;
}

.value-content.is-empty {
    min-height: 0.85rem;
}

.property-meta {
    margin-top: 0.25rem;
    font-size: 0.65rem;
    color: hsl(var(--bc) / 0.45);
}

.property-item-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background-color: hsl(var(--b2));
    border: 1px solid hsl(var(--bc) / 0.08);
    font-size: 0.75rem;
}

.property-item-compact+.property-item-compact {
    margin-top: 0.25rem;
}

.property-label-compact {
    font-family: 'Courier New', monospace;
    color: hsl(var(--bc) / 0.6);
    flex-shrink: 0;
}

.property-compact-value {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.property-value-compact {
    font-family: 'JetBrains Mono', 'Cascadia Code', 'Courier New', monospace;
    color: hsl(var(--bc));
    max-width: 18rem;
    word-break: break-word;
    overflow-wrap: anywhere;
    background-color: hsl(var(--b1));
    border: 1px solid hsl(var(--bc) / 0.22);
    border-radius: 0.4rem;
    padding: 0.35rem 0.6rem;
    display: inline-block;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 1px 4px rgba(15, 23, 42, 0.14);
}

.divider {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>
