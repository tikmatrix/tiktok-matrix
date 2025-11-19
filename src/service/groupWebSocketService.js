import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Group Service
 * All group operations through WebSocket instead of HTTP requests
 */

/**
 * Get all groups
 */
export async function ws_get_groups() {
    try {
        const response = await sendWsMessage('group.list')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_groups error:', error)
        throw error
    }
}

/**
 * Create a new group
 */
export async function ws_add_group(group) {
    try {
        const response = await sendWsMessage('group.create', group)
        return { success: response.success }
    } catch (error) {
        console.error('ws_add_group error:', error)
        throw error
    }
}

/**
 * Update a group
 */
export async function ws_update_group(group) {
    try {
        const response = await sendWsMessage('group.update', group)
        return { success: response.success }
    } catch (error) {
        console.error('ws_update_group error:', error)
        throw error
    }
}

/**
 * Delete a group by id
 */
export async function ws_delete_group({ id }) {
    try {
        const response = await sendWsMessage('group.delete', { id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_group error:', error)
        throw error
    }
}

/**
 * Get a group by id
 */
export async function ws_get_group_by_id({ id }) {
    try {
        const response = await sendWsMessage('group.get_by_id', { id })
        return { code: 0, data: response.data }
    } catch (error) {
        console.error('ws_get_group_by_id error:', error)
        throw error
    }
}

export default {
    ws_get_groups,
    ws_add_group,
    ws_update_group,
    ws_delete_group,
    ws_get_group_by_id
}
