<template>
  <div class="agents">
    <div class="page-header">
      <h1 class="page-title">{{ $t('navigation.agents') }}</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateAgent">
          <el-icon><Plus /></el-icon>
          Create Agent
        </el-button>
        <el-button @click="refreshAgents">
          <el-icon><Refresh /></el-icon>
          Refresh
        </el-button>
      </div>
    </div>

    <!-- 过滤和搜索 -->
    <el-card class="filters-card" shadow="never">
      <div class="filters">
        <el-input
          v-model="searchQuery"
          placeholder="Search agents..."
          prefix-icon="Search"
          class="search-input"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="Status" clearable>
          <el-option label="Active" value="active" />
          <el-option label="Inactive" value="inactive" />
          <el-option label="Error" value="error" />
        </el-select>
        <el-select v-model="channelFilter" placeholder="Channel" clearable>
          <el-option label="WhatsApp" value="whatsapp" />
          <el-option label="Telegram" value="telegram" />
          <el-option label="Discord" value="discord" />
          <el-option label="Slack" value="slack" />
        </el-select>
      </div>
    </el-card>

    <!-- 代理列表 -->
    <el-card class="agents-table-card" shadow="hover">
      <el-table :data="filteredAgents" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Name">
          <template #default="{ row }">
            <div class="agent-name">
              <el-avatar :size="32" :src="row.avatar" />
              <div class="agent-info">
                <div class="agent-title">{{ row.name }}</div>
                <div class="agent-description">{{ row.description }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'error' ? 'danger' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channels" label="Channels" width="120">
          <template #default="{ row }">
            <div class="channels">
              <el-tag
                v-for="channel in row.channels"
                :key="channel"
                size="small"
                :type="getChannelType(channel)"
              >
                {{ channel }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="workspace" label="Workspace" />
        <el-table-column prop="createdAt" label="Created" width="120" />
        <el-table-column label="Actions" width="180">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" @click="viewAgent(row)">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" type="primary" @click="editAgent(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                size="small"
                :type="row.status === 'active' ? 'warning' : 'success'"
                @click="toggleAgentStatus(row)"
              >
                <el-icon v-if="row.status === 'active'"><SwitchButton /></el-icon>
                <el-icon v-else><VideoPlay /></el-icon>
              </el-button>
              <el-button size="small" type="danger" @click="deleteAgent(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalAgents"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Refresh,
  Search,
  View,
  Edit,
  SwitchButton,
  VideoPlay,
  Delete
} from '@element-plus/icons-vue'

const router = useRouter()

const searchQuery = ref('')
const statusFilter = ref('')
const channelFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 模拟代理数据
const agents = ref([
  {
    id: '001',
    name: 'Personal Assistant',
    description: 'Handles personal messages and scheduling',
    avatar: '',
    status: 'active',
    channels: ['WhatsApp', 'Telegram'],
    workspace: '~/.openclaw/workspace-personal',
    createdAt: '2024-01-15',
    model: 'claude-sonnet-4-5'
  },
  {
    id: '002',
    name: 'Work Agent',
    description: 'Business communications and task management',
    avatar: '',
    status: 'active',
    channels: ['Slack', 'Discord'],
    workspace: '~/.openclaw/workspace-work',
    createdAt: '2024-01-20',
    model: 'claude-opus-4-5'
  },
  {
    id: '003',
    name: 'Support Bot',
    description: 'Customer support and FAQ handling',
    avatar: '',
    status: 'inactive',
    channels: ['WhatsApp', 'Telegram', 'Discord'],
    workspace: '~/.openclaw/workspace-support',
    createdAt: '2024-02-01',
    model: 'claude-haiku-4-5'
  },
  {
    id: '004',
    name: 'News Aggregator',
    description: 'Collects and summarizes news from various sources',
    avatar: '',
    status: 'error',
    channels: ['Telegram'],
    workspace: '~/.openclaw/workspace-news',
    createdAt: '2024-02-10',
    model: 'claude-sonnet-4-5'
  }
])

const totalAgents = computed(() => agents.value.length)

const filteredAgents = computed(() => {
  return agents.value.filter(agent => {
    const matchesSearch = !searchQuery.value ||
      agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !statusFilter.value || agent.status === statusFilter.value

    const matchesChannel = !channelFilter.value ||
      agent.channels.some(channel => channel.toLowerCase() === channelFilter.value.toLowerCase())

    return matchesSearch && matchesStatus && matchesChannel
  })
})

const getChannelType = (channel: string) => {
  const types: Record<string, string> = {
    'WhatsApp': 'success',
    'Telegram': 'primary',
    'Discord': 'info',
    'Slack': 'warning'
  }
  return types[channel] || 'default'
}

const showCreateAgent = () => {
  router.push('/agents/new')
}

const refreshAgents = () => {
  // 刷新代理列表
  console.log('Refreshing agents...')
}

const viewAgent = (agent: any) => {
  router.push(`/agents/${agent.id}`)
}

const editAgent = (agent: any) => {
  console.log('Edit agent:', agent)
}

const toggleAgentStatus = (agent: any) => {
  agent.status = agent.status === 'active' ? 'inactive' : 'active'
  console.log('Toggled agent status:', agent)
}

const deleteAgent = (agent: any) => {
  // 删除代理确认
  console.log('Delete agent:', agent)
}
</script>

<style scoped>
.agents {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filters-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filters {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.agents-table-card {
  border-radius: 8px;
}

.agent-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-info {
  display: flex;
  flex-direction: column;
}

.agent-title {
  font-weight: 600;
  color: #1f2937;
}

.agent-description {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.channels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

[data-theme="dark"] .page-title,
[data-theme="dark"] .agent-title {
  color: #f3f4f6;
}

[data-theme="dark"] .agent-description {
  color: #d1d5db;
}

[data-theme="dark"] .table-footer {
  border-top-color: #374151;
}
</style>