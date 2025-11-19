/**
 * WebSocket Connection State Manager
 * Provides global WebSocket connection state and wait utilities
 */

class WsConnectionState {
    constructor() {
        this.connected = false
        this.waiters = []
        this.maxWaitTime = 30000 // 30 seconds max wait time
    }

    /**
     * Set connection status
     * @param {boolean} isConnected - Whether WebSocket is connected
     */
    setConnected(isConnected) {
        const wasConnected = this.connected
        this.connected = isConnected

        // Notify all waiters when connection is established
        if (isConnected && !wasConnected && this.waiters.length > 0) {
            console.log(`[WsConnectionState] Connection established, notifying ${this.waiters.length} waiters`)
            this.waiters.forEach(resolve => resolve())
            this.waiters = []
        }
    }

    /**
     * Check if WebSocket is currently connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected
    }

    /**
     * Wait for WebSocket connection to be established
     * @param {number} timeout - Max time to wait in milliseconds
     * @returns {Promise<void>} Resolves when connected or rejects on timeout
     */
    waitForConnection(timeout = this.maxWaitTime) {
        // If already connected, resolve immediately
        if (this.connected) {
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                // Remove from waiters list
                const index = this.waiters.indexOf(resolve)
                if (index > -1) {
                    this.waiters.splice(index, 1)
                }
                reject(new Error('WebSocket connection timeout'))
            }, timeout)

            // Add to waiters list
            const wrappedResolve = () => {
                clearTimeout(timer)
                resolve()
            }
            this.waiters.push(wrappedResolve)
        })
    }

    /**
     * Reset state (for cleanup)
     */
    reset() {
        this.connected = false
        // Reject all pending waiters
        this.waiters.forEach(() => {
            // Could reject here if needed
        })
        this.waiters = []
    }
}

// Global singleton instance
const wsConnectionState = new WsConnectionState()

export default wsConnectionState
