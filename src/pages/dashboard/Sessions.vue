<template>
  <div class="content-section">
    <div class="section-header">
      <h2>登录会话</h2>
      <p>管理您的活跃登录会话，可以查看和终止不安全的会话</p>
    </div>

    <!-- 当前会话 -->
    <el-card class="session-card current-session">
      <template #header>
        <div class="card-header">
          <span>当前会话</span>
          <el-tag type="success">活跃</el-tag>
        </div>
      </template>
      
      <div class="session-info">
        <div class="session-details">
          <div class="detail-item">
            <el-icon><Monitor /></el-icon>
            <div>
              <span class="label">设备</span>
              <span class="value">{{ currentSession.device }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <el-icon><Location /></el-icon>
            <div>
              <span class="label">位置</span>
              <span class="value">{{ currentSession.location }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <el-icon><Connection /></el-icon>
            <div>
              <span class="label">IP地址</span>
              <span class="value">{{ currentSession.ip }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <el-icon><Clock /></el-icon>
            <div>
              <span class="label">登录时间</span>
              <span class="value">{{ formatDate(currentSession.login_time) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 其他会话 -->
    <el-card class="session-card">
      <template #header>
        <div class="card-header">
          <span>其他会话</span>
          <el-button 
            type="danger" 
            size="small" 
            @click="terminateAllSessions"
            :loading="terminatingAll"
          >
            终止所有会话
          </el-button>
        </div>
      </template>
      
      <div v-if="otherSessions.length === 0" class="no-sessions">
        <el-empty description="暂无其他活跃会话" />
      </div>
      
      <div v-else class="sessions-list">
        <div 
          v-for="session in otherSessions" 
          :key="session.id" 
          class="session-item"
        >
          <div class="session-info">
            <div class="session-details">
              <div class="detail-item">
                <el-icon><Monitor /></el-icon>
                <div>
                  <span class="label">设备</span>
                  <span class="value">{{ session.device }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <el-icon><Location /></el-icon>
                <div>
                  <span class="label">位置</span>
                  <span class="value">{{ session.location }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <el-icon><Connection /></el-icon>
                <div>
                  <span class="label">IP地址</span>
                  <span class="value">{{ session.ip }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <el-icon><Clock /></el-icon>
                <div>
                  <span class="label">最后活跃</span>
                  <span class="value">{{ formatDate(session.last_active) }}</span>
                </div>
              </div>
            </div>
            
            <div class="session-actions">
              <el-button 
                type="danger" 
                size="small" 
                @click="terminateSession(session.id)"
                :loading="terminatingSession === session.id"
              >
                终止会话
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 会话历史 -->
    <el-card class="session-card">
      <template #header>
        <div class="card-header">
          <span>会话历史</span>
          <el-button size="small" @click="refreshHistory">
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="sessionHistory" style="width: 100%" v-loading="loadingHistory">
        <el-table-column prop="device" label="设备" width="200" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="login_time" label="登录时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.login_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="logout_time" label="退出时间" width="180">
          <template #default="scope">
            {{ scope.row.logout_time ? formatDate(scope.row.logout_time) : '会话中断' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 'normal' ? 'success' : 
                     scope.row.status === 'terminated' ? 'warning' : 'danger'"
            >
              {{ 
                scope.row.status === 'normal' ? '正常退出' : 
                scope.row.status === 'terminated' ? '手动终止' : '异常中断'
              }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalSessions"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">


interface Session {
  id: string
  device: string
  location: string
  ip: string
  login_time: string
  last_active?: string
  logout_time?: string
  status?: 'normal' | 'terminated' | 'interrupted'
}

// 当前会话
const currentSession = reactive<Session>({
  id: 'current',
  device: 'Chrome on macOS',
  location: '北京',
  ip: '192.168.1.100',
  login_time: '2024-01-15T09:30:00Z'
})

// 其他活跃会话
const otherSessions = ref<Session[]>([
  {
    id: 'session-1',
    device: 'Safari on iPhone',
    location: '上海',
    ip: '192.168.1.101',
    login_time: '2024-01-14T18:20:00Z',
    last_active: '2024-01-15T08:45:00Z'
  },
  {
    id: 'session-2',
    device: 'Edge on Windows',
    location: '广州',
    ip: '192.168.1.102',
    login_time: '2024-01-13T14:15:00Z',
    last_active: '2024-01-14T22:30:00Z'
  }
])

// 会话历史
const sessionHistory = ref<Session[]>([
  {
    id: 'history-1',
    device: 'Chrome on macOS',
    location: '北京',
    ip: '192.168.1.100',
    login_time: '2024-01-12T09:00:00Z',
    logout_time: '2024-01-12T18:30:00Z',
    status: 'normal'
  },
  {
    id: 'history-2',
    device: 'Firefox on Ubuntu',
    location: '深圳',
    ip: '192.168.1.103',
    login_time: '2024-01-11T10:15:00Z',
    logout_time: '2024-01-11T16:45:00Z',
    status: 'terminated'
  },
  {
    id: 'history-3',
    device: 'Safari on iPad',
    location: '杭州',
    ip: '192.168.1.104',
    login_time: '2024-01-10T13:20:00Z',
    status: 'interrupted'
  }
])

// 加载状态
const terminatingSession = ref<string | null>(null)
const terminatingAll = ref(false)
const loadingHistory = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalSessions = ref(50)

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

// 终止单个会话
const terminateSession = async (sessionId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要终止这个会话吗？该设备将被强制退出登录。',
      '确认终止会话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    terminatingSession.value = sessionId
    
    // 这里应该调用实际的API
    // await apiService.user.terminateSession(sessionId)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从列表中移除会话
    const index = otherSessions.value.findIndex(s => s.id === sessionId)
    if (index > -1) {
      otherSessions.value.splice(index, 1)
    }
    
    ElMessage.success('会话已终止')
  } catch {
    // 用户取消操作
  } finally {
    terminatingSession.value = null
  }
}

// 终止所有会话
const terminateAllSessions = async () => {
  if (otherSessions.value.length === 0) {
    ElMessage.info('没有其他活跃会话')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要终止所有其他会话吗？这将强制 ${otherSessions.value.length} 个设备退出登录。`,
      '确认终止所有会话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    terminatingAll.value = true
    
    // 这里应该调用实际的API
    // await apiService.user.terminateAllSessions()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 清空其他会话列表
    otherSessions.value = []
    
    ElMessage.success('所有其他会话已终止')
  } catch {
    // 用户取消操作
  } finally {
    terminatingAll.value = false
  }
}

// 刷新历史记录
const refreshHistory = async () => {
  loadingHistory.value = true
  
  try {
    // 这里应该调用实际的API
    // const response = await apiService.user.getSessionHistory({
    //   page: currentPage.value,
    //   pageSize: pageSize.value
    // })
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    ElMessage.success('历史记录已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loadingHistory.value = false
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  refreshHistory()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  refreshHistory()
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的会话数据
  // loadSessions()
})
</script>

<style scoped lang="scss">
.content-section {
  max-width: 1000px;
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

// 会话卡片
.session-card {
  margin-bottom: 48px;
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

// 当前会话特殊样式
.current-session {
  border-left: 4px solid #10b981;
  
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  }
}

// 会话信息
.session-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.session-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .el-icon {
    color: #667eea;
    font-size: 18px;
  }
  
  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 14px;
    color: #111827;
    font-weight: 600;
  }
}

// 会话列表
.sessions-list {
  .session-item {
    padding: 24px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.session-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.no-sessions {
  text-align: center;
  padding: 48px 0;
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

// Element UI组件样式
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.el-button--danger) {
  background: #ef4444;
  border-color: #ef4444;
  
  &:hover {
    background: #dc2626;
    border-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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

:deep(.el-pagination) {
  .el-pager li {
    border-radius: 6px;
    margin: 0 2px;
  }
  
  .btn-prev,
  .btn-next {
    border-radius: 6px;
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
@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .session-card {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .session-details {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .session-info {
    flex-direction: column;
  }
  
  .session-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .detail-item {
    .el-icon {
      font-size: 16px;
    }
    
    .value {
      font-size: 13px;
    }
  }
}
</style>