import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Script Service
 * All script execution operations through WebSocket instead of HTTP requests
 */

/**
 * Execute a script
 * @param {Object} scriptRequest - Script execution request
 */
export async function ws_script(scriptRequest) {
    try {
        const response = await sendWsMessage('script.execute', scriptRequest)
        return { data: response.data }
    } catch (error) {
        console.error('ws_script error:', error)
        throw error
    }
}

/**
 * Stop a task
 * @param {Object} data - Task stop request
 */
export async function ws_stop_task(data) {
    try {
        const response = await sendWsMessage('script.stop_task', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_stop_task error:', error)
        throw error
    }
}

/**
 * Run script by account immediately
 * @param {Object} data - Run request data
 */
export async function ws_run_now_by_account(data) {
    try {
        const response = await sendWsMessage('script.run_now_by_account', data, 60000, 'script.execute.response')
        return { success: response.success, data: response.data }
    } catch (error) {
        console.error('ws_run_now_by_account error:', error)
        throw error
    }
}

/**
 * Send message now
 * @param {Object} data - Message data
 */
export async function ws_message_now(data) {
    try {
        const response = await sendWsMessage('script.message_now', data, 60000, 'script.execute.response')
        return { success: response.success, data: response.data }
    } catch (error) {
        console.error('ws_message_now error:', error)
        throw error
    }
}

/**
 * Comment now
 * @param {Object} data - Comment data
 */
export async function ws_comment_now(data) {
    try {
        const response = await sendWsMessage('script.comment_now', data, 60000, 'script.execute.response')
        return { success: response.success, data: response.data }
    } catch (error) {
        console.error('ws_comment_now error:', error)
        throw error
    }
}

/**
 * Follow now
 * @param {Object} data - Follow data
 */
export async function ws_follow_now(data) {
    try {
        const response = await sendWsMessage('script.follow_now', data, 60000, 'script.execute.response')
        return { success: response.success, data: response.data }
    } catch (error) {
        console.error('ws_follow_now error:', error)
        throw error
    }
}

/**
 * Scrape now
 * @param {Object} data - Scrape data
 */
export async function ws_scrape_now(data) {
    try {
        const response = await sendWsMessage('script.scrape_now', data, 60000, 'script.execute.response')
        return { success: response.success, data: response.data }
    } catch (error) {
        console.error('ws_scrape_now error:', error)
        throw error
    }
}

/**
 * Super marketing run now
 * @param {Object} data - Super marketing data
 */
export async function ws_super_marketing_run_now(data) {
    try {
        // This action can perform heavy processing (task planning / allocation).
        // Use a generous timeout to avoid transient WS timeouts. 60s is a reasonable default.
        const response = await sendWsMessage('script.super_marketing_run_now', data, 60000, 'script.execute.response')
        return { success: response.success, data: response.data }
    } catch (error) {
        console.error('ws_super_marketing_run_now error:', error, 'action: script.super_marketing_run_now', 'data:', data)
        throw error
    }
}

export default {
    ws_script,
    ws_stop_task,
    ws_run_now_by_account,
    ws_message_now,
    ws_comment_now,
    ws_follow_now,
    ws_scrape_now,
    ws_super_marketing_run_now
}
