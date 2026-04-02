import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAgentStore } from '../agent.store'

describe('Agent Store', () => {
  beforeEach(() => {
    // 创建一个新的pinia实例
    setActivePinia(createPinia())
  })

  it('should have initial state', () => {
    const store = useAgentStore()

    expect(store.agents).toEqual([])
    expect(store.selectedAgent).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should compute active agents', () => {
    const store = useAgentStore()

    // 模拟数据
    store.agents = [
      { id: '001', name: 'Agent 1', status: 'active' } as any,
      { id: '002', name: 'Agent 2', status: 'inactive' } as any,
      { id: '003', name: 'Agent 3', status: 'active' } as any
    ]

    expect(store.activeAgents).toHaveLength(2)
    expect(store.inactiveAgents).toHaveLength(1)
    expect(store.errorAgents).toHaveLength(0)
  })

  it('should compute agent metrics', () => {
    const store = useAgentStore()

    store.agents = [
      { id: '001', name: 'Agent 1', status: 'active' } as any,
      { id: '002', name: 'Agent 2', status: 'inactive' } as any,
      { id: '003', name: 'Agent 3', status: 'active' } as any,
      { id: '004', name: 'Agent 4', status: 'error' } as any
    ]

    const metrics = store.agentMetrics

    expect(metrics.total).toBe(4)
    expect(metrics.active).toBe(2)
    expect(metrics.inactive).toBe(1)
    expect(metrics.withErrors).toBe(1)
    expect(metrics.activePercentage).toBe(50)
  })

  it('should update agent status', () => {
    const store = useAgentStore()

    store.agents = [
      { id: '001', name: 'Agent 1', status: 'active' } as any,
      { id: '002', name: 'Agent 2', status: 'inactive' } as any
    ]

    store.updateAgentStatus({
      agentId: '001',
      status: 'error',
      metrics: { cpuUsage: 90 }
    })

    const updatedAgent = store.agents.find(a => a.id === '001')
    expect(updatedAgent?.status).toBe('error')

    // 检查agentStatus也被更新了
    expect(store.agentStatus['001']).toBeDefined()
    expect(store.agentStatus['001'].status).toBe('error')
  })

  it('should select agent', () => {
    const store = useAgentStore()

    const mockAgent = { id: '001', name: 'Agent 1', status: 'active' } as any
    store.selectAgent(mockAgent)

    expect(store.selectedAgent).toBe(mockAgent)
  })
})