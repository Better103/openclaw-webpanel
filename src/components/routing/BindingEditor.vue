<template>
  <el-dialog
    :title="isEditMode ? 'Edit Binding Rule' : 'Create New Binding Rule'"
    v-model="visible"
    width="700px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
      size="default"
    >
      <!-- 优先级 -->
      <el-form-item label="Priority" prop="priority">
        <el-input-number
          v-model="formData.priority"
          :min="1"
          :max="100"
          controls-position="right"
          placeholder="Lower number = higher priority"
        />
        <div class="form-help">
          Lower priority numbers are evaluated first (1 = highest priority)
        </div>
      </el-form-item>

      <!-- 通道选择 -->
      <el-form-item label="Channel" prop="channel">
        <el-select
          v-model="formData.channel"
          placeholder="Select channel"
          style="width: 100%"
          @change="handleChannelChange"
        >
          <el-option label="WhatsApp" value="whatsapp" />
          <el-option label="Telegram" value="telegram" />
          <el-option label="Discord" value="discord" />
          <el-option label="Slack" value="slack" />
          <el-option label="All Channels (*)" value="*" />
        </el-select>
      </el-form-item>

      <!-- 账户ID -->
      <el-form-item label="Account ID" prop="accountId">
        <el-input
          v-model="formData.accountId"
          placeholder="e.g., personal, biz, work"
          :maxlength="50"
        >
          <template #append>
            <el-button @click="setWildcard('accountId')">Set as *</el-button>
          </template>
        </el-input>
        <div class="form-help">
          Specific account ID or * for any account
        </div>
      </el-form-item>

      <!-- 对等类型 -->
      <el-form-item label="Peer Type" prop="peerType">
        <el-select
          v-model="formData.peerType"
          placeholder="Select peer type"
          style="width: 100%"
        >
          <el-option label="Direct Message (DM)" value="dm" />
          <el-option label="Group Chat" value="group" />
          <el-option label="Channel" value="channel" />
          <el-option label="Any Peer Type (*)" value="*" />
        </el-select>
        <div class="form-help">
          Type of conversation: DM, group, or channel
        </div>
      </el-form-item>

      <!-- 对等ID -->
      <el-form-item label="Peer ID" prop="peerId">
        <el-input
          v-model="formData.peerId"
          placeholder="e.g., +15551234567, group-id-123"
          :maxlength="100"
        >
          <template #append>
            <el-button @click="setWildcard('peerId')">Set as *</el-button>
          </template>
        </el-input>
        <div class="form-help">
          Specific peer ID (phone number, group ID) or * for any peer
        </div>
      </el-form-item>

      <!-- 目标代理 -->
      <el-form-item label="Target Agent" prop="agentId">
        <el-select
          v-model="formData.agentId"
          placeholder="Select target agent"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="agent in availableAgents"
            :key="agent.id"
            :label="agent.name"
            :value="agent.id"
          />
        </el-select>
        <div class="form-help">
          Agent that will receive messages matching this binding
        </div>
      </el-form-item>

      <!-- 描述 -->
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="Describe what this binding rule is for"
          :maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <!-- 启用状态 -->
      <el-form-item label="Status" prop="enabled">
        <el-switch
          v-model="formData.enabled"
          active-text="Enabled"
          inactive-text="Disabled"
        />
      </el-form-item>

      <!-- 绑定预览 -->
      <el-form-item label="Binding Preview">
        <div class="binding-preview">
          <div class="preview-header">Rule Preview:</div>
          <div class="preview-content">
            <code>
              {{ generateBindingPreview() }}
            </code>
          </div>
          <div class="preview-explanation">
            <div v-if="formData.channel && formData.agentId">
              <strong>Interpretation:</strong>
              Messages from
              <strong>{{ formatChannel(formData.channel) }}</strong>
              <span v-if="formData.accountId && formData.accountId !== '*'">
                (account: <strong>{{ formData.accountId }}</strong>)
              </span>
              <span v-if="formData.peerType && formData.peerType !== '*'">
                in <strong>{{ formatPeerType(formData.peerType) }}</strong>
              </span>
              <span v-if="formData.peerId && formData.peerId !== '*'">
                with ID <strong>{{ formData.peerId }}</strong>
              </span>
              will be routed to agent <strong>{{ getAgentName(formData.agentId) }}</strong>
            </div>
            <div v-else>
              Complete the form to see binding interpretation
            </div>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          {{ isEditMode ? 'Update Binding' : 'Create Binding' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAgentStore } from '@/stores/agent.store'
import type { BindingRule } from '@/types/routing'

interface Props {
  modelValue: boolean
  bindingData?: BindingRule | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: BindingRule): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const agentStore = useAgentStore()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditMode = computed(() => !!props.bindingData)

// 表单数据
const formData = reactive({
  priority: 1,
  channel: '',
  accountId: '',
  peerType: '',
  peerId: '',
  agentId: '',
  description: '',
  enabled: true
})

// 表单验证规则
const formRules: FormRules = {
  priority: [
    { required: true, message: 'Priority is required', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: 'Priority must be between 1 and 100', trigger: 'blur' }
  ],
  channel: [
    { required: true, message: 'Channel is required', trigger: 'change' }
  ],
  accountId: [
    { required: false, message: 'Account ID is optional', trigger: 'blur' }
  ],
  peerType: [
    { required: false, message: 'Peer type is optional', trigger: 'change' }
  ],
  peerId: [
    { required: false, message: 'Peer ID is optional', trigger: 'blur' }
  ],
  agentId: [
    { required: true, message: 'Target agent is required', trigger: 'change' }
  ],
  description: [
    { required: false, max: 200, message: 'Description cannot exceed 200 characters', trigger: 'blur' }
  ]
}

// 可用代理列表
const availableAgents = computed(() => {
  return agentStore.agents.map(agent => ({
    id: agent.id,
    name: agent.name
  }))
})

// 设置通配符
const setWildcard = (field: keyof typeof formData) => {
  formData[field] = '*'
}

// 处理通道变更
const handleChannelChange = (value: string) => {
  // 可以根据通道设置默认值
  if (value === 'whatsapp') {
    if (!formData.accountId) formData.accountId = 'personal'
    if (!formData.peerType) formData.peerType = 'dm'
  } else if (value === 'discord') {
    if (!formData.peerType) formData.peerType = 'channel'
  }
}

// 生成绑定预览
const generateBindingPreview = () => {
  const parts = []
  if (formData.channel) parts.push(`channel: ${formData.channel}`)
  if (formData.accountId) parts.push(`account: ${formData.accountId}`)
  if (formData.peerType) parts.push(`peerType: ${formData.peerType}`)
  if (formData.peerId) parts.push(`peerId: ${formData.peerId}`)
  if (formData.agentId) parts.push(`→ agent: ${formData.agentId}`)

  return parts.join(' | ')
}

// 格式化通道显示
const formatChannel = (channel: string) => {
  const channelMap: Record<string, string> = {
    'whatsapp': 'WhatsApp',
    'telegram': 'Telegram',
    'discord': 'Discord',
    'slack': 'Slack',
    '*': 'Any Channel'
  }
  return channelMap[channel] || channel
}

// 格式化对等类型
const formatPeerType = (peerType: string) => {
  const peerTypeMap: Record<string, string> = {
    'dm': 'Direct Message',
    'group': 'Group Chat',
    'channel': 'Channel',
    '*': 'Any Type'
  }
  return peerTypeMap[peerType] || peerType
}

// 获取代理名称
const getAgentName = (agentId: string) => {
  const agent = agentStore.agents.find(a => a.id === agentId)
  return agent ? agent.name : agentId
}

// 处理关闭
const handleClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  visible.value = false
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    // 准备提交数据
    const bindingData: BindingRule = {
      id: isEditMode.value && props.bindingData ? props.bindingData.id : `binding-${Date.now()}`,
      priority: formData.priority,
      channel: formData.channel,
      accountId: formData.accountId || '*',
      peerType: formData.peerType || '*',
      peerId: formData.peerId || '*',
      agentId: formData.agentId,
      description: formData.description,
      enabled: formData.enabled,
      createdAt: isEditMode.value && props.bindingData ? props.bindingData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 提交到父组件
    emit('submit', bindingData)

    // 成功消息
    ElMessage.success(isEditMode.value ? 'Binding updated successfully' : 'Binding created successfully')

    // 关闭对话框
    handleClose()
  } catch (error) {
    console.error('Form validation failed:', error)
    ElMessage.error('Please check the form for errors')
  } finally {
    submitting.value = false
  }
}

