<template>
  <div class="content-section">
    <div class="section-header">
      <h2>管理概览</h2>
      <p>系统整体运行状况和关键指标概览</p>
    </div>

    <!-- 关键指标卡片 -->
    <div class="stats-grid">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card users">
            <div class="stat-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_users }}</div>
              <div class="stat-label">总用户数</div>
              <div class="stat-change positive">+{{ stats.new_users_today }} 今日新增</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card apps">
            <div class="stat-icon">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_apps }}</div>
              <div class="stat-label">应用总数</div>
              <div class="stat-change positive">+{{ stats.new_apps_week }} 本周新增</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card sessions">
            <div class="stat-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.active_sessions }}</div>
              <div class="stat-label">活跃会话</div>
              <div class="stat-change neutral">{{ stats.avg_session_time }}min 平均时长</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card security">
            <div class="stat-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.security_score }}%</div>
              <div class="stat-label">安全评分</div>
              <div class="stat-change positive">+2% 较上月</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表和快速操作 -->
    <el-row :gutter="24" class="charts-row">
      <!-- 用户增长趋势 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-select v-model="chartPeriod" size="small" style="width: 120px;">
                <el-option label="最近7天" value="7d" />
                <el-option label="最近30天" value="30d" />
                <el-option label="最近90天" value="90d" />
              </el-select>
            </div>
          </template>
          
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon size="64"><TrendCharts /></el-icon>
              <p>用户增长趋势图表</p>
              <p class="chart-desc">显示用户注册和活跃度变化趋势</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 快速操作 -->
      <el-col :span="8">
        <el-card class="quick-actions-card">
          <template #header>
            <span>快速操作</span>
          </template>
          
          <div class="quick-actions">
            <div class="action-item" @click="navigateToUserManagement">
              <div class="action-icon users">
                <el-icon><User /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">用户管理</div>
                <div class="action-desc">管理用户账户和权限</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-item" @click="navigateToAppManagement">
              <div class="action-icon apps">
                <el-icon><Grid /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">应用管理</div>
                <div class="action-desc">配置和管理应用</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-item" @click="navigateToPermissions">
              <div class="action-icon permissions">
                <el-icon><Key /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">权限管理</div>
                <div class="action-desc">配置角色和权限</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-item" @click="navigateToAuditLogs">
              <div class="action-icon logs">
                <el-icon><Document /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">审计日志</div>
                <div class="action-desc">查看系统操作记录</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
            
            <div class="action-item" @click="navigateToSystemSettings">
              <div class="action-icon settings">
                <el-icon><Setting /></el-icon>
              </div>
              <div class="action-content">
                <div class="action-title">系统设置</div>
                <div class="action-desc">配置系统参数</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动和系统状态 -->
    <el-row :gutter="24" class="bottom-row">
      <!-- 最近活动 -->
      <el-col :span="12">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button size="small" @click="refreshActivities">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <div class="activities-list">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id" 
              class="activity-item"
            >
              <div class="activity-icon" :class="activity.type">
                <el-icon>
                  <User v-if="activity.type === 'user'" />
                  <Grid v-else-if="activity.type === 'app'" />
                  <Key v-else-if="activity.type === 'permission'" />
                  <Setting v-else />
                </el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-desc">{{ activity.description }}</div>
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
              </div>
            </div>
          </div>
          
          <div class="activity-footer">
            <el-button type="text" @click="navigateToAuditLogs">
              查看全部活动
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统状态 -->
      <el-col :span="12">
        <el-card class="system-status-card">
          <template #header>
            <div class="card-header">
              <span>系统状态</span>
              <el-tag :type="systemStatus.overall === 'healthy' ? 'success' : 'warning'">
                {{ systemStatus.overall === 'healthy' ? '正常' : '警告' }}
              </el-tag>
            </div>
          </template>
          
          <div class="status-items">
            <div class="status-item">
              <div class="status-label">数据库连接</div>
              <div class="status-value">
                <el-tag :type="systemStatus.database === 'connected' ? 'success' : 'danger'" size="small">
                  {{ systemStatus.database === 'connected' ? '正常' : '异常' }}
                </el-tag>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">缓存服务</div>
              <div class="status-value">
                <el-tag :type="systemStatus.cache === 'running' ? 'success' : 'danger'" size="small">
                  {{ systemStatus.cache === 'running' ? '运行中' : '停止' }}
                </el-tag>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">邮件服务</div>
              <div class="status-value">
                <el-tag :type="systemStatus.email === 'active' ? 'success' : 'warning'" size="small">
                  {{ systemStatus.email === 'active' ? '正常' : '警告' }}
                </el-tag>
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">存储空间</div>
              <div class="status-value">
                <span class="storage-usage">{{ systemStatus.storage_usage }}%</span>
                <el-progress 
                  :percentage="systemStatus.storage_usage" 
                  :stroke-width="6" 
                  :show-text="false"
                  :color="systemStatus.storage_usage > 80 ? '#f56c6c' : '#67c23a'"
                />
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">CPU使用率</div>
              <div class="status-value">
                <span class="cpu-usage">{{ systemStatus.cpu_usage }}%</span>
                <el-progress 
                  :percentage="systemStatus.cpu_usage" 
                  :stroke-width="6" 
                  :show-text="false"
                  :color="systemStatus.cpu_usage > 80 ? '#f56c6c' : '#67c23a'"
                />
              </div>
            </div>
            
            <div class="status-item">
              <div class="status-label">内存使用率</div>
              <div class="status-value">
                <span class="memory-usage">{{ systemStatus.memory_usage }}%</span>
                <el-progress 
                  :percentage="systemStatus.memory_usage" 
                  :stroke-width="6" 
                  :show-text="false"
                  :color="systemStatus.memory_usage > 80 ? '#f56c6c' : '#67c23a'"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">

