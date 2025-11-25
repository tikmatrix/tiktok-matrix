/**
 * Persistent Storage Utility
 * Backed by Rust backend for better performance and reliability
 */

import { invoke } from '@tauri-apps/api/tauri'

/**
 * Get a storage item by key
 * @param {string} key - Storage key
 * @returns {Promise<string|null>} - Stored value or null if not found
 */
export async function getItem(key) {
    try {
        const result = await invoke('get_storage_item', { key })
        return result || null
    } catch (error) {
        console.error(`Failed to get storage item "${key}":`, error)
        return null
    }
}

/**
 * Get a JSON storage item by key
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key not found or parse fails
 * @returns {Promise<*>} - Parsed JSON value or default value
 */
export async function getJsonItem(key, defaultValue = null) {
    try {
        const raw = await getItem(key)
        if (raw === null) {
            return defaultValue
        }
        return JSON.parse(raw)
    } catch (error) {
        console.warn(`Failed to parse JSON for key "${key}", returning default value.`, error)
        return defaultValue
    }
}

/**
 * Set a storage item
 * @param {string} key - Storage key
 * @param {string} value - Value to store (will be converted to string)
 * @returns {Promise<void>}
 */
export async function setItem(key, value) {
    try {
        if (value === undefined || value === null) {
            await removeItem(key)
            return
        }
        await invoke('set_storage_item', { key, value: String(value) })
    } catch (error) {
        console.error(`Failed to set storage item "${key}":`, error)
        throw error
    }
}

/**
 * Set a JSON storage item
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON serialized)
 * @returns {Promise<void>}
 */
export async function setJsonItem(key, value) {
    try {
        await setItem(key, JSON.stringify(value))
    } catch (error) {
        console.error(`Failed to set JSON item "${key}":`, error)
        throw error
    }
}

/**
 * Remove a storage item by key
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function removeItem(key) {
    try {
        await invoke('remove_storage_item', { key })
    } catch (error) {
        console.error(`Failed to remove storage item "${key}":`, error)
        throw error
    }
}

/**
 * Clear all storage
 * @returns {Promise<void>}
 */
export async function clearStorage() {
    try {
        await invoke('clear_storage')
    } catch (error) {
        console.error('Failed to clear storage:', error)
        throw error
    }
}

/**
 * Get all storage keys
 * @returns {Promise<string[]>} - Array of all storage keys
 */
export async function getAllKeys() {
    try {
        return await invoke('get_all_storage_keys')
    } catch (error) {
        console.error('Failed to get all storage keys:', error)
        return []
    }
}

/**
 * Get a snapshot of all storage data
 * @returns {Promise<Object>} - Object containing all key-value pairs
 */
export async function getStoreSnapshot() {
    try {
        return await invoke('get_storage_snapshot')
    } catch (error) {
        console.error('Failed to get storage snapshot:', error)
        return {}
    }
}

/**
 * Initialize storage subsystem (kept for backward compatibility)
 * In Rust-backed mode nothing needs to be done, but we keep the hook
 * to maintain the bootstrap flow unchanged.
 * @returns {Promise<void>}
 */
export async function initStorage() {
    try {
        // Triggering a snapshot read ensures backend is reachable and file exists
        await invoke('get_storage_snapshot')
    } catch (error) {
        console.error('Failed to initialize storage:', error)
        throw error
    }
}

// Export storage file path constant for compatibility
export const STORAGE_FILE_PATH = 'data/app_state.json'
