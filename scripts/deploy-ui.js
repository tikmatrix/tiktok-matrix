import { execSync } from 'child_process';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const STAGING_ROOT = path.resolve(ROOT_DIR, '.tmp', 'deploy-ui');

const API_KEY = 'LUfAkEaQ3Hwd5Cs6KbJr8FVGYDSzMj9R';
const API_URL = 'https://api.tikmatrix.com/ci/update_lib';
// const API_URL = 'http://127.0.0.1:8787/ci/update_lib';

const DEFAULT_APP = 'TikMatrix';
const DEFAULT_OBJECT_PREFIX = 'ui';
const DEFAULT_PLATFORMS = ['generic'];

const args = process.argv.slice(2);

const getArgValue = (key) => {
    const prefix = `--${key}=`;
    const arg = args.find((item) => item.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : undefined;
};

const betaFlag = getArgValue('beta') === '1' ? '1' : '0';
let version = getArgValue('version');
const appName = getArgValue('app') || DEFAULT_APP;
const componentPrefix = getArgValue('prefix') || DEFAULT_OBJECT_PREFIX;
const dryRun = args.includes('--dry-run');
const skipBuild = args.includes('--skip-build');

const platforms = (() => {
    const value = getArgValue('platforms');
    if (!value) {
        return DEFAULT_PLATFORMS;
    }
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
})();

function promptForVersion() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Please enter the UI version number (e.g., v1.0.0): ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function runCommand(command, options = {}) {
    console.log(`\n> ${command}`);
    execSync(command, {
        stdio: 'inherit',
        cwd: options.cwd || ROOT_DIR,
        env: options.env || process.env
    });
}

function ensureDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

function copyDirectory(source, destination) {
    fs.cpSync(source, destination, { recursive: true });
}

function rewriteIndexForRelativeAssets(indexPath) {
    if (!fs.existsSync(indexPath)) {
        return;
    }

    // No rewriting required; kept for backward compatibility with older deployments.
}

function createManifest(manifestDir, version) {
    const manifestPath = path.join(manifestDir, 'manifest.json');
    const manifest = {
        version,
        beta: betaFlag === '1',
        app: appName,
        builtAt: new Date().toISOString()
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function zipDirectory(sourceDir, zipPath) {
    if (fs.existsSync(zipPath)) {
        fs.rmSync(zipPath);
    }

    const isWindows = process.platform === 'win32';
    if (isWindows) {
        const escapedSource = sourceDir.replace(/'/g, "''");
        const escapedZip = zipPath.replace(/'/g, "''");
        const command = `powershell -NoProfile -Command "Compress-Archive -Path '${escapedSource}' -DestinationPath '${escapedZip}' -Force"`;
        runCommand(command);
    } else {
        const folderName = path.basename(sourceDir);
        const parentDir = path.dirname(sourceDir);
        const command = `zip -r "${zipPath}" "${folderName}"`;
        runCommand(command, { cwd: parentDir });
    }
}

async function updateLibrary(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`updateLibrary failed with HTTP ${response.status}: ${errorText}`);
    }
}

async function main() {
    try {
        if (!version) {
            version = await promptForVersion();
        }

        if (!version.startsWith('v')) {
            version = `v${version}`;
        }

        console.log(`UI Version: ${version}`);
        console.log(`Beta Channel: ${betaFlag === '1' ? 'Yes' : 'No'}`);
        console.log(`App: ${appName}`);
        console.log(`Platforms: ${platforms.join(', ')}`);
        console.log(`Dry Run: ${dryRun ? 'Yes' : 'No'}`);

        if (!dryRun) {
            if (!skipBuild) {
                const viteBinary = process.platform === 'win32'
                    ? path.join(ROOT_DIR, 'node_modules', '.bin', 'vite.cmd')
                    : path.join(ROOT_DIR, 'node_modules', '.bin', 'vite');

                if (!fs.existsSync(viteBinary)) {
                    throw new Error('Vite binary not found. Please run `npm install` first.');
                }

                runCommand(`${JSON.stringify(viteBinary)} build --mode prod --base ./`);
            } else {
                console.log('Skipping UI build as per --skip-build flag.');
            }
        } else {
            console.log('Dry run enabled: skipping build step.');
        }

        if (!fs.existsSync(DIST_DIR)) {
            throw new Error(`dist directory not found at ${DIST_DIR}. Run the build step or remove --skip-build.`);
        }

        ensureDir(STAGING_ROOT);

        const stagingVersionDir = path.join(STAGING_ROOT, 'upload', componentPrefix, version);
        fs.mkdirSync(stagingVersionDir, { recursive: true });
        copyDirectory(DIST_DIR, stagingVersionDir);

        const indexPath = path.join(stagingVersionDir, 'index.html');
        rewriteIndexForRelativeAssets(indexPath);

        const manifestDir = path.join(STAGING_ROOT, 'upload', componentPrefix);
        createManifest(manifestDir, version);

        const zipFileName = `ui-${version}.zip`;
        const zipPath = path.join(STAGING_ROOT, zipFileName);
        zipDirectory(path.join(STAGING_ROOT, 'upload'), zipPath);

        const objectName = betaFlag === '1'
            ? `beta/${componentPrefix}/${version}/ui.zip`
            : `${componentPrefix}/${version}/ui.zip`;

        const downloadUrl = `https://r2.tikmatrix.com/${objectName}`;

        if (!dryRun) {
            const wranglerCommand = `wrangler r2 object put tikmatrix/${objectName} --file="${zipPath}" --remote`;
            runCommand(wranglerCommand);
        } else {
            console.log('Dry run enabled: skipping upload to R2.');
        }

        if (!dryRun) {
            for (const platform of platforms) {
                const payload = {
                    oldName: 'ui',
                    oldPlatform: platform,
                    name: 'ui',
                    downloadUrl,
                    platform,
                    version,
                    app: appName,
                    beta: betaFlag
                };

                console.log(`Updating UI library for platform "${platform}"...`);
                await updateLibrary(payload);
                console.log(`UI library updated for platform "${platform}".`);
            }
        } else {
            console.log('Dry run enabled: skipping version registration.');
        }

        console.log('\nUI deployment completed successfully.');
        console.log(`Remote object: ${objectName}`);
        console.log(`Download URL: ${downloadUrl}`);
    } catch (error) {
        console.error('\nUI deployment failed:', error.message);
        process.exit(1);
    } finally {
        try {
            fs.rmSync(STAGING_ROOT, { recursive: true, force: true });
        } catch (cleanupError) {
            console.warn('Warning: failed to clean staging directory:', cleanupError.message);
        }
    }
}

main();
