import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { Binding, Channel, RoutingTest, RoutingEvent } from '@/types/routing'

export const useRoutingStore = defineStore('routing', () => {
  // 状态
  const bindings = ref<Binding[]>([])
  const channels = ref<Channel[]>([])
  const routingGraph = ref<any>(null)
  const messageFlow = ref<RoutingEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeBindings = computed(() => bindings.value.filter(binding => binding.enabled))
  const inactiveBindings = computed(() => bindings.value.filter(binding => !binding.enabled))
  const channelMetrics = computed(() => {
    const metrics: Record<string, { total: number; active: number; agents: Set<string> }> = {}

    bindings.value.forEach(binding => {
      if (!metrics[binding.channel]) {
        metrics[binding.channel] = {
          total: 0,
          active: 0,
          agents: new Set()
        }
      }

      metrics[binding.channel].total++
      if (binding.enabled) {
        metrics[binding.channel].active++
      }
      metrics[binding.channel].agents.add(binding.agentId)
    })

    return Object.entries(metrics).map(([channel, data]) => ({
      channel,
      totalBindings: data.total,
      activeBindings: data.active,
      uniqueAgents: data.agents.size
    }))
  })

  const routingEfficiency = computed(() => {
    const total = bindings.value.length
    const active = activeBindings.value.length
    const uniqueChannels = new Set(bindings.value.map(b => b.channel)).size
    const uniqueAgents = new Set(bindings.value.map(b => b.agentId)).size

    return {
      totalBindings: total,
      activeBindings: active,
      bindingCoverage: total > 0 ? (active / total) * 100 : 0,
      channelCoverage: uniqueChannels,
      agentDistribution: uniqueAgents
    }
  })

  // 操作
  const fetchBindings = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/api/routes/bindings')
      if (response.data.success) {
        bindings.value = response.data.data
        generateRoutingGraph()
      } else {
        throw new Error(response.data.error || 'Failed to fetch bindings')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch bindings'
      console.error('Error fetching bindings:', err)

      // 模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        bindings.value = [
          {
            id: '1',
            priority: 1,
            channel: 'whatsapp',
            accountId: 'personal',
            peerType: 'dm',
            peerId: '+15551230001',
            agentId: 'home',
            description: 'Personal WhatsApp messages',
            enabled: true,
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            priority: 2,
            channel: 'whatsapp',
            accountId: 'biz',
            peerType: 'dm',
            peerId: '+15551230002',
            agentId: 'work',
            description: 'Business WhatsApp messages',
            enabled: true,
            createdAt: '2024-01-16T14:20:00Z'
          }
        ]
        generateRoutingGraph()
      }
    } finally {
      loading.value = false
    }
  }

  const fetchChannels = async () => {
    try {
      const response = await axios.get('/api/routes/channels')
      if (response.data.success) {
        channels.value = response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch channels')
      }
    } catch (err: any) {
      console.error('Error fetching channels:', err)

      // 模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        channels.value = [
          {
            id: 'whatsapp',
            name: 'WhatsApp',
            type: 'messaging',
            accounts: [
              { id: 'personal', name: 'Personal Account', status: 'connected' },
              { id: 'biz', name: 'Business Account', status: 'connected' }
            ],
            config: {
              webhookUrl: 'https://api.openclaw.ai/webhook/whatsapp',
              dmPolicy: 'allowlist'
            }
          },
          {
            id: 'telegram',
            name: 'Telegram',
            type: 'messaging',
            accounts: [
              { id: 'default', name: 'Default Bot', status: 'connected' }
            ],
            config: {
              botToken: '***',
              webhookUrl: 'https://api.openclaw.ai/webhook/telegram'
            }
          }
        ]
      }
    }
  }

  const createBinding = async (bindingData: Partial<Binding>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/api/routes/bindings', bindingData)
      if (response.data.success) {
        bindings.value.push(response.data.data)
        generateRoutingGraph()
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to create binding')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create binding'
      console.error('Error creating binding:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBinding = async (id: string, bindingData: Partial<Binding>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`/api/routes/bindings/${id}`, bindingData)
      if (response.data.success) {
        const index = bindings.value.findIndex(binding => binding.id === id)
        if (index !== -1) {
          bindings.value[index] = response.data.data
        }
        generateRoutingGraph()
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to update binding')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update binding'
      console.error('Error updating binding:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBinding = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`/api/routes/bindings/${id}`)
      if (response.data.success) {
        bindings.value = bindings.value.filter(binding => binding.id !== id)
        generateRoutingGraph()
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to delete binding')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete binding'
      console.error('Error deleting binding:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleBinding = async (id: string, enabled: boolean) => {
    return updateBinding(id, { enabled })
  }

  const testRouting = async (testData: RoutingTest) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/api/routes/test', testData)
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Routing test failed')
      }
    } catch (err: any) {
      error.value = err.message || 'Routing test failed'
      console.error('Error testing routing:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const addChannel = async (channelData: Partial<Channel>) => {
    // 实现添加渠道的逻辑
    console.log('Add channel:', channelData)
    // 这里可以调用API
  }

  const simulateRouting = async (testData: RoutingTest) => {
    // 模拟路由逻辑
    const result = await testRouting(testData)

    // 添加路由事件到消息流
    const routingEvent: RoutingEvent = {
      messageId: `sim-${Date.now()}`,
      channel: testData.channel,
      accountId: testData.accountId,
      peerType: testData.peerType,
      peerId: testData.peerId,
      agentId: result.matchedAgent,
      timestamp: new Date().toISOString(),
      status: 'routed',
      details: result
    }

    addRoutingEvent(routingEvent)
    return result
  }

  const getBindingForMessage = (message: {
    channel: string
    accountId: string
    peerType: string
    peerId: string
  }) => {
    // 按优先级排序的绑定规则
    const sortedBindings = [...bindings.value]
      .filter(binding => binding.enabled)
      .sort((a, b) => a.priority - b.priority)

    for (const binding of sortedBindings) {
      // 检查渠道匹配
      if (binding.channel !== '*' && binding.channel !== message.channel) continue

      // 检查账户匹配
      if (binding.accountId !== '*' && binding.accountId !== message.accountId) continue

      // 检查对等类型匹配
      if (binding.peerType !== '*' && binding.peerType !== message.peerType) continue

      // 检查对等ID匹配
      if (binding.peerId !== '*' && binding.peerId !== message.peerId) continue

      // 找到匹配
      return binding
    }

    return null
  }

  const addRoutingEvent = (event: RoutingEvent) => {
    messageFlow.value.unshift(event)

    // 保持消息流长度
    if (messageFlow.value.length > 100) {
      messageFlow.value = messageFlow.value.slice(0, 100)
    }
  }

  const generateRoutingGraph = () => {
    // 生成路由图数据
    const nodes = new Set<string>()
    const edges: Array<{ from: string; to: string; label: string }> = []

    // 收集节点
    bindings.value.forEach(binding => {
      nodes.add(`channel:${binding.channel}`)
      nodes.add(`agent:${binding.agentId}`)
    })

    // 收集边
    bindings.value.forEach(binding => {
      if (binding.enabled) {
        edges.push({
          from: `channel:${binding.channel}`,
          to: `agent:${binding.agentId}`,
          label: `${binding.accountId}/${binding.peerType}`
        })
      }
    })

    routingGraph.value = {
      nodes: Array.from(nodes).map(id => ({
        id,
        label: id.split(':')[1],
        type: id.split(':')[0]
      })),
      edges,
      metadata: {
        totalNodes: nodes.size,
        totalEdges: edges.length,
        generatedAt: new Date().toISOString()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  // 初始化
  fetchBindings()
  fetchChannels()

  return {
    // 状态
    bindings,
    channels,
    routingGraph,
    messageFlow,
    loading,
    error,

    // 计算属性
    activeBindings,
    inactiveBindings,
    channelMetrics,
    routingEfficiency,

    // 操作
    fetchBindings,
    fetchChannels,
    createBinding,
    updateBinding,
    deleteBinding,
    toggleBinding,
    testRouting,
    addChannel,
    simulateRouting,
    getBindingForMessage,
    addRoutingEvent,
    clearError
  }
})