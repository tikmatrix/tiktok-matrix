import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Device Control Service
 * All device control operations through WebSocket instead of HTTP requests
 */

/**
 * Execute ADB command
 * @param {Object} adbCommandRequest - ADB command request
 */
export async function ws_adb_command(adbCommandRequest) {
    try {
        const response = await sendWsMessage('device.adb_command', adbCommandRequest)
        return { data: response.data }
    } catch (error) {
        console.error('ws_adb_command error:', error)
        throw error
    }
}

/**
 * Scan TCP devices
 * @param {Object} data - Scan parameters
 */
export async function ws_scan_tcp(data) {
    try {
        const response = await sendWsMessage('device.scan_tcp', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_scan_tcp error:', error)
        throw error
    }
}

/**
 * Get TCP scan details
 * @param {Object} data - Scan detail parameters
 */
export async function ws_scan_tcp_details(data) {
    try {
        const response = await sendWsMessage('device.scan_tcp_details', data)
        return { data: response.data }
    } catch (error) {
        console.error('ws_scan_tcp_details error:', error)
        throw error
    }
}

/**
 * Move device to group
 * @param {Object} data - Move request data
 */
export async function ws_move_to_group(data) {
    try {
        const response = await sendWsMessage('device.move_to_group', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_move_to_group error:', error)
        throw error
    }
}

/**
 * Set text on device
 * @param {Object} data - Set text data
 */
export async function ws_set_text(data) {
    try {
        const response = await sendWsMessage('device.set_text', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_set_text error:', error)
        throw error
    }
}

/**
 * Read clipboard from device
 * @param {Object} params - { serial: string }
 */
export async function ws_read_clipboard({ serial }) {
    try {
        const response = await sendWsMessage('device.read_clipboard', { serial })
        return { data: response.data }
    } catch (error) {
        console.error('ws_read_clipboard error:', error)
        throw error
    }
}

/**
 * Clear gallery on device
 * @param {Object} data - Clear gallery data
 */
export async function ws_clear_gallery(data) {
    try {
        const response = await sendWsMessage('device.clear_gallery', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_clear_gallery error:', error)
        throw error
    }
}

/**
 * Reset all index
 * @param {Object} data - Reset data
 */
export async function ws_reset_all_index(data) {
    try {
        const response = await sendWsMessage('device.reset_all_index', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_reset_all_index error:', error)
        throw error
    }
}

/**
 * Get device index
 * @param {Object} params - { serial: string, index: number }
 */
export async function ws_get_index({ serial, index }) {
    try {
        const response = await sendWsMessage('device.get_index', { serial, index })
        return { data: response.data }
    } catch (error) {
        console.error('ws_get_index error:', error)
        throw error
    }
}

/**
 * Open TikTok app
 * @param {Object} data - Open TikTok data
 */
export async function ws_open_tiktok(data) {
    try {
        const response = await sendWsMessage('device.open_tiktok', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_open_tiktok error:', error)
        throw error
    }
}

/**
 * Stop TikTok app
 * @param {Object} data - Stop TikTok data
 */
export async function ws_stop_tiktok(data) {
    try {
        const response = await sendWsMessage('device.stop_tiktok', data)
        return { success: response.success }
    } catch (error) {
        console.error('ws_stop_tiktok error:', error)
        throw error
    }
}

/**
 * Detect current package on device
 * @param {string} serial - Device serial number
 */
export async function ws_detect_current_package(serial) {
    try {
        const response = await sendWsMessage('device.detect_package', { serial })
        return { data: response.data }
    } catch (error) {
        console.error('ws_detect_current_package error:', error)
        throw error
    }
}

export default {
    ws_adb_command,
    ws_scan_tcp,
    ws_scan_tcp_details,
    ws_move_to_group,
    ws_set_text,
    ws_read_clipboard,
    ws_clear_gallery,
    ws_reset_all_index,
    ws_get_index,
    ws_open_tiktok,
    ws_stop_tiktok,
    ws_detect_current_package
}
