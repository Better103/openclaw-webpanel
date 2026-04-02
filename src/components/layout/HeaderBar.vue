<template>
  <header class="header-bar">
    <div class="header-left">
      <el-button
        type="text"
        class="sidebar-toggle"
        @click="$emit('toggle-sidebar')"
      >
        <el-icon><Menu /></el-icon>
      </el-button>
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="index"
            :to="item.path"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="header-right">
      <div class="header-actions">
        <!-- 语言切换 -->
        <el-select
          v-model="currentLang"
          @change="changeLanguage"
          size="small"
          class="language-select"
        >
          <el-option :label="$t('language.en')" value="en" />
          <el-option :label="$t('language.zh-CN')" value="zh-CN" />
        </el-select>

        <!-- 主题切换 -->
        <el-switch
          v-model="storeDarkMode"
          @change="toggleTheme"
          :active-text="$t('theme.dark')"
          :inactive-text="$t('theme.light')"
          size="small"
          class="theme-switch"
        />

        <!-- 通知 -->
        <el-badge :value="3" :max="99" class="notification-badge">
          <el-button type="text" @click="showNotifications">
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>

        <!-- 用户菜单 -->
        <el-dropdown @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="user-name">{{ userName }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                {{ $t('navigation.profile') || 'Profile' }}
              </el-dropdown-item>
              <el-dropdown-item command="settings" divided>
                <el-icon><Setting /></el-icon>
                {{ $t('navigation.settings') }}
              </el-dropdown-item>
              <el-dropdown-item command="help">
                <el-icon><QuestionFilled /></el-icon>
                {{ $t('navigation.help') }}
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                {{ $t('navigation.logout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useUIStore } from '@/stores/ui.store'
import {
  Menu,
  Bell,
  User,
  Setting,
  QuestionFilled,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const uiStore = useUIStore()
const { isDarkMode: storeDarkMode } = storeToRefs(uiStore)

const currentLang = ref(locale.value)

// 模拟用户数据
const userName = ref('Admin User')
const userAvatar = ref('')

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(Boolean)
  const breadcrumbs = []
  let currentPath = ''

  // 添加首页
  breadcrumbs.push({
    title: 'Dashboard',
    path: '/'
  })

  // 添加其他路径
  for (const segment of pathArray) {
    currentPath += `/${segment}`
    breadcrumbs.push({
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: currentPath
    })
  }

  return breadcrumbs
})

const changeLanguage = (lang: string) => {
  locale.value = lang
  uiStore.toggleLanguage(lang)
}

const toggleTheme = (darkMode: boolean) => {
  uiStore.setTheme(darkMode ? 'dark' : 'light')
  // 这里可以添加主题切换的逻辑
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
}

const showNotifications = () => {
  // 显示通知面板
  console.log('Show notifications')
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'help':
      window.open('https://docs.openclaw.ai', '_blank')
      break
    case 'logout':
      // 处理退出登录
      console.log('Logout')
      break
  }
}
</script>

<style scoped>
.header-bar {
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sidebar-toggle {
  font-size: 20px;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-select {
  width: 120px;
}

.theme-switch {
  margin-left: 10px;
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #6b7280;
}

[data-theme="dark"] .header-bar {
  background-color: #1f2937;
  border-bottom-color: #374151;
  color: white;
}

[data-theme="dark"] .user-info:hover {
  background-color: #374151;
}
</style>