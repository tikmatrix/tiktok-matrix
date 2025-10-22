import { invoke } from '@tauri-apps/api/tauri';
import { exists } from '@tauri-apps/api/fs';
import { getItem, removeItem } from './persistentStorage.js';

/**
 * 通用设置管理工具
 * 用于简化设置文件的读写操作
 */
export class SettingsManager {
    constructor(filename) {
        this.filename = filename;
    }

    /**
     * 从文件加载设置
     * @param {Object} defaultSettings - 默认设置对象
     * @returns {Promise<Object>} 加载的设置对象
     */
    async loadSettings(defaultSettings = {}) {
        // 检查是否需要执行迁移
        const needsMigration = await this.shouldMigrate(defaultSettings);

        if (needsMigration) {
            console.log(`Settings file ${this.filename} doesn't exist, attempting migration...`);

            // 执行迁移
            const migratedSettings = await this.attemptDataMigration(defaultSettings);

            if (migratedSettings !== defaultSettings) {
                console.log(`从localStorage迁移的设置:`, migratedSettings);

                try {
                    await this.saveSettings(migratedSettings);
                    console.log(`设置已保存到 ${this.filename}`);

                    // 迁移成功后清理localStorage中的相关数据
                    await this.cleanupMigratedLocalStorageData(defaultSettings);

                    return migratedSettings;
                } catch (saveError) {
                    console.error('保存迁移设置失败:', saveError);
                    return migratedSettings; // 即使保存失败也返回迁移的数据
                }
            }

            return defaultSettings;
        }

        // 文件存在且有效，正常加载
        try {
            const settingsJson = await invoke('read_settings_file_generic', {
                filename: this.filename
            });
            const settings = JSON.parse(settingsJson);

            // 合并默认设置和文件设置
            return { ...defaultSettings, ...settings };
        } catch (error) {
            console.error(`Failed to load settings from ${this.filename}:`, error);
            // 如果加载失败，尝试迁移作为后备方案
            console.log('尝试作为后备方案执行迁移...');
            const migratedSettings = await this.attemptDataMigration(defaultSettings);
            return migratedSettings !== defaultSettings ? migratedSettings : defaultSettings;
        }
    }

    /**
     * 检查设置文件是否存在且有效
     * @returns {Promise<boolean>} 文件是否存在且有效
     */
    async checkSettingsFileExists() {
        try {
            // 首先使用 Tauri API 检查文件是否存在
            const fileExists = await exists(this.filename);

            if (!fileExists) {
                console.log(`Settings file ${this.filename} does not exist`);
                return false;
            }

            // 文件存在，检查内容是否有效
            const settingsJson = await invoke('read_settings_file_generic', {
                filename: this.filename
            });

            // 检查文件内容是否为空
            if (!settingsJson || settingsJson.trim() === '') {
                console.log(`Settings file ${this.filename} is empty`);
                return false;
            }

            // 尝试解析JSON以确保格式有效
            JSON.parse(settingsJson);
            return true;
        } catch (error) {
            console.log(`Settings file ${this.filename} check failed:`, error);
            return false;
        }
    }

    /**
     * 检查是否需要执行数据迁移
     * @param {Object} defaultSettings - 默认设置对象
     * @returns {Promise<boolean>} 是否需要执行迁移
     */
    async shouldMigrate(defaultSettings) {
        // 如果设置文件已存在且有效，不需要迁移
        const fileExists = await this.checkSettingsFileExists();
        if (fileExists) {
            return false;
        }

        // 检查localStorage中是否有相关数据
        const defaultKeys = Object.keys(defaultSettings);
        for (const key of defaultKeys) {
            const legacyValue = await getItem(key);
            if (legacyValue !== null) {
                return true;
            }
        }
        return false;
    }

