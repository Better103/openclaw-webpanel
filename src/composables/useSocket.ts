import { ref, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useAgentStore } from '@/stores/agent.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useRoutingStore } from '@/stores/routing.store'

interface AgentStatusUpdate {
  agentId: string
  status: 'active' | 'inactive' | 'error'
  timestamp: string
  metrics?: {
    cpuUsage: number
    memoryUsage: number
    messageCount: number
    lastMessageTime: string
  }
}

interface MetricUpdate {
  type: 'agent' | 'channel' | 'system'
  data: any
  timestamp: string
}

interface AlertEvent {
  id: string
  type: 'info' | 'warning' | 'error'
  title: string
  description: string
  timestamp: string
  resolved: boolean
}

interface RoutingEvent {
  messageId: string
  channel: string
  accountId: string
  peerType: string
  peerId: string
  agentId: string
  timestamp: string
  status: 'received' | 'processing' | 'routed' | 'completed' | 'failed'
}

export function useSocket() {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const error = ref<string | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  const agentStore = useAgentStore()
  const dashboardStore = useDashboardStore()
  const routingStore = useRoutingStore()

  const connect = (url?: string) => {
    const socketUrl = url || import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

    console.log('Connecting to WebSocket at:', socketUrl)

    socket.value = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    })

    // 连接事件
    socket.value.on('connect', () => {
      console.log('WebSocket connected:', socket.value?.id)
      connected.value = true
      error.value = null
      reconnectAttempts.value = 0

      // 订阅初始数据
      subscribeToInitialData()
    })

    socket.value.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err)
      error.value = err.message
      connected.value = false
    })

    socket.value.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      connected.value = false

      if (reason === 'io server disconnect') {
        // 服务器主动断开连接，需要手动重连
        setTimeout(() => {
          if (socket.value) {
            socket.value.connect()
          }
        }, 1000)
      }
    })

    socket.value.on('reconnect_attempt', (attempt) => {
      console.log('WebSocket reconnection attempt:', attempt)
      reconnectAttempts.value = attempt
    })

    socket.value.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after', maxReconnectAttempts, 'attempts')
      error.value = 'Failed to reconnect to WebSocket server'
    })

    // 数据事件
    setupEventHandlers()
  }

  const subscribeToInitialData = () => {
    if (!socket.value || !connected.value) return

    // 请求初始代理状态
    socket.value.emit('subscribe:agent-status', [])

    // 请求初始指标
    socket.value.emit('subscribe:metrics', ['system', 'agent', 'channel'])
  }

  const setupEventHandlers = () => {
    if (!socket.value) return

    // 初始代理状态
    socket.value.on('initial-agent-status', (agents: AgentStatusUpdate[]) => {
      console.log('Received initial agent status:', agents)
      agents.forEach(agent => {
        agentStore.updateAgentStatus({
          agentId: agent.agentId,
          status: agent.status,
          metrics: agent.metrics
        })
      })
    })

    // 初始系统指标
    socket.value.on('initial-system-metrics', (metrics: any) => {
      console.log('Received initial system metrics:', metrics)
      // 更新dashboard store
      dashboardStore.updateMetrics(metrics)
    })

    // 初始警报
    socket.value.on('initial-alerts', (alerts: AlertEvent[]) => {
      console.log('Received initial alerts:', alerts)
      // 更新dashboard store
      alerts.forEach(alert => dashboardStore.addAlert(alert))
    })

    // 代理状态更新
    socket.value.on('agent-status-update', (update: AgentStatusUpdate) => {
      console.log('Agent status update:', update)
      agentStore.updateAgentStatus({
        agentId: update.agentId,
        status: update.status,
        metrics: update.metrics
      })
    })

    // 指标更新
    socket.value.on('metric-update', (update: MetricUpdate) => {
      console.log('Metric update:', update)

      // 根据指标类型处理更新
      switch (update.type) {
        case 'system':
          // 更新系统指标
          if (update.data) {
            dashboardStore.updateMetrics(update.data)
          }
          break
        case 'agent':
          // 更新代理指标 - 可以通过agent-status-update处理
          break
        case 'channel':
          // 更新渠道指标 - 可以更新routing store或dashboard store
          break
      }
    })

    // 警报触发
    socket.value.on('alert-triggered', (alert: AlertEvent) => {
      console.log('Alert triggered:', alert)
      dashboardStore.addAlert(alert)
    })

    // 路由更新
    socket.value.on('route-update', (event: RoutingEvent) => {
      console.log('Routing event:', event)
      routingStore.addRoutingEvent(event)
    })

    // 路由测试结果
    socket.value.on('routing-test-result', (result: any) => {
      console.log('Routing test result:', result)
      // 这里可以处理路由测试结果
    })
  }

  const disconnect = () => {
    if (socket.value) {
      console.log('Disconnecting WebSocket')
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  const sendAgentControl = (agentId: string, action: string) => {
    if (!socket.value || !connected.value) {
      console.error('Cannot send agent control: WebSocket not connected')
      return false
    }

    try {
      socket.value.emit('control:agent', { agentId, action })
      console.log('Sent agent control:', { agentId, action })
      return true
    } catch (err) {
      console.error('Failed to send agent control:', err)
      return false
    }
  }

  const testRouting = (testData: any) => {
    if (!socket.value || !connected.value) {
      console.error('Cannot test routing: WebSocket not connected')
      return Promise.reject(new Error('WebSocket not connected'))
    }

    return new Promise((resolve, reject) => {
      if (!socket.value) {
        reject(new Error('WebSocket not connected'))
        return
      }

      socket.value.emit('test:routing', testData)

      // 设置响应超时
      const timeout = setTimeout(() => {
        reject(new Error('Routing test timeout'))
      }, 10000)

      socket.value.once('routing-test-result', (result) => {
        clearTimeout(timeout)
        resolve(result)
      })
    })
  }

  const subscribeToAgentStatus = (agentIds: string[]) => {
    if (!socket.value || !connected.value) {
      console.error('Cannot subscribe: WebSocket not connected')
      return false
    }

    try {
      socket.value.emit('subscribe:agent-status', agentIds)
      console.log('Subscribed to agent status:', agentIds)
      return true
    } catch (err) {
      console.error('Failed to subscribe to agent status:', err)
      return false
    }
  }

  const unsubscribeFromAgentStatus = (agentIds: string[]) => {
    if (!socket.value || !connected.value) {
      console.error('Cannot unsubscribe: WebSocket not connected')
      return false
    }

    try {
      socket.value.emit('unsubscribe:agent-status', agentIds)
      console.log('Unsubscribed from agent status:', agentIds)
      return true
    } catch (err) {
      console.error('Failed to unsubscribe from agent status:', err)
      return false
    }
  }

  const subscribeToMetrics = (metricTypes: string[]) => {
    if (!socket.value || !connected.value) {
      console.error('Cannot subscribe: WebSocket not connected')
      return false
    }

    try {
      socket.value.emit('subscribe:metrics', metricTypes)
      console.log('Subscribed to metrics:', metricTypes)
      return true
    } catch (err) {
      console.error('Failed to subscribe to metrics:', err)
      return false
    }
  }

  const unsubscribeFromMetrics = () => {
    if (!socket.value || !connected.value) {
      console.error('Cannot unsubscribe: WebSocket not connected')
      return false
    }

    try {
      socket.value.emit('unsubscribe:metrics')
      console.log('Unsubscribed from metrics')
      return true
    } catch (err) {
      console.error('Failed to unsubscribe from metrics:', err)
      return false
    }
  }

  // 自动清理
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    connected,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    sendAgentControl,
    testRouting,
    subscribeToAgentStatus,
    unsubscribeFromAgentStatus,
    subscribeToMetrics,
    unsubscribeFromMetrics
  }
}