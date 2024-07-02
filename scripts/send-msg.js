const chatId = process.env.CHAT_ID
const token = process.env.TOKEN
const tag = process.env.TAG
const url = process.env.URL

import TelegramBot from 'node-telegram-bot-api';
// 从CHANGELOG.md中读取版本更新说明
const fs = require('fs');
const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
const message = `A new release: ${tag} is available: ${changelog}. Check it out at ${url}`


// 创建一个机器人实例
const bot = new TelegramBot(token, { polling: false });


// 发送消息
bot.sendMessage(chatId, message)
    .then(response => {
        console.log('Message sent successfully:', response);
    })
    .catch(error => {
        console.error('Error sending message:', error);
    });
