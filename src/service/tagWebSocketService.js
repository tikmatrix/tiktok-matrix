import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Tag Service
 * All tag management operations through WebSocket instead of HTTP requests
 */

/**
 * Get all tags
 */
export async function ws_get_tags() {
    try {
        const response = await sendWsMessage('tag.list')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_tags error:', error)
        throw error
    }
}

/**
 * Add a new tag
 * @param {Object} data - Tag data
 */
export async function ws_add_tag(data) {
    try {
        const response = await sendWsMessage('tag.create', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_add_tag error:', error)
        throw error
    }
}

/**
 * Update a tag
 * @param {Object} data - Tag data with id
 */
export async function ws_update_tag(data) {
    try {
        const response = await sendWsMessage('tag.update', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_update_tag error:', error)
        throw error
    }
}

/**
 * Delete a tag
 * @param {Object} params - { id: number }
 */
export async function ws_delete_tag({ id }) {
    try {
        const response = await sendWsMessage('tag.delete', { id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_tag error:', error)
        throw error
    }
}

/**
 * Get material's tags
 * @param {Object} params - { material_id: number }
 */
export async function ws_get_material_tags({ material_id }) {
    try {
        const response = await sendWsMessage('tag.get_material_tags', { material_id })
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_material_tags error:', error)
        throw error
    }
}

/**
 * Add tags to material
 * @param {Object} params - { material_id: number, tag_ids: number[] }
 */
export async function ws_add_tags_to_material({ material_id, tag_ids }) {
    try {
        const response = await sendWsMessage('tag.add_tags_to_material', { material_id, tag_ids })
        return { success: response.success }
    } catch (error) {
        console.error('ws_add_tags_to_material error:', error)
        throw error
    }
}

/**
 * Add a single tag to material
 * @param {Object} params - { material_id: number, tag_id: number }
 */
export async function ws_add_tag_to_material({ material_id, tag_id }) {
    try {
        const response = await sendWsMessage('tag.add_tag_to_material', { material_id, tag_id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_add_tag_to_material error:', error)
        throw error
    }
}

/**
 * Remove tag from material
 * @param {Object} params - { material_id: number, tag_id: number }
 */
export async function ws_remove_tag_from_material({ material_id, tag_id }) {
    try {
        const response = await sendWsMessage('tag.remove_tag_from_material', { material_id, tag_id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_remove_tag_from_material error:', error)
        throw error
    }
}

/**
 * Clear all tags from material
 * @param {Object} params - { material_id: number }
 */
export async function ws_clear_material_tags({ material_id }) {
    try {
        const response = await sendWsMessage('tag.clear_material_tags', { material_id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_clear_material_tags error:', error)
        throw error
    }
}

/**
 * Get material with tags
 * @param {Object} params - { material_id: number }
 */
export async function ws_get_material_with_tags({ material_id }) {
    try {
        const response = await sendWsMessage('tag.get_material_with_tags', { material_id })
        return { data: response.data }
    } catch (error) {
        console.error('ws_get_material_with_tags error:', error)
        throw error
    }
}

/**
 * List all materials with tags
 */
export async function ws_list_all_materials_with_tags() {
    try {
        const response = await sendWsMessage('tag.list_all_materials_with_tags')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_list_all_materials_with_tags error:', error)
        throw error
    }
}

/**
 * Get materials by tag
 * @param {Object} params - { tag_id: number }
 */
export async function ws_get_materials_by_tag({ tag_id }) {
    try {
        const response = await sendWsMessage('tag.get_materials_by_tag', { tag_id })
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_materials_by_tag error:', error)
        throw error
    }
}

/**
 * Get materials with tags by tag
 * @param {Object} params - { tag_id: number }
 */
export async function ws_get_materials_with_tags_by_tag({ tag_id }) {
    try {
        const response = await sendWsMessage('tag.get_materials_with_tags_by_tag', { tag_id })
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_materials_with_tags_by_tag error:', error)
        throw error
    }
}

export default {
    ws_get_tags,
    ws_add_tag,
    ws_update_tag,
    ws_delete_tag,
    ws_get_material_tags,
    ws_add_tags_to_material,
    ws_add_tag_to_material,
    ws_remove_tag_from_material,
    ws_clear_material_tags,
    ws_get_material_with_tags,
    ws_list_all_materials_with_tags,
    ws_get_materials_by_tag,
    ws_get_materials_with_tags_by_tag
}
