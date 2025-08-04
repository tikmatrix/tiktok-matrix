/**
 * 功能解锁管理工具
 */

/**
 * 检查功能是否已解锁
 * @param {string} featureName - 功能名称
 * @returns {boolean} - 是否已解锁
 */
export function isFeatureUnlocked(featureName) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedFeatures') || '[]');
    return unlocked.includes(featureName);
}

/**
 * 解锁功能
 * @param {string} featureName - 功能名称
 */
export function unlockFeature(featureName) {
    const unlocked = JSON.parse(localStorage.getItem('unlockedFeatures') || '[]');
    if (!unlocked.includes(featureName)) {
        unlocked.push(featureName);
        localStorage.setItem('unlockedFeatures', JSON.stringify(unlocked));
    }
}

/**
 * 获取所有已解锁的功能
 * @returns {Array} - 已解锁功能列表
 */
export function getUnlockedFeatures() {
    return JSON.parse(localStorage.getItem('unlockedFeatures') || '[]');
}

/**
 * 重置所有解锁功能（仅用于调试）
 */
export function resetUnlockedFeatures() {
    localStorage.removeItem('unlockedFeatures');
}
