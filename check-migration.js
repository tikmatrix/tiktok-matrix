#!/usr/bin/env node

/**
 * WebSocket Service Migration Checker
 * 
 * This script helps identify components that might need to be migrated
 * from old service/index.js imports to direct WebSocket service imports.
 */

const fs = require('fs');
const path = require('path');

// List of removed functions from service/index.js
const removedFunctions = {
    script: {
        category: 'Script',
        newImport: "import { ws_script } from '@/service/scriptWebSocketService'"
    },
    stop_task: {
        category: 'Script',
        newImport: "import { ws_stop_task } from '@/service/scriptWebSocketService'"
    },
    super_marketing_run_now: {
        category: 'Script',
        newImport: "import { ws_super_marketing_run_now } from '@/service/scriptWebSocketService'"
    },
    run_now_by_account: {
        category: 'Script',
        newImport: "import { ws_run_now_by_account } from '@/service/scriptWebSocketService'"
    },
    message_now: {
        category: 'Script',
        newImport: "import { ws_message_now } from '@/service/scriptWebSocketService'"
    },
    comment_now: {
        category: 'Script',
        newImport: "import { ws_comment_now } from '@/service/scriptWebSocketService'"
    },
    follow_now: {
        category: 'Script',
        newImport: "import { ws_follow_now } from '@/service/scriptWebSocketService'"
    },
    scrape_now: {
        category: 'Script',
        newImport: "import { ws_scrape_now } from '@/service/scriptWebSocketService'"
    },
    adb_command: {
        category: 'Device Control',
        newImport: "import { ws_adb_command } from '@/service/deviceControlWebSocketService'"
    },
    scan_tcp: {
        category: 'Device Control',
        newImport: "import { ws_scan_tcp } from '@/service/deviceControlWebSocketService'"
    },
    scan_tcp_details: {
        category: 'Device Control',
        newImport: "import { ws_scan_tcp_details } from '@/service/deviceControlWebSocketService'"
    },
    move_to_group: {
        category: 'Device Control',
        newImport: "import { ws_move_to_group } from '@/service/deviceControlWebSocketService'"
    },
    set_text: {
        category: 'Device Control',
        newImport: "import { ws_set_text } from '@/service/deviceControlWebSocketService'"
    },
    reset_all_index: {
        category: 'Device Control',
        newImport: "import { ws_reset_all_index } from '@/service/deviceControlWebSocketService'"
    },
    clear_gallery: {
        category: 'Device Control',
        newImport: "import { ws_clear_gallery } from '@/service/deviceControlWebSocketService'"
    },
    read_clipboard: {
        category: 'Device Control',
        newImport: "import { ws_read_clipboard } from '@/service/deviceControlWebSocketService'"
    },
    index: {
        category: 'Device Control',
        newImport: "import { ws_get_index } from '@/service/deviceControlWebSocketService'"
    },
    open_tiktok: {
        category: 'Device Control',
        newImport: "import { ws_open_tiktok } from '@/service/deviceControlWebSocketService'"
    },
    stop_tiktok: {
        category: 'Device Control',
        newImport: "import { ws_stop_tiktok } from '@/service/deviceControlWebSocketService'"
    },
    detectCurrentPackage: {
        category: 'Device Control',
        newImport: "import { ws_detect_current_package } from '@/service/deviceControlWebSocketService'"
    },
    get_tags: {
        category: 'Tag',
        newImport: "import { ws_get_tags } from '@/service/tagWebSocketService'"
    },
    add_tag: {
        category: 'Tag',
        newImport: "import { ws_add_tag } from '@/service/tagWebSocketService'"
    },
    update_tag: {
        category: 'Tag',
        newImport: "import { ws_update_tag } from '@/service/tagWebSocketService'"
    },
    delete_tag: {
        category: 'Tag',
        newImport: "import { ws_delete_tag } from '@/service/tagWebSocketService'"
    },
    get_material_tags: {
        category: 'Tag',
        newImport: "import { ws_get_material_tags } from '@/service/tagWebSocketService'"
    },
    add_tags_to_material: {
        category: 'Tag',
        newImport: "import { ws_add_tags_to_material } from '@/service/tagWebSocketService'"
    },
    add_tag_to_material: {
        category: 'Tag',
        newImport: "import { ws_add_tag_to_material } from '@/service/tagWebSocketService'"
    },
    remove_tag_from_material: {
        category: 'Tag',
        newImport: "import { ws_remove_tag_from_material } from '@/service/tagWebSocketService'"
    },
    clear_material_tags: {
        category: 'Tag',
        newImport: "import { ws_clear_material_tags } from '@/service/tagWebSocketService'"
    },
    get_material_with_tags: {
        category: 'Tag',
        newImport: "import { ws_get_material_with_tags } from '@/service/tagWebSocketService'"
    },
    list_all_materials_with_tags: {
        category: 'Tag',
        newImport: "import { ws_list_all_materials_with_tags } from '@/service/tagWebSocketService'"
    },
    get_materials_by_tag: {
        category: 'Tag',
        newImport: "import { ws_get_materials_by_tag } from '@/service/tagWebSocketService'"
    },
    get_materials_with_tags_by_tag: {
        category: 'Tag',
        newImport: "import { ws_get_materials_with_tags_by_tag } from '@/service/tagWebSocketService'"
    },
    upload_videos: {
        category: 'Utils',
        newImport: "import { ws_upload_videos } from '@/service/utilsWebSocketService'"
    },
    upload_video: {
        category: 'Utils',
        newImport: "import { ws_upload_video } from '@/service/utilsWebSocketService'"
    },
    init: {
        category: 'Utils',
        newImport: "import { ws_init } from '@/service/utilsWebSocketService'"
    },
    get_group_config_file: {
        category: 'Utils',
        newImport: "import { ws_get_group_config_file } from '@/service/utilsWebSocketService'"
    },
    save_group_config_file: {
        category: 'Utils',
        newImport: "import { ws_save_group_config_file } from '@/service/utilsWebSocketService'"
    },
    test_proxy_rotation: {
        category: 'Utils',
        newImport: "import { ws_test_proxy_rotation } from '@/service/utilsWebSocketService'"
    },
    get_analytics: {
        category: 'Utils',
        newImport: "import { ws_get_analytics } from '@/service/utilsWebSocketService'"
    },
    get_menus: {
        category: 'Utils',
        newImport: "import { ws_get_menus } from '@/service/utilsWebSocketService'"
    },
    chatgpt_completion: {
        category: 'Utils',
        newImport: "import { ws_chatgpt_completion } from '@/service/utilsWebSocketService'"
    },
    get_follow_record: {
        category: 'Utils',
        newImport: "import { ws_get_follow_record } from '@/service/utilsWebSocketService'"
    },
    clear_follow_records: {
        category: 'Utils',
        newImport: "import { ws_clear_follow_records } from '@/service/utilsWebSocketService'"
    },
    report_distributor_install: {
        category: 'Utils',
        newImport: "import { ws_report_distributor_install } from '@/service/utilsWebSocketService'"
    }
};

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const findings = [];

    // Check for service import
    const hasServiceImport = /from ['"]@\/service['"]/.test(content) ||
        /from ['"]\.\.\/service['"]/.test(content) ||
        /from ['"]\.\.\/\.\.\/service['"]/.test(content);

    if (!hasServiceImport) {
        return null;
    }

    // Check for usage of removed functions
    for (const [funcName, info] of Object.entries(removedFunctions)) {
        const funcPattern = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
        const matches = content.match(funcPattern);

        if (matches) {
            findings.push({
                function: funcName,
                category: info.category,
                newImport: info.newImport,
                count: matches.length
            });
        }
    }

    return findings.length > 0 ? findings : null;
}

function scanDirectory(dirPath, results = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            scanDirectory(filePath, results);
        } else if (file.endsWith('.vue') || file.endsWith('.js')) {
            const findings = scanFile(filePath);
            if (findings) {
                results.push({
                    file: filePath,
                    findings
                });
            }
        }
    }

    return results;
}

// Main execution
console.log('🔍 Scanning for components that need migration...\n');

const srcPath = path.join(__dirname, 'src');
const results = scanDirectory(srcPath);

if (results.length === 0) {
    console.log('✅ No components found that need migration!');
    console.log('All components are already using direct WebSocket service imports.\n');
} else {
    console.log(`⚠️  Found ${results.length} file(s) that may need migration:\n`);

    results.forEach(({ file, findings }) => {
        console.log(`📄 ${path.relative(process.cwd(), file)}`);

        const byCategory = {};
        findings.forEach(f => {
            if (!byCategory[f.category]) {
                byCategory[f.category] = [];
            }
            byCategory[f.category].push(f);
        });

        for (const [category, funcs] of Object.entries(byCategory)) {
            console.log(`   ${category}:`);
            funcs.forEach(f => {
                console.log(`     - ${f.function}() (used ${f.count}x)`);
                console.log(`       Replace with: ${f.newImport}`);
            });
        }
        console.log('');
    });

    console.log('\n📚 For detailed migration guide, see: WEBSOCKET_SERVICE_MIGRATION_GUIDE.md\n');
}

process.exit(results.length > 0 ? 1 : 0);
