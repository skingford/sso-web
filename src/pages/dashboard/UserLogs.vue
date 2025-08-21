<template>
  <div class="content-section">
    <div class="section-header">
      <h2>操作日志</h2>
      <p>查看您的账户操作历史记录和系统活动日志</p>
    </div>

    <!-- 筛选器 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" :inline="true" size="default">
        <el-form-item label="操作类型">
          <el-select 
            v-model="filterForm.action_type" 
            placeholder="全部类型" 
            clearable
            style="width: 150px;"
          >
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="修改资料" value="profile_update" />
            <el-option label="修改密码" value="password_change" />
            <el-option label="应用访问" value="app_access" />
            <el-option label="安全设置" value="security_setting" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.date_range"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 350px;"
          />
        </el-form-item>
        
        <el-form-item label="IP地址">
          <el-input 
            v-model="filterForm.ip_address" 
            placeholder="输入IP地址" 
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="searchLogs" :loading="searching">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button @click="exportLogs">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <div class="stats-row">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon login">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_logins }}</div>
              <div class="stat-label">总登录次数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon access">
              <el-icon><Link /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.app_accesses }}</div>
              <div class="stat-label">应用访问次数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon security">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.security_changes }}</div>
              <div class="stat-label">安全操作次数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon profile">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.profile_updates }}</div>
              <div class="stat-label">资料修改次数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 日志列表 -->
    <el-card class="logs-card">
      <template #header>
        <div class="card-header">
          <span>操作记录</span>
          <div class="header-actions">
            <el-button size="small" @click="refreshLogs" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="logs" 
        style="width: 100%" 
        v-loading="loading"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="timestamp" label="时间" width="180" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.timestamp) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="action_type" label="操作类型" width="120">
          <template #default="scope">
            <el-tag :type="getActionTypeColor(scope.row.action_type)">
              {{ getActionTypeName(scope.row.action_type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="操作描述" min-width="200" />
        
        <el-table-column prop="ip_address" label="IP地址" width="150" />
        
        <el-table-column prop="user_agent" label="设备信息" width="200">
          <template #default="scope">
            <el-tooltip :content="scope.row.user_agent" placement="top">
              <span class="user-agent-text">{{ formatUserAgent(scope.row.user_agent) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="80">
          <template #default="scope">
            <el-button 
              type="text" 
              size="small" 
              @click="showLogDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalLogs"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="操作详情" 
      width="600px"
    >
      <div v-if="selectedLog" class="log-detail">
        <div class="detail-row">
          <span class="detail-label">操作时间：</span>
          <span class="detail-value">{{ formatDate(selectedLog.timestamp) }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">操作类型：</span>
          <el-tag :type="getActionTypeColor(selectedLog.action_type)">
            {{ getActionTypeName(selectedLog.action_type) }}
          </el-tag>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">操作描述：</span>
          <span class="detail-value">{{ selectedLog.description }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">IP地址：</span>
          <span class="detail-value">{{ selectedLog.ip_address }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">设备信息：</span>
          <span class="detail-value">{{ selectedLog.user_agent }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">操作结果：</span>
          <el-tag :type="selectedLog.status === 'success' ? 'success' : 'danger'">
            {{ selectedLog.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </div>
        
        <div v-if="selectedLog.details" class="detail-row">
          <span class="detail-label">详细信息：</span>
          <pre class="detail-json">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">


interface UserLog {
  id: string
  timestamp: string
  action_type: string
  description: string
  ip_address: string
  user_agent: string
  status: 'success' | 'failed'
  details?: any
}

// 筛选表单
const filterForm = reactive({
  action_type: '',
  date_range: [] as string[],
  ip_address: ''
})

// 统计数据
const stats = reactive({
  total_logins: 156,
  app_accesses: 89,
  security_changes: 12,
  profile_updates: 8
})

// 日志数据
const logs = ref<UserLog[]>([
  {
    id: '1',
    timestamp: '2024-01-15T14:30:25Z',
    action_type: 'login',
    description: '用户登录系统',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'success'
  },
  {
    id: '2',
    timestamp: '2024-01-15T13:45:10Z',
    action_type: 'app_access',
    description: '访问应用：项目管理系统',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'success',
    details: { app_id: 'app-001', app_name: '项目管理系统' }
  },
  {
    id: '3',
    timestamp: '2024-01-15T11:20:33Z',
    action_type: 'profile_update',
    description: '修改个人资料',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'success',
    details: { changed_fields: ['display_name', 'phone'] }
  },
  {
    id: '4',
    timestamp: '2024-01-14T18:45:15Z',
    action_type: 'password_change',
    description: '修改登录密码',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    status: 'success'
  },
  {
    id: '5',
    timestamp: '2024-01-14T16:30:22Z',
    action_type: 'login',
    description: '用户登录失败 - 密码错误',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'failed'
  }
])

// 状态管理
const loading = ref(false)
const searching = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(150)

// 详情对话框
const detailDialogVisible = ref(false)
const selectedLog = ref<UserLog | null>(null)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取操作类型名称
const getActionTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    login: '登录',
    logout: '登出',
    profile_update: '修改资料',
    password_change: '修改密码',
    app_access: '应用访问',
    security_setting: '安全设置'
  }
  return typeMap[type] || type
}

// 获取操作类型颜色
const getActionTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    login: 'success',
    logout: 'info',
    profile_update: 'primary',
    password_change: 'warning',
    app_access: 'success',
    security_setting: 'warning'
  }
  return colorMap[type] || 'info'
}

// 格式化用户代理
const formatUserAgent = (userAgent: string) => {
  if (userAgent.includes('Chrome')) {
    if (userAgent.includes('Mobile')) {
      return 'Chrome Mobile'
    }
    return 'Chrome Desktop'
  }
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    if (userAgent.includes('Mobile')) {
      return 'Safari Mobile'
    }
    return 'Safari Desktop'
  }
  if (userAgent.includes('Firefox')) {
    return 'Firefox'
  }
  if (userAgent.includes('Edge')) {
    return 'Edge'
  }
  return '未知设备'
}

// 搜索日志
const searchLogs = async () => {
  searching.value = true
  
  try {
    // 这里应该调用实际的API
    // const response = await apiService.user.searchLogs(filterForm)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    ElMessage.success('搜索完成')
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

// 重置筛选器
const resetFilter = () => {
  Object.assign(filterForm, {
    action_type: '',
    date_range: [],
    ip_address: ''
  })
  searchLogs()
}

// 导出日志
const exportLogs = async () => {
  try {
    // 这里应该调用实际的API
    // await apiService.user.exportLogs(filterForm)
    
    ElMessage.success('导出请求已提交，请稍后查看下载')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 刷新日志
const refreshLogs = async () => {
  loading.value = true
  
  try {
    // 这里应该调用实际的API
    // const response = await apiService.user.getLogs({
    //   page: currentPage.value,
    //   pageSize: pageSize.value
    // })
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 600))
    
    ElMessage.success('日志已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 显示日志详情
const showLogDetail = (log: UserLog) => {
  selectedLog.value = log
  detailDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  refreshLogs()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  refreshLogs()
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的日志数据
  // loadLogs()
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

// 筛选卡片
.filter-card {
  margin-bottom: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

// 统计卡片行
.stats-row {
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
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
  
  &.login {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.access {
    background: linear-gradient(135deg, #f093fb, #f5576c);
  }
  
  &.security {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.profile {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
}

.stat-content {
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
  }
}

// 日志卡片
.logs-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 32px 32px 0;
  }
  
  :deep(.el-card__body) {
    padding: 24px 32px 32px;
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

.header-actions {
  display: flex;
  gap: 8px;
}

// 用户代理文本
.user-agent-text {
  display: inline-block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

// 日志详情
.log-detail {
  .detail-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .detail-label {
    min-width: 100px;
    font-weight: 600;
    color: #374151;
  }
  
  .detail-value {
    flex: 1;
    color: #111827;
    word-break: break-all;
  }
  
  .detail-json {
    background: #f3f4f6;
    padding: 12px;
    border-radius: 6px;
    font-size: 12px;
    color: #374151;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

// Element UI组件样式
:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  
  th {
    background: #f9fafb;
    color: #111827;
    font-weight: 600;
  }
  
  td {
    border-bottom: 1px solid #f3f4f6;
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
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
  .stats-row {
    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .filter-card,
  .logs-card {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    
    .el-icon {
      font-size: 20px;
    }
  }
  
  .stat-content .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  :deep(.el-form--inline) {
    .el-form-item {
      display: block;
      margin-right: 0;
    }
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>