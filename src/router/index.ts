import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomePage from '@/pages/HomePage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import NotFound from '@/pages/NotFound.vue'
import Forbidden from '@/pages/Forbidden.vue'

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
    redirect: '/dashboard/overview'
  },
  {
    path: '/home',
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
  // Dashboard页面使用统一的布局结构
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
        name: 'overview',
        component: Overview
      },
      {
        path: 'applications',
        name: 'applications',
        component: Applications
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile
      },
      {
        path: 'security',
        name: 'security',
        component: Security
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: Sessions
      },
      {
        path: 'logs',
        name: 'logs',
        component: UserLogs
      }
    ]
  },
  // 为了保持简洁的URL，添加顶级路由重定向
  {
    path: '/overview',
    redirect: '/dashboard/overview'
  },
  {
    path: '/applications',
    redirect: '/dashboard/applications'
  },
  {
    path: '/profile',
    redirect: '/dashboard/profile'
  },
  {
    path: '/security',
    redirect: '/dashboard/security'
  },
  {
    path: '/sessions',
    redirect: '/dashboard/sessions'
  },
  {
    path: '/logs',
    redirect: '/dashboard/logs'
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
    path: '/forbidden',
    name: 'forbidden',
    component: Forbidden
  },
  {
    path: '/about',
    name: 'about',
    component: {
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
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
    next('/overview')
  } else if (requiresAdmin && !authStore.hasAnyUserPermission(['管理员', '超级管理员'])) {
    // 需要管理员权限但不是管理员
    ElMessage.error('您没有权限访问此页面')
    next('/forbidden')
  } else {
    next()
  }
})

export default router
