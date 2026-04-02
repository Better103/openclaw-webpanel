import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { SystemMetrics, TimeSeriesData, Alert, LogEntry } from '@/types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态
  const metrics = ref<SystemMetrics | null>(null)
  const timeSeriesData = ref<TimeSeriesData[]>([])
  const alerts = ref<Alert[]>([])
  const logs = ref<LogEntry[]>([])
  const realTimeData = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const systemHealth = computed(() => {
    if (!metrics.value) return { status: 'unknown', score: 0 }

    const { avgSuccessRate, systemUptime, memoryUsage, cpuUsage } = metrics.value

    // 计算健康分数
    const successScore = (avgSuccessRate / 100) * 40 // 最多40分
    const uptimeScore = (systemUptime / 100) * 30 // 最多30分
    const resourceScore = ((100 - (memoryUsage + cpuUsage) / 2) / 100) * 30 // 最多30分

    const totalScore = successScore + uptimeScore + resourceScore

    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (totalScore < 60) {
      status = 'critical'
    } else if (totalScore < 80) {
      status = 'warning'
    }

    return {
      status,
      score: Math.round(totalScore),
      details: {
        successRate: avgSuccessRate,
        uptime: systemUptime,
        resourceUsage: (memoryUsage + cpuUsage) / 2
      }
    }
  })

  const performanceTrends = computed(() => {
    if (timeSeriesData.value.length < 2) return null

    const recent = timeSeriesData.value.slice(-2)
    const older = timeSeriesData.value.slice(-4, -2)

    const recentAvg = recent.reduce((sum, data) => sum + data.avgResponseTime, 0) / recent.length
    const olderAvg = older.reduce((sum, data) => sum + data.avgResponseTime, 0) / older.length

    const recentSuccess = recent.reduce((sum, data) => sum + (data.successful / data.messages) * 100, 0) / recent.length
    const olderSuccess = older.reduce((sum, data) => sum + (data.successful / data.messages) * 100, 0) / older.length

    return {
      responseTime: {
        current: Math.round(recentAvg),
        previous: Math.round(olderAvg),
        trend: recentAvg < olderAvg ? 'improving' : 'declining',
        change: Math.abs(((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1)
      },
      successRate: {
        current: recentSuccess.toFixed(1),
        previous: olderSuccess.toFixed(1),
        trend: recentSuccess > olderSuccess ? 'improving' : 'declining',
        change: Math.abs(recentSuccess - olderSuccess).toFixed(1)
      }
    }
  })

  const criticalAlerts = computed(() => alerts.value.filter(alert => !alert.resolved && alert.type === 'error'))
  const warningAlerts = computed(() => alerts.value.filter(alert => !alert.resolved && alert.type === 'warning'))

  // 操作
  const fetchMetrics = async (period: '24h' | '7d' | '30d' = '24h') => {
    loading.value = true
    error.value = null

    try {
      // 获取系统指标
      const [systemResponse, timeSeriesResponse] = await Promise.all([
        axios.get('/api/metrics/system'),
        axios.get('/api/metrics/timeseries', { params: { period } })
      ])

      if (systemResponse.data.success) {
        metrics.value = systemResponse.data.data
      }

      if (timeSeriesResponse.data.success) {
        timeSeriesData.value = timeSeriesResponse.data.data
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch metrics'
      console.error('Error fetching metrics:', err)

      // 模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        metrics.value = {
          totalAgents: 12,
          activeAgents: 8,
          totalMessages: 12815,
          avgSuccessRate: 95.8,
          systemUptime: 99.9,
          memoryUsage: 65.2,
          cpuUsage: 42.7,
          diskUsage: 23.4
        }

        timeSeriesData.value = Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
          messages: Math.floor(100 + Math.random() * 200),
          successful: Math.floor(90 + Math.random() * 100),
          failed: Math.floor(0 + Math.random() * 20),
          avgResponseTime: Math.floor(100 + Math.random() * 300)
        }))
      }
    } finally {
      loading.value = false
    }
  }

  const fetchAlerts = async (resolved?: boolean) => {
    try {
      const params: any = {}
      if (resolved !== undefined) {
        params.resolved = resolved
      }

      const response = await axios.get('/api/metrics/alerts', { params })
      if (response.data.success) {
        alerts.value = response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch alerts')
      }
    } catch (err: any) {
      console.error('Error fetching alerts:', err)

      // 模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        alerts.value = [
          {
            id: '1',
            type: 'warning' as const,
            title: 'High response time detected',
            description: 'Agent-003 response time exceeded 500ms threshold',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            resolved: false
          },
          {
            id: '2',
            type: 'error' as const,
            title: 'Agent connection lost',
            description: 'Agent-004 lost connection to WhatsApp channel',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            resolved: true
          }
        ]
      }
    }
  }

  const fetchLogs = async (params?: { level?: string; agentId?: string; channel?: string; limit?: number }) => {
    try {
      const response = await axios.get('/api/metrics/logs', { params })
      if (response.data.success) {
        logs.value = response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch logs')
      }
    } catch (err: any) {
      console.error('Error fetching logs:', err)

      // 模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        const logLevels = ['info', 'warning', 'error', 'debug']
        const logSources = ['agent', 'channel', 'system', 'api']
        const logMessages = [
          'Agent started successfully',
          'Message processed',
          'Channel connected',
          'Routing rule applied'
        ]

        logs.value = Array.from({ length: 20 }, (_, i) => ({
          id: `log-${i + 1}`,
          level: logLevels[Math.floor(Math.random() * logLevels.length)] as any,
          source: logSources[Math.floor(Math.random() * logSources.length)] as any,
          message: logMessages[Math.floor(Math.random() * logMessages.length)],
          agentId: Math.random() > 0.5 ? `00${Math.floor(Math.random() * 3) + 1}` : undefined,
          channel: Math.random() > 0.5 ? ['whatsapp', 'telegram', 'discord'][Math.floor(Math.random() * 3)] : undefined,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration: Math.floor(Math.random() * 1000)
          }
        }))
      }
    }
  }

  const subscribeToUpdates = () => {
    // 这里会连接到 WebSocket 进行实时更新
    // WebSocket连接在App.vue中初始化，通过useSocket composable
    console.log('Subscribing to real-time updates via WebSocket')

    // 真实的更新通过WebSocket事件处理
    // 不再需要模拟更新
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // 这里会调用API标记警报为已解决
      const alert = alerts.value.find(a => a.id === alertId)
      if (alert) {
        alert.resolved = true
      }

      // 模拟API调用
      console.log('Alert acknowledged:', alertId)
    } catch (err: any) {
      console.error('Error acknowledging alert:', err)
    }
  }

  const addAlert = (alert: Alert) => {
    alerts.value.unshift(alert)

    // 保持警报列表长度
    if (alerts.value.length > 50) {
      alerts.value = alerts.value.slice(0, 50)
    }
  }

  const updateMetrics = (newMetrics: Partial<SystemMetrics>) => {
    if (metrics.value) {
      metrics.value = { ...metrics.value, ...newMetrics }
    } else {
      // 如果还没有指标，创建新的
      metrics.value = newMetrics as SystemMetrics
    }

    // 触发实时数据更新
    realTimeData.value = {
      type: 'metrics',
      data: metrics.value,
      timestamp: new Date().toISOString()
    }
  }

  const clearError = () => {
    error.value = null
  }

  // 初始化
  fetchMetrics()
  fetchAlerts()
  fetchLogs()
  subscribeToUpdates()

  return {
    // 状态
    metrics,
    timeSeriesData,
    alerts,
    logs,
    realTimeData,
    loading,
    error,

    // 计算属性
    systemHealth,
    performanceTrends,
    criticalAlerts,
    warningAlerts,

    // 操作
    fetchMetrics,
    fetchAlerts,
    fetchLogs,
    subscribeToUpdates,
    acknowledgeAlert,
    addAlert,
    updateMetrics,
    clearError
  }
})