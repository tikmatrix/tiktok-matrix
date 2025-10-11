import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

const args = process.argv.slice(2).filter(Boolean);
const hasFlag = flag => args.includes(flag);

if (hasFlag('--help') || hasFlag('-h')) {
    printUsage(0);
}

const brandArg = args.find(arg => !arg.startsWith('-')) || process.env.WHITELABEL_BRAND;

if (!brandArg) {
    console.error('❌ 未指定白标品牌目录。');
    printUsage(1);
}

const skipIcon = hasFlag('--skip-icon');
const skipBuild = hasFlag('--skip-build');
const verbose = hasFlag('--verbose');

const brandDir = path.join(rootDir, 'whitelable', brandArg);
const configPath = path.join(brandDir, 'config.json');
const buildScriptPath = isWindows
    ? path.join(rootDir, 'build.ps1')
    : isMac
        ? path.join(rootDir, 'build.sh')
        : null;

if (!fs.existsSync(brandDir)) {
    console.error(`❌ 未找到白标目录: ${brandDir}`);
    process.exit(1);
}

if (!fs.existsSync(configPath)) {
    console.error(`❌ 未找到配置文件: ${configPath}`);
    console.error('👉 请先创建 config.json 并填写必要信息。');
    process.exit(1);
}

const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const appName = mustHave(rawConfig.appName, 'appName');
const officialWebsite = mustHave(rawConfig.officialWebsite, 'officialWebsite');
const apiDomain = normalizeDomain(mustHave(rawConfig.apiDomain, 'apiDomain'));
const emailSupport = rawConfig.emailSupport?.trim() || '';
const telegramSupport = rawConfig.telegramSupport?.trim() || '';
const whatsappSupport = rawConfig.whatsappSupport?.trim() || '';
const iconFile = rawConfig.iconFile?.trim() || 'app-icon.png';
const iconSource = path.join(brandDir, iconFile);

if (!fs.existsSync(iconSource)) {
    console.error(`❌ 未找到白标图标文件: ${iconSource}`);
    process.exit(1);
}

const appId = sanitizeAppId(rawConfig.appId?.trim() || appName);
if (!appId) {
    throw new Error('无法根据 appName 生成有效的 appId，请在 config.json 中显式设置 appId');
}
const updaterEndpoint = `${apiDomain}/front-api/check_update?app=${appId}`;
const mossUrl = `${apiDomain}/moss`;

if (verbose) {
    console.log('📋 白标配置:');
    console.log(`   • 品牌: ${brandArg}`);
    console.log(`   • 应用名: ${appName}`);
    console.log(`   • 应用 ID: ${appId}`);
    console.log(`   • 官网: ${officialWebsite}`);
    console.log(`   • API: ${apiDomain}`);
    console.log(`   • 更新地址: ${updaterEndpoint}`);
    console.log(`   • MOSS: ${mossUrl}`);
}

const backups = new Map();
const iconBackups = new Map();
let iconUpdated = false;
let iconGenerated = false;
let hadError = false;

try {
    console.log(`🚀 开始为 ${brandArg} 构建白标包...`);

    updateTauriConfig();
    updateWhitelabelConfig();
    updateMainRs();
    updateIcons();

    if (!skipIcon) {
        runCommand('npm run tauri icon');
        iconGenerated = true;
    } else {
        console.log('⚠️ 跳过图标生成 (tauri icon)。');
    }

    if (!skipBuild) {
        runBuild();
        console.log('🎉 构建完成，产物位于 src-tauri/target/release');
    } else {
        console.log('⚠️ 已按要求跳过 tauri build，配置已应用但未打包。');
    }

} catch (error) {
    hadError = true;
    console.error(`❌ 构建失败: ${error.message}`);
    process.exitCode = 1;
} finally {
    restoreTextFiles();
    restoreIcons();

    if (iconUpdated && iconGenerated) {
        try {
            runCommand('npm run tauri icon', true);
            console.log('♻️ 已恢复默认图标集。');
        } catch (error) {
            console.warn(`⚠️ 恢复默认图标失败: ${error.message}`);
        }
    }

    if (!hadError) {
        console.log('✅ 已恢复项目原始配置。');
    }
}

function updateTauriConfig() {
    const tauriConfigPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
    backupTextFile(tauriConfigPath);

    const json = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf-8'));

    json.package = json.package || {};
    json.package.productName = appName;

    if (json.tauri?.windows?.length) {
        json.tauri.windows = json.tauri.windows.map(win => ({
            ...win,
            title: appName,
        }));
    }

    if (json.tauri?.bundle) {
        json.tauri.bundle.identifier = `com.${appId}`;
    }

    if (json.tauri?.updater) {
        json.tauri.updater.endpoints = [updaterEndpoint];
    }



    fs.writeFileSync(tauriConfigPath, JSON.stringify(json, null, 2) + '\n');
}

