import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Settings Service
 * All settings operations through WebSocket instead of HTTP requests
 */

/**
 * Get settings
 */
export async function ws_get_settings() {
    try {
        const response = await sendWsMessage('settings.get')
        return { code: 0, data: response.data || {} }
    } catch (error) {
        console.error('ws_get_settings error:', error)
        throw error
    }
}

/**
 * Update settings
 */
export async function ws_update_settings(settings) {
    try {
        const response = await sendWsMessage('settings.update', settings)
        return { success: response.success }
    } catch (error) {
        console.error('ws_update_settings error:', error)
        throw error
    }
}

export default {
    ws_get_settings,
    ws_update_settings
}
