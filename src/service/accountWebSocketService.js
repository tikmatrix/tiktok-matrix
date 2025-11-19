import { sendWsMessage } from './wsRequest'

/**
 * WebSocket Account Service
 * All account operations through WebSocket instead of HTTP requests
 */

/**
 * Get all accounts
 */
export async function ws_get_accounts() {
    try {
        const response = await sendWsMessage('account.list')
        return { data: response.data || [] }
    } catch (error) {
        console.error('ws_get_accounts error:', error)
        throw error
    }
}

/**
 * Create a new account
 */
export async function ws_add_account(account) {
    try {
        const response = await sendWsMessage('account.create', account)
        return { success: response.success }
    } catch (error) {
        console.error('ws_add_account error:', error)
        throw error
    }
}

/**
 * Update an account
 */
export async function ws_update_account(account) {
    try {
        const response = await sendWsMessage('account.update', account)
        return { success: response.success }
    } catch (error) {
        console.error('ws_update_account error:', error)
        throw error
    }
}

/**
 * Delete an account by id
 */
export async function ws_delete_account({ id }) {
    try {
        const response = await sendWsMessage('account.delete', { id })
        return { success: response.success }
    } catch (error) {
        console.error('ws_delete_account error:', error)
        throw error
    }
}

export default {
    ws_get_accounts,
    ws_add_account,
    ws_update_account,
    ws_delete_account
}
