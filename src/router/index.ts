import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 布局组件
import AppLayout from '@/layouts/AppLayout.vue'

// 视图组件（暂时创建占位符）
const DashboardView = () => import('@/views/Dashboard.vue')
const AgentsView = () => import('@/views/Agents.vue')
const RoutingView = () => import('@/views/Routing.vue')
const AnalyticsView = () => import('@/views/Analytics.vue')
const SettingsView = () => import('@/views/Settings.vue')

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
        meta: { title: 'dashboard.title' }
      },
      {
        path: '/agents',
        name: 'Agents',
        component: AgentsView,
        meta: { title: 'agents.title' }
      },
      {
        path: '/agents/:id',
        name: 'AgentDetail',
        component: () => import('@/views/AgentDetail.vue'),
        meta: { title: 'agents.detail' }
      },
      {
        path: '/routing',
        name: 'Routing',
        component: RoutingView,
        meta: { title: 'routing.title' }
      },
      {
        path: '/analytics',
        name: 'Analytics',
        component: AnalyticsView,
        meta: { title: 'analytics.title' }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
        meta: { title: 'settings.title' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  // 可以在这里添加权限检查等逻辑
  next()
})

export default router