// 监听props变化，当编辑时填充表单
watch(() => props.bindingData, (newBinding) => {
  if (newBinding) {
    Object.assign(formData, {
      priority: newBinding.priority,
      channel: newBinding.channel,
      accountId: newBinding.accountId,
      peerType: newBinding.peerType,
      peerId: newBinding.peerId,
      agentId: newBinding.agentId,
      description: newBinding.description,
      enabled: newBinding.enabled
    })
  } else {
    // 重置表单
    Object.assign(formData, {
      priority: 1,
      channel: '',
      accountId: '',
      peerType: '',
      peerId: '',
      agentId: '',
      description: '',
      enabled: true
    })
  }
}, { immediate: true })

// 监听对话框打开/关闭
watch(visible, (newValue) => {
  if (!newValue && formRef.value) {
    // 对话框关闭时重置表单
    formRef.value.resetFields()
  }
})
</script>

<style scoped>
.form-help {
  font-size: 12px;
  color: #6b7280;
  margin-top: 5px;
}

.binding-preview {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 15px;
  border: 1px solid #e5e7eb;
}

.preview-header {
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  font-size: 14px;
}

.preview-content {
  background-color: #1f2937;
  color: #f3f4f6;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  overflow-x: auto;
  margin-bottom: 15px;
}

.preview-content code {
  white-space: pre-wrap;
  word-break: break-all;
}

.preview-explanation {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
}

.preview-explanation strong {
  color: #1f2937;
  font-weight: 600;
}

[data-theme="dark"] .binding-preview {
  background-color: #1f2937;
  border-color: #374151;
}

[data-theme="dark"] .preview-header {
  color: #d1d5db;
}

[data-theme="dark"] .preview-content {
  background-color: #111827;
  color: #e5e7eb;
}

[data-theme="dark"] .preview-explanation {
  color: #9ca3af;
}

[data-theme="dark"] .preview-explanation strong {
  color: #f3f4f6;
}
</style>