    /**
     * 尝试进行数据迁移
     * @param {Object} defaultSettings - 默认设置对象
     * @returns {Promise<Object>} 迁移后的设置对象，如果没有迁移则返回默认设置
     */
    async attemptDataMigration(defaultSettings) {
        console.log(`=== 开始自动迁移检查 [${this.filename}] ===`);
        console.log('时间:', new Date().toLocaleString());

        // 检查localStorage中是否有相关的历史数据
        const defaultKeys = Object.keys(defaultSettings);
        console.log('检查的默认设置键列表:', defaultKeys);

        // 详细记录localStorage状态
        console.log('遗留存储状态:');
        const legacyData = {};
        for (const key of defaultKeys) {
            const value = await getItem(key);
            legacyData[key] = value;
            console.log(`  ${key}: ${value === null ? 'null' : value} (type: ${typeof value})`);
        }

        const hasLegacyData = Object.values(legacyData).some(value => value !== null);
        console.log('是否发现历史数据:', hasLegacyData);

        if (hasLegacyData) {
            console.log('>>> 开始执行自动迁移');
            const migratedSettings = await this.migrateFromLegacyStorage(defaultSettings);
            console.log('>>> 迁移完成');
            return migratedSettings;
        } else {
            console.log('>>> 未发现历史数据，使用默认设置');
            return defaultSettings;
        }
    }

    /**
     * 从localStorage迁移设置数据
     * @param {Object} defaultSettings - 默认设置对象
     * @returns {Object} 迁移的设置对象
     */
    async migrateFromLegacyStorage(defaultSettings) {
        const migratedSettings = { ...defaultSettings };
        let migrationCount = 0;

        console.log(`--- 执行迁移逻辑 [${this.filename}] ---`);

        // 直接检查每个默认设置的键
        for (const key of Object.keys(defaultSettings)) {
            const legacyValue = await getItem(key);
            const oldValue = migratedSettings[key];

            if (legacyValue !== null) {
                try {
                    // 尝试解析JSON，如果失败则使用原始字符串
                    const parsedValue = JSON.parse(legacyValue);
                    migratedSettings[key] = parsedValue;
                    console.log(`  ✓ ${key}: "${legacyValue}" (parsed) | 旧值: "${oldValue}" -> 新值: "${parsedValue}"`);
                    migrationCount++;
                } catch {
                    // 如果不是JSON，直接使用字符串值
                    migratedSettings[key] = legacyValue;
                    console.log(`  ✓ ${key}: "${legacyValue}" (string) | 旧值: "${oldValue}" -> 新值: "${legacyValue}"`);
                    migrationCount++;
                }
            } else {
                console.log(`  - ${key}: 无数据，保持默认值 "${oldValue}"`);
            }
        }

        console.log(`迁移汇总: 共处理 ${Object.keys(defaultSettings).length} 个属性，成功迁移 ${migrationCount} 个`);
        return migratedSettings;
    }

    /**
     * 清理已迁移的localStorage数据
     * @param {Object} defaultSettings - 默认设置对象
     */
    async cleanupMigratedLocalStorageData(defaultSettings) {
        console.log(`--- 清理遗留存储数据 [${this.filename}] ---`);

        let cleanedCount = 0;
        for (const key of Object.keys(defaultSettings)) {
            const legacyValue = await getItem(key);
            if (legacyValue !== null) {
                await removeItem(key);
                cleanedCount++;
                console.log(`  ✓ 已清理: ${key}`);
            }
        }

        if (cleanedCount > 0) {
            console.log(`清理完成: 共清理了 ${cleanedCount} 个遗留条目`);
        } else {
            console.log('无需清理遗留数据');
        }
    }

    /**
     * 保存设置到文件
     * @param {Object} settings - 要保存的设置对象
     * @returns {Promise<void>}
     */
    async saveSettings(settings) {
        try {
            await invoke('write_settings_file_generic', {
                filename: this.filename,
                content: JSON.stringify(settings, null, 2)
            });
        } catch (error) {
            console.error(`Failed to save settings to ${this.filename}:`, error);
            throw error;
        }
    }

    /**
     * 重置设置文件
     * @param {Object} defaultSettings - 默认设置对象
     * @returns {Promise<void>}
     */
    async resetSettings(defaultSettings = {}) {
        try {
            console.log(`重置设置文件 ${this.filename} 为默认设置`);
            await this.saveSettings(defaultSettings);
            return defaultSettings;
        } catch (error) {
            console.error(`重置设置文件 ${this.filename} 失败:`, error);
            throw error;
        }
    }

