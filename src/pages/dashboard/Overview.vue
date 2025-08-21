<template>
  <div class="content-section">
    <div class="section-header">
      <h2>概览</h2>
      <p>查看您的账户概况和快速访问常用功能</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="32" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon apps">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ userApplications.length }}</div>
              <div class="stats-label">我的应用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon sessions">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ activeSessions.length }}</div>
              <div class="stats-label">活跃会话</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon logins">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ recentLogins }}</div>
              <div class="stats-label">近期登录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon security">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ securityScore }}%</div>
              <div class="stats-label">安全评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速访问 -->
    <el-card class="quick-access-card">
      <template #header>
        <div class="card-header">
          <span>快速访问</span>
        </div>
      </template>
      <el-row :gutter="24">
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" v-for="app in userApplications.slice(0, 3)" :key="app.id">
          <div class="app-item" @click="accessApplication(app)">
            <div class="app-info">
              <div class="app-name">{{ app.name }}</div>
              <div class="app-desc">{{ app.description }}</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 管理员入口 -->
    <div v-if="authStore.hasAnyUserPermission(['admin'])">
      <div class="section-header">
        <h2>管理功能</h2>
        <p>快速访问系统管理功能</p>
      </div>
      <el-row :gutter="32">
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="admin-card" @click="goToAdmin('users')">
            <div class="admin-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="admin-title">用户管理</div>
            <div class="admin-desc">管理系统用户，分配角色和权限</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="admin-card" @click="goToAdmin('applications')">
            <div class="admin-icon">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="admin-title">应用管理</div>
            <div class="admin-desc">管理接入的应用系统和配置</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="admin-card" @click="goToAdmin('permissions')">
            <div class="admin-icon">
              <el-icon><Key /></el-icon>
            </div>
            <div class="admin-title">权限管理</div>
            <div class="admin-desc">配置用户权限和访问控制</div>
          </div>
        </el-col>
      </el-row>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Grid, Monitor, User, Lock, ArrowRight, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { Application } from '@/types/application'

const router = useRouter()
const authStore = useAuthStore()

// 数据
const userApplications = ref<Application[]>([])
const activeSessions = ref([
  {
    id: '1',
    device: 'Chrome on Windows',
    location: '北京',
    ip_address: '192.168.1.100',
    login_time: '2024-01-15 09:30:00',
    last_activity: '2024-01-15 14:25:00',
    is_current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: '上海',
    ip_address: '192.168.1.101',
    login_time: '2024-01-14 18:20:00',
    last_activity: '2024-01-15 08:15:00',
    is_current: false
  }
])
const recentLogins = ref(28)
const securityScore = ref(85)

// 访问应用
const accessApplication = (app: Application) => {
  if (app.status !== 'active') {
    ElMessage.warning('应用正在维护中，暂时无法访问')
    return
  }
  
  ElMessage.success(`正在跳转到 ${app.name}...`)
  // window.open(app.redirect_uri, '_blank')
}

// 跳转到管理页面
const goToAdmin = (section?: string) => {
  if (section) {
    ElMessage.info(`正在跳转到${section === 'users' ? '用户' : section === 'applications' ? '应用' : '权限'}管理页面...`)
    router.push('/admin')
  } else {
    router.push('/admin')
  }
}

// 加载用户应用
const loadUserApplications = async () => {
  try {
    // 使用mock数据
    userApplications.value = [
      {
        id: '1',
        name: 'OA办公系统',
        description: '企业办公自动化系统',
        client_id: 'oa_system',
        client_secret: 'secret123',
        redirect_uris: ['https://oa.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'user1',
        owner_name: '张三',
        usage_count: 320,
        logo_url: '',
        homepage_url: 'https://oa.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'CRM客户管理',
        description: '客户关系管理系统',
        client_id: 'crm_system',
        client_secret: 'secret456',
        redirect_uris: ['https://crm.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'user1',
        owner_name: '张三',
        usage_count: 150,
        logo_url: '',
        homepage_url: 'https://crm.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: '财务系统',
        description: '企业财务管理系统',
        client_id: 'finance_system',
        client_secret: 'secret789',
        redirect_uris: ['https://finance.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'maintenance',
        type: 'web',
        owner_id: 'user1',
        owner_name: '张三',
        usage_count: 89,
        logo_url: '',
        homepage_url: 'https://finance.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  } catch (error) {
    console.error('Failed to load user applications:', error)
    ElMessage.error('加载应用列表失败')
  }
}

// 组件挂载时初始化数据
onMounted(async () => {
  await loadUserApplications()
})
</script>

<style scoped lang="scss">
.content-section {
  max-width: 1200px;
  animation: slideInRight 0.4s ease-out;
}

.section-header {
  margin-bottom: 48px;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
}

// 统计卡片样式
.stats-row {
  margin-bottom: 64px;
}

.stats-card {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 48px 24px 24px;
}

.stats-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  
  &.apps {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.sessions {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  &.logins {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  &.security {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.stats-info {
  flex: 1;
  
  .stats-number {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stats-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

// 快速访问卡片
.quick-access-card {
  margin-bottom: 64px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 48px 48px 0;
  }
  
  :deep(.el-card__body) {
    padding: 24px 48px 48px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.3px;
    }
  }
}

.app-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
  
  .app-info {
    flex: 1;
    
    .app-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    
    .app-desc {
      font-size: 14px;
      color: #6b7280;
    }
  }
}

// 管理员卡片
.admin-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 64px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  .admin-icon {
    font-size: 48px;
    color: #667eea;
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }
  
  .admin-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }
  
  .admin-desc {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }
}

// 响应式样式
@media (max-width: 768px) {
  .content-section {
    padding: 16px;
  }
  
  .stats-row {
    margin-bottom: 32px;
    
    .el-col {
      margin-bottom: 16px;
    }
  }
  
  .stats-content {
    padding: 32px 16px 16px;
    gap: 16px;
  }
  
  .stats-icon {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
  
  .stats-info .stats-number {
    font-size: 24px;
  }
  
  .quick-access-card {
    :deep(.el-card__header) {
      padding: 24px 24px 0;
    }
    
    :deep(.el-card__body) {
      padding: 16px 24px 24px;
    }
  }
  
  .app-item {
    margin-bottom: 16px;
    padding: 16px;
  }
  
  .admin-card {
    padding: 32px 16px;
    margin-bottom: 16px;
    
    .admin-icon {
      font-size: 36px;
      margin-bottom: 16px;
    }
    
    .admin-title {
      font-size: 18px;
    }
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 12px;
  }
  
  .section-header {
    margin-bottom: 24px;
    
    h2 {
      font-size: 20px;
    }
  }
  
  .stats-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stats-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
    margin: 0 auto;
  }
  
  .stats-info .stats-number {
    font-size: 20px;
  }
}

// 动画效果
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>