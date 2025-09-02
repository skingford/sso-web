import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由过渡动画名称
export const routeTransition = {
  name: 'fade',
  mode: 'out-in' as const
}

// 公共meta配置
const authMeta = { requiresAuth: true }
const guestMeta = { requiresGuest: true }
const adminMeta = { requiresAuth: true, requiresAdmin: true }

// 懒加载组件
const HomePage = () => import('@/pages/HomePage.vue')
const LoginPage = () => import('@/pages/LoginPage.vue')
const RegisterPage = () => import('@/pages/RegisterPage.vue')
const NotFound = () => import('@/pages/NotFound.vue')
const Forbidden = () => import('@/pages/Forbidden.vue')

// 布局组件
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')
const AdminLayout = () => import('@/layouts/AdminLayout.vue')

// Dashboard子页面
const Overview = () => import('@/pages/dashboard/Overview.vue')
const Applications = () => import('@/pages/dashboard/Applications.vue')
const Profile = () => import('@/pages/dashboard/Profile.vue')
const Security = () => import('@/pages/dashboard/Security.vue')
const Sessions = () => import('@/pages/dashboard/Sessions.vue')
const UserLogs = () => import('@/pages/dashboard/UserLogs.vue')

// Admin子页面
const AdminOverview = () => import('@/pages/admin/AdminOverview.vue')
const UserManagement = () => import('@/pages/admin/UserManagement.vue')
const ApplicationManagement = () => import('@/pages/admin/ApplicationManagement.vue')
const ThirdPartyApps = () => import('@/pages/admin/ThirdPartyApps.vue')
const ThirdPartyAppDetail = () => import('@/pages/admin/ThirdPartyAppDetail.vue')
const PermissionManagement = () => import('@/pages/admin/PermissionManagement.vue')
const AuditLogs = () => import('@/pages/admin/AuditLogs.vue')
const SystemSettings = () => import('@/pages/admin/SystemSettings.vue')

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
    meta: guestMeta
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: guestMeta
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: guestMeta
  },
  // Dashboard页面使用统一的布局结构
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: authMeta,
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
  {
    path: '/admin',
    component: AdminLayout,
    meta: adminMeta,
    children: [
      {
        path: '',
        redirect: '/admin/overview'
      },
      {
        path: 'overview',
        name: 'admin-overview',
        component: AdminOverview
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagement
      },
      {
        path: 'applications',
        name: 'admin-applications',
        component: ApplicationManagement
      },
      {
        path: 'third-party-apps',
        name: 'admin-third-party-apps',
        component: ThirdPartyApps
      },
      {
        path: 'third-party-apps/:id',
        name: 'admin-third-party-app-detail',
        component: ThirdPartyAppDetail,
        props: true
      },
      {
        path: 'permissions',
        name: 'admin-permissions',
        component: PermissionManagement
      },
      {
        path: 'audit-logs',
        name: 'admin-audit-logs',
        component: AuditLogs
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: SystemSettings
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
      template: '<div class="text-center text-xl p-8">About Page - Coming Soon</div>'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 添加滚动行为
  scrollBehavior(to, from, savedPosition) {
    console.log('scrollBehavior from->to', from.path, to.path, savedPosition)
    if (savedPosition) {
      return savedPosition
    } 
    return { top: 0 }
  }
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  try {
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
      next('/dashboard/overview')
    } else if (requiresAdmin && !authStore.hasAnyUserPermission(['管理员', '超级管理员'])) {
      // 需要管理员权限但不是管理员
      // ElMessage会通过自动导入获得，无需手动导入
      ElMessage?.error('您没有权限访问此页面')
      next('/forbidden')
    } else {
      next()
    }
  } catch (error) {
    console.error('路由守卫错误:', error)
    // 发生错误时跳转到登录页
    next('/login')
  }
})

export default router
