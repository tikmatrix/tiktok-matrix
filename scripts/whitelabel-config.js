#!/usr/bin/env node

/**
 * 白标配置命令行工具
 * 用于快速配置白标设置
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const CONFIG_FILE = path.join(__dirname, '../src/config/whitelabel-build.json');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function promptForConfig() {
    console.log('🎨 TikMatrix 白标配置工具\n');

    const config = {
        appName: await question('应用名称 (默认: TikMatrix): ') || 'TikMatrix',
        logo: {
            main: await question('主要Logo路径 (默认: /src/assets/app-icon.png): ') || '/src/assets/app-icon.png',
            favicon: await question('Favicon路径 (默认: /public/favicon.ico): ') || '/public/favicon.ico',
            titleBar: await question('标题栏Logo路径 (默认: /src/assets/app-icon.png): ') || '/src/assets/app-icon.png',
        },
        branding: {
            supportEmail: await question('支持邮箱 (默认: support@tikmatrix.com): ') || 'support@tikmatrix.com',
            tutorialUrl: await question('教程地址 (默认: https://tikmatrix.com/docs/intro): ') || 'https://tikmatrix.com/docs/intro',
            rewardsUrl: await question('奖励页面地址 (默认: https://tikmatrix.com/rewards): ') || 'https://tikmatrix.com/rewards',
            telegramUrl: await question('Telegram地址 (默认: https://t.me/tikmatrix): ') || 'https://t.me/tikmatrix',
        },
        features: {
            showTutorial: (await question('显示教程链接? (y/n, 默认: y): ') || 'y').toLowerCase() === 'y',
            showRewards: (await question('显示奖励链接? (y/n, 默认: y): ') || 'y').toLowerCase() === 'y',
            showBranding: (await question('显示品牌信息? (y/n, 默认: y): ') || 'y').toLowerCase() === 'y',
        }
    };

    return config;
}

async function updateTauriConfig(config) {
    const tauriConfigPath = path.join(__dirname, '../src-tauri/tauri.conf.json');

    if (fs.existsSync(tauriConfigPath)) {
        const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'));

        // 更新应用名称
        tauriConfig.package.productName = config.appName;
        tauriConfig.tauri.windows[0].title = config.appName;
        tauriConfig.tauri.bundle.identifier = `com.${config.appName.toLowerCase().replace(/\s+/g, '')}`;

        fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfig, null, 2));
        console.log('✅ Tauri配置已更新');
    }
}

async function updatePackageJson(config) {
    const packageJsonPath = path.join(__dirname, '../package.json');

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.name = config.appName.toLowerCase().replace(/\s+/g, '-');

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ package.json已更新');
    }
}

async function main() {
    try {
        console.log('欢迎使用TikMatrix白标配置工具！\n');

        const action = await question('请选择操作:\n1. 创建新的白标配置\n2. 从文件导入配置\n3. 查看当前配置\n请输入选项 (1-3): ');

        switch (action) {
            case '1':
                const config = await promptForConfig();

                // 保存配置文件
                fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
                console.log(`\n✅ 白标配置已保存到: ${CONFIG_FILE}`);

                // 询问是否更新构建配置
                const updateBuild = await question('\n是否更新构建配置文件? (y/n): ');
                if (updateBuild.toLowerCase() === 'y') {
                    await updateTauriConfig(config);
                    await updatePackageJson(config);
                }

                console.log('\n🎉 白标配置完成！');
                console.log('提示: 重新启动应用程序以查看更改。');
                break;

            case '2':
                const filePath = await question('请输入配置文件路径: ');
                if (fs.existsSync(filePath)) {
                    const importedConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    fs.writeFileSync(CONFIG_FILE, JSON.stringify(importedConfig, null, 2));
                    console.log('✅ 配置已导入');
                } else {
                    console.log('❌ 文件不存在');
                }
                break;

            case '3':
                if (fs.existsSync(CONFIG_FILE)) {
                    const currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
                    console.log('\n当前配置:');
                    console.log(JSON.stringify(currentConfig, null, 2));
                } else {
                    console.log('❌ 未找到配置文件');
                }
                break;

            default:
                console.log('❌ 无效选项');
                break;
        }

    } catch (error) {
        console.error('❌ 错误:', error.message);
    } finally {
        rl.close();
    }
}

main();
