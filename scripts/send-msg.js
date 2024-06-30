const chatId = process.env.CHAT_ID
const token = process.env.TOKEN
const message = process.env.MESSAGE
import TelegramBot from 'node-telegram-bot-api';


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
