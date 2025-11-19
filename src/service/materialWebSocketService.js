import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Material Service
 * All material operations through WebSocket instead of HTTP requests
 */

/**
 * Get materials list
 * @param {Object} params - { group_id?: number }
 */
export async function ws_get_materials(params = {}) {
    try {
        const response = await sendWsMessage('material.list', params)
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_materials error:', error)
        throw error
    }
}

/**
 * Update a material
 */
export async function ws_update_material(material) {
    try {
        const response = await sendWsMessage('material.update', material)
        return { success: response.success }
    } catch (error) {
        console.error('ws_update_material error:', error)
        throw error
    }
}

/**
 * Delete a material by id
 */
export async function ws_delete_material({ id }) {
    try {
        const response = await sendWsMessage('material.delete', { id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_material error:', error)
        throw error
    }
}

/**
 * Delete all materials in a group
 */
export async function ws_delete_all_materials({ group_id }) {
    try {
        const response = await sendWsMessage('material.delete_all', { group_id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_all_materials error:', error)
        throw error
    }
}

/**
 * Get material count
 * @param {Object} params - { used?: number, group_id?: number, content_type?: number }
 */
export async function ws_get_material_count(params = {}) {
    try {
        const response = await sendWsMessage('material.count', params)
        return { code: 0, data: response.data }
    } catch (error) {
        console.error('ws_get_material_count error:', error)
        throw error
    }
}

export default {
    ws_get_materials,
    ws_update_material,
    ws_delete_material,
    ws_delete_all_materials,
    ws_get_material_count
}