function updateWhitelabelConfig() {
    const configFile = path.join(rootDir, 'src', 'config', 'whitelabel.js');
    backupTextFile(configFile);
    let content = fs.readFileSync(configFile, 'utf-8');

    content = replaceConfigString(content, 'appName', appName);
    content = replaceConfigString(content, 'officialWebsite', officialWebsite);
    content = replaceConfigString(content, 'apiDomain', apiDomain);
    content = replaceConfigString(content, 'emailSupport', emailSupport);
    content = replaceConfigString(content, 'telegramSupport', telegramSupport);
    content = replaceConfigString(content, 'whatsappSupport', whatsappSupport);

    fs.writeFileSync(configFile, content, 'utf-8');
}

function updateMainRs() {
    const mainRsPath = path.join(rootDir, 'src-tauri', 'src', 'main.rs');
    backupTextFile(mainRsPath);
    let content = fs.readFileSync(mainRsPath, 'utf-8');

    // 在 setup_env 函数的 debug_assertions 块之后添加 MOSS_URL 设置
    const debugBlockRegex = /(if cfg!\(debug_assertions\) \{[\s\S]*?\})\s*(\})/;
    if (!debugBlockRegex.test(content)) {
        throw new Error('无法在 main.rs 中找到 setup_env 函数的 debug_assertions 块。');
    }

    // 在 debug_assertions 的 if 块之后、setup_env 函数结束之前插入 MOSS_URL
    content = content.replace(
        debugBlockRegex,
        `$1\n    std::env::set_var("MOSS_URL", "${escapeRust(mossUrl)}");$2`
    );

    fs.writeFileSync(mainRsPath, content, 'utf-8');
}

function updateIcons() {
    const targets = [
        path.join(rootDir, 'app-icon.png'),
        path.join(rootDir, 'src', 'assets', 'logo.png'),
        path.join(rootDir, 'src', 'assets', 'app-icon.png'),
    ].filter(fs.existsSync);

    if (targets.length === 0) {
        console.warn('⚠️ 未找到需要替换的图标文件，跳过。');
        return;
    }

    targets.forEach(target => {
        iconBackups.set(target, fs.readFileSync(target));
        fs.copyFileSync(iconSource, target);
    });

    iconUpdated = true;
}

function restoreTextFiles() {
    for (const [filePath, content] of backups.entries()) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

function restoreIcons() {
    for (const [filePath, buffer] of iconBackups.entries()) {
        fs.writeFileSync(filePath, buffer);
    }
}

function backupTextFile(filePath) {
    if (!backups.has(filePath)) {
        backups.set(filePath, fs.readFileSync(filePath, 'utf-8'));
    }
}

function replaceConfigString(content, key, value) {
    const regex = new RegExp(`(${key}\\s*:\\s*)['\"]([^'\"]*)['\"]`);
    if (!regex.test(content)) {
        throw new Error(`无法在 whitelabel.js 中找到字段 ${key}`);
    }
    return content.replace(regex, (_, prefix) => `${prefix}'${escapeJs(value)}'`);
}

function runCommand(command, quiet = false) {
    if (!quiet) {
        console.log(`➡️  执行命令: ${command}`);
    }
    execSync(command, {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true,
    });
}

function runBuild() {
    if (isWindows || isMac) {
        if (!buildScriptPath || !fs.existsSync(buildScriptPath)) {
            throw new Error(`未找到构建脚本: ${buildScriptPath}`);
        }

        const command = isWindows
            ? `powershell -ExecutionPolicy Bypass -File "${buildScriptPath}"`
            : `bash "${buildScriptPath}"`;

        runCommand(command);
        return;
    }

    console.warn('⚠️ 当前平台不在支持列表(仅 Windows/macOS)，回退到 `npm run tauri build`。');
    runCommand('npm run tauri build');
}

function mustHave(value, key) {
    if (value === undefined || value === null) {
        throw new Error(`配置字段 "${key}" 不能为空`);
    }
    const str = String(value).trim();
    if (!str) {
        throw new Error(`配置字段 "${key}" 不能为空`);
    }
    return str;
}

function sanitizeAppId(value) {
    return value
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9.-]/g, '');
}

function normalizeDomain(value) {
    const trimmed = value.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(trimmed)) {
        throw new Error(`API 域名必须包含协议(http/https): ${value}`);
    }
    return trimmed;
}

function escapeJs(value) {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeRust(value) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function printUsage(code) {
    console.log('用法:');
    console.log('  node scripts/build-whitelabel.js <品牌目录> [--skip-icon] [--skip-build] [--verbose]');
    console.log('示例:');
    console.log('  node scripts/build-whitelabel.js TikZenx --verbose');
    process.exit(code);
}
