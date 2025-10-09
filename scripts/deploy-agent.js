import { execSync } from 'child_process';
import readline from 'readline';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API Configuration
const API_KEY = 'LUfAkEaQ3Hwd5Cs6KbJr8FVGYDSzMj9R';
const API_URL = 'https://api.tikmatrix.com/ci/update_lib';
const PLATFORM = 'windows';

// tiktok-agent 项目路径(相对于当前项目)
const AGENT_PROJECT_PATH = path.resolve(__dirname, '../../tiktok-agent');

// Get version from command line arguments
let version = process.argv.find(arg => arg.startsWith('--version='))?.split('=')[1];

// Function to prompt for version
function promptForVersion() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Please enter the version number (e.g., v1.0.0): ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// Function to make HTTP POST request
function updateLibrary(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Authorization': `Bearer ${API_KEY}`
            }
        };

        const req = https.request(API_URL, options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Main deployment function
async function deploy() {
    try {
        // Get version
        if (!version) {
            version = await promptForVersion();
        }

        // Ensure version starts with 'v'
        if (!version.startsWith('v')) {
            version = `v${version}`;
        }

        console.log(`Building and deploying version ${version} for Windows platform...`);

        // Build with Cargo
        console.log('Building with cargo...');
        execSync('cargo build --release', {
            stdio: 'inherit',
            cwd: AGENT_PROJECT_PATH
        });

        // Upload to R2
        console.log('Uploading agent.exe to R2...');
        execSync('wrangler r2 object put tikmatrix/agent.exe --file=target/release/agent.exe --remote', {
            stdio: 'inherit',
            cwd: AGENT_PROJECT_PATH
        });

        console.log('Uploading script.exe to R2...');
        execSync('wrangler r2 object put tikmatrix/script.exe --file=target/release/script.exe --remote', {
            stdio: 'inherit',
            cwd: AGENT_PROJECT_PATH
        });

        console.log('Upload complete. Updating library versions...');

        // Update agent library
        const agentUpdateData = {
            oldName: 'agent',
            oldPlatform: PLATFORM,
            name: 'agent',
            downloadUrl: 'https://r2.tikmatrix.com/agent.exe',
            platform: PLATFORM,
            version: version,
            app: 'TikMatrix'
        };

        console.log('Updating agent library...');
        try {
            await updateLibrary(agentUpdateData);
            console.log('Agent library updated successfully');
        } catch (error) {
            console.error('Failed to update agent library:', error.message);
        }

        // Update script library
        const scriptUpdateData = {
            oldName: 'script',
            oldPlatform: PLATFORM,
            name: 'script',
            downloadUrl: 'https://r2.tikmatrix.com/script.exe',
            platform: PLATFORM,
            version: version,
            app: 'TikMatrix'
        };

        console.log('Updating script library...');
        try {
            await updateLibrary(scriptUpdateData);
            console.log('Script library updated successfully');
        } catch (error) {
            console.error('Failed to update script library:', error.message);
        }

        console.log(`Both agent and script library versions updated to ${version} for Windows platform`);
    } catch (error) {
        console.error('Deployment failed:', error.message);
        process.exit(1);
    }
}

// Run deployment
deploy();
