/**
 * 白标工具类
 * 提供白标功能相关的实用方法
 */

import { getWhiteLabelConfig } from '../config/whitelabel.js';

/**
 * 更新文档标题
 */
export function updateDocumentTitle(appName) {
    document.title = appName || 'TikMatrix';
}

/**
 * 更新favicon
 */
export function updateFavicon(logoUrl) {
    if (!logoUrl) return;

    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = logoUrl;

    if (!document.querySelector("link[rel*='icon']")) {
        document.getElementsByTagName('head')[0].appendChild(link);
    }
}

/**
 * 初始化白标配置
 */
export function initWhiteLabel() {
    const config = getWhiteLabelConfig();

    // 更新标题
    updateDocumentTitle(config.appName);

    // 更新favicon
    updateFavicon(config.logo.favicon);

    return config;
}

/**
 * 验证URL格式
 */
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * 生成配置的摘要信息
 */
export function getConfigSummary(config) {
    return {
        appName: config.appName,
        hasCustomLogo: config.logo.main !== '/src/assets/logo.png',
        featuresEnabled: Object.values(config.features).filter(Boolean).length,
        lastModified: new Date().toISOString()
    };
}

/**
 * 深度合并配置对象
 */
export function deepMergeConfig(defaultConfig, userConfig) {
    const result = { ...defaultConfig };

    for (const key in userConfig) {
        if (userConfig[key] && typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
            result[key] = deepMergeConfig(result[key] || {}, userConfig[key]);
        } else {
            result[key] = userConfig[key];
        }
    }

    return result;
}
