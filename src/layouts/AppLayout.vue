<template>
  <div class="app-layout">
    <SidebarNavigation v-model:collapsed="sidebarCollapsed" />
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <HeaderBar @toggle-sidebar="toggleSidebar" />
      <main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarNavigation from '@/components/layout/SidebarNavigation.vue'
import HeaderBar from '@/components/layout/HeaderBar.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  margin-left: 240px; /* 侧边栏宽度 */
}

.main-content.sidebar-collapsed {
  margin-left: 64px; /* 折叠后的侧边栏宽度 */
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }

  .app-layout {
    flex-direction: column;
  }

  .content-area {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .content-area {
    padding: 12px;
  }
}
</style>