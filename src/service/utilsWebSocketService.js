import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Utils Service
 * Utility functions through WebSocket instead of HTTP requests
 */

/**
 * Get analytics data
 */
export async function ws_get_analytics() {
    try {
        const response = await sendWsMessage('utils.get_analytics')
        return { data: response.data }
    } catch (error) {
        console.error('ws_get_analytics error:', error)
        throw error
    }
}

/**
 * Test proxy rotation
 * @param {Object} data - Proxy test data
 */
export async function ws_test_proxy_rotation(data) {
    try {
        const response = await sendWsMessage('utils.test_proxy_rotation', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_test_proxy_rotation error:', error)
        throw error
    }
}

/**
 * ChatGPT completion
 * @param {Object} data - ChatGPT request data
 */
export async function ws_chatgpt_completion(data) {
    try {
        const response = await sendWsMessage('utils.chatgpt_completion', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_chatgpt_completion error:', error)
        throw error
    }
}

/**
 * Get follow record
 * @param {Object} params - { username: string }
 */
export async function ws_get_follow_record({ username }) {
    try {
        const response = await sendWsMessage('utils.get_follow_record', { username })
        return { data: response.data }
    } catch (error) {
        console.error('ws_get_follow_record error:', error)
        throw error
    }
}

/**
 * Clear follow records
 * @param {Object} params - { username: string }
 */
export async function ws_clear_follow_records({ username }) {
    try {
        const response = await sendWsMessage('utils.clear_follow_records', { username })
        return { success: response.success }
    } catch (error) {
        console.error('ws_clear_follow_records error:', error)
        throw error
    }
}

/**
 * Report distributor install
 * @param {Object} data - Distributor install data
 */
export async function ws_report_distributor_install(data) {
    try {
        const response = await sendWsMessage('utils.report_distributor_install', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_report_distributor_install error:', error)
        throw error
    }
}

/**
 * Initialize system
 * @param {Object} data - Initialization data
 */
export async function ws_init(data) {
    try {
        const response = await sendWsMessage('utils.init', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_init error:', error)
        throw error
    }
}

/**
 * Upload video
 * @param {Object} data - Upload data
 */
export async function ws_upload_video(data) {
    try {
        const response = await sendWsMessage('utils.upload_video', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_upload_video error:', error)
        throw error
    }
}

/**
 * Upload videos
 * @param {Object} data - Upload data
 */
export async function ws_upload_videos(data) {
    try {
        const response = await sendWsMessage('utils.upload_videos', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_upload_videos error:', error)
        throw error
    }
}

/**
 * Get menus
 */
export async function ws_get_menus() {
    try {
        const response = await sendWsMessage('utils.get_menus')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_menus error:', error)
        throw error
    }
}

/**
 * Get group config file
 * @param {Object} params - { group_id: number, script_name: string }
 */
export async function ws_get_group_config_file({ group_id, script_name }) {
    try {
        const response = await sendWsMessage('utils.get_group_config_file', { group_id, script_name })
        return { data: response.data }
    } catch (error) {
        console.error('ws_get_group_config_file error:', error)
        throw error
    }
}

/**
 * Save group config file
 * @param {Object} data - { group_id: number, script_name: string, settings: object }
 */
export async function ws_save_group_config_file({ group_id, script_name, settings }) {
    try {
        const response = await sendWsMessage('utils.save_group_config_file', { group_id, script_name, settings })
        return { success: response.success }
    } catch (error) {
        console.error('ws_save_group_config_file error:', error)
        throw error
    }
}

export default {
    ws_get_analytics,
    ws_test_proxy_rotation,
    ws_chatgpt_completion,
    ws_get_follow_record,
    ws_clear_follow_records,
    ws_report_distributor_install,
    ws_init,
    ws_upload_video,
    ws_upload_videos,
    ws_get_menus,
    ws_get_group_config_file,
    ws_save_group_config_file
}
