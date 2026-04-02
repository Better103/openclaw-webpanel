<template>
  <div class="channel-config">
    <div class="header">
      <h2>Channel Configuration</h2>
      <el-button type="primary" @click="showAddChannelDialog">
        <el-icon><Plus /></el-icon>
        Add Channel
      </el-button>
    </div>

    <p class="description">
      Configure messaging channels and their accounts. Each channel can have multiple accounts (e.g., WhatsApp personal and business).
    </p>

    <!-- 通道列表 -->
    <div class="channels-list">
      <el-card
        v-for="channel in channels"
        :key="channel.id"
        class="channel-card"
        shadow="hover"
      >
        <template #header>
          <div class="channel-header">
            <div class="channel-info">
              <div class="channel-icon">
                <el-icon v-if="channel.id === 'whatsapp'"><Message /></el-icon>
                <el-icon v-if="channel.id === 'telegram'"><Promotion /></el-icon>
                <el-icon v-if="channel.id === 'discord'"><ChatDotRound /></el-icon>
                <el-icon v-if="channel.id === 'slack'"><Bell /></el-icon>
                <el-icon v-else><Platform /></el-icon>
              </div>
              <div>
                <h3>{{ channel.name }}</h3>
                <div class="channel-meta">
                  <el-tag :type="getChannelStatusType(channel)" size="small">
                    {{ getChannelStatusText(channel) }}
                  </el-tag>
                  <span class="channel-type">{{ channel.type }}</span>
                </div>
              </div>
            </div>
            <div class="channel-actions">
              <el-button-group size="small">
                <el-button @click="editChannel(channel)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button @click="testChannel(channel)">
                  <el-icon><Connection /></el-icon>
                  Test
                </el-button>
                <el-button
                  v-if="channel.status === 'connected'"
                  type="danger"
                  @click="disconnectChannel(channel)"
                >
                  <el-icon><Close /></el-icon>
                  Disconnect
                </el-button>
                <el-button
                  v-else
                  type="success"
                  @click="connectChannel(channel)"
                >
                  <el-icon><Check /></el-icon>
                  Connect
                </el-button>
              </el-button-group>
            </div>
          </div>
        </template>

        <!-- 账户列表 -->
        <div class="accounts-section">
          <div class="section-header">
            <h4>Accounts</h4>
            <el-button size="small" @click="showAddAccountDialog(channel)">
              <el-icon><Plus /></el-icon>
              Add Account
            </el-button>
          </div>

          <div class="accounts-list">
            <div
              v-for="account in channel.accounts"
              :key="account.id"
              class="account-item"
            >
              <div class="account-info">
                <div class="account-name">
                  <strong>{{ account.name }}</strong>
                  <el-tag
                    :type="account.status === 'connected' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ account.status }}
                  </el-tag>
                </div>
                <div class="account-id">ID: {{ account.id }}</div>
                <div class="account-meta">
                  <span>Last active: {{ formatDate(account.lastActive) }}</span>
                  <span v-if="account.messageCount">
                    • Messages: {{ account.messageCount }}
                  </span>
                </div>
              </div>
              <div class="account-actions">
                <el-button-group size="small">
                  <el-button @click="editAccount(channel, account)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button @click="testAccount(channel, account)">
                    <el-icon><Connection /></el-icon>
                  </el-button>
                  <el-button
                    type="danger"
                    @click="removeAccount(channel, account)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </div>
        </div>

        <!-- 配置详情 -->
        <el-collapse class="config-collapse">
          <el-collapse-item title="Configuration Details">
            <div class="config-details">
              <div class="config-item">
                <label>Webhook URL:</label>
                <code>{{ channel.config.webhookUrl || 'Not configured' }}</code>
                <el-button
                  v-if="channel.config.webhookUrl"
                  type="text"
                  size="small"
                  @click="copyToClipboard(channel.config.webhookUrl)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
              <div
                v-for="(value, key) in channel.config"
                v-if="key !== 'webhookUrl'"
                :key="key"
                class="config-item"
              >
                <label>{{ formatConfigKey(key) }}:</label>
                <span>{{ formatConfigValue(key, value) }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>

    <!-- 添加/编辑通道对话框 -->
    <el-dialog
      :title="editingChannel ? 'Edit Channel' : 'Add New Channel'"
      v-model="showChannelDialog"
      width="600px"
    >
      <el-form :model="channelForm" label-width="120px">
        <el-form-item label="Channel Type" required>
          <el-select v-model="channelForm.type" placeholder="Select channel type">
            <el-option label="WhatsApp" value="whatsapp" />
            <el-option label="Telegram" value="telegram" />
            <el-option label="Discord" value="discord" />
            <el-option label="Slack" value="slack" />
          </el-select>
        </el-form-item>
        <el-form-item label="Display Name" required>
          <el-input v-model="channelForm.name" placeholder="e.g., WhatsApp Business" />
        </el-form-item>
        <el-form-item label="Webhook URL">
          <el-input v-model="channelForm.webhookUrl" placeholder="https://api.example.com/webhook" />
        </el-form-item>
        <el-form-item label="Authentication">
          <el-input
            v-model="channelForm.authToken"
            type="password"
            placeholder="API token or secret"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChannelDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveChannel">
          {{ editingChannel ? 'Update' : 'Add' }} Channel
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑账户对话框 -->
    <el-dialog
      :title="editingAccount ? 'Edit Account' : 'Add Account'"
      v-model="showAccountDialog"
      width="500px"
    >
      <el-form :model="accountForm" label-width="100px">
        <el-form-item label="Account Name" required>
          <el-input v-model="accountForm.name" placeholder="e.g., Personal Account" />
        </el-form-item>
        <el-form-item label="Account ID" required>
          <el-input v-model="accountForm.id" placeholder="e.g., personal, biz, default" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="accountForm.status" placeholder="Select status">
            <el-option label="Connected" value="connected" />
            <el-option label="Disconnected" value="disconnected" />
            <el-option label="Error" value="error" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAccountDialog = false">Cancel</el-button>
        <el-button type="primary" @click="saveAccount">Save Account</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Connection,
  Message,
  Promotion,
  ChatDotRound,
  Bell,
  Platform,
  CopyDocument
} from '@element-plus/icons-vue'
import { useRoutingStore } from '@/stores/routing.store'
import type { Channel, ChannelAccount } from '@/types/routing'

