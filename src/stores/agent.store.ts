import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { Agent, AgentStatus, AgentControlAction } from '@/types/agent'

export const useAgentStore = defineStore('agent', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const selectedAgent = ref<Agent | null>(null)
  const agentStatus = ref<Record<string, AgentStatus>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeAgents = computed(() => agents.value.filter(agent => agent.status === 'active'))
  const inactiveAgents = computed(() => agents.value.filter(agent => agent.status === 'inactive'))
  const errorAgents = computed(() => agents.value.filter(agent => agent.status === 'error'))
  const agentMetrics = computed(() => {
    const total = agents.value.length
    const active = activeAgents.value.length
    const inactive = inactiveAgents.value.length
    const withErrors = errorAgents.value.length

    return {
      total,
      active,
      inactive,
      withErrors,
      activePercentage: total > 0 ? (active / total) * 100 : 0
    }
  })

  // 操作
  const fetchAgents = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get('/api/agents')
      if (response.data.success) {
        agents.value = response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch agents')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch agents'
      console.error('Error fetching agents:', err)

      // 模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        agents.value = [
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
          }
        ]
      }
    } finally {
      loading.value = false
    }
  }

  const fetchAgent = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`/api/agents/${id}`)
      if (response.data.success) {
        selectedAgent.value = response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to fetch agent')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch agent'
      console.error('Error fetching agent:', err)
    } finally {
      loading.value = false
    }
  }

  const createAgent = async (agentData: Partial<Agent>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post('/api/agents', agentData)
      if (response.data.success) {
        agents.value.push(response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to create agent')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to create agent'
      console.error('Error creating agent:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAgent = async (id: string, agentData: Partial<Agent>) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`/api/agents/${id}`, agentData)
      if (response.data.success) {
        const index = agents.value.findIndex(agent => agent.id === id)
        if (index !== -1) {
          agents.value[index] = response.data.data
        }

        if (selectedAgent.value?.id === id) {
          selectedAgent.value = response.data.data
        }

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to update agent')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update agent'
      console.error('Error updating agent:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const controlAgent = async (id: string, action: AgentControlAction) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`/api/agents/${id}/control`, { action })
      if (response.data.success) {
        const index = agents.value.findIndex(agent => agent.id === id)
        if (index !== -1) {
          agents.value[index] = response.data.data
        }

        if (selectedAgent.value?.id === id) {
          selectedAgent.value = response.data.data
        }

        return response.data.data
      } else {
        throw new Error(response.data.error || `Failed to ${action} agent`)
      }
    } catch (err: any) {
      error.value = err.message || `Failed to ${action} agent`
      console.error('Error controlling agent:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAgent = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`/api/agents/${id}`)
      if (response.data.success) {
        agents.value = agents.value.filter(agent => agent.id !== id)

        if (selectedAgent.value?.id === id) {
          selectedAgent.value = null
        }

        return response.data.data
      } else {
        throw new Error(response.data.error || 'Failed to delete agent')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete agent'
      console.error('Error deleting agent:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const selectAgent = (agent: Agent | null) => {
    selectedAgent.value = agent
  }

  const updateAgentStatus = (statusUpdate: { agentId: string; status: Agent['status']; metrics?: any }) => {
    const { agentId, status, metrics } = statusUpdate

    // 更新代理状态
    const agentIndex = agents.value.findIndex(agent => agent.id === agentId)
    if (agentIndex !== -1) {
      agents.value[agentIndex].status = status
    }

    // 更新状态存储
    agentStatus.value[agentId] = {
      agentId,
      status,
      timestamp: new Date().toISOString(),
      metrics
    }

    // 如果选中了该代理，也更新选中状态
    if (selectedAgent.value?.id === agentId) {
      selectedAgent.value.status = status
    }
  }

  const clearError = () => {
    error.value = null
  }

  // 初始化
  fetchAgents()

  return {
    // 状态
    agents,
    selectedAgent,
    agentStatus,
    loading,
    error,

    // 计算属性
    activeAgents,
    inactiveAgents,
    errorAgents,
    agentMetrics,

    // 操作
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    controlAgent,
    deleteAgent,
    selectAgent,
    updateAgentStatus,
    clearError
  }
})