/**
 * 白标配置管理
 * 支持动态修改应用名称、logo、主题色等
 */


export const DEFAULT_WHITELABEL_CONFIG = {
    // 应用基本信息
    appName: '',
    officialWebsite: 'https://tikmatrix.com', // 官网域名
    apiDomain: 'https://api.tikmatrix.com', // API域名
    enablePay: true, // 是否启用支付功能

    // Logo配置
    logo: {
        main: '', // 主logo
        dark: '', // 暗色模式logo
    },

    // 品牌配置
    branding: {
        emailSupport: 'support@tikmatrix.com',
        telegramSupport: 'https://t.me/tikmatrix',
        whatsappSupport: '',
    },


};

/**
 * 获取白标配置
 */
export function getWhiteLabelConfig() {
    try {
        const stored = localStorage.getItem('whitelabel_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            // 深度合并配置，确保所有必需的属性都存在
            return deepMerge(DEFAULT_WHITELABEL_CONFIG, parsed);
        }
    } catch (error) {
        console.warn('Failed to parse whitelabel config:', error);
    }
    return JSON.parse(JSON.stringify(DEFAULT_WHITELABEL_CONFIG));
}

/**
 * 深度合并对象
 */
function deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }

    return result;
}

/**
 * 保存白标配置
 */
export function saveWhiteLabelConfig(config) {
    try {
        const mergedConfig = deepMerge(DEFAULT_WHITELABEL_CONFIG, config);
        localStorage.setItem('whitelabel_config', JSON.stringify(mergedConfig));
        return true;
    } catch (error) {
        console.error('Failed to save whitelabel config:', error);
        return false;
    }
}

/**
 * 重置白标配置
 */
export function resetWhiteLabelConfig() {
    localStorage.removeItem('whitelabel_config');
    return JSON.parse(JSON.stringify(DEFAULT_WHITELABEL_CONFIG));
}

/**
 * 验证配置格式
 */
export function validateWhiteLabelConfig(config) {
    const required = ['appName'];
    const missing = required.filter(key => !config[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
}
