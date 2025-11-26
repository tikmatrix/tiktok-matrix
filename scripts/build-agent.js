import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { platform, homedir } from 'os';
import { copyFileSync, mkdirSync, chmodSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine the tiktok-agent directory path
const agentDir = resolve(__dirname, '..', '..', 'tiktok-agent');
const isWindows = platform() === 'win32';
const isMac = platform() === 'darwin';
const args = process.argv.slice(2);
const debugMode = args.includes('--debug');
if (debugMode) {
    console.log('🐛 Debug mode enabled');
}

console.log(`🚀 Building tiktok-agent (${isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux'})...`);
console.log(`📁 Agent directory: ${agentDir}`);

// Step 1: Kill existing processes
function killProcesses() {
    if (isWindows) {
        console.log('🔪 Killing existing processes...');
        try {
            spawn('taskkill', ['/IM', 'agent.exe', '/F'], { stdio: 'ignore' });
            spawn('taskkill', ['/IM', 'script.exe', '/F'], { stdio: 'ignore' });
        } catch (error) {
            // Ignore errors if processes don't exist
        }
    } else {
        console.log('🔪 Killing existing processes...');
        try {
            spawn('pkill', ['-f', 'agent'], { stdio: 'ignore' });
            spawn('pkill', ['-f', 'script'], { stdio: 'ignore' });
        } catch (error) {
            // Ignore errors if processes don't exist
        }
    }
}

// Step 2: Run cargo build
function runCargoBuild() {
    return new Promise((resolve, reject) => {

        console.log(`🔨 Running cargo build ${debugMode ? '' : '--release'}...`);

        const cargo = spawn('cargo', ['build', debugMode ? '' : '--release'], {
            cwd: agentDir,
            stdio: 'inherit',
            shell: true
        });

        cargo.on('error', (error) => {
            reject(new Error(`Failed to run cargo: ${error.message}`));
        });

        cargo.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Cargo build failed with exit code ${code}`));
            } else {
                console.log('✅ Cargo build completed successfully!');
                resolve();
            }
        });
    });
}

// Step 3: Copy binaries to destination
function copyBinaries() {
    console.log('📦 Copying binaries...');

    const releaseDir = join(agentDir, 'target', debugMode ? 'debug' : 'release');

    if (isWindows) {
        // Windows paths
        const appDataDir = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
        const tikmatrixBin = join(appDataDir, 'com.tikmatrix', 'bin');
        const igmatrixBin = join(appDataDir, 'com.igmatrix', 'bin');

        // Create directories if they don't exist
        mkdirSync(tikmatrixBin, { recursive: true });
        mkdirSync(igmatrixBin, { recursive: true });

        // Copy agent.exe
        const agentSrc = join(releaseDir, 'agent.exe');
        copyFileSync(agentSrc, join(tikmatrixBin, 'agent.exe'));
        copyFileSync(agentSrc, join(igmatrixBin, 'agent.exe'));
        console.log('✅ agent.exe copied');

        // Copy script.exe
        const scriptSrc = join(releaseDir, 'script.exe');
        copyFileSync(scriptSrc, join(tikmatrixBin, 'script.exe'));
        copyFileSync(scriptSrc, join(igmatrixBin, 'script.exe'));
        console.log('✅ script.exe copied');

    } else {
        // macOS/Linux paths
        const appSupportDir = isMac
            ? join(homedir(), 'Library', 'Application Support')
            : join(homedir(), '.local', 'share');

        // Use igmatrix as per build.sh
        const matrixAppDir = join(appSupportDir, 'com.igmatrix');
        const binDir = join(matrixAppDir, 'bin');

        // Create directory if it doesn't exist
        mkdirSync(binDir, { recursive: true });

        // Copy agent
        const agentSrc = join(releaseDir, 'agent');
        const agentDest = join(binDir, 'agent');
        copyFileSync(agentSrc, agentDest);
        chmodSync(agentDest, 0o755); // Make executable
        console.log('✅ agent copied');

        // Copy script
        const scriptSrc = join(releaseDir, 'script');
        const scriptDest = join(binDir, 'script');
        copyFileSync(scriptSrc, scriptDest);
        chmodSync(scriptDest, 0o755); // Make executable
        console.log('✅ script copied');
    }
}

// Main execution
async function main() {
    try {
        await runCargoBuild();
        killProcesses();
        copyBinaries();
        console.log('🎉 Build completed successfully!');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

main();
