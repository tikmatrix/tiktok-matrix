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
 * 初始化白标配置
 */
export async function initWhiteLabel() {
    const config = await getWhiteLabelConfig();

    // 更新标题
    updateDocumentTitle(config.appName);

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
