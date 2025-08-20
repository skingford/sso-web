<template>
  <div class="content-section">
    <div class="section-header">
      <h2>我的应用</h2>
      <p>管理您有权访问的应用系统</p>
    </div>

    <!-- 应用列表 -->
    <el-row :gutter="24">
      <el-col :span="8" v-for="app in userApplications" :key="app.id">
        <el-card class="application-card" @click="accessApplication(app)">
          <div class="app-header">
            <div class="app-status" :class="app.status">
              {{ app.status === 'active' ? '正常' : '维护中' }}
            </div>
          </div>
          <div class="app-content">
            <h3>{{ app.name }}</h3>
            <p>{{ app.description }}</p>
            <div class="app-meta">
              <span>客户端ID: {{ app.client_id }}</span>
              <span>创建时间: {{ formatDate(app.created_at) }}</span>
            </div>
          </div>
          <div class="app-actions">
            <el-button 
              type="primary" 
              :disabled="app.status !== 'active'"
              @click.stop="accessApplication(app)"
            >
              {{ app.status === 'active' ? '访问应用' : '维护中' }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 空状态 -->
    <div v-if="userApplications.length === 0" class="empty-state">
      <el-empty description="暂无可访问的应用">
        <el-button type="primary" @click="contactAdmin">联系管理员</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Application } from '@/types/application'

// 数据
const userApplications = ref<Application[]>([])

// 访问应用
const accessApplication = (app: Application) => {
  if (app.status !== 'active') {
    ElMessage.warning('应用正在维护中，暂时无法访问')
    return
  }
  
  ElMessage.success(`正在跳转到 ${app.name}...`)
  // 这里可以实现SSO跳转逻辑
  // window.open(app.redirect_uri, '_blank')
}

// 联系管理员
const contactAdmin = () => {
  ElMessage.info('请联系系统管理员为您分配应用访问权限')
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 加载用户应用
const loadUserApplications = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await apiService.applications.getUserApplications()
    // userApplications.value = response.data
    
    // 使用mock数据
    userApplications.value = [
      {
        id: '1',
        name: 'OA办公系统',
        description: '企业办公自动化系统，包含考勤、审批、文档管理等功能',
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
        description: '客户关系管理系统，帮助您更好地管理客户信息和销售流程',
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
        description: '企业财务管理系统，提供财务报表、预算管理等功能',
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
      },
      {
        id: '4',
        name: 'HR人事系统',
        description: '人力资源管理系统，包含员工档案、薪资管理、绩效考核等',
        client_id: 'hr_system',
        client_secret: 'secret101',
        redirect_uris: ['https://hr.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'user1',
        owner_name: '张三',
        usage_count: 234,
        logo_url: '',
        homepage_url: 'https://hr.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '5',
        name: '项目管理系统',
        description: '项目管理和协作平台，支持任务分配、进度跟踪、团队协作',
        client_id: 'project_system',
        client_secret: 'secret102',
        redirect_uris: ['https://project.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'user1',
        owner_name: '张三',
        usage_count: 178,
        logo_url: '',
        homepage_url: 'https://project.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '6',
        name: '知识库系统',
        description: '企业知识管理平台，提供文档存储、知识分享、搜索功能',
        client_id: 'wiki_system',
        client_secret: 'secret103',
        redirect_uris: ['https://wiki.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'user1',
        owner_name: '张三',
        usage_count: 95,
        logo_url: '',
        homepage_url: 'https://wiki.example.com',
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

// 应用卡片样式
.application-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
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
    height: 3px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  :deep(.el-card__body) {
    padding: 32px;
  }
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.app-status {
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.active {
    background: #dcfce7;
    color: #16a34a;
  }
  
  &.maintenance {
    background: #fef3c7;
    color: #d97706;
  }
}

.app-content {
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px 0;
    letter-spacing: -0.3px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
    line-height: 1.6;
  }
}

.app-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.app-actions {
  margin-top: 24px;
  text-align: right;
  
  :deep(.el-button) {
    border-radius: 8px;
    font-weight: 600;
    padding: 8px 24px;
  }
}

// 空状态样式
.empty-state {
  text-align: center;
  padding: 64px 0;
  
  :deep(.el-empty__description) {
    color: #6b7280;
    font-size: 16px;
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

// 响应式设计
@media (max-width: 1024px) {
  .application-card .el-col {
    margin-bottom: 32px;
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .application-card .el-col {
    margin-bottom: 24px;
  }
  
  .application-card {
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
}
</style>