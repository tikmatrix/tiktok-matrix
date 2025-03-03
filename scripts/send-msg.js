const chatId = process.env.CHAT_ID;
const token = process.env.TOKEN;
const url = 'https://pro.api.tikmatrix.com/front-api/download';

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
const configPath = "src-tauri/tauri.conf.json";
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const changelog = fs.readFileSync('CHANGELOG', 'utf8');
const message = `*${config.package.productName} v${config.package.version}* New Release!\n\n\`\`\`\n${changelog}\n\`\`\`\n\n*Please update to the latest version*\n[Download Here](${url})`;

console.log(message);

const bot = new TelegramBot(token, { polling: false });

bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    .then(response => {
        console.log('Message sent successfully:', response);
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });