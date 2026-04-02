import { Router } from 'express'

const router = Router()

// 模拟绑定规则数据
const mockBindings = [
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
  },
  {
    id: '3',
    priority: 3,
    channel: 'whatsapp',
    accountId: 'personal',
    peerType: 'group',
    peerId: '1203630...@g.us',
    agentId: 'work',
    description: 'Work group chat',
    enabled: true,
    createdAt: '2024-01-18T09:15:00Z'
  },
  {
    id: '4',
    priority: 4,
    channel: 'telegram',
    accountId: '*',
    peerType: '*',
    peerId: '*',
    agentId: 'opus',
    description: 'All Telegram to Opus',
    enabled: true,
    createdAt: '2024-01-20T11:45:00Z'
  }
]

// 模拟渠道配置
const mockChannels = [
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
  },
  {
    id: 'discord',
    name: 'Discord',
    type: 'chat',
    accounts: [
      { id: 'support', name: 'Support Server', status: 'connected' }
    ],
    config: {
      botToken: '***',
      guildId: '1234567890'
    }
  }
]

// 获取所有绑定规则
router.get('/bindings', (req, res) => {
  res.json({
    success: true,
    data: mockBindings,
    total: mockBindings.length,
    timestamp: new Date().toISOString()
  })
})

// 获取单个绑定规则
router.get('/bindings/:id', (req, res) => {
  const binding = mockBindings.find(b => b.id === req.params.id)
  if (!binding) {
    return res.status(404).json({
      success: false,
      error: 'Binding not found'
    })
  }
  res.json({
    success: true,
    data: binding
  })
})

// 创建绑定规则
router.post('/bindings', (req, res) => {
  const newBinding = {
    id: `${mockBindings.length + 1}`,
    priority: req.body.priority || mockBindings.length + 1,
    channel: req.body.channel || 'whatsapp',
    accountId: req.body.accountId || '*',
    peerType: req.body.peerType || '*',
    peerId: req.body.peerId || '*',
    agentId: req.body.agentId || 'default',
    description: req.body.description || 'New binding rule',
    enabled: req.body.enabled !== false,
    createdAt: new Date().toISOString()
  }

  mockBindings.push(newBinding)

  res.status(201).json({
    success: true,
    data: newBinding,
    message: 'Binding created successfully'
  })
})

// 更新绑定规则
router.put('/bindings/:id', (req, res) => {
  const bindingIndex = mockBindings.findIndex(b => b.id === req.params.id)
  if (bindingIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Binding not found'
    })
  }

  const updatedBinding = {
    ...mockBindings[bindingIndex],
    ...req.body,
    id: req.params.id
  }

  mockBindings[bindingIndex] = updatedBinding

  res.json({
    success: true,
    data: updatedBinding,
    message: 'Binding updated successfully'
  })
})

// 删除绑定规则
router.delete('/bindings/:id', (req, res) => {
  const bindingIndex = mockBindings.findIndex(b => b.id === req.params.id)
  if (bindingIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Binding not found'
    })
  }

  const deletedBinding = mockBindings.splice(bindingIndex, 1)[0]

  res.json({
    success: true,
    data: deletedBinding,
    message: 'Binding deleted successfully'
  })
})

// 路由测试
router.post('/test', (req, res) => {
  const { channel, accountId, peerType, peerId } = req.body

  // 模拟路由逻辑
  let matchedAgent = 'default'
  let matchedBinding = null
  let reason = 'No matching binding found, using default agent'

  // 按优先级排序的绑定规则
  const sortedBindings = [...mockBindings].sort((a, b) => a.priority - b.priority)

  for (const binding of sortedBindings) {
    if (!binding.enabled) continue

    // 检查渠道匹配
    if (binding.channel !== '*' && binding.channel !== channel) continue

    // 检查账户匹配
    if (binding.accountId !== '*' && binding.accountId !== accountId) continue

    // 检查对等类型匹配
    if (binding.peerType !== '*' && binding.peerType !== peerType) continue

    // 检查对等ID匹配
    if (binding.peerId !== '*' && binding.peerId !== peerId) continue

    // 找到匹配
    matchedAgent = binding.agentId
    matchedBinding = binding
    reason = `Matched binding #${binding.priority}: ${binding.description}`
    break
  }

  res.json({
    success: true,
    data: {
      matchedAgent,
      matchedBinding,
      reason,
      routingPath: `${channel}(${accountId}) → ${peerType}(${peerId}) → agent(${matchedAgent})`
    }
  })
})

// 获取所有渠道配置
router.get('/channels', (req, res) => {
  res.json({
    success: true,
    data: mockChannels,
    total: mockChannels.length
  })
})

// 获取单个渠道配置
router.get('/channels/:id', (req, res) => {
  const channel = mockChannels.find(c => c.id === req.params.id)
  if (!channel) {
    return res.status(404).json({
      success: false,
      error: 'Channel not found'
    })
  }
  res.json({
    success: true,
    data: channel
  })
})

export default router