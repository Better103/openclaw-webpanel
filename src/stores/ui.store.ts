import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export type Theme = 'light' | 'dark'
export type Language = 'en' | 'zh-CN'

export const useUIStore = defineStore('ui', () => {
  // 状态
  const language = ref<Language>('en')
  const theme = ref<Theme>('light')
  const sidebarCollapsed = ref(false)
  const notificationsEnabled = ref(true)
  const autoRefreshEnabled = ref(true)
  const refreshInterval = ref(30) // 秒
  const pageTitle = ref('OpenClaw Control Panel')

  // 计算属性
  const currentLocale = computed(() => language.value)
  const isDarkMode = computed(() => theme.value === 'dark')
  const isSidebarCollapsed = computed(() => sidebarCollapsed.value)
  const isChinese = computed(() => language.value === 'zh-CN')
  const isEnglish = computed(() => language.value === 'en')
  const translation = computed(() => {
    // 这里可以返回翻译函数，但实际翻译通过vue-i18n处理
    // 这个计算属性主要用于组件内获取语言状态
    return {
      currentLang: language.value,
      isChinese: language.value === 'zh-CN',
      isEnglish: language.value === 'en'
    }
  })

  // 操作
  const toggleLanguage = () => {
    language.value = language.value === 'en' ? 'zh-CN' : 'en'

    // 更新HTML lang属性
    document.documentElement.lang = language.value

    // 这里可以触发i18n语言切换
    // 实际的语言切换在App.vue或main.ts中通过vue-i18n处理
    console.log('Language switched to:', language.value)
  }

  const setLanguage = (lang: Language) => {
    language.value = lang
    document.documentElement.lang = lang
    console.log('Language set to:', lang)
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'

    // 更新HTML class
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // 保存到localStorage
    localStorage.setItem('theme', theme.value)
    console.log('Theme switched to:', theme.value)
  }

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme

    // 更新HTML class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localStorage.setItem('theme', newTheme)
    console.log('Theme set to:', newTheme)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
    console.log('Sidebar collapsed:', sidebarCollapsed.value)
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
    localStorage.setItem('sidebarCollapsed', collapsed.toString())
    console.log('Sidebar collapsed set to:', collapsed)
  }

  const toggleNotifications = () => {
    notificationsEnabled.value = !notificationsEnabled.value
    localStorage.setItem('notificationsEnabled', notificationsEnabled.value.toString())
    console.log('Notifications enabled:', notificationsEnabled.value)
  }

  const toggleAutoRefresh = () => {
    autoRefreshEnabled.value = !autoRefreshEnabled.value
    localStorage.setItem('autoRefreshEnabled', autoRefreshEnabled.value.toString())
    console.log('Auto refresh enabled:', autoRefreshEnabled.value)
  }

  const setRefreshInterval = (interval: number) => {
    refreshInterval.value = interval
    localStorage.setItem('refreshInterval', interval.toString())
    console.log('Refresh interval set to:', interval, 'seconds')
  }

  const setPageTitle = (title: string) => {
    pageTitle.value = title
    document.title = title
    console.log('Page title set to:', title)
  }

  // 初始化
  const initialize = () => {
    // 从localStorage加载设置
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme)
    }

    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'en' || savedLang === 'zh-CN')) {
      setLanguage(savedLang)
    }

    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedSidebarCollapsed) {
      setSidebarCollapsed(savedSidebarCollapsed === 'true')
    }

    const savedNotifications = localStorage.getItem('notificationsEnabled')
    if (savedNotifications) {
      notificationsEnabled.value = savedNotifications === 'true'
    }

    const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled')
    if (savedAutoRefresh) {
      autoRefreshEnabled.value = savedAutoRefresh === 'true'
    }

    const savedRefreshInterval = localStorage.getItem('refreshInterval')
    if (savedRefreshInterval) {
      refreshInterval.value = parseInt(savedRefreshInterval, 10) || 30
    }

    console.log('UI Store initialized')
  }

  // 立即初始化
  initialize()

  return {
    // 状态
    language,
    theme,
    sidebarCollapsed,
    notificationsEnabled,
    autoRefreshEnabled,
    refreshInterval,
    pageTitle,

    // 计算属性
    currentLocale,
    isDarkMode,
    isSidebarCollapsed,
    isChinese,
    isEnglish,
    translation,

    // 操作
    toggleLanguage,
    setLanguage,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed,
    toggleNotifications,
    toggleAutoRefresh,
    setRefreshInterval,
    setPageTitle,
    initialize
  }
})