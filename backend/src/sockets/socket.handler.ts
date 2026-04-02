import { Server, Socket } from 'socket.io'

interface AgentStatus {
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

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`)

    // 发送初始状态
    sendInitialState(socket)

    // 处理客户端消息
    socket.on('subscribe:agent-status', (agentIds: string[]) => {
      console.log(`Client ${socket.id} subscribed to agent status:`, agentIds)
      // 这里可以设置定期更新
    })

    socket.on('subscribe:metrics', (metricTypes: string[]) => {
      console.log(`Client ${socket.id} subscribed to metrics:`, metricTypes)
    })

    socket.on('unsubscribe:agent-status', (agentIds: string[]) => {
      console.log(`Client ${socket.id} unsubscribed from agent status:`, agentIds)
    })

    socket.on('unsubscribe:metrics', () => {
      console.log(`Client ${socket.id} unsubscribed from metrics`)
    })

    socket.on('control:agent', (data: { agentId: string; action: string }) => {
      console.log(`Agent control requested:`, data)
      // 模拟处理代理控制
      const { agentId, action } = data

      // 广播状态更新
      const statusUpdate: AgentStatus = {
        agentId,
        status: action === 'start' ? 'active' : action === 'stop' ? 'inactive' : 'error',
        timestamp: new Date().toISOString()
      }

      io.emit('agent-status-update', statusUpdate)
    })

    socket.on('test:routing', (testData: any) => {
      console.log('Routing test requested:', testData)
      // 模拟路由测试结果
      const result = {
        success: true,
        matchedAgent: 'home',
        matchedBinding: {
          priority: 1,
          channel: testData.channel,
          accountId: testData.accountId,
          peerType: testData.peerType,
          peerId: testData.peerId,
          agentId: 'home'
        },
        routingPath: `${testData.channel}(${testData.accountId}) → ${testData.peerType}(${testData.peerId}) → agent(home)`,
        timestamp: new Date().toISOString()
      }

      socket.emit('routing-test-result', result)
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  // 模拟实时数据更新
  startMockDataUpdates(io)
}

function sendInitialState(socket: Socket) {
  // 发送初始代理状态
  const initialAgents: AgentStatus[] = [
    { agentId: '001', status: 'active', timestamp: new Date().toISOString() },
    { agentId: '002', status: 'active', timestamp: new Date().toISOString() },
    { agentId: '003', status: 'inactive', timestamp: new Date().toISOString() },
    { agentId: '004', status: 'error', timestamp: new Date().toISOString() }
  ]

  socket.emit('initial-agent-status', initialAgents)

  // 发送系统指标
  const systemMetrics = {
    totalAgents: 12,
    activeAgents: 8,
    totalMessages: 12815,
    avgSuccessRate: 95.8,
    systemUptime: 99.9,
    timestamp: new Date().toISOString()
  }

  socket.emit('initial-system-metrics', systemMetrics)

  // 发送最近警报
  const recentAlerts: AlertEvent[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High response time detected',
      description: 'Agent-003 response time exceeded 500ms threshold',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false
    }
  ]

  socket.emit('initial-alerts', recentAlerts)
}

function startMockDataUpdates(io: Server) {
  // 定期更新代理状态
  setInterval(() => {
    const statusUpdate: AgentStatus = {
      agentId: `00${Math.floor(Math.random() * 4) + 1}`,
      status: ['active', 'inactive', 'error'][Math.floor(Math.random() * 3)] as any,
      timestamp: new Date().toISOString(),
      metrics: {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        messageCount: Math.floor(Math.random() * 1000),
        lastMessageTime: new Date().toISOString()
      }
    }

    io.emit('agent-status-update', statusUpdate)
  }, 10000) // 每10秒更新一次

  // 定期更新指标
  setInterval(() => {
    const metricUpdate: MetricUpdate = {
      type: 'system',
      data: {
        totalMessages: Math.floor(Math.random() * 100),
        avgResponseTime: Math.floor(100 + Math.random() * 200),
        successRate: 95 + Math.random() * 5
      },
      timestamp: new Date().toISOString()
    }

    io.emit('metric-update', metricUpdate)
  }, 5000) // 每5秒更新一次

  // 模拟路由事件
  setInterval(() => {
    const channels = ['whatsapp', 'telegram', 'discord', 'slack']
    const agents = ['home', 'work', 'support', 'opus']

    const routingEvent: RoutingEvent = {
      messageId: `msg-${Math.random().toString(36).substr(2, 9)}`,
      channel: channels[Math.floor(Math.random() * channels.length)],
      accountId: ['personal', 'biz', 'default'][Math.floor(Math.random() * 3)],
      peerType: ['dm', 'group', 'channel'][Math.floor(Math.random() * 3)],
      peerId: `+${Math.floor(Math.random() * 10000000000)}`,
      agentId: agents[Math.floor(Math.random() * agents.length)],
      timestamp: new Date().toISOString(),
      status: 'routed'
    }

    io.emit('route-update', routingEvent)
  }, 3000) // 每3秒模拟一个路由事件

  // 模拟警报
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% 概率生成警报
      const alertTypes: Array<'info' | 'warning' | 'error'> = ['info', 'warning', 'error']
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)]

      const alertEvent: AlertEvent = {
        id: `alert-${Math.random().toString(36).substr(2, 9)}`,
        type: alertType,
        title: alertType === 'error' ? 'Agent connection error' :
               alertType === 'warning' ? 'High resource usage' : 'System notification',
        description: alertType === 'error' ? 'An agent lost connection to its channel' :
                    alertType === 'warning' ? 'Resource usage above threshold' : 'Regular system update',
        timestamp: new Date().toISOString(),
        resolved: false
      }

      io.emit('alert-triggered', alertEvent)
    }
  }, 15000) // 每15秒检查一次
}