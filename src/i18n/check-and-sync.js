// 翻译文件检查和同步工具
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入翻译文件
import en from './locales/en.js';
import zhCN from './locales/zh-CN.js';
import ru from './locales/ru.js';

// 收集所有语言文件中的键
const allKeys = new Set();
Object.keys(en).forEach(key => allKeys.add(key));
Object.keys(zhCN).forEach(key => allKeys.add(key));
Object.keys(ru).forEach(key => allKeys.add(key));

// 按字母顺序排序的键列表
const sortedKeys = Array.from(allKeys).sort();

// 检查每种语言的覆盖情况
function checkCoverage(translations, name) {
  const missing = [];

  for (const key of sortedKeys) {
    if (translations[key] === undefined) {
      missing.push(key);
    }
  }

  console.log(`${name}: ${Object.keys(translations).length}/${sortedKeys.length} 键 (${missing.length} 个缺失)`);

  if (missing.length > 0) {
    console.log(`缺失的键: ${missing.join(', ')}`);
  }

  return missing;
}


// 生成排序后的翻译对象
function generateSortedTranslations(translations) {
  const sorted = {};

  for (const key of sortedKeys) {
    sorted[key] = translations[key] || en[key] || key;
  }

  return sorted;
}

// 生成JavaScript代码
function generateJsCode(translations) {
  let output = 'export default {\n';

  for (const key of sortedKeys) {
    const value = translations[key] || '';
    // 正确转义所有特殊字符
    const escapedValue = value
      .replace(/\\/g, '\\\\')  // 反斜杠必须首先转义
      .replace(/'/g, "\\'")     // 单引号
      .replace(/\n/g, '\\n')    // 换行符
      .replace(/\r/g, '\\r')    // 回车符
      .replace(/\t/g, '\\t')    // 制表符
      .replace(/\f/g, '\\f')    // 换页符
      .replace(/\v/g, '\\v');   // 垂直制表符
    output += `  ${key}: '${escapedValue}',\n`;
  }

  output += '};';
  return output;
}

// 写入文件
function writeFile(filePath, content) {
  fs.writeFileSync(path.join(__dirname, filePath), content, 'utf8');
}

console.log('====== 检查翻译完整性 ======');
console.log(`总键数: ${sortedKeys.length}`);

// 检查覆盖情况
checkCoverage(en, '英语');
checkCoverage(zhCN, '中文');
checkCoverage(ru, '俄语');

console.log('\n====== 生成更新文件 ======');

// 合并并排序翻译
const sortedEn = generateSortedTranslations(en);
const sortedZh = generateSortedTranslations(zhCN);
const sortedRu = generateSortedTranslations(ru);

// 生成代码
const enCode = generateJsCode(sortedEn);
const zhCode = generateJsCode(sortedZh);
const ruCode = generateJsCode(sortedRu);

// 创建备份
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(__dirname, 'backups', timestamp);

if (!fs.existsSync(path.join(__dirname, 'backups'))) {
  fs.mkdirSync(path.join(__dirname, 'backups'));
}
fs.mkdirSync(backupDir);

// 备份原文件
fs.copyFileSync(
  path.join(__dirname, 'locales/en.js'),
  path.join(backupDir, 'en.js')
);
fs.copyFileSync(
  path.join(__dirname, 'locales/zh-CN.js'),
  path.join(backupDir, 'zh-CN.js')
);
fs.copyFileSync(
  path.join(__dirname, 'locales/ru.js'),
  path.join(backupDir, 'ru.js')
);

console.log(`已创建备份在: backups/${timestamp}/`);

// 写入新文件
writeFile('locales/en.js', enCode);
writeFile('locales/zh-CN.js', zhCode);
writeFile('locales/ru.js', ruCode);

console.log('已更新所有语言文件，各文件现在包含相同的键且按字母顺序排列。');
console.log('对于缺失的翻译，暂时使用英文作为默认值。');
console.log('请检查更新后的文件并修正翻译。'); 