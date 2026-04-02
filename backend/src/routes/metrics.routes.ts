import { Router } from 'express'

const router = Router()

// 生成模拟指标数据
function generateMockMetrics() {
  const now = new Date()
  const hours = 24

  const timeSeries = Array.from({ length: hours }, (_, i) => {
    const time = new Date(now.getTime() - (hours - i - 1) * 60 * 60 * 1000)
    return {
      timestamp: time.toISOString(),
      messages: Math.floor(100 + Math.random() * 200),
      successful: Math.floor(90 + Math.random() * 100),
      failed: Math.floor(0 + Math.random() * 20),
      avgResponseTime: Math.floor(100 + Math.random() * 300)
    }
  })

  const agentMetrics = [
    {
      agentId: '001',
      name: 'Personal Assistant',
      totalMessages: 3421,
      successRate: 97.5,
      avgResponseTime: 218,
      uptime: 99.8,
      lastActive: new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    },
    {
      agentId: '002',
      name: 'Work Agent',
      totalMessages: 2876,
      successRate: 95.8,
      avgResponseTime: 312,
      uptime: 98.7,
      lastActive: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    },
    {
      agentId: '003',
      name: 'Support Bot',
      totalMessages: 2154,
      successRate: 92.3,
      avgResponseTime: 287,
      uptime: 97.2,
      lastActive: new Date(now.getTime() - 30 * 60 * 1000).toISOString()
    }
  ]

  const channelMetrics = [
    {
      channel: 'whatsapp',
      totalMessages: 5247,
      successRate: 96.8,
      avgResponseTime: 245,
      activeAgents: 2
    },
    {
      channel: 'telegram',
      totalMessages: 3215,
      successRate: 95.2,
      avgResponseTime: 198,
      activeAgents: 1
    },
    {
      channel: 'discord',
      totalMessages: 1893,
      successRate: 93.7,
      avgResponseTime: 312,
      activeAgents: 1
    },
    {
      channel: 'slack',
      totalMessages: 2456,
      successRate: 97.1,
      avgResponseTime: 276,
      activeAgents: 1
    }
  ]

  const systemMetrics = {
    totalAgents: 12,
    activeAgents: 8,
    totalMessages: 12815,
    avgSuccessRate: 95.8,
    systemUptime: 99.9,
    memoryUsage: 65.2,
    cpuUsage: 42.7,
    diskUsage: 23.4
  }

  const recentAlerts = [
    {
      id: '1',
      type: 'warning',
      title: 'High response time detected',
      description: 'Agent-003 response time exceeded 500ms threshold',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: '2',
      type: 'error',
      title: 'Agent connection lost',
      description: 'Agent-004 lost connection to WhatsApp channel',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true
    },
    {
      id: '3',
      type: 'info',
      title: 'New agent created',
      description: 'Agent-005 created and configured',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      resolved: true
    }
  ]

  return {
    timeSeries,
    agentMetrics,
    channelMetrics,
    systemMetrics,
    recentAlerts,
    timestamp: now.toISOString()
  }
}

// 获取系统指标
router.get('/system', (req, res) => {
  const metrics = generateMockMetrics()
  res.json({
    success: true,
    data: metrics.systemMetrics,
    timestamp: metrics.timestamp
  })
})

// 获取时间序列数据
router.get('/timeseries', (req, res) => {
  const { period = '24h' } = req.query
  const metrics = generateMockMetrics()

  let filteredSeries = metrics.timeSeries
  if (period === '7d') {
    // 模拟7天数据
    filteredSeries = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        timestamp: date.toISOString().split('T')[0],
        messages: Math.floor(500 + Math.random() * 1500),
        successful: Math.floor(450 + Math.random() * 1400),
        failed: Math.floor(0 + Math.random() * 100),
        avgResponseTime: Math.floor(150 + Math.random() * 250)
      }
    })
  } else if (period === '30d') {
    // 模拟30天数据
    filteredSeries = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        timestamp: date.toISOString().split('T')[0],
        messages: Math.floor(1000 + Math.random() * 3000),
        successful: Math.floor(900 + Math.random() * 2800),
        failed: Math.floor(0 + Math.random() * 200),
        avgResponseTime: Math.floor(120 + Math.random() * 280)
      }
    })
  }

  res.json({
    success: true,
    data: filteredSeries,
    period,
    timestamp: new Date().toISOString()
  })
})

// 获取代理指标
router.get('/agents', (req, res) => {
  const metrics = generateMockMetrics()
  res.json({
    success: true,
    data: metrics.agentMetrics,
    timestamp: metrics.timestamp
  })
})

// 获取渠道指标
router.get('/channels', (req, res) => {
  const metrics = generateMockMetrics()
  res.json({
    success: true,
    data: metrics.channelMetrics,
    timestamp: metrics.timestamp
  })
})

// 获取警报
router.get('/alerts', (req, res) => {
  const metrics = generateMockMetrics()
  const { resolved } = req.query

  let alerts = metrics.recentAlerts
  if (resolved === 'true') {
    alerts = alerts.filter(alert => alert.resolved)
  } else if (resolved === 'false') {
    alerts = alerts.filter(alert => !alert.resolved)
  }

  res.json({
    success: true,
    data: alerts,
    total: alerts.length,
    unresolved: alerts.filter(a => !a.resolved).length,
    timestamp: metrics.timestamp
  })
})

// 获取日志
router.get('/logs', (req, res) => {
  const { level, agentId, channel, limit = 100 } = req.query

  // 模拟日志数据
  const logLevels = ['info', 'warning', 'error', 'debug']
  const logSources = ['agent', 'channel', 'system', 'api']
  const logMessages = [
    'Agent started successfully',
    'Message processed',
    'Channel connected',
    'Routing rule applied',
    'Error processing message',
    'Webhook received',
    'Session created',
    'Authentication successful',
    'Rate limit exceeded',
    'Configuration updated'
  ]

  const mockLogs = Array.from({ length: parseInt(limit as string) }, (_, i) => {
    const level = logLevels[Math.floor(Math.random() * logLevels.length)]
    const source = logSources[Math.floor(Math.random() * logSources.length)]
    const message = logMessages[Math.floor(Math.random() * logMessages.length)]
    const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)

    return {
      id: `log-${i + 1}`,
      level,
      source,
      message,
      agentId: source === 'agent' ? `00${Math.floor(Math.random() * 3) + 1}` : undefined,
      channel: source === 'channel' ? ['whatsapp', 'telegram', 'discord'][Math.floor(Math.random() * 3)] : undefined,
      timestamp: timestamp.toISOString(),
      metadata: {
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        duration: Math.floor(Math.random() * 1000),
        userId: 'user-001'
      }
    }
  })

  // 过滤日志
  let filteredLogs = mockLogs
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level)
  }
  if (agentId) {
    filteredLogs = filteredLogs.filter(log => log.agentId === agentId)
  }
  if (channel) {
    filteredLogs = filteredLogs.filter(log => log.channel === channel)
  }

  // 按时间排序
  filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  res.json({
    success: true,
    data: filteredLogs,
    total: filteredLogs.length,
    timestamp: new Date().toISOString()
  })
})

export default router