import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './style.css'

// 导入本地化消息
import enMessages from './locales/en/common.json'
import zhCnMessages from './locales/zh-CN/common.json'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN', // 默认语言
  fallbackLocale: 'en', // 回退语言
  messages: {
    en: enMessages,
    'zh-CN': zhCnMessages
  }
})

// 获取当前语言对应的 Element Plus 语言包
const getElementLocale = () => {
  return i18n.global.locale.value === 'zh-CN' ? zhCn : en
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
  locale: getElementLocale()
})

app.mount('#app')