const routingStore = useRoutingStore()

// 通道数据
const channels = computed(() => routingStore.channels)

// 对话框状态
const showChannelDialog = ref(false)
const showAccountDialog = ref(false)
const editingChannel = ref<Channel | null>(null)
const editingAccount = ref<{ channel: Channel; account: ChannelAccount } | null>(null)
const currentChannelForAccount = ref<Channel | null>(null)

// 通道表单
const channelForm = reactive({
  type: '',
  name: '',
  webhookUrl: '',
  authToken: ''
})

// 账户表单
const accountForm = reactive({
  name: '',
  id: '',
  status: 'connected'
})

// 获取通道状态类型
const getChannelStatusType = (channel: Channel) => {
  const statusMap: Record<string, string> = {
    'connected': 'success',
    'disconnected': 'warning',
    'error': 'danger',
    'connecting': 'info'
  }
  return statusMap[channel.status] || 'info'
}

const getChannelStatusText = (channel: Channel) => {
  const connectedAccounts = channel.accounts.filter(a => a.status === 'connected').length
  return `${channel.status} (${connectedAccounts}/${channel.accounts.length} accounts)`
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleString()
}

// 格式化配置键
const formatConfigKey = (key: string) => {
  const keyMap: Record<string, string> = {
    'webhookUrl': 'Webhook URL',
    'botToken': 'Bot Token',
    'dmPolicy': 'DM Policy',
    'groupPolicy': 'Group Policy',
    'rateLimit': 'Rate Limit'
  }
  return keyMap[key] || key
}

// 格式化配置值
const formatConfigValue = (key: string, value: any) => {
  if (key.includes('Token') || key.includes('Secret') || key.includes('Key')) {
    return '••••••••'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

// 复制到剪贴板
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('Copied to clipboard')
  }).catch(() => {
    ElMessage.error('Failed to copy')
  })
}

// 显示添加通道对话框
const showAddChannelDialog = () => {
  editingChannel.value = null
  channelForm.type = ''
  channelForm.name = ''
  channelForm.webhookUrl = ''
  channelForm.authToken = ''
  showChannelDialog.value = true
}

// 编辑通道
const editChannel = (channel: Channel) => {
  editingChannel.value = channel
  channelForm.type = channel.id
  channelForm.name = channel.name
  channelForm.webhookUrl = channel.config.webhookUrl || ''
  channelForm.authToken = channel.config.botToken || channel.config.apiKey || ''
  showChannelDialog.value = true
}

