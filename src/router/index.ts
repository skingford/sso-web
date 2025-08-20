import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

// 布局组件
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

// Dashboard子页面
import Overview from '@/pages/dashboard/Overview.vue'
import Applications from '@/pages/dashboard/Applications.vue'
import Profile from '@/pages/dashboard/Profile.vue'
import Security from '@/pages/dashboard/Security.vue'
import Sessions from '@/pages/dashboard/Sessions.vue'
import UserLogs from '@/pages/dashboard/UserLogs.vue'

// Admin子页面
import AdminOverview from '@/pages/admin/AdminOverview.vue'
import UserManagement from '@/pages/admin/UserManagement.vue'
import ApplicationManagement from '@/pages/admin/ApplicationManagement.vue'
import PermissionManagement from '@/pages/admin/PermissionManagement.vue'
import AuditLogs from '@/pages/admin/AuditLogs.vue'
import SystemSettings from '@/pages/admin/SystemSettings.vue'

// 定义路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/overview'
      },
      {
        path: 'overview',
        name: 'dashboard-overview',
        component: Overview,
        meta: { requiresAuth: true }
      },
      {
        path: 'applications',
        name: 'dashboard-applications',
        component: Applications,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'dashboard-profile',
        component: Profile,
        meta: { requiresAuth: true }
      },
      {
        path: 'security',
        name: 'dashboard-security',
        component: Security,
        meta: { requiresAuth: true }
      },
      {
        path: 'sessions',
        name: 'dashboard-sessions',
        component: Sessions,
        meta: { requiresAuth: true }
      },
      {
        path: 'logs',
        name: 'dashboard-logs',
        component: UserLogs,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/overview'
      },
      {
        path: 'overview',
        name: 'admin-overview',
        component: AdminOverview,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'applications',
        name: 'admin-applications',
        component: ApplicationManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'permissions',
        name: 'admin-permissions',
        component: PermissionManagement,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'audit-logs',
        name: 'admin-audit-logs',
        component: AuditLogs,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: SystemSettings,
        meta: { requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/about',
    name: 'about',
    component: {
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>',
    },
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态（仅在首次访问时）
  if (!authStore.accessToken) {
    await authStore.initializeAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    // 需要游客状态但已登录，跳转到控制台
    next('/dashboard')
  } else if (requiresAdmin && !authStore.hasAnyUserPermission(['管理员', '超级管理员'])) {
    // 需要管理员权限但不是管理员
    ElMessage.error('您没有权限访问此页面')
    next('/dashboard')
  } else {
    next()
  }
})

export default router
