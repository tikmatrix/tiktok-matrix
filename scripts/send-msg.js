process.env.URL = 'https://pro.api.tikmatrix.com/front-api/download'
const chatId = process.env.CHAT_ID
const token = process.env.TOKEN
const tag = process.env.TAG
const url = process.env.URL

import TelegramBot from 'node-telegram-bot-api';
// 从CHANGELOG.md中读取版本更新说明
import fs from 'fs';
const configPath = "src-tauri/tauri.conf.json"
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const changelog = fs.readFileSync('CHANGELOG', 'utf8');
// const message = `A new release: ${tag} is available:\n ${changelog}\n Check it out at ${url}`
const message = `*${config.package.productName} v${config.package.version}* New Release!\n\n${changelog}\n\n*Please update to the latest version*\n[Download Here](${url})`


// 创建一个机器人实例
const bot = new TelegramBot(token, { polling: false });


// 发送消息
bot.sendMessage(chatId, message, { parse_mode: 'Markdown' })
    .then(response => {
        console.log('Message sent successfully:', response);
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });
