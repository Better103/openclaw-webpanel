import { Router } from 'express'

const router = Router()

// 模拟代理数据
const mockAgents = [
  {
    id: '001',
    name: 'Personal Assistant',
    description: 'Handles personal messages and scheduling',
    status: 'active',
    channels: ['WhatsApp', 'Telegram'],
    workspace: '~/.openclaw/workspace-personal',
    createdAt: '2024-01-15',
    model: 'claude-sonnet-4-5',
    config: {
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: 'You are a helpful personal assistant...'
    }
  },
  {
    id: '002',
    name: 'Work Agent',
    description: 'Business communications and task management',
    status: 'active',
    channels: ['Slack', 'Discord'],
    workspace: '~/.openclaw/workspace-work',
    createdAt: '2024-01-20',
    model: 'claude-opus-4-5',
    config: {
      maxTokens: 8192,
      temperature: 0.5,
      systemPrompt: 'You are a professional work assistant...'
    }
  },
  {
    id: '003',
    name: 'Support Bot',
    description: 'Customer support and FAQ handling',
    status: 'inactive',
    channels: ['WhatsApp', 'Telegram', 'Discord'],
    workspace: '~/.openclaw/workspace-support',
    createdAt: '2024-02-01',
    model: 'claude-haiku-4-5',
    config: {
      maxTokens: 2048,
      temperature: 0.3,
      systemPrompt: 'You are a customer support agent...'
    }
  }
]

// 获取所有代理
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockAgents,
    total: mockAgents.length,
    timestamp: new Date().toISOString()
  })
})

// 获取单个代理
router.get('/:id', (req, res) => {
  const agent = mockAgents.find(a => a.id === req.params.id)
  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    })
  }
  res.json({
    success: true,
    data: agent
  })
})

// 创建代理
router.post('/', (req, res) => {
  const newAgent = {
    id: `00${mockAgents.length + 1}`,
    name: req.body.name || 'New Agent',
    description: req.body.description || '',
    status: 'inactive',
    channels: req.body.channels || [],
    workspace: req.body.workspace || `~/.openclaw/workspace-agent-${mockAgents.length + 1}`,
    createdAt: new Date().toISOString().split('T')[0],
    model: req.body.model || 'claude-sonnet-4-5',
    config: req.body.config || {
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: 'You are a helpful assistant...'
    }
  }

  mockAgents.push(newAgent)

  res.status(201).json({
    success: true,
    data: newAgent,
    message: 'Agent created successfully'
  })
})

// 更新代理
router.put('/:id', (req, res) => {
  const agentIndex = mockAgents.findIndex(a => a.id === req.params.id)
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    })
  }

  const updatedAgent = {
    ...mockAgents[agentIndex],
    ...req.body,
    id: req.params.id // 确保ID不变
  }

  mockAgents[agentIndex] = updatedAgent

  res.json({
    success: true,
    data: updatedAgent,
    message: 'Agent updated successfully'
  })
})

// 控制代理（启动/停止/重启）
router.post('/:id/control', (req, res) => {
  const agent = mockAgents.find(a => a.id === req.params.id)
  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    })
  }

  const action = req.body.action // start, stop, restart
  let newStatus = agent.status

  switch (action) {
    case 'start':
      newStatus = 'active'
      break
    case 'stop':
      newStatus = 'inactive'
      break
    case 'restart':
      newStatus = 'active' // 假设重启后为活跃状态
      break
    default:
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use start, stop, or restart'
      })
  }

  agent.status = newStatus

  res.json({
    success: true,
    data: { ...agent, status: newStatus },
    message: `Agent ${action}ed successfully`
  })
})

// 删除代理
router.delete('/:id', (req, res) => {
  const agentIndex = mockAgents.findIndex(a => a.id === req.params.id)
  if (agentIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found'
    })
  }

  const deletedAgent = mockAgents.splice(agentIndex, 1)[0]

  res.json({
    success: true,
    data: deletedAgent,
    message: 'Agent deleted successfully'
  })
})

export default router