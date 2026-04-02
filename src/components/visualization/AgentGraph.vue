<template>
  <div class="agent-graph">
    <div ref="graphContainer" class="graph-container"></div>
    <div class="graph-controls">
      <el-button-group size="small">
        <el-button @click="fitGraph">
          <el-icon><FullScreen /></el-icon>
          Fit
        </el-button>
        <el-button @click="resetGraph">
          <el-icon><Refresh /></el-icon>
          Reset
        </el-button>
        <el-button @click="toggleLabels">
          <el-icon><View /></el-icon>
          {{ showLabels ? 'Hide Labels' : 'Show Labels' }}
        </el-button>
        <el-button @click="toggleAnimations">
          <el-icon><VideoPlay /></el-icon>
          {{ animationsEnabled ? 'Stop Animations' : 'Start Animations' }}
        </el-button>
      </el-button-group>
      <div class="layout-selector">
        <el-select v-model="layoutType" size="small" @change="applyLayout">
          <el-option label="Force-Directed" value="cose" />
          <el-option label="Circular" value="circle" />
          <el-option label="Grid" value="grid" />
          <el-option label="Breadthfirst" value="breadthfirst" />
        </el-select>
      </div>
    </div>
    <div class="graph-legend">
      <div class="legend-item">
        <div class="legend-color agent-color"></div>
        <span>Agent</span>
      </div>
      <div class="legend-item">
        <div class="legend-color channel-color"></div>
        <span>Channel</span>
      </div>
      <div class="legend-item">
        <div class="legend-color binding-color"></div>
        <span>Binding</span>
      </div>
      <div class="legend-item">
        <div class="legend-color active-color"></div>
        <span>Active</span>
      </div>
      <div class="legend-item">
        <div class="legend-color inactive-color"></div>
        <span>Inactive</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, defineExpose } from 'vue'
import cytoscape, { Core, ElementDefinition } from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import { FullScreen, Refresh, View, VideoPlay } from '@element-plus/icons-vue'
import { useAgentStore } from '@/stores/agent.store'
import { useRoutingStore } from '@/stores/routing.store'

// 注册布局插件
cytoscape.use(coseBilkent)

const props = defineProps<{
  height?: string
}>()

const emit = defineEmits<{
  'node-click': [nodeId: string, nodeType: string]
  'edge-click': [edgeId: string, source: string, target: string]
}>()

const graphContainer = ref<HTMLElement>()
const cy = ref<Core | null>(null)
const showLabels = ref(true)
const animationsEnabled = ref(true)
const layoutType = ref('cose')

const agentStore = useAgentStore()
const routingStore = useRoutingStore()

// 计算图形元素
const graphElements = computed<ElementDefinition[]>(() => {
  const elements: ElementDefinition[] = []

  // 添加代理节点
  agentStore.agents.forEach(agent => {
    elements.push({
      data: {
        id: `agent-${agent.id}`,
        label: agent.name,
        type: 'agent',
        status: agent.status,
        agentId: agent.id
      },
      classes: `agent ${agent.status}`,
      position: { x: Math.random() * 400, y: Math.random() * 300 }
    })
  })

  // 添加通道节点
  const channels = ['whatsapp', 'telegram', 'discord', 'slack']
  channels.forEach((channel, index) => {
    elements.push({
      data: {
        id: `channel-${channel}`,
        label: channel.charAt(0).toUpperCase() + channel.slice(1),
        type: 'channel',
        channel
      },
      classes: 'channel',
      position: { x: 100 + index * 200, y: 50 }
    })
  })

  // 添加绑定边
  routingStore.bindings.forEach((binding, index) => {
    if (binding.enabled && binding.agentId && binding.channel) {
      elements.push({
        data: {
          id: `binding-${index}`,
          source: `channel-${binding.channel}`,
          target: `agent-${binding.agentId}`,
          label: `Binding ${index + 1}`,
          binding,
          weight: binding.priority || 1
        },
        classes: 'binding'
      })
    }
  })

  return elements
})

// 初始化图形
const initGraph = () => {
  if (!graphContainer.value) return

  cy.value = cytoscape({
    container: graphContainer.value,
    elements: graphElements.value,
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#3b82f6',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '14px',
          'font-weight': '600',
          'color': '#ffffff',
          'width': '80px',
          'height': '80px',
          'border-width': '3px',
          'border-color': '#1d4ed8',
          'text-outline-width': '2px',
          'text-outline-color': '#1e40af'
        }
      },
      {
        selector: 'node.agent',
        style: {
          'background-color': '#10b981',
          'border-color': '#059669',
          'shape': 'ellipse'
        }
      },
      {
        selector: 'node.channel',
        style: {
          'background-color': '#8b5cf6',
          'border-color': '#7c3aed',
          'shape': 'rectangle'
        }
      },
      {
        selector: 'node.active',
        style: {
          'background-color': '#10b981',
          'border-color': '#059669'
        }
      },
      {
        selector: 'node.inactive',
        style: {
          'background-color': '#6b7280',
          'border-color': '#4b5563'
        }
      },
      {
        selector: 'node.error',
        style: {
          'background-color': '#ef4444',
          'border-color': '#dc2626'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#9ca3af',
          'target-arrow-color': '#9ca3af',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '12px',
          'text-background-color': '#ffffff',
          'text-background-opacity': 0.8,
          'text-background-padding': '3px'
        }
      },
      {
        selector: 'edge.binding',
        style: {
          'line-color': '#f59e0b',
          'target-arrow-color': '#f59e0b',
          'line-style': 'dashed'
        }
      },
      {
        selector: 'edge.message',
        style: {
          'line-color': '#3b82f6',
          'target-arrow-color': '#3b82f6',
          'line-style': 'solid',
          'width': 4
        }
      }
    ],
    layout: {
      name: layoutType.value,
      animate: animationsEnabled.value,
      animationDuration: 1000,
      fit: true,
      padding: 30
    }
  })

  // 添加事件监听器
  cy.value.on('tap', 'node', (event) => {
    const node = event.target
    emit('node-click', node.data('id'), node.data('type'))
  })

  cy.value.on('tap', 'edge', (event) => {
    const edge = event.target
    emit('edge-click', edge.data('id'), edge.data('source'), edge.data('target'))
  })

  cy.value.on('mouseover', 'node', (event) => {
    event.target.addClass('hovered')
  })

  cy.value.on('mouseout', 'node', (event) => {
    event.target.removeClass('hovered')
  })
}

