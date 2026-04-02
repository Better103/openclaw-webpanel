<template>
  <div class="agent-detail">
    <!-- 头部导航 -->
    <div class="detail-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/agents' }">
          {{ $t('navigation.agents') }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ agent?.name || 'Loading...' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.back') }}
        </el-button>
        <el-button type="primary" @click="editAgent">
          <el-icon><Edit /></el-icon>
          {{ $t('common.edit') }}
        </el-button>
        <el-button
          :type="agent?.status === 'active' ? 'warning' : 'success'"
          @click="toggleAgentStatus"
        >
          <el-icon v-if="agent?.status === 'active'"><SwitchButton /></el-icon>
          <el-icon v-else><VideoPlay /></el-icon>
          {{ agent?.status === 'active' ? $t('agents.stop') : $t('agents.start') }}
        </el-button>
        <el-button type="danger" @click="deleteAgent">
          <el-icon><Delete /></el-icon>
          {{ $t('common.delete') }}
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        :title="$t('common.error')"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="loadAgent">
            {{ $t('common.retry') }}
          </el-button>
        </template>
      </el-result>
    </div>

    <div v-else-if="!agent" class="not-found-container">
      <el-result
        icon="warning"
        :title="$t('agents.notFound')"
        :sub-title="$t('agents.agentNotFound')"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">
            {{ $t('common.backToList') }}
          </el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="detail-content">
      <el-row :gutter="20">
        <!-- 左侧：基本信息 -->
        <el-col :span="8">
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><User /></el-icon>
                <span>{{ $t('agents.basicInfo') }}</span>
              </div>
            </template>

            <div class="agent-profile">
              <div class="agent-avatar">
                <el-avatar :size="80" :src="agent.avatar">
                  {{ agent.name.charAt(0) }}
                </el-avatar>
              </div>

              <div class="agent-summary">
                <h3 class="agent-name">{{ agent.name }}</h3>
                <p class="agent-description">{{ agent.description }}</p>

                <div class="agent-status">
                  <el-tag :type="agent.status === 'active' ? 'success' : agent.status === 'error' ? 'danger' : 'info'">
                    {{ agent.status }}
                  </el-tag>
                  <span class="status-text">{{ $t(`agents.status.${agent.status}`) }}</span>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="agent-metadata">
              <div class="metadata-item">
                <span class="metadata-label">{{ $t('agents.id') }}:</span>
                <span class="metadata-value">{{ agent.id }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">{{ $t('agents.createdAt') }}:</span>
                <span class="metadata-value">{{ formatDate(agent.createdAt) }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">{{ $t('agents.model') }}:</span>
                <span class="metadata-value">{{ agent.model }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">{{ $t('agents.workspace') }}:</span>
                <span class="metadata-value">{{ agent.workspace }}</span>
              </div>
            </div>
          </el-card>

          <!-- 渠道信息 -->
          <el-card class="channels-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Connection /></el-icon>
                <span>{{ $t('agents.channels') }}</span>
              </div>
            </template>

            <div class="channels-list">
              <el-tag
                v-for="channel in agent.channels"
                :key="channel"
                class="channel-tag"
                :type="getChannelType(channel)"
                effect="plain"
              >
                <el-icon class="channel-icon">
                  <component :is="getChannelIcon(channel)" />
                </el-icon>
                {{ channel }}
              </el-tag>
            </div>

            <div v-if="agent.channels.length === 0" class="no-channels">
              {{ $t('agents.noChannels') }}
            </div>
          </el-card>
        </el-col>

        <!-- 中间：配置和状态 -->
        <el-col :span="16">
          <!-- 配置信息 -->
          <el-card class="config-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>{{ $t('agents.configuration') }}</span>
              </div>
            </template>

            <el-tabs v-model="activeConfigTab">
              <el-tab-pane :label="$t('agents.modelConfig')" name="model">
                <div class="config-section">
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.model') }}:</span>
                    <span class="config-value">{{ agent.model }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.maxTokens') }}:</span>
                    <span class="config-value">{{ agent.config?.maxTokens || 4096 }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.temperature') }}:</span>
                    <span class="config-value">{{ agent.config?.temperature || 0.7 }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.systemPrompt') }}:</span>
                    <div class="config-prompt">
                      <pre>{{ agent.config?.systemPrompt || 'No system prompt configured' }}</pre>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane :label="$t('agents.workspaceConfig')" name="workspace">
                <div class="config-section">
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.workspacePath') }}:</span>
                    <span class="config-value">{{ agent.workspace }}</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.agentDirectory') }}:</span>
                    <span class="config-value">{{ agent.workspace }}/agent</span>
                  </div>
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.sessionStorage') }}:</span>
                    <span class="config-value">{{ agent.workspace }}/sessions</span>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane :label="$t('agents.rulesConfig')" name="rules">
                <div class="config-section">
                  <div class="config-item">
                    <span class="config-label">{{ $t('agents.responseRules') }}:</span>
                    <div class="config-rules">
                      <pre>{{ JSON.stringify(agent.config?.rules || {}, null, 2) }}</pre>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <!-- 状态指标 -->
          <el-card class="metrics-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Histogram /></el-icon>
                <span>{{ $t('agents.metrics') }}</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="6">
                <div class="metric-item">
                  <div class="metric-label">{{ $t('agents.totalMessages') }}</div>
                  <div class="metric-value">{{ agentMetrics.totalMessages || 0 }}</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-item">
                  <div class="metric-label">{{ $t('agents.successRate') }}</div>
                  <div class="metric-value">{{ agentMetrics.successRate || 0 }}%</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-item">
                  <div class="metric-label">{{ $t('agents.avgResponseTime') }}</div>
                  <div class="metric-value">{{ agentMetrics.avgResponseTime || 0 }}ms</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="metric-item">
                  <div class="metric-label">{{ $t('agents.uptime') }}</div>
                  <div class="metric-value">{{ agentMetrics.uptime || 0 }}%</div>
                </div>
              </el-col>
            </el-row>

            <div v-if="agent.status === 'error'" class="error-message">
              <el-alert
                :title="$t('agents.errorDetected')"
                type="error"
                :description="agent.errorMessage || $t('agents.unknownError')"
                show-icon
                :closable="false"
              />
            </div>
          </el-card>

          <!-- 最近活动 -->
          <el-card class="activity-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Clock /></el-icon>
                <span>{{ $t('agents.recentActivity') }}</span>
              </div>
            </template>

            <el-timeline>
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="formatTime(activity.timestamp)"
                :type="getActivityType(activity.type)"
                :hollow="activity.type === 'info'"
              >
                <div class="activity-item">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-description">{{ activity.description }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>

            <div v-if="recentActivities.length === 0" class="no-activity">
              {{ $t('agents.noRecentActivity') }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAgentStore } from '@/stores/agent.store'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  SwitchButton,
  VideoPlay,
  Delete,
  User,
  Connection,
  Setting,
  Histogram,
  Clock,
  Warning,
  Check,
  Close,
  InfoFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const agentStore = useAgentStore()

const agentId = computed(() => route.params.id as string)
const agent = computed(() => agentStore.selectedAgent)
const loading = computed(() => agentStore.loading)
const error = ref<string | null>(null)

const activeConfigTab = ref('model')

// 模拟代理指标数据
const agentMetrics = ref({
  totalMessages: 3421,
  successRate: 97.5,
  avgResponseTime: 218,
  uptime: 99.8,
  lastActive: '2024-01-15T10:30:00Z'
})

// 模拟最近活动
const recentActivities = ref([
  {
    id: '1',
    type: 'success',
    title: t('agents.activity.messageProcessed'),
    description: 'Message from WhatsApp (personal) processed successfully',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'info',
    title: t('agents.activity.agentStarted'),
    description: 'Agent started with new configuration',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'warning',
    title: t('agents.activity.highLatency'),
    description: 'Response time exceeded 500ms threshold',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    type: 'success',
    title: t('agents.activity.configUpdated'),
    description: 'Model configuration updated to claude-sonnet-4-5',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
])

onMounted(() => {
  loadAgent()
})

const loadAgent = async () => {
  error.value = null
  try {
    await agentStore.fetchAgent(agentId.value)
    if (!agent.value) {
      error.value = t('agents.agentNotFound')
    }
  } catch (err: any) {
    error.value = err.message || t('common.loadFailed')
  }
}

const goBack = () => {
  router.push('/agents')
}

const editAgent = () => {
  ElMessage.info(t('agents.editFeatureComingSoon'))
}

const toggleAgentStatus = async () => {
  if (!agent.value) return

  try {
    const action = agent.value.status === 'active' ? 'stop' : 'start'
    await agentStore.controlAgent(agent.value.id, action)
    ElMessage.success(
      agent.value.status === 'active'
        ? t('agents.stoppedSuccessfully')
        : t('agents.startedSuccessfully')
    )
  } catch (err: any) {
    ElMessage.error(err.message || t('agents.controlFailed'))
  }
}

const deleteAgent = async () => {
  if (!agent.value) return

  try {
    await ElMessageBox.confirm(
      t('agents.deleteConfirm', { name: agent.value.name }),
      t('common.warning'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await agentStore.deleteAgent(agent.value.id)
    ElMessage.success(t('agents.deletedSuccessfully'))
    goBack()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(t('agents.deleteFailed'))
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

const getChannelType = (channel: string) => {
  const types: Record<string, string> = {
    'WhatsApp': 'success',
    'Telegram': 'primary',
    'Discord': 'info',
    'Slack': 'warning'
  }
  return types[channel] || 'default'
}

const getChannelIcon = (channel: string) => {
  const icons: Record<string, string> = {
    'WhatsApp': 'Message',
    'Telegram': 'ChatRound',
    'Discord': 'ChatLineSquare',
    'Slack': 'ChatDotSquare'
  }
  return icons[channel] || 'Connection'
}

const getActivityType = (type: string) => {
  const types: Record<string, string> = {
    'success': 'success',
    'error': 'danger',
    'warning': 'warning',
    'info': 'info'
  }
  return types[type] || 'info'
}
</script>

<style scoped>
.agent-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-container,
.error-container,
.not-found-container {
  margin-top: 40px;
}

.detail-content {
  margin-top: 20px;
}

.info-card,
.channels-card,
.config-card,
.metrics-card,
.activity-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.agent-profile {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.agent-summary {
  flex: 1;
}

.agent-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.agent-description {
  color: var(--el-text-color-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.agent-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.agent-metadata {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.metadata-item:last-child {
  border-bottom: none;
}

.metadata-label {
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.metadata-value {
  font-family: monospace;
  color: var(--el-text-color-primary);
}

.channels-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.channel-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.channel-icon {
  font-size: 14px;
}

.no-channels {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 20px;
}

.config-section {
  padding: 16px;
}

.config-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.config-label {
  font-weight: 500;
  min-width: 150px;
  color: var(--el-text-color-secondary);
}

.config-value {
  flex: 1;
  word-break: break-all;
}

.config-prompt,
.config-rules {
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.config-prompt pre,
.config-rules pre {
  margin: 0;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.metric-item {
  text-align: center;
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
}

.metric-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.error-message {
  margin-top: 20px;
}

.activity-item {
  padding: 8px 0;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.no-activity {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 20px;
}
</style>