import { 
  UserFilled, Grid, Connection, Lock, TrendCharts, User, Key, Document, Setting, 
  ArrowRight, Refresh 
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = reactive({
  total_users: 1248,
  new_users_today: 23,
  total_apps: 45,
  new_apps_week: 3,
  active_sessions: 156,
  avg_session_time: 42,
  security_score: 94
})

// 图表时间段
const chartPeriod = ref('30d')

// 最近活动
const recentActivities = ref([
  {
    id: '1',
    type: 'user',
    title: '新用户注册',
    description: '用户 zhang.wei@example.com 完成注册',
    timestamp: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    type: 'app',
    title: '应用配置更新',
    description: '项目管理系统的OAuth配置已更新',
    timestamp: '2024-01-15T13:45:00Z'
  },
  {
    id: '3',
    type: 'permission',
    title: '权限变更',
    description: '为角色"项目经理"添加了新的权限',
    timestamp: '2024-01-15T12:20:00Z'
  },
  {
    id: '4',
    type: 'system',
    title: '系统维护',
    description: '数据库备份任务执行完成',
    timestamp: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    type: 'user',
    title: '用户状态变更',
    description: '用户 li.ming@example.com 账户已激活',
    timestamp: '2024-01-15T09:15:00Z'
  }
])

// 系统状态
const systemStatus = reactive({
  overall: 'healthy',
  database: 'connected',
  cache: 'running',
  email: 'active',
  storage_usage: 65,
  cpu_usage: 32,
  memory_usage: 58
})

// 格式化时间
const formatTime = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 导航函数
const navigateToUserManagement = () => {
  router.push('/admin/users')
}

const navigateToAppManagement = () => {
  router.push('/admin/applications')
}

const navigateToPermissions = () => {
  router.push('/admin/permissions')
}

const navigateToAuditLogs = () => {
  router.push('/admin/audit-logs')
}

const navigateToSystemSettings = () => {
  router.push('/admin/settings')
}

// 刷新活动
const refreshActivities = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await apiService.admin.getRecentActivities()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('活动列表已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的统计数据
  // loadDashboardData()
})
</script>

<style scoped lang="scss">
.content-section {
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

// 统计卡片网格
.stats-grid {
  margin-bottom: 48px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
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
  }
  
  &.users::before {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.apps::before {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }
  
  &.sessions::before {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.security::before {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  
  .el-icon {
    font-size: 32px;
    color: #475569;
  }
}

.stat-content {
  flex: 1;
  
  .stat-value {
    font-size: 36px;
    font-weight: 800;
    color: #111827;
    line-height: 1;
    margin-bottom: 8px;
  }
  
  .stat-label {
    font-size: 16px;
    color: #6b7280;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .stat-change {
    font-size: 14px;
    font-weight: 600;
    
    &.positive {
      color: #059669;
    }
    
    &.negative {
      color: #dc2626;
    }
    
    &.neutral {
      color: #6b7280;
    }
  }
}

// 图表行
.charts-row {
  margin-bottom: 48px;
}

.chart-card,
.quick-actions-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 32px 32px 0;
  }
  
  :deep(.el-card__body) {
    padding: 24px 32px 32px;
  }
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

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #6b7280;
  
  .el-icon {
    margin-bottom: 16px;
  }
  
  p {
    margin: 8px 0;
    
    &.chart-desc {
      font-size: 14px;
      color: #9ca3af;
    }
  }
}

// 快速操作
.quick-actions {
  .action-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f8fafc;
      transform: translateX(4px);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .el-icon {
    font-size: 24px;
    color: white;
  }
  
  &.users {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.apps {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }
  
  &.permissions {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.logs {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
  
  &.settings {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }
}

.action-content {
  flex: 1;
  
  .action-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .action-desc {
    font-size: 14px;
    color: #6b7280;
  }
}

.action-arrow {
  color: #9ca3af;
  transition: all 0.3s ease;
}

.action-item:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

// 底部行
.bottom-row {
  .activity-card,
  .system-status-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    
    :deep(.el-card__header) {
      padding: 32px 32px 0;
    }
    
    :deep(.el-card__body) {
      padding: 24px 32px 32px;
    }
  }
}

// 活动列表
.activities-list {
  max-height: 400px;
  overflow-y: auto;
  
  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .el-icon {
    font-size: 18px;
    color: white;
  }
  
  &.user {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.app {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }
  
  &.permission {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.system {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
}

.activity-content {
  flex: 1;
  
  .activity-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .activity-desc {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .activity-time {
    font-size: 12px;
    color: #9ca3af;
  }
}

.activity-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  margin-top: 16px;
}

// 系统状态
.status-items {
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.status-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.status-value {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .storage-usage,
  .cpu-usage,
  .memory-usage {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
    min-width: 40px;
  }
  
  :deep(.el-progress) {
    width: 80px;
  }
}

// Element UI组件样式
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.el-button--text) {
  color: #667eea;
  
  &:hover {
    color: #5a67d8;
    background: rgba(102, 126, 234, 0.1);
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
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
@media (max-width: 1200px) {
  .stats-grid {
    :deep(.el-col) {
      margin-bottom: 24px;
    }
  }
  
  .charts-row {
    :deep(.el-col) {
      margin-bottom: 24px;
    }
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .stat-card {
    padding: 24px;
    
    .stat-icon {
      width: 48px;
      height: 48px;
      
      .el-icon {
        font-size: 24px;
      }
    }
    
    .stat-content .stat-value {
      font-size: 28px;
    }
  }
  
  .chart-card,
  .quick-actions-card,
  .activity-card,
  .system-status-card {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
}
</style>