const fitGraph = () => {
  if (cy.value) {
    cy.value.fit()
  }
}

const resetGraph = () => {
  if (cy.value) {
    cy.value.destroy()
    initGraph()
  }
}

const toggleLabels = () => {
  showLabels.value = !showLabels.value
  if (cy.value) {
    cy.value.style()
      .selector('node')
      .style('label', showLabels.value ? 'data(label)' : '')
      .update()
  }
}

const toggleAnimations = () => {
  animationsEnabled.value = !animationsEnabled.value
  applyLayout()
}

const applyLayout = () => {
  if (cy.value) {
    cy.value.layout({
      name: layoutType.value,
      animate: animationsEnabled.value,
      animationDuration: 1000,
      fit: true,
      padding: 30
    }).run()
  }
}

// 模拟实时消息流
const simulateMessageFlow = () => {
  if (!cy.value) return

  const agents = cy.value.nodes('.agent')
  const channels = cy.value.nodes('.channel')

  if (agents.length > 0 && channels.length > 0) {
    const randomChannel = channels[Math.floor(Math.random() * channels.length)]
    const randomAgent = agents[Math.floor(Math.random() * agents.length)]

    const messageEdge = cy.value.add({
      group: 'edges',
      data: {
        id: `message-${Date.now()}`,
        source: randomChannel.id(),
        target: randomAgent.id(),
        label: 'Message',
        type: 'message'
      },
      classes: 'message'
    })

    // 动画效果
    messageEdge.animate({
      style: {
        'line-color': '#3b82f6',
        'width': 6
      }
    }, {
      duration: 500,
      complete: () => {
        setTimeout(() => {
          messageEdge.remove()
        }, 2000)
      }
    })
  }
}

// 定期模拟消息流
let messageInterval: number | null = null

const startMessageSimulation = () => {
  if (messageInterval) clearInterval(messageInterval)
  messageInterval = setInterval(simulateMessageFlow, 3000)
}

const stopMessageSimulation = () => {
  if (messageInterval) {
    clearInterval(messageInterval)
    messageInterval = null
  }
}

onMounted(() => {
  initGraph()
  if (animationsEnabled.value) {
    startMessageSimulation()
  }
})

onUnmounted(() => {
  stopMessageSimulation()
  if (cy.value) {
    cy.value.destroy()
  }
})

watch(animationsEnabled, (newVal) => {
  if (newVal) {
    startMessageSimulation()
  } else {
    stopMessageSimulation()
  }
})

// 监听数据变化，更新图形
watch(() => agentStore.agents, () => {
  if (cy.value) {
    // 更新图形元素逻辑
    // 简化：重新初始化图形
    resetGraph()
  }
}, { deep: true })

watch(() => routingStore.bindings, () => {
  if (cy.value) {
    resetGraph()
  }
}, { deep: true })

// 暴露方法给父组件
defineExpose({
  resetGraph,
  fitGraph,
  applyLayout
})
</script>

<style scoped>
.agent-graph {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.graph-container {
  flex: 1;
  min-height: 500px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background-color: #f9fafb;
}

.graph-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f3f4f6;
  border-radius: 6px;
}

.graph-controls .el-button-group {
  display: flex;
  gap: 5px;
}

.layout-selector {
  width: 180px;
}

.graph-legend {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #f3f4f6;
  border-radius: 6px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.agent-color {
  background-color: #10b981;
  border: 2px solid #059669;
}

.legend-color.channel-color {
  background-color: #8b5cf6;
  border: 2px solid #7c3aed;
}

.legend-color.binding-color {
  background-color: #f59e0b;
  border: 2px solid #d97706;
  height: 3px;
  width: 20px;
  border-radius: 0;
}

.legend-color.active-color {
  background-color: #10b981;
  border: 2px solid #059669;
}

.legend-color.inactive-color {
  background-color: #6b7280;
  border: 2px solid #4b5563;
}

[data-theme="dark"] .graph-container {
  border-color: #374151;
  background-color: #111827;
}

[data-theme="dark"] .graph-controls,
[data-theme="dark"] .graph-legend {
  background-color: #1f2937;
}

[data-theme="dark"] .legend-item {
  color: #d1d5db;
}
</style>