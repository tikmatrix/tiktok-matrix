import { sendWsMessage } from '@/utils/wsRequest'

/**
 * Get license information via WebSocket
 * @returns {Promise<Object>} License data
 */
export async function ws_get_license() {
    try {
        console.log('[LicenseWS] Getting license')
        const response = await sendWsMessage('license.get', {})
        console.log('[LicenseWS] Get license response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get license:', error)
        throw error
    }
}

/**
 * Activate license via WebSocket
 * @param {string} licenseCode - License activation code
 * @returns {Promise<Object>} Activation result
 */
export async function ws_activate_license(licenseCode) {
    try {
        console.log('[LicenseWS] Activating license')
        const response = await sendWsMessage('license.activate', {
            license_code: licenseCode
        })
        console.log('[LicenseWS] Activate license response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to activate license:', error)
        throw error
    }
}

/**
 * Migrate license to another machine via WebSocket
 * @param {string} targetMachineId - Target machine ID
 * @returns {Promise<Object>} Migration result
 */
export async function ws_migrate_license(targetMachineId) {
    try {
        console.log('[LicenseWS] Migrating license to:', targetMachineId)
        const response = await sendWsMessage('license.migrate', {
            target_machine_id: targetMachineId
        })
        console.log('[LicenseWS] Migrate license response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to migrate license:', error)
        throw error
    }
}

/**
 * Validate license migration via WebSocket
 * @param {string} targetMachineId - Target machine ID
 * @returns {Promise<Object>} Validation result
 */
export async function ws_validate_license_migration(targetMachineId) {
    try {
        console.log('[LicenseWS] Validating license migration to:', targetMachineId)
        const response = await sendWsMessage('license.validate_migration', {
            target_machine_id: targetMachineId
        })
        console.log('[LicenseWS] Validate migration response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to validate license migration:', error)
        throw error
    }
}

/**
 * Get license concurrency limit via WebSocket
 * @returns {Promise<number>} Concurrency limit
 */
export async function ws_get_license_concurrency_limit() {
    try {
        console.log('[LicenseWS] Getting license concurrency limit')
        const response = await sendWsMessage('license.get_concurrency_limit', {})
        console.log('[LicenseWS] Get concurrency limit response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get concurrency limit:', error)
        throw error
    }
}

/**
 * Create order via WebSocket
 * @param {Object} orderData - Order creation data
 * @param {string} orderData.network - Payment network
 * @param {number} orderData.amount - Order amount
 * @param {string} orderData.plan_id - Plan ID
 * @param {string} orderData.plan_interval - Plan interval (month/year)
 * @returns {Promise<Object>} Order creation result
 */
export async function ws_create_order(orderData) {
    try {
        console.log('[LicenseWS] Creating order:', orderData)
        const response = await sendWsMessage('order.create', orderData)
        console.log('[LicenseWS] Create order response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to create order:', error)
        throw error
    }
}

/**
 * Get order information via WebSocket
 * @returns {Promise<Object>} Order data
 */
export async function ws_get_order() {
    try {
        console.log('[LicenseWS] Getting order')
        const response = await sendWsMessage('order.get', {})
        console.log('[LicenseWS] Get order response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get order:', error)
        throw error
    }
}

/**
 * Close order via WebSocket
 * @returns {Promise<Object>} Close order result
 */
export async function ws_close_order() {
    try {
        console.log('[LicenseWS] Closing order')
        const response = await sendWsMessage('order.close', {})
        console.log('[LicenseWS] Close order response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to close order:', error)
        throw error
    }
}

/**
 * Get Stripe checkout URL via WebSocket
 * @param {Object} checkoutData - Checkout data
 * @param {string} checkoutData.price_id - Stripe price ID
 * @param {string} checkoutData.plan_interval - Plan interval (month/year)
 * @returns {Promise<string>} Checkout URL
 */
export async function ws_get_stripe_checkout_url(checkoutData) {
    try {
        console.log('[LicenseWS] Getting Stripe checkout URL:', checkoutData)
        const response = await sendWsMessage('stripe.get_checkout_url', checkoutData)
        console.log('[LicenseWS] Get Stripe checkout URL response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get Stripe checkout URL:', error)
        throw error
    }
}

/**
 * Get Stripe portal URL via WebSocket
 * @returns {Promise<string>} Portal URL
 */
export async function ws_get_stripe_portal_url() {
    try {
        console.log('[LicenseWS] Getting Stripe portal URL')
        const response = await sendWsMessage('stripe.get_portal_url', {})
        console.log('[LicenseWS] Get Stripe portal URL response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get Stripe portal URL:', error)
        throw error
    }
}

/**
 * Get Stripe price table info via WebSocket
 * @returns {Promise<Object>} Price table info
 */
export async function ws_get_stripe_price_table_info() {
    try {
        console.log('[LicenseWS] Getting Stripe price table info')
        const response = await sendWsMessage('stripe.get_price_table_info', {})
        console.log('[LicenseWS] Get price table info response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get Stripe price table info:', error)
        throw error
    }
}

/**
 * Get Alipay checkout URL via WebSocket
 * @param {Object} checkoutData - Checkout data
 * @param {string} checkoutData.plan_id - Plan ID
 * @param {string} checkoutData.plan_interval - Plan interval (month/year)
 * @returns {Promise<string>} Checkout URL
 */
export async function ws_get_alipay_checkout_url(checkoutData) {
    try {
        console.log('[LicenseWS] Getting Alipay checkout URL:', checkoutData)
        const response = await sendWsMessage('alipay.get_checkout_url', checkoutData)
        console.log('[LicenseWS] Get Alipay checkout URL response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to get Alipay checkout URL:', error)
        throw error
    }
}

/**
 * Query TikTok user info via WebSocket
 * @param {string} username - TikTok username
 * @returns {Promise<Object>} User info
 */
export async function ws_tiktok_query(username) {
    try {
        console.log('[LicenseWS] Querying TikTok user:', username)
        const response = await sendWsMessage('tiktok.query', { username })
        console.log('[LicenseWS] TikTok query response:', response)
        return response.data
    } catch (error) {
        console.error('[LicenseWS] Failed to query TikTok user:', error)
        throw error
    }
}
