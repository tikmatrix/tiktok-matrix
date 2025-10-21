import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

const STORAGE_DIR = 'data';
const STORAGE_FILE = 'app_state.json';
const STORAGE_PATH = `${STORAGE_DIR}/${STORAGE_FILE}`;

let store = {};
let initialized = false;
let initPromise = null;
let persistQueue = Promise.resolve();

function isTauriEnvironment() {
    return typeof window !== 'undefined' && '__TAURI__' in window;
}

function hasBrowserLocalStorage() {
    try {
        return typeof window !== 'undefined' && window.localStorage != null;
    } catch (error) {
        console.warn('LocalStorage unavailable:', error);
        return false;
    }
}

async function ensureStorageDir() {
    if (!isTauriEnvironment()) {
        return;
    }

    try {
        const dirExists = await exists(STORAGE_DIR, { dir: BaseDirectory.AppData });
        if (!dirExists) {
            await createDir(STORAGE_DIR, { dir: BaseDirectory.AppData, recursive: true });
        }
    } catch (error) {
        console.error('Failed to ensure storage directory:', error);
        throw error;
    }
}

async function loadFromFile() {
    if (!isTauriEnvironment()) {
        return {};
    }

    try {
        const fileExists = await exists(STORAGE_PATH, { dir: BaseDirectory.AppData });
        if (!fileExists) {
            return {};
        }

        const content = await readTextFile(STORAGE_PATH, { dir: BaseDirectory.AppData });
        if (!content || !content.trim()) {
            return {};
        }

        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }

        return {};
    } catch (error) {
        console.error('Failed to load persistent storage, falling back to empty store:', error);
        return {};
    }
}

function readLegacyLocalStorage() {
    if (!hasBrowserLocalStorage()) {
        return {};
    }

    const legacyData = {};
    for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (key != null) {
            legacyData[key] = window.localStorage.getItem(key);
        }
    }
    return legacyData;
}

function clearLegacyLocalStorageKeys(keys) {
    if (!hasBrowserLocalStorage()) {
        return;
    }
    keys.forEach(key => {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Failed to remove legacy localStorage key "${key}":`, error);
        }
    });
}

async function persistToFile() {
    if (!isTauriEnvironment()) {
        if (hasBrowserLocalStorage()) {
            Object.entries(store).forEach(([key, value]) => {
                if (value === undefined || value === null) {
                    window.localStorage.removeItem(key);
                } else {
                    window.localStorage.setItem(key, value);
                }
            });
        }
        return;
    }

    try {
        await ensureStorageDir();
        const payload = JSON.stringify(store, null, 2);
        await writeTextFile(STORAGE_PATH, payload, { dir: BaseDirectory.AppData });
    } catch (error) {
        console.error('Failed to persist storage:', error);
        throw error;
    }
}

function enqueuePersist() {
    persistQueue = persistQueue.then(() => persistToFile()).catch((error) => {
        console.error('Storage persistence error:', error);
    });
    return persistQueue;
}

export async function initStorage() {
    if (initialized) {
        return store;
    }

    if (!initPromise) {
        initPromise = (async () => {
            store = await loadFromFile();

            const legacyData = readLegacyLocalStorage();
            const legacyKeys = Object.keys(legacyData);
            let migrated = false;
            Object.entries(legacyData).forEach(([key, value]) => {
                if (!(key in store) && value !== null && value !== undefined) {
                    store[key] = String(value);
                    migrated = true;
                }
            });

            initialized = true;

            if (migrated) {
                await enqueuePersist();
            }

            if (legacyKeys.length > 0 && isTauriEnvironment()) {
                clearLegacyLocalStorageKeys(legacyKeys);
            }

            return store;
        })().catch((error) => {
            console.error('Failed to initialise persistent storage:', error);
            store = {};
            initialized = true;
            return store;
        });
    }

    return initPromise;
}

async function ensureInitialised() {
    if (!initialized) {
        await initStorage();
    }
}

export async function getItem(key) {
    await ensureInitialised();
    const value = store[key];
    return value === undefined ? null : value;
}

export async function getJsonItem(key, defaultValue = null) {
    const raw = await getItem(key);
    if (raw === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`Failed to parse JSON for key "${key}", returning default value.`, error);
        return defaultValue;
    }
}

export async function setItem(key, value) {
    await ensureInitialised();
    if (value === undefined || value === null) {
        delete store[key];
    } else {
        store[key] = String(value);
    }
    await enqueuePersist();
}

export async function setJsonItem(key, value) {
    try {
        await setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to serialise JSON for key "${key}":`, error);
        throw error;
    }
}

export async function removeItem(key) {
    await ensureInitialised();
    if (key in store) {
        delete store[key];
        await enqueuePersist();
    }
}

export async function clearStorage() {
    await ensureInitialised();
    store = {};
    await enqueuePersist();
}

export async function getAllKeys() {
    await ensureInitialised();
    return Object.keys(store);
}

export async function getStoreSnapshot() {
    await ensureInitialised();
    return { ...store };
}

export const STORAGE_FILE_PATH = STORAGE_PATH;
