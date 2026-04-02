<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="page-title">{{ $t('navigation.dashboard') }}</h1>
      <p class="page-subtitle">{{ $t('app.description') }}</p>
    </div>

    <!-- 指标卡片 -->
    <div class="metrics-grid">
      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #3b82f6;">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">12</div>
            <div class="metric-label">Total Agents</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #10b981;">
            <el-icon><Check /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">8</div>
            <div class="metric-label">Active Agents</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #f59e0b;">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">94.5%</div>
            <div class="metric-label">Success Rate</div>
          </div>
        </div>
      </el-card>

      <el-card class="metric-card" shadow="hover">
        <div class="metric-content">
          <div class="metric-icon" style="background-color: #8b5cf6;">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">125ms</div>
            <div class="metric-label">Avg Latency</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="chart-header">
            <h3>Agent Activity</h3>
            <el-select size="small" placeholder="Last 24 hours">
              <el-option label="Last 24 hours" value="24h" />
              <el-option label="Last 7 days" value="7d" />
              <el-option label="Last 30 days" value="30d" />
            </el-select>
          </div>
        </template>
        <div class="chart-placeholder">
          <div class="placeholder-text">Agent Activity Chart</div>
          <div class="placeholder-bar" v-for="i in 8" :key="i" :style="{ height: `${20 + Math.random() * 60}%` }"></div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover">
        <template #header>
          <div class="chart-header">
            <h3>Message Volume</h3>
            <el-select size="small" placeholder="By Channel">
              <el-option label="By Channel" value="channel" />
              <el-option label="By Agent" value="agent" />
            </el-select>
          </div>
        </template>
        <div class="chart-placeholder">
          <div class="placeholder-text">Message Volume Chart</div>
          <div class="placeholder-circle"></div>
        </div>
      </el-card>
    </div>

    <!-- 最近活动 -->
    <el-card class="recent-activity" shadow="hover">
      <template #header>
        <div class="activity-header">
          <h3>Recent Activity</h3>
          <el-button type="primary" size="small" text>View All</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.type"
          :color="activity.color"
        >
          <div class="activity-item">
            <div class="activity-content">
              <strong>{{ activity.agent }}</strong> {{ activity.action }}
              <span v-if="activity.channel">via {{ activity.channel }}</span>
            </div>
            <el-tag :type="activity.status" size="small">{{ activity.status }}</el-tag>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  User,
  Check,
  TrendCharts,
  Clock
} from '@element-plus/icons-vue'

const recentActivities = ref([
  {
    agent: 'Agent-001',
    action: 'processed a message',
    channel: 'WhatsApp',
    timestamp: '2 minutes ago',
    type: 'primary',
    color: '#3b82f6',
    status: 'success'
  },
  {
    agent: 'Agent-002',
    action: 'started a new session',
    channel: 'Telegram',
    timestamp: '15 minutes ago',
    type: 'success',
    color: '#10b981',
    status: 'success'
  },
  {
    agent: 'Agent-003',
    action: 'encountered an error',
    channel: 'Discord',
    timestamp: '1 hour ago',
    type: 'danger',
    color: '#ef4444',
    status: 'error'
  },
  {
    agent: 'Agent-004',
    action: 'completed a task',
    channel: 'Slack',
    timestamp: '2 hours ago',
    type: 'warning',
    color: '#f59e0b',
    status: 'completed'
  },
  {
    agent: 'Agent-005',
    action: 'received configuration update',
    timestamp: '3 hours ago',
    type: 'info',
    color: '#8b5cf6',
    status: 'updated'
  }
])
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.metrics-grid {
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
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 8px;
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

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border-radius: 4px;
}

.placeholder-text {
  font-size: 16px;
  color: #9ca3af;
  margin-bottom: 20px;
}

.placeholder-bar {
  width: 40px;
  background-color: #3b82f6;
  margin: 0 4px;
  border-radius: 2px;
  display: inline-block;
}

.placeholder-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(#3b82f6 0% 30%, #10b981 30% 60%, #f59e0b 60% 90%, #8b5cf6 90% 100%);
}

.recent-activity {
  border-radius: 8px;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.activity-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.activity-content {
  flex: 1;
}

[data-theme="dark"] .page-title,
[data-theme="dark"] .metric-value {
  color: #f3f4f6;
}

[data-theme="dark"] .page-subtitle,
[data-theme="dark"] .metric-label {
  color: #d1d5db;
}

[data-theme="dark"] .chart-placeholder {
  background-color: #374151;
}

[data-theme="dark"] .placeholder-text {
  color: #9ca3af;
}
</style>