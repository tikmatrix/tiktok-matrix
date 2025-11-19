import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Task Service
 * All task operations through WebSocket instead of HTTP requests
 */

/**
 * Get all tasks
 */
export async function ws_get_tasks() {
    try {
        const response = await sendWsMessage('task.list')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_tasks error:', error)
        throw error
    }
}

/**
 * Get running tasks
 */
export async function ws_get_running_tasks() {
    try {
        const response = await sendWsMessage('task.running')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_running_tasks error:', error)
        throw error
    }
}

/**
 * Create a new task
 */
export async function ws_create_task(taskData) {
    try {
        const response = await sendWsMessage('task.create', taskData)
        return { success: response.success }
    } catch (error) {
        console.error('ws_create_task error:', error)
        throw error
    }
}

/**
 * Update a task
 */
export async function ws_update_task(taskData) {
    try {
        const response = await sendWsMessage('task.update', taskData)
        return { code: response.success ? 0 : 1, data: 'ok' }
    } catch (error) {
        console.error('ws_update_task error:', error)
        return { code: 1, data: error.message }
    }
}

/**
 * Delete a task by id
 */
export async function ws_delete_task({ id }) {
    try {
        const response = await sendWsMessage('task.delete', { id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_task error:', error)
        throw error
    }
}

/**
 * Delete all tasks
 */
export async function ws_delete_all_tasks() {
    try {
        const response = await sendWsMessage('task.delete_all')
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_all_tasks error:', error)
        throw error
    }
}

/**
 * Retry all failed tasks
 */
export async function ws_retry_all_failed_tasks() {
    try {
        const response = await sendWsMessage('task.retry_all')
        return { code: response.success ? 0 : 1, data: response.data || 0 }
    } catch (error) {
        console.error('ws_retry_all_failed_tasks error:', error)
        return { code: 1, data: error.message }
    }
}

/**
 * Get task count by status
 */
export async function ws_count_task_by_status() {
    try {
        const response = await sendWsMessage('task.count_by_status')
        return { code: 0, data: Array.isArray(response.data) ? response.data : [] }
    } catch (error) {
        console.error('ws_count_task_by_status error:', error)
        throw error
    }
}

export default {
    ws_get_tasks,
    ws_get_running_tasks,
    ws_create_task,
    ws_update_task,
    ws_delete_task,
    ws_delete_all_tasks,
    ws_retry_all_failed_tasks,
    ws_count_task_by_status
}
