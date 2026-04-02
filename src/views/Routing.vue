<template>
  <div class="routing">
    <div class="page-header">
      <h1 class="page-title">{{ $t('navigation.routing') }}</h1>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateBinding">
          <el-icon><Plus /></el-icon>
          Add Binding
        </el-button>
        <el-button @click="simulateRouting">
          <el-icon><VideoPlay /></el-icon>
          Simulate Routing
        </el-button>
      </div>
    </div>

    <!-- 路由图 -->
    <el-card class="graph-card" shadow="hover">
      <template #header>
        <div class="graph-header">
          <h3>Agent Routing Graph</h3>
          <div class="graph-controls">
            <el-button size="small" @click="resetView">
              <el-icon><Refresh /></el-icon>
              Reset View
            </el-button>
            <el-button size="small" @click="toggleLabels">
              <el-icon><View /></el-icon>
              {{ showLabels ? 'Hide Labels' : 'Show Labels' }}
            </el-button>
            <el-switch
              v-model="autoLayout"
              active-text="Auto Layout"
              size="small"
            />
          </div>
        </div>
      </template>
      <div class="graph-container">
        <div class="graph-placeholder">
          <div class="placeholder-text">Interactive Routing Graph</div>
          <div class="placeholder-graph">
            <!-- 模拟图节点 -->
            <div
              v-for="(node, index) in graphNodes"
              :key="`node-${index}`"
              class="graph-node"
              :style="{
                left: `${node.x}%`,
                top: `${node.y}%`,
                backgroundColor: node.color,
                borderColor: node.borderColor
              }"
              :class="{ 'node-active': node.active }"
            >
              <div class="node-label">{{ node.label }}</div>
              <div class="node-status">{{ node.status }}</div>
            </div>
            <!-- 模拟连接线 -->
            <div
              v-for="(edge, index) in graphEdges"
              :key="`edge-${index}`"
              class="graph-edge"
              :style="{
                left: `${edge.fromX}%`,
                top: `${edge.fromY}%`,
                width: `${edge.width}%`,
                transform: `rotate(${edge.angle}deg)`
              }"
            ></div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 绑定规则 -->
    <div class="bindings-section">
      <div class="section-header">
        <h2>Binding Rules</h2>
        <el-button type="text" @click="showBindingHelp">Help</el-button>
      </div>
      <p class="section-description">
        Binding rules determine how incoming messages are routed to agents based on channel, account, and peer.
      </p>

      <el-table :data="bindings" style="width: 100%" class="bindings-table">
        <el-table-column prop="priority" label="Priority" width="80" sortable />
        <el-table-column prop="channel" label="Channel" width="120" />
        <el-table-column prop="accountId" label="Account ID" width="120" />
        <el-table-column prop="peerType" label="Peer Type" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.peerType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="peerId" label="Peer ID" />
        <el-table-column prop="agentId" label="Agent ID" width="120">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.agentId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="enabled" label="Status" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="toggleBinding(row)" />
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120">
          <template #default="{ row }">
            <el-button-group size="small">
              <el-button @click="editBinding(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" @click="deleteBinding(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 路由测试 -->
    <el-card class="test-card" shadow="hover">
      <template #header>
        <h3>Routing Test</h3>
      </template>
      <div class="test-form">
        <el-form :model="testForm" label-width="120px">
          <el-form-item label="Channel">
            <el-select v-model="testForm.channel" placeholder="Select channel">
              <el-option label="WhatsApp" value="whatsapp" />
              <el-option label="Telegram" value="telegram" />
              <el-option label="Discord" value="discord" />
              <el-option label="Slack" value="slack" />
            </el-select>
          </el-form-item>
          <el-form-item label="Account ID">
            <el-input v-model="testForm.accountId" placeholder="e.g., personal, biz" />
          </el-form-item>
          <el-form-item label="Peer Type">
            <el-select v-model="testForm.peerType" placeholder="Select peer type">
              <el-option label="Direct Message" value="dm" />
              <el-option label="Group" value="group" />
              <el-option label="Channel" value="channel" />
            </el-select>
          </el-form-item>
          <el-form-item label="Peer ID">
            <el-input v-model="testForm.peerId" placeholder="e.g., +15551234567" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="testRouting">Test Routing</el-button>
            <el-button @click="resetTest">Reset</el-button>
          </el-form-item>
        </el-form>

        <div v-if="testResult" class="test-result">
          <h4>Routing Result:</h4>
          <div class="result-card" :class="`result-${testResult.status}`">
            <div class="result-header">
              <el-icon :class="`result-icon-${testResult.status}`">
                <SuccessFilled v-if="testResult.status === 'success'" />
                <WarningFilled v-if="testResult.status === 'warning'" />
                <CircleCloseFilled v-if="testResult.status === 'error'" />
              </el-icon>
              <strong>{{ testResult.message }}</strong>
            </div>
            <div class="result-details">
              <div><strong>Matched Agent:</strong> {{ testResult.agentId }}</div>
              <div><strong>Binding Rule:</strong> {{ testResult.bindingPriority }}</div>
              <div><strong>Routing Path:</strong> {{ testResult.routingPath }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Plus,
  VideoPlay,
  Refresh,
  View,
  Edit,
  Delete,
  SuccessFilled,
  WarningFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'

const showLabels = ref(true)
const autoLayout = ref(true)

// 模拟图数据
const graphNodes = ref([
  { id: 1, label: 'WhatsApp', status: 'personal', x: 20, y: 30, color: '#10b981', borderColor: '#059669', active: true },
  { id: 2, label: 'Telegram', status: 'work', x: 50, y: 20, color: '#3b82f6', borderColor: '#2563eb', active: true },
  { id: 3, label: 'Discord', status: 'support', x: 80, y: 40, color: '#8b5cf6', borderColor: '#7c3aed', active: true },
  { id: 4, label: 'Agent-001', status: 'active', x: 30, y: 60, color: '#f59e0b', borderColor: '#d97706', active: true },
  { id: 5, label: 'Agent-002', status: 'active', x: 60, y: 70, color: '#ef4444', borderColor: '#dc2626', active: true },
  { id: 6, label: 'Agent-003', status: 'inactive', x: 70, y: 50, color: '#6b7280', borderColor: '#4b5563', active: false }
])

const graphEdges = ref([
  { id: 1, fromX: 20, fromY: 30, toX: 30, toY: 60, width: 15, angle: 30 },
  { id: 2, fromX: 50, fromY: 20, toX: 60, toY: 70, width: 18, angle: 45 },
  { id: 3, fromX: 80, fromY: 40, toX: 70, toY: 50, width: 12, angle: -20 }
])

// 绑定规则数据
const bindings = ref([
  { priority: 1, channel: 'whatsapp', accountId: 'personal', peerType: 'dm', peerId: '+15551230001', agentId: 'home', description: 'Personal WhatsApp messages', enabled: true },
  { priority: 2, channel: 'whatsapp', accountId: 'biz', peerType: 'dm', peerId: '+15551230002', agentId: 'work', description: 'Business WhatsApp messages', enabled: true },
  { priority: 3, channel: 'whatsapp', accountId: 'personal', peerType: 'group', peerId: '1203630...@g.us', agentId: 'work', description: 'Work group chat', enabled: true },
  { priority: 4, channel: 'telegram', accountId: '*', peerType: '*', peerId: '*', agentId: 'opus', description: 'All Telegram to Opus', enabled: true },
  { priority: 5, channel: 'discord', accountId: 'support', peerType: 'channel', peerId: 'support-channel', agentId: 'support', description: 'Discord support channel', enabled: false }
])

// 测试表单
const testForm = reactive({
  channel: '',
  accountId: '',
  peerType: '',
  peerId: ''
})

const testResult = ref<any>(null)

const showCreateBinding = () => {
  console.log('Show create binding dialog')
}

const simulateRouting = () => {
  console.log('Simulate routing')
}

const resetView = () => {
  console.log('Reset graph view')
}

const toggleLabels = () => {
  showLabels.value = !showLabels.value
}

const showBindingHelp = () => {
  window.open('https://docs.openclaw.ai/zh-CN/concepts/multi-agent', '_blank')
}

const toggleBinding = (binding: any) => {
  console.log('Toggle binding:', binding)
}

const editBinding = (binding: any) => {
  console.log('Edit binding:', binding)
}

const deleteBinding = (binding: any) => {
  console.log('Delete binding:', binding)
}

const testRouting = () => {
  // 模拟路由测试
  testResult.value = {
    status: 'success',
    message: 'Routing test successful',
    agentId: 'home',
    bindingPriority: 1,
    routingPath: 'whatsapp(personal) → dm(+15551230001) → agent(home)'
  }
}

const resetTest = () => {
  testResult.value = null
  testForm.channel = ''
  testForm.accountId = ''
  testForm.peerType = ''
  testForm.peerId = ''
}
</script>

<style scoped>
.routing {
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

.graph-card {
  margin-bottom: 30px;
  border-radius: 8px;
}

.graph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.graph-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.graph-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.graph-container {
  height: 400px;
}

.graph-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border-radius: 4px;
  position: relative;
}

.placeholder-text {
  font-size: 16px;
  color: #9ca3af;
  margin-bottom: 20px;
  z-index: 1;
}

.placeholder-graph {
  position: relative;
  width: 80%;
  height: 70%;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.graph-node {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  cursor: pointer;
}

.graph-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.graph-node.node-active {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.node-label {
  font-weight: bold;
  font-size: 14px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.node-status {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 4px;
}

.graph-edge {
  position: absolute;
  height: 2px;
  background-color: #6b7280;
  transform-origin: 0 0;
  opacity: 0.6;
}

.bindings-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.section-description {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 14px;
}

.bindings-table {
  border-radius: 4px;
  overflow: hidden;
}

.test-card {
  border-radius: 8px;
}

.test-form {
  max-width: 600px;
}

.test-result {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.test-result h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.result-card {
  padding: 20px;
  border-radius: 6px;
  border: 1px solid;
}

.result-success {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.result-warning {
  background-color: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.result-error {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.result-icon-success {
  color: #10b981;
}

.result-icon-warning {
  color: #f59e0b;
}

.result-icon-error {
  color: #ef4444;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.result-details div {
  display: flex;
  gap: 10px;
}

[data-theme="dark"] .page-title,
[data-theme="dark"] .section-header h2,
[data-theme="dark"] .test-result h4 {
  color: #f3f4f6;
}

[data-theme="dark"] .section-description {
  color: #d1d5db;
}

[data-theme="dark"] .graph-placeholder {
  background-color: #374151;
}

[data-theme="dark"] .placeholder-graph {
  background-color: #1f2937;
  border-color: #374151;
}

[data-theme="dark"] .test-result {
  border-top-color: #374151;
}

[data-theme="dark"] .result-success {
  background-color: #064e3b;
  border-color: #047857;
  color: #a7f3d0;
}

[data-theme="dark"] .result-warning {
  background-color: #78350f;
  border-color: #d97706;
  color: #fde68a;
}

[data-theme="dark"] .result-error {
  background-color: #7f1d1d;
  border-color: #dc2626;
  color: #fecaca;
}
</style>