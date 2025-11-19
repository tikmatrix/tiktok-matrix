import { sendWsMessage } from '@/utils/wsRequest'

/**
 * Get list of devices via WebSocket
 * @param {string} source - Source of the request (e.g., 'manual', 'auto')
 * @param {Object} extra - Additional parameters
 * @returns {Promise<Array>} List of devices
 */
export async function ws_list_devices(source = 'manual', extra = {}) {
    try {
        console.log('[DeviceWS] Listing devices, source:', source)
        const response = await sendWsMessage('device.list', {
            source,
            ...extra
        })
        console.log('[DeviceWS] List devices response:', response)
        return response.data
    } catch (error) {
        console.error('[DeviceWS] Failed to list devices:', error)
        throw error
    }
}

/**
 * Get online device count via WebSocket
 * @returns {Promise<number>} Online device count
 */
export async function ws_count_online_device() {
    try {
        console.log('[DeviceWS] Counting online devices')
        const response = await sendWsMessage('device.count_online', {})
        console.log('[DeviceWS] Count online devices response:', response)
        return response.data
    } catch (error) {
        console.error('[DeviceWS] Failed to count online devices:', error)
        throw error
    }
}
