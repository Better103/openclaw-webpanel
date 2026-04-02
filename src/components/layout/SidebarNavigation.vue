<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <div class="logo" v-if="!collapsed">
        <span class="logo-text">OpenClaw</span>
      </div>
      <div class="logo-collapsed" v-else>
        <span class="logo-icon">🦞</span>
      </div>
    </div>

    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="collapsed"
      :collapse-transition="false"
      @select="handleMenuSelect"
    >
      <el-menu-item index="dashboard">
        <el-icon><House /></el-icon>
        <template #title>{{ $t('navigation.dashboard') }}</template>
      </el-menu-item>

      <el-menu-item index="agents">
        <el-icon><User /></el-icon>
        <template #title>{{ $t('navigation.agents') }}</template>
      </el-menu-item>

      <el-menu-item index="routing">
        <el-icon><Connection /></el-icon>
        <template #title>{{ $t('navigation.routing') }}</template>
      </el-menu-item>

      <el-menu-item index="analytics">
        <el-icon><TrendCharts /></el-icon>
        <template #title>{{ $t('navigation.analytics') }}</template>
      </el-menu-item>

      <el-menu-item index="settings">
        <el-icon><Setting /></el-icon>
        <template #title>{{ $t('navigation.settings') }}</template>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-footer">
      <el-button
        type="text"
        class="collapse-btn"
        @click="$emit('update:collapsed', !collapsed)"
      >
        <el-icon v-if="collapsed"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  User,
  Connection,
  TrendCharts,
  Setting,
  Expand,
  Fold
} from '@element-plus/icons-vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  'update:collapsed': [value: boolean]
}>()

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => {
  return route.name?.toString().toLowerCase() || 'dashboard'
})

const handleMenuSelect = (index: string) => {
  router.push({ name: index.charAt(0).toUpperCase() + index.slice(1) })
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
}

.logo-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 1.5rem;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background-color: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  color: #d1d5db;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #374151;
  color: white;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #3b82f6;
  color: white;
}

.sidebar-menu :deep(.el-icon) {
  color: inherit;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #374151;
  display: flex;
  justify-content: center;
}

.collapse-btn {
  color: #d1d5db;
}

.collapse-btn:hover {
  color: white;
}
</style>