<template>
  <div class="settings">
    <div class="settings-header">
      <h1 class="page-title">{{ $t('navigation.settings') }}</h1>
      <p class="page-subtitle">{{ $t('settings.description') }}</p>
    </div>

    <el-card class="settings-card" shadow="hover">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 常规设置 -->
        <el-tab-pane :label="$t('settings.general')" name="general">
          <div class="tab-content">
            <el-form :model="generalForm" label-width="200px" label-position="left">
              <el-form-item :label="$t('settings.language')">
                <el-select v-model="generalForm.language" @change="handleLanguageChange">
                  <el-option
                    v-for="lang in languages"
                    :key="lang.value"
                    :label="lang.label"
                    :value="lang.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="$t('settings.theme')">
                <el-select v-model="generalForm.theme" @change="handleThemeChange">
                  <el-option
                    v-for="theme in themes"
                    :key="theme.value"
                    :label="theme.label"
                    :value="theme.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item :label="$t('settings.sidebar')">
                <el-switch
                  v-model="generalForm.sidebarCollapsed"
                  :active-text="$t('settings.collapsed')"
                  :inactive-text="$t('settings.expanded')"
                  @change="handleSidebarChange"
                />
              </el-form-item>

              <el-form-item :label="$t('settings.autoRefresh')">
                <el-switch
                  v-model="generalForm.autoRefresh"
                  :active-text="$t('settings.enabled')"
                  :inactive-text="$t('settings.disabled')"
                  @change="handleAutoRefreshChange"
                />
              </el-form-item>

              <el-form-item v-if="generalForm.autoRefresh" :label="$t('settings.refreshInterval')">
                <el-input-number
                  v-model="generalForm.refreshInterval"
                  :min="5"
                  :max="300"
                  :step="5"
                  :step-strictly="true"
                />
                <span class="unit-text"> {{ $t('settings.seconds') }}</span>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveGeneralSettings">
                  {{ $t('common.save') }}
                </el-button>
                <el-button @click="resetGeneralSettings">
                  {{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- API管理 -->
        <el-tab-pane :label="$t('settings.api')" name="api">
          <div class="tab-content">
            <el-alert
              :title="$t('settings.apiSecurityNote')"
              type="warning"
              :closable="false"
              show-icon
              class="mb-6"
            />

            <el-form :model="apiForm" label-width="200px" label-position="left">
              <el-form-item :label="$t('settings.openaiApiKey')">
                <el-input
                  v-model="apiForm.openaiApiKey"
                  type="password"
                  show-password
                  placeholder="sk-..."
                />
              </el-form-item>

              <el-form-item :label="$t('settings.anthropicApiKey')">
                <el-input
                  v-model="apiForm.anthropicApiKey"
                  type="password"
                  show-password
                  placeholder="sk-ant-..."
                />
              </el-form-item>

              <el-form-item :label="$t('settings.apiBaseUrl')">
                <el-input
                  v-model="apiForm.apiBaseUrl"
                  placeholder="https://api.openclaw.ai"
                />
              </el-form-item>

              <el-form-item :label="$t('settings.apiTimeout')">
                <el-input-number
                  v-model="apiForm.apiTimeout"
                  :min="1000"
                  :max="60000"
                  :step="1000"
                />
                <span class="unit-text"> {{ $t('settings.milliseconds') }}</span>
              </el-form-item>

              <el-form-item :label="$t('settings.maxRetries')">
                <el-input-number
                  v-model="apiForm.maxRetries"
                  :min="0"
                  :max="10"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="testApiConnection">
                  {{ $t('settings.testConnection') }}
                </el-button>
                <el-button type="primary" @click="saveApiSettings">
                  {{ $t('common.save') }}
                </el-button>
                <el-button @click="resetApiSettings">
                  {{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane :label="$t('settings.notifications')" name="notifications">
          <div class="tab-content">
            <el-form :model="notificationForm" label-width="200px" label-position="left">
              <el-form-item :label="$t('settings.enableNotifications')">
                <el-switch
                  v-model="notificationForm.enabled"
                  @change="handleNotificationsChange"
                />
              </el-form-item>

              <template v-if="notificationForm.enabled">
                <el-divider>{{ $t('settings.notificationTypes') }}</el-divider>

                <el-form-item :label="$t('settings.agentStatusChanges')">
                  <el-switch v-model="notificationForm.agentStatusChanges" />
                </el-form-item>

                <el-form-item :label="$t('settings.systemAlerts')">
                  <el-switch v-model="notificationForm.systemAlerts" />
                </el-form-item>

                <el-form-item :label="$t('settings.routingEvents')">
                  <el-switch v-model="notificationForm.routingEvents" />
                </el-form-item>

                <el-form-item :label="$t('settings.errorReports')">
                  <el-switch v-model="notificationForm.errorReports" />
                </el-form-item>

                <el-divider>{{ $t('settings.notificationMethods') }}</el-divider>

                <el-form-item :label="$t('settings.inAppNotifications')">
                  <el-switch v-model="notificationForm.inApp" />
                </el-form-item>

                <el-form-item :label="$t('settings.emailNotifications')">
                  <el-switch v-model="notificationForm.email" />
                </el-form-item>

                <el-form-item v-if="notificationForm.email" :label="$t('settings.emailAddress')">
                  <el-input
                    v-model="notificationForm.emailAddress"
                    type="email"
                    placeholder="user@example.com"
                  />
                </el-form-item>

                <el-form-item :label="$t('settings.webhookNotifications')">
                  <el-switch v-model="notificationForm.webhook" />
                </el-form-item>

                <el-form-item v-if="notificationForm.webhook" :label="$t('settings.webhookUrl')">
                  <el-input
                    v-model="notificationForm.webhookUrl"
                    placeholder="https://webhook.example.com"
                  />
                </el-form-item>
              </template>

              <el-form-item>
                <el-button type="primary" @click="saveNotificationSettings">
                  {{ $t('common.save') }}
                </el-button>
                <el-button @click="resetNotificationSettings">
                  {{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 备份与恢复 -->
        <el-tab-pane :label="$t('settings.backup')" name="backup">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card shadow="hover" class="backup-card">
                  <template #header>
                    <div class="card-header">
                      <el-icon><Download /></el-icon>
                      <span>{{ $t('settings.backupConfig') }}</span>
                    </div>
                  </template>

                  <div class="backup-info">
                    <p>{{ $t('settings.backupDescription') }}</p>
                    <p class="backup-last">
                      {{ $t('settings.lastBackup') }}: {{ lastBackupTime || $t('settings.never') }}
                    </p>
                  </div>

                  <div class="backup-actions">
                    <el-button type="primary" @click="createBackup" :loading="backupLoading">
                      <el-icon><Download /></el-icon>
                      {{ $t('settings.createBackup') }}
                    </el-button>
                    <el-button @click="scheduleBackup">
                      <el-icon><Clock /></el-icon>
                      {{ $t('settings.scheduleBackup') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card shadow="hover" class="restore-card">
                  <template #header>
                    <div class="card-header">
                      <el-icon><Upload /></el-icon>
                      <span>{{ $t('settings.restoreConfig') }}</span>
                    </div>
                  </template>

                  <div class="restore-info">
                    <p>{{ $t('settings.restoreDescription') }}</p>
                    <p class="restore-warning">
                      <el-icon><Warning /></el-icon>
                      {{ $t('settings.restoreWarning') }}
                    </p>
                  </div>

                  <div class="restore-actions">
                    <el-upload
                      class="restore-upload"
                      action="/api/settings/restore"
                      :show-file-list="false"
                      :on-success="handleRestoreSuccess"
                      :on-error="handleRestoreError"
                      :before-upload="beforeRestoreUpload"
                    >
                      <el-button type="warning">
                        <el-icon><Upload /></el-icon>
                        {{ $t('settings.restoreFromFile') }}
                      </el-button>
                    </el-upload>
                    <el-button @click="showRestoreHistory">
                      <el-icon><Histogram /></el-icon>
                      {{ $t('settings.restoreHistory') }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-divider>{{ $t('settings.exportOptions') }}</el-divider>

            <div class="export-options">
              <el-button @click="exportAgentsConfig">
                <el-icon><User /></el-icon>
                {{ $t('settings.exportAgents') }}
              </el-button>
              <el-button @click="exportRoutingConfig">
                <el-icon><Connection /></el-icon>
                {{ $t('settings.exportRouting') }}
              </el-button>
              <el-button @click="exportAllConfig">
                <el-icon><FolderOpened /></el-icon>
                {{ $t('settings.exportAll') }}
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUIStore } from '@/stores/ui.store'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Upload,
  Warning,
  Clock,
  Histogram,
  User,
  Connection,
  FolderOpened
} from '@element-plus/icons-vue'

const { t } = useI18n()
const uiStore = useUIStore()

const activeTab = ref('general')
const backupLoading = ref(false)
const lastBackupTime = ref<string | null>(null)

// 语言选项
const languages = [
  { label: 'English', value: 'en' },
  { label: '中文 (简体)', value: 'zh-CN' }
]

// 主题选项
const themes = [
  { label: t('settings.lightTheme'), value: 'light' },
  { label: t('settings.darkTheme'), value: 'dark' }
]

// 常规设置表单
const generalForm = reactive({
  language: uiStore.language,
  theme: uiStore.theme,
  sidebarCollapsed: uiStore.sidebarCollapsed,
  autoRefresh: uiStore.autoRefreshEnabled,
  refreshInterval: uiStore.refreshInterval
})

// API设置表单
const apiForm = reactive({
  openaiApiKey: '',
  anthropicApiKey: '',
  apiBaseUrl: 'https://api.openclaw.ai',
  apiTimeout: 30000,
  maxRetries: 3
})

// 通知设置表单
const notificationForm = reactive({
  enabled: uiStore.notificationsEnabled,
  agentStatusChanges: true,
  systemAlerts: true,
  routingEvents: false,
  errorReports: true,
  inApp: true,
  email: false,
  emailAddress: '',
  webhook: false,
  webhookUrl: ''
})

// 初始化加载设置
onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  // 从localStorage加载API设置
  const savedApiSettings = localStorage.getItem('apiSettings')
  if (savedApiSettings) {
    try {
      Object.assign(apiForm, JSON.parse(savedApiSettings))
    } catch (e) {
      console.error('Failed to load API settings:', e)
    }
  }

  // 从localStorage加载通知设置
  const savedNotificationSettings = localStorage.getItem('notificationSettings')
  if (savedNotificationSettings) {
    try {
      Object.assign(notificationForm, JSON.parse(savedNotificationSettings))
    } catch (e) {
      console.error('Failed to load notification settings:', e)
    }
  }

  // 加载最后备份时间
  lastBackupTime.value = localStorage.getItem('lastBackupTime')
}

const handleLanguageChange = (language: string) => {
  uiStore.setLanguage(language as 'en' | 'zh-CN')
}

const handleThemeChange = (theme: string) => {
  uiStore.setTheme(theme as 'light' | 'dark')
}

const handleSidebarChange = (collapsed: boolean) => {
  uiStore.setSidebarCollapsed(collapsed)
}

const handleAutoRefreshChange = (enabled: boolean) => {
  uiStore.toggleAutoRefresh()
}

const handleNotificationsChange = (enabled: boolean) => {
  uiStore.toggleNotifications()
}

const saveGeneralSettings = () => {
  // 保存到UI store
  uiStore.setLanguage(generalForm.language as 'en' | 'zh-CN')
  uiStore.setTheme(generalForm.theme as 'light' | 'dark')
  uiStore.setSidebarCollapsed(generalForm.sidebarCollapsed)
  uiStore.setRefreshInterval(generalForm.refreshInterval)

  ElMessage.success(t('settings.generalSettingsSaved'))
}

const resetGeneralSettings = () => {
  generalForm.language = uiStore.language
  generalForm.theme = uiStore.theme
  generalForm.sidebarCollapsed = uiStore.sidebarCollapsed
  generalForm.autoRefresh = uiStore.autoRefreshEnabled
  generalForm.refreshInterval = uiStore.refreshInterval
}

const testApiConnection = async () => {
  try {
    // 这里应该调用API测试连接
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(t('settings.apiConnectionSuccessful'))
  } catch (error) {
    ElMessage.error(t('settings.apiConnectionFailed'))
  }
}

const saveApiSettings = () => {
  // 保存到localStorage
  localStorage.setItem('apiSettings', JSON.stringify(apiForm))
  ElMessage.success(t('settings.apiSettingsSaved'))
}

const resetApiSettings = () => {
  apiForm.openaiApiKey = ''
  apiForm.anthropicApiKey = ''
  apiForm.apiBaseUrl = 'https://api.openclaw.ai'
  apiForm.apiTimeout = 30000
  apiForm.maxRetries = 3
}

const saveNotificationSettings = () => {
  // 保存到UI store和localStorage
  uiStore.toggleNotifications()
  localStorage.setItem('notificationSettings', JSON.stringify(notificationForm))
  ElMessage.success(t('settings.notificationSettingsSaved'))
}

const resetNotificationSettings = () => {
  notificationForm.enabled = uiStore.notificationsEnabled
  notificationForm.agentStatusChanges = true
  notificationForm.systemAlerts = true
  notificationForm.routingEvents = false
  notificationForm.errorReports = true
  notificationForm.inApp = true
  notificationForm.email = false
  notificationForm.emailAddress = ''
  notificationForm.webhook = false
  notificationForm.webhookUrl = ''
}

const createBackup = async () => {
  backupLoading.value = true
  try {
    // 模拟备份过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    const timestamp = new Date().toISOString()
    lastBackupTime.value = timestamp
    localStorage.setItem('lastBackupTime', timestamp)

    // 创建备份数据
    const backupData = {
      timestamp,
      version: '1.0.0',
      data: {
        agents: [], // 这里应该是实际的代理数据
        routes: [], // 路由数据
        settings: {
          ui: {
            language: uiStore.language,
            theme: uiStore.theme
          },
          api: apiForm,
          notifications: notificationForm
        }
      }
    }

    // 创建下载链接
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `openclaw-backup-${timestamp.split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success(t('settings.backupCreated'))
  } catch (error) {
    ElMessage.error(t('settings.backupFailed'))
  } finally {
    backupLoading.value = false
  }
}

const scheduleBackup = () => {
  ElMessageBox.prompt(t('settings.scheduleBackupPrompt'), t('settings.scheduleBackup'), {
    confirmButtonText: t('common.save'),
    cancelButtonText: t('common.cancel'),
    inputPattern: /^[0-9]+$/,
    inputErrorMessage: t('settings.enterValidNumber')
  }).then(({ value }) => {
    const hours = parseInt(value, 10)
    localStorage.setItem('backupScheduleHours', hours.toString())
    ElMessage.success(t('settings.backupScheduled', { hours }))
  })
}

const beforeRestoreUpload = (file: File) => {
  const isJSON = file.type === 'application/json'
  if (!isJSON) {
    ElMessage.error(t('settings.onlyJsonFiles'))
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error(t('settings.fileTooLarge'))
    return false
  }

  return true
}

const handleRestoreSuccess = (response: any) => {
  if (response.success) {
    ElMessage.success(t('settings.restoreSuccessful'))
    // 重新加载设置
    loadSettings()
  } else {
    ElMessage.error(t('settings.restoreFailed'))
  }
}

const handleRestoreError = () => {
  ElMessage.error(t('settings.restoreFailed'))
}

const showRestoreHistory = () => {
  ElMessage.info(t('settings.featureComingSoon'))
}

const exportAgentsConfig = () => {
  ElMessage.info(t('settings.featureComingSoon'))
}

const exportRoutingConfig = () => {
  ElMessage.info(t('settings.featureComingSoon'))
}

const exportAllConfig = () => {
  ElMessage.info(t('settings.featureComingSoon'))
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.settings-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.settings-card {
  margin-top: 20px;
}

.tab-content {
  padding: 20px;
}

.unit-text {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.backup-card,
.restore-card {
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.backup-info,
.restore-info {
  margin-bottom: 20px;
}

.backup-last {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-top: 8px;
}

.restore-warning {
  color: var(--el-color-warning);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 8px;
}

.backup-actions,
.restore-actions {
  display: flex;
  gap: 12px;
}

.restore-upload {
  display: inline-block;
}

.export-options {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>