    /**
     * 创建一个 Vue 组件的 mixin，用于自动管理设置
     * @param {Object} defaultSettings - 默认设置对象
     * @param {Array<string>} watchedProperties - 需要监听的属性列表
     * @returns {Object} Vue mixin 对象
     */
    createVueMixin(defaultSettings, watchedProperties = []) {
        const settingsManager = this;

        return {
            data() {
                // 创建响应式数据属性
                const data = {};
                Object.keys(defaultSettings).forEach(key => {
                    data[key] = defaultSettings[key];
                });
                return data;
            },

            async created() {
                // 在组件创建时立即加载设置，这样能确保迁移的数据被立即应用
                await this.loadComponentSettings();
            },

            methods: {
                async loadComponentSettings() {
                    console.log(`=== Loading component settings for ${settingsManager.filename} ===`);
                    try {
                        const settings = await settingsManager.loadSettings(defaultSettings);
                        console.log('Loaded settings:', settings);

                        // 将设置应用到组件数据，同时确保对象类型正确
                        Object.keys(settings).forEach(key => {
                            if (key in this.$data) {
                                // 判断默认值和加载值的类型是否匹配
                                const defaultType = typeof defaultSettings[key];
                                const loadedValue = settings[key];
                                const loadedType = typeof loadedValue;

                                // 如果默认值是对象但加载值不是，则使用默认值
                                if (defaultType === 'object' && defaultType !== loadedType) {
                                    console.warn(`Type mismatch for setting ${key}: expected object but got ${loadedType}. Using default value.`);
                                    // 使用Vue的$set方法确保响应式
                                    this.$set(this, key, JSON.parse(JSON.stringify(defaultSettings[key])));
                                } else {
                                    console.log(`Setting ${key} from ${JSON.stringify(this[key])} to ${JSON.stringify(loadedValue)}`);
                                    this[key] = loadedValue;
                                }
                            }
                        });

                        console.log('Component settings loaded successfully');
                    } catch (error) {
                        console.error('Failed to load component settings:', error);
                    }
                },

                async saveComponentSettings() {
                    try {
                        const settings = {};

                        // 收集需要保存的属性
                        watchedProperties.forEach(prop => {
                            if (prop in this.$data) {
                                settings[prop] = this[prop];
                            }
                        });

                        await settingsManager.saveSettings(settings);
                    } catch (error) {
                        console.error('Failed to save component settings:', error);
                    }
                },

                // 添加手动保存设置的方法
                async saveSettings() {
                    await this.saveComponentSettings();
                }
            },

            watch: (() => {
                const watchers = {};

                // 为每个监听的属性创建 watcher
                watchedProperties.forEach(prop => {
                    watchers[prop] = {
                        handler() {
                            this.saveComponentSettings();
                        },
                        deep: true
                    };
                });

                return watchers;
            })()
        };
    }
}

// 预定义的设置管理器
export const accountWarmupSettings = new SettingsManager('account_warmup_settings.json');
export const postSettings = new SettingsManager('post_settings.json');
export const scrapeUsersSettings = new SettingsManager('scrape_users_settings.json');
export const unfollowAllSettings = new SettingsManager('unfollow_all_settings.json');
export const boostPostsSettings = new SettingsManager('boost_posts_settings.json');
export const deletePostSettings = new SettingsManager('delete_post_settings.json');
export const boostUsersSettings = new SettingsManager('boost_users_settings.json');
export const profileSettings = new SettingsManager('profile_settings.json');
export const massDMSettings = new SettingsManager('mass_dm_settings.json');
export const beforeRunScriptSettings = new SettingsManager('before_run_script_settings.json');
export const boostLivesSettings = new SettingsManager('boost_lives_settings.json');
export const massCommentSettings = new SettingsManager('mass_comment_settings.json');
export const followBackSettings = new SettingsManager('follow_back_settings.json');
export const superBoostSettings = new SettingsManager('super_boost_settings.json');
export const boostCommentsSettings = new SettingsManager('boost_comments_settings.json');

// 导出常用函数
export async function loadSettings(filename, defaultSettings = {}) {
    const manager = new SettingsManager(filename);
    return await manager.loadSettings(defaultSettings);
}

export async function saveSettings(filename, settings) {
    const manager = new SettingsManager(filename);
    return await manager.saveSettings(settings);
}
