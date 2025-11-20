import { invoke } from '@tauri-apps/api/tauri'
import { listen } from '@tauri-apps/api/event'
import wsConnectionState from '../utils/wsConnectionState'

/**
 * Send a request to the agent via WebSocket and wait for the corresponding response action.
 * Ensures the event listener is in place before emitting the request to avoid race conditions.
 * Will wait for WebSocket connection if not yet connected.
 *
 * @param {string} action - Action name understood by the agent, e.g. "task.list".
 * @param {any} [data=null] - Optional payload sent with the action.
 * @param {number} [timeout=10000] - Milliseconds to wait before rejecting the request.
 * @param {string} [expectedAction] - Optional response action name to listen for. Default is `${action}.response`.
 * @returns {Promise<any>} Resolves with the raw response payload from the agent.
 */
export async function sendWsMessage(action, data = null, timeout = 10000, expectedAction = undefined) {
    // Wait for WebSocket connection before sending message
    try {
        await wsConnectionState.waitForConnection(timeout)
    } catch (error) {
        throw new Error(`WebSocket not connected: ${error.message}`)
    }
    const payload = { action }
    if (data !== null && data !== undefined) {
        payload.data = data
    }

    // Allow caller to override expected response action when server returns a
    // different action name (e.g. device.list -> device_snapshot)
    if (!expectedAction) {
        expectedAction = `${action}.response`
    }

    return new Promise((resolve, reject) => {
        let unlisten
        let settled = false

        const cleanup = () => {
            if (settled) {
                return
            }
            settled = true
            if (unlisten) {
                unlisten()
                unlisten = undefined
            }
        }

        const timer = setTimeout(() => {
            cleanup()
            reject(new Error(`WebSocket request timeout for action: ${action}`))
        }, timeout)

        const complete = (handler) => {
            cleanup()
            clearTimeout(timer)
            handler()
        }

        const registerAndSend = async () => {
            try {
                unlisten = await listen('agent://ws/message', (event) => {
                    const response = event?.payload
                    if (!response || response.action !== expectedAction) {
                        return
                    }

                    complete(() => {
                        if (response.success === false || response.error) {
                            reject(new Error(response.error || 'Request failed'))
                        } else {
                            resolve(response)
                        }
                    })
                })

                await invoke('agent_ws_send', { payload })
            } catch (error) {
                complete(() => reject(error))
            }
        }

        registerAndSend()
    })
}

export default {
    sendWsMessage
}
