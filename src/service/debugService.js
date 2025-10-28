import { ref, nextTick } from 'vue'
import { fetch, Body, ResponseType } from '@tauri-apps/api/http'
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'

// 获取设备截图 URL
export async function getDeviceScreenshot(serial) {
    const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData })
    const url = `http://localhost:${port}/api/device/screenshot?serial=${serial}&_=${Date.now()}`
    // 直接返回图片 URL,不需要下载
    return { code: 0, data: url }
}

// Dump 设备 UI 层次结构 (返回 XML 文本)
export async function dumpDeviceHierarchy(serial) {
    const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData })
    const url = `http://localhost:${port}/api/device/hierarchy?serial=${serial}&_=${Date.now()}`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache'
        },
        responseType: ResponseType.Text
    })
    // hierarchy 接口直接返回 XML 文本,不是 JSON 格式
    return { code: 0, data: response.data }
}

// 获取当前 Activity
export async function getDeviceActivity(serial) {
    const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData })
    const url = `http://localhost:${port}/api/device/activity?serial=${serial}&_=${Date.now()}`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache'
        },
        responseType: ResponseType.Text
    })

    return { code: 0, data: response.data }
}

// 在设备上执行 tap 操作
export async function tapDevice(serial, x, y) {
    const port = await readTextFile('port.txt', { dir: BaseDirectory.AppData })
    const url = `http://localhost:${port}/api/device/tap`
    const response = await fetch(url, {
        method: 'POST',
        body: Body.json({ serial, x, y }),
        responseType: ResponseType.JSON
    })
    return response.data
}

export function useDeviceDebugService(deviceSerial) {
    const loading = ref(false)
    const screenshot = ref(null)
    const hierarchy = ref(null)
    const error = ref(null)
    const activity = ref('')

    const dumpHierarchy = async () => {
        loading.value = true
        error.value = null

        try {
            const res = await dumpDeviceHierarchy(deviceSerial)
            if (res.code === 0) {
                hierarchy.value = null
                await nextTick()
                hierarchy.value = res.data
            } else {
                error.value = res.error || 'Failed to dump hierarchy'
            }
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const getScreenshot = async () => {
        loading.value = true
        error.value = null

        try {
            const res = await getDeviceScreenshot(deviceSerial)
            if (res.code === 0) {
                const cacheBustedUrl = res.data
                    ? `${res.data}${res.data.includes('?') ? '&' : '?'}_=${Date.now()}`
                    : null
                screenshot.value = null
                await nextTick()
                screenshot.value = cacheBustedUrl
            } else {
                error.value = res.error || 'Failed to get screenshot'
            }
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const getActivity = async () => {
        loading.value = true
        error.value = null

        try {
            const res = await getDeviceActivity(deviceSerial)
            if (res.code === 0) {
                activity.value = res.data ? res.data.trim() : ''
            } else {
                error.value = res.error || 'Failed to get activity'
            }
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const tap = async (x, y) => {
        try {
            const res = await tapDevice(deviceSerial, x, y)
            if (res.code !== 0) {
                error.value = res.error || 'Failed to tap'
                throw new Error(error.value)
            }

            if (res.data) {
                if (res.data.screenshot) {
                    screenshot.value = res.data.screenshot
                }
                if (res.data.hierarchy) {
                    hierarchy.value = res.data.hierarchy
                }
            }
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    return {
        loading,
        screenshot,
        hierarchy,
        activity,
        error,
        dumpHierarchy,
        getScreenshot,
        getActivity,
        tap
    }
}