<template>
  <div id="app">
    <!-- WebSocket连接状态指示器（仅开发环境显示） -->
    <div v-if="showConnectionStatus" class="connection-status" :class="socketStatus">
      <div class="status-indicator"></div>
      <span class="status-text">{{ connectionText }}</span>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSocket } from '@/composables/useSocket'

const { connect, disconnect, connected, error } = useSocket()

const showConnectionStatus = import.meta.env.DEV

const socketStatus = computed(() => {
  if (connected.value) return 'connected'
  if (error.value) return 'error'
  return 'disconnected'
})

const connectionText = computed(() => {
  if (connected.value) return '实时连接已建立'
  if (error.value) return `连接错误: ${error.value}`
  return '正在连接...'
})

onMounted(() => {
  // 启动WebSocket连接
  console.log('Initializing WebSocket connection...')
  connect()
})

onUnmounted(() => {
  // 断开WebSocket连接
  console.log('Disconnecting WebSocket...')
  disconnect()
})
</script>

<style scoped>
#app {
  width: 100%;
  height: 100vh;
  position: relative;
}

.connection-status {
  position: fixed;
  top: 10px;
  right: 10px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.connection-status.connected {
  background-color: rgba(72, 187, 120, 0.9);
  color: white;
}

.connection-status.disconnected {
  background-color: rgba(156, 163, 175, 0.9);
  color: white;
}

.connection-status.error {
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.connected .status-indicator {
  background-color: #ffffff;
}

.disconnected .status-indicator {
  background-color: #d1d5db;
}

.error .status-indicator {
  background-color: #ffffff;
}

.status-text {
  font-weight: 500;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>