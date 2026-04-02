<template>
  <div class="analytics">
    <div class="page-header">
      <h1 class="page-title">{{ $t('navigation.analytics') }}</h1>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          size="small"
        />
        <el-select v-model="selectedMetric" placeholder="Select metric" size="small">
          <el-option label="Message Volume" value="messages" />
          <el-option label="Response Time" value="responseTime" />
          <el-option label="Success Rate" value="successRate" />
          <el-option label="Agent Usage" value="agentUsage" />
        </el-select>
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          Export
        </el-button>
      </div>
    </div>

    <!-- 概览指标 -->
    <div class="overview-metrics">
      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #3b82f6;">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">12,847</div>
            <div class="metric-label">Total Messages</div>
            <div class="metric-trend trend-up">
              <el-icon><Top /></el-icon>
              <span>12% from last period</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #10b981;">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">235ms</div>
            <div class="metric-label">Avg Response Time</div>
            <div class="metric-trend trend-down">
              <el-icon><Bottom /></el-icon>
              <span>8% from last period</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #f59e0b;">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">96.2%</div>
            <div class="metric-label">Success Rate</div>
            <div class="metric-trend trend-up">
              <el-icon><Top /></el-icon>
              <span>2% from last period</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #8b5cf6;">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">84%</div>
            <div class="metric-label">Agent Utilization</div>
            <div class="metric-trend trend-neutral">
              <el-icon><Right /></el-icon>
              <span>No change</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <el-card class="chart-card large" shadow="hover">
        <template #header>
          <div class="chart-header">
            <h3>Message Volume Over Time</h3>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #3b82f6;"></div>
                <span>WhatsApp</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #10b981;"></div>
                <span>Telegram</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #8b5cf6;"></div>
                <span>Discord</span>
              </div>
            </div>
          </div>
        </template>
        <div class="chart-placeholder">
          <div class="placeholder-text">Time Series Chart</div>
          <div class="placeholder-bars">
            <div v-for="i in 24" :key="i" class="placeholder-bar-group">
              <div
                class="placeholder-bar"
                :style="{
                  height: `${20 + Math.random() * 50}%`,
                  backgroundColor: '#3b82f6'
                }"
              ></div>
              <div
                class="placeholder-bar"
                :style="{
                  height: `${15 + Math.random() * 40}%`,
                  backgroundColor: '#10b981'
                }"
              ></div>
              <div
                class="placeholder-bar"
                :style="{
                  height: `${10 + Math.random() * 30}%`,
                  backgroundColor: '#8b5cf6'
                }"
              ></div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3>Top Agents by Message Volume</h3>
        </template>
        <div class="agent-ranking">
          <div
            v-for="(agent, index) in topAgents"
            :key="agent.id"
            class="agent-rank-item"
          >
            <div class="rank-number">{{ index + 1 }}</div>
            <div class="agent-info">
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-stats">
                <span class="agent-messages">{{ agent.messages }} messages</span>
                <span class="agent-success">{{ agent.successRate }}% success</span>
              </div>
            </div>
            <div class="agent-bar">
              <div
                class="bar-fill"
                :style="{ width: `${(agent.messages / maxMessages) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3>Channel Distribution</h3>
        </template>
        <div class="chart-placeholder">
          <div class="placeholder-text">Pie Chart</div>
          <div class="placeholder-pie">
            <div class="pie-segment" style="transform: rotate(0deg); background: conic-gradient(#3b82f6 0% 45%);"></div>
            <div class="pie-segment" style="transform: rotate(162deg); background: conic-gradient(#10b981 0% 25%);"></div>
            <div class="pie-segment" style="transform: rotate(252deg); background: conic-gradient(#8b5cf6 0% 20%);"></div>
            <div class="pie-segment" style="transform: rotate(324deg); background: conic-gradient(#f59e0b 0% 10%);"></div>
            <div class="pie-center"></div>
          </div>
          <div class="pie-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #3b82f6;"></div>
              <span>WhatsApp (45%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #10b981;"></div>
              <span>Telegram (25%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #8b5cf6;"></div>
              <span>Discord (20%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #f59e0b;"></div>
              <span>Slack (10%)</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <h3>Response Time Trends</h3>
        </template>
        <div class="chart-placeholder">
          <div class="placeholder-text">Line Chart</div>
          <div class="placeholder-line-chart">
            <div class="line-path"></div>
            <div class="data-point" v-for="i in 12" :key="i" :style="{ left: `${(i / 13) * 100}%`, bottom: `${20 + Math.random() * 60}%` }"></div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 详细数据表 -->
    <el-card class="data-table-card" shadow="hover">
      <template #header>
        <div class="table-header">
          <h3>Detailed Performance Data</h3>
          <el-button size="small" @click="toggleTableExpand">
            {{ tableExpanded ? 'Collapse' : 'Expand' }}
          </el-button>
        </div>
      </template>
      <el-table
        :data="performanceData"
        style="width: 100%"
        :max-height="tableExpanded ? null : 300"
      >
        <el-table-column prop="date" label="Date" width="120" />
        <el-table-column prop="agent" label="Agent" width="150" />
        <el-table-column prop="channel" label="Channel" width="120" />
        <el-table-column prop="totalMessages" label="Messages" width="100" align="center" />
        <el-table-column prop="successful" label="Successful" width="100" align="center" />
        <el-table-column prop="failed" label="Failed" width="100" align="center" />
        <el-table-column prop="successRate" label="Success Rate" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.successRate"
              :color="row.successRate > 90 ? '#10b981' : row.successRate > 80 ? '#f59e0b' : '#ef4444'"
              :show-text="false"
            />
            <span class="percentage-text">{{ row.successRate }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="avgResponseTime" label="Avg Response" width="120" align="center">
          <template #default="{ row }">
            <div :class="{'fast-response': row.avgResponseTime < 300, 'slow-response': row.avgResponseTime > 500}">
              {{ row.avgResponseTime }}ms
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="peakHour" label="Peak Hour" width="120" align="center" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Download,
  ChatDotRound,
  Timer,
  SuccessFilled,
  User,
  Top,
  Bottom,
  Right
} from '@element-plus/icons-vue'

const dateRange = ref([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()])
const selectedMetric = ref('messages')
const tableExpanded = ref(false)

// 顶部代理数据
const topAgents = ref([
  { id: 1, name: 'Personal Assistant', messages: 3421, successRate: 97.5 },
  { id: 2, name: 'Work Agent', messages: 2876, successRate: 95.8 },
  { id: 3, name: 'Support Bot', messages: 2154, successRate: 92.3 },
  { id: 4, name: 'News Aggregator', messages: 1892, successRate: 88.7 },
  { id: 5, name: 'Social Media Manager', messages: 1504, successRate: 94.2 }
])

const maxMessages = computed(() => {
  return Math.max(...topAgents.value.map(a => a.messages))
})

// 性能数据
const performanceData = ref([
  { date: '2024-03-01', agent: 'Personal Assistant', channel: 'WhatsApp', totalMessages: 456, successful: 445, failed: 11, successRate: 97.6, avgResponseTime: 218, peakHour: '14:00' },
  { date: '2024-03-01', agent: 'Work Agent', channel: 'Slack', totalMessages: 389, successful: 378, failed: 11, successRate: 97.2, avgResponseTime: 312, peakHour: '10:00' },
  { date: '2024-03-01', agent: 'Support Bot', channel: 'Discord', totalMessages: 521, successful: 498, failed: 23, successRate: 95.6, avgResponseTime: 287, peakHour: '16:00' },
  { date: '2024-03-02', agent: 'Personal Assistant', channel: 'WhatsApp', totalMessages: 432, successful: 425, failed: 7, successRate: 98.4, avgResponseTime: 205, peakHour: '15:00' },
  { date: '2024-03-02', agent: 'Work Agent', channel: 'Slack', totalMessages: 412, successful: 400, failed: 12, successRate: 97.1, avgResponseTime: 298, peakHour: '11:00' },
  { date: '2024-03-02', agent: 'Support Bot', channel: 'Discord', totalMessages: 487, successful: 468, failed: 19, successRate: 96.1, avgResponseTime: 275, peakHour: '17:00' },
  { date: '2024-03-03', agent: 'Personal Assistant', channel: 'WhatsApp', totalMessages: 398, successful: 390, failed: 8, successRate: 98.0, avgResponseTime: 212, peakHour: '14:30' }
])

const exportData = () => {
  console.log('Exporting analytics data')
}

const toggleTableExpand = () => {
  tableExpanded.value = !tableExpanded.value
}
</script>

<style scoped>
.analytics {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.overview-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  border-radius: 8px;
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.metric-info {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-neutral {
  color: #6b7280;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 8px;
}

.chart-card.large {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.chart-legend {
  display: flex;
  gap: 15px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-placeholder {
  height: 300px;
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

.placeholder-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 90%;
  height: 70%;
  gap: 2px;
}

.placeholder-bar-group {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 100%;
}

.placeholder-bar {
  width: 8px;
  border-radius: 2px 2px 0 0;
}

.agent-ranking {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.agent-rank-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 6px;
  background-color: #f9fafb;
}

.rank-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.agent-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #6b7280;
}

.agent-bar {
  flex: 1;
  max-width: 200px;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 4px;
}

.placeholder-pie {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%);
}

.pie-center {
  position: absolute;
  width: 60px;
  height: 60px;
  background-color: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.placeholder-line-chart {
  position: relative;
  width: 90%;
  height: 70%;
  border-left: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.line-path {
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #3b82f6;
  bottom: 30%;
  border-radius: 1px;
}

.data-point {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
  transform: translate(-50%, 50%);
}

.data-table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.percentage-text {
  margin-left: 10px;
  font-size: 12px;
  color: #6b7280;
}

.fast-response {
  color: #10b981;
  font-weight: 500;
}

.slow-response {
  color: #ef4444;
  font-weight: 500;
}

[data-theme="dark"] .page-title,
[data-theme="dark"] .metric-value,
[data-theme="dark"] .agent-name {
  color: #f3f4f6;
}

[data-theme="dark"] .metric-label,
[data-theme="dark"] .agent-stats,
[data-theme="dark"] .percentage-text {
  color: #d1d5db;
}

[data-theme="dark"] .chart-placeholder {
  background-color: #374151;
}

[data-theme="dark"] .placeholder-text {
  color: #9ca3af;
}

[data-theme="dark"] .agent-rank-item {
  background-color: #374151;
}

[data-theme="dark"] .agent-bar {
  background-color: #4b5563;
}

[data-theme="dark"] .placeholder-line-chart {
  border-color: #4b5563;
}

[data-theme="dark"] .pie-center {
  background-color: #1f2937;
}
</style>