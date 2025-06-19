import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import zhCN from './locales/zh-CN.js'
import ru from './locales/ru.js'

export const i18n = createI18n({
  locale: 'en', // 设置默认语言
  messages: {
    en,
    'zh-CN': zhCN,
    'ru': ru
  }
}) 