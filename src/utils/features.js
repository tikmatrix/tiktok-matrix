import { getJsonItem, removeItem, setJsonItem } from './storage.js';

/**
 * 功能解锁管理工具
 */

let unlockedCache = null;
let loadPromise = null;

async function ensureLoaded() {
    if (Array.isArray(unlockedCache)) {
        return unlockedCache;
    }

    if (!loadPromise) {
        loadPromise = (async () => {
            const stored = await getJsonItem('unlockedFeatures', []);
            unlockedCache = Array.isArray(stored) ? stored : [];
            return unlockedCache;
        })().catch(error => {
            console.error('Failed to load unlocked features:', error);
            unlockedCache = [];
            return unlockedCache;
        });
    }

    return loadPromise;
}

export async function getUnlockedFeatures() {
    const features = await ensureLoaded();
    return [...features];
}

export async function isFeatureUnlocked(featureName) {
    const features = await ensureLoaded();
    return features.includes(featureName);
}

export function isFeatureUnlockedSync(featureName) {
    if (!Array.isArray(unlockedCache)) {
        return false;
    }
    return unlockedCache.includes(featureName);
}

export async function unlockFeature(featureName) {
    const features = await ensureLoaded();
    if (!features.includes(featureName)) {
        features.push(featureName);
        await setJsonItem('unlockedFeatures', features);
    }
    return [...features];
}

export async function resetUnlockedFeatures() {
    unlockedCache = [];
    await removeItem('unlockedFeatures');
    return [];
}