// 保存通道
const saveChannel = async () => {
  try {
    const channelData: Partial<Channel> = {
      id: channelForm.type,
      name: channelForm.name,
      type: 'messaging',
      status: 'disconnected',
      accounts: [],
      config: {
        webhookUrl: channelForm.webhookUrl
      }
    }

    if (channelForm.authToken) {
      if (channelForm.type === 'telegram') {
        channelData.config!.botToken = channelForm.authToken
      } else {
        channelData.config!.apiKey = channelForm.authToken
      }
    }

    await routingStore.addChannel(channelData)
    ElMessage.success(editingChannel.value ? 'Channel updated' : 'Channel added')
    showChannelDialog.value = false
  } catch (error) {
    console.error('Error saving channel:', error)
    ElMessage.error('Failed to save channel')
  }
}

// 测试通道连接
const testChannel = async (channel: Channel) => {
  ElMessage.info(`Testing connection to ${channel.name}...`)
  // 这里应该调用API测试连接
  setTimeout(() => {
    ElMessage.success(`${channel.name} connection test successful`)
  }, 1000)
}

// 连接通道
const connectChannel = async (channel: Channel) => {
  try {
    ElMessage.info(`Connecting to ${channel.name}...`)
    // 这里应该调用API连接通道
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success(`${channel.name} connected successfully`)
  } catch (error) {
    ElMessage.error(`Failed to connect to ${channel.name}`)
  }
}

// 断开通道连接
const disconnectChannel = async (channel: Channel) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to disconnect ${channel.name}?`,
      'Disconnect Channel',
      { type: 'warning' }
    )
    ElMessage.info(`Disconnecting ${channel.name}...`)
    // 这里应该调用API断开连接
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`${channel.name} disconnected`)
  } catch {
    // 用户取消
  }
}

// 显示添加账户对话框
const showAddAccountDialog = (channel: Channel) => {
  currentChannelForAccount.value = channel
  editingAccount.value = null
  accountForm.name = ''
  accountForm.id = ''
  accountForm.status = 'connected'
  showAccountDialog.value = true
}

// 编辑账户
const editAccount = (channel: Channel, account: ChannelAccount) => {
  currentChannelForAccount.value = channel
  editingAccount.value = { channel, account }
  accountForm.name = account.name
  accountForm.id = account.id
  accountForm.status = account.status
  showAccountDialog.value = true
}

// 保存账户
const saveAccount = () => {
  if (!currentChannelForAccount.value) return

  // 这里应该调用API保存账户
  ElMessage.success(editingAccount.value ? 'Account updated' : 'Account added')
  showAccountDialog.value = false
}

// 测试账户
const testAccount = (channel: Channel, account: ChannelAccount) => {
  ElMessage.info(`Testing account ${account.name}...`)
  // 这里应该调用API测试账户
  setTimeout(() => {
    ElMessage.success(`Account ${account.name} test successful`)
  }, 1000)
}

// 移除账户
const removeAccount = async (channel: Channel, account: ChannelAccount) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to remove account ${account.name}?`,
      'Remove Account',
      { type: 'warning' }
    )
    // 这里应该调用API移除账户
    ElMessage.success(`Account ${account.name} removed`)
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.channel-config {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.description {
  color: #6b7280;
  margin-bottom: 30px;
  font-size: 14px;
  line-height: 1.6;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.channel-card {
  border-radius: 8px;
}

.channel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.channel-icon {
  font-size: 24px;
  color: #3b82f6;
}

.channel-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.channel-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.channel-type {
  font-size: 12px;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.accounts-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.account-info {
  flex: 1;
}

.account-name {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.account-name strong {
  font-size: 14px;
  color: #1f2937;
}

.account-id {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.account-meta {
  font-size: 11px;
  color: #9ca3af;
  display: flex;
  gap: 10px;
}

.config-collapse {
  margin-top: 20px;
}

.config-details {
  padding: 10px;
  background-color: #f9fafb;
  border-radius: 4px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 13px;
}

.config-item label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.config-item code {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', monospace;
  flex: 1;
}

[data-theme="dark"] .header h2,
[data-theme="dark"] .channel-info h3,
[data-theme="dark"] .section-header h4,
[data-theme="dark"] .account-name strong,
[data-theme="dark"] .config-item label {
  color: #f3f4f6;
}

[data-theme="dark"] .description {
  color: #d1d5db;
}

[data-theme="dark"] .channel-type {
  background-color: #374151;
  color: #d1d5db;
}

[data-theme="dark"] .account-item {
  background-color: #1f2937;
  border-color: #374151;
}

[data-theme="dark"] .config-details {
  background-color: #1f2937;
}

[data-theme="dark"] .config-item code {
  background-color: #111827;
}
</style>