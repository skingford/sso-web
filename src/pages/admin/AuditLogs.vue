<template>
  <div class="content-section">
    <div class="section-header">
      <h2>审计日志</h2>
      <p>查看和管理系统审计日志记录</p>
    </div>

    <!-- 日志统计卡片 -->
    <div class="logs-overview">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ logStats.totalLogs }}</div>
              <div class="card-label">总日志数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ logStats.todayLogs }}</div>
              <div class="card-label">今日日志</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon errors">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ logStats.errorLogs }}</div>
              <div class="card-label">错误日志</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="overview-card">
            <div class="card-icon security">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ logStats.securityLogs }}</div>
              <div class="card-label">安全日志</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选区域 -->
    <el-card class="filter-card">
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-group">
            <label>搜索关键词</label>
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户、操作、IP地址等"
              prefix-icon="Search"
              clearable
              style="width: 300px;"
              @input="handleSearch"
            />
          </div>
          
          <div class="filter-group">
            <label>日志类型</label>
            <el-select
              v-model="logTypeFilter"
              placeholder="选择日志类型"
              clearable
              style="width: 150px;"
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="用户操作" value="user" />
              <el-option label="系统操作" value="system" />
              <el-option label="安全事件" value="security" />
              <el-option label="应用操作" value="application" />
              <el-option label="权限变更" value="permission" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>日志级别</label>
            <el-select
              v-model="logLevelFilter"
              placeholder="选择日志级别"
              clearable
              style="width: 120px;"
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="信息" value="info" />
              <el-option label="警告" value="warning" />
              <el-option label="错误" value="error" />
              <el-option label="严重" value="critical" />
            </el-select>
          </div>
          
          <div class="filter-group">
            <label>时间范围</label>
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 350px;"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
        
        <div class="filter-actions">
          <el-button @click="resetFilters">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button @click="exportLogs">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="primary" @click="refreshLogs">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="logs-card">
      <div class="logs-header">
        <div class="logs-title">
          <h3>审计日志列表</h3>
          <span class="logs-count">共 {{ filteredLogs.length }} 条记录</span>
        </div>
        
        <div class="logs-actions">
          <el-button-group>
            <el-button 
              :type="viewMode === 'table' ? 'primary' : ''"
              @click="viewMode = 'table'"
            >
              <el-icon><Grid /></el-icon>
              表格视图
            </el-button>
            <el-button 
              :type="viewMode === 'timeline' ? 'primary' : ''"
              @click="viewMode = 'timeline'"
            >
              <el-icon><Clock /></el-icon>
              时间线视图
            </el-button>
          </el-button-group>
        </div>
      </div>
      
      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-view">
        <el-table
          v-loading="logsLoading"
          :data="paginatedLogs"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column label="时间" width="180" sortable>
            <template #default="{ row }">
              <div class="log-time">
                <div class="time-primary">{{ formatDate(row.timestamp) }}</div>
                <div class="time-secondary">{{ formatTime(row.timestamp) }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="用户" width="150">
            <template #default="{ row }">
              <div class="user-info">
                <div class="user-avatar">
                  <img v-if="row.user?.avatar" :src="row.user.avatar" :alt="row.user.name" />
                  <div v-else class="avatar-placeholder">
                    {{ row.user?.name?.charAt(0) || 'S' }}
                  </div>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ row.user?.name || '系统' }}</div>
                  <div class="user-email">{{ row.user?.email || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" min-width="200">
            <template #default="{ row }">
              <div class="log-action">
                <el-tag :type="getLogTypeTagType(row.type)" size="small" class="action-tag">
                  {{ getLogTypeLabel(row.type) }}
                </el-tag>
                <span class="action-description">{{ row.action }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="getLogLevelTagType(row.level)" size="small">
                {{ getLogLevelLabel(row.level) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="IP地址" width="120">
            <template #default="{ row }">
              <span class="ip-address">{{ row.ip_address }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="位置" width="120">
            <template #default="{ row }">
              <span class="location">{{ row.location || '-' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                {{ row.success ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewLogDetail(row)">
                详情
              </el-button>
              <el-dropdown @command="handleLogAction">
                <el-button size="small">
                  更多
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'copy', log: row }">
                      复制日志
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'export', log: row }">
                      导出日志
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :command="{ action: 'related', log: row }"
                      divided
                    >
                      查看相关日志
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredLogs.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      
      <!-- 时间线视图 -->
      <div v-else class="timeline-view">
        <el-timeline>
          <el-timeline-item
            v-for="log in paginatedLogs"
            :key="log.id"
            :timestamp="formatDateTime(log.timestamp)"
            :type="getTimelineType(log.level)"
            :color="getTimelineColor(log.level)"
            placement="top"
          >
            <div class="timeline-content">
              <div class="timeline-header">
                <div class="timeline-user">
                  <div class="user-avatar">
                    <img v-if="log.user?.avatar" :src="log.user.avatar" :alt="log.user.name" />
                    <div v-else class="avatar-placeholder">
                      {{ log.user?.name?.charAt(0) || 'S' }}
                    </div>
                  </div>
                  <span class="user-name">{{ log.user?.name || '系统' }}</span>
                </div>
                
                <div class="timeline-tags">
                  <el-tag :type="getLogTypeTagType(log.type)" size="small">
                    {{ getLogTypeLabel(log.type) }}
                  </el-tag>
                  <el-tag :type="log.success ? 'success' : 'danger'" size="small">
                    {{ log.success ? '成功' : '失败' }}
                  </el-tag>
                </div>
              </div>
              
              <div class="timeline-body">
                <div class="action-description">{{ log.action }}</div>
                <div class="log-details">
                  <span class="detail-item">
                    <el-icon><Location /></el-icon>
                    {{ log.ip_address }}
                  </span>
                  <span v-if="log.location" class="detail-item">
                    <el-icon><Position /></el-icon>
                    {{ log.location }}
                  </span>
                  <span v-if="log.user_agent" class="detail-item">
                    <el-icon><Monitor /></el-icon>
                    {{ formatUserAgent(log.user_agent) }}
                  </span>
                </div>
              </div>
              
              <div class="timeline-footer">
                <el-button size="small" text @click="viewLogDetail(log)">
                  查看详情
                </el-button>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredLogs.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="logDetailVisible"
      title="日志详情"
      width="800px"
      @close="resetLogDetail"
    >
      <div v-if="selectedLog" class="log-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>时间</label>
              <span>{{ formatDateTime(selectedLog.timestamp) }}</span>
            </div>
            <div class="detail-item">
              <label>用户</label>
              <span>{{ selectedLog.user?.name || '系统' }}</span>
            </div>
            <div class="detail-item">
              <label>邮箱</label>
              <span>{{ selectedLog.user?.email || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>操作类型</label>
              <el-tag :type="getLogTypeTagType(selectedLog.type)" size="small">
                {{ getLogTypeLabel(selectedLog.type) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>日志级别</label>
              <el-tag :type="getLogLevelTagType(selectedLog.level)" size="small">
                {{ getLogLevelLabel(selectedLog.level) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <label>执行状态</label>
              <el-tag :type="selectedLog.success ? 'success' : 'danger'" size="small">
                {{ selectedLog.success ? '成功' : '失败' }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>操作描述</h4>
          <div class="action-description">{{ selectedLog.action }}</div>
        </div>
        
        <div class="detail-section">
          <h4>网络信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>IP地址</label>
              <span>{{ selectedLog.ip_address }}</span>
            </div>
            <div class="detail-item">
              <label>地理位置</label>
              <span>{{ selectedLog.location || '-' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>用户代理</label>
              <span class="user-agent">{{ selectedLog.user_agent || '-' }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedLog.details" class="detail-section">
          <h4>详细信息</h4>
          <div class="json-viewer">
            <pre>{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
          </div>
        </div>
        
        <div v-if="selectedLog.error_message" class="detail-section">
          <h4>错误信息</h4>
          <div class="error-message">
            {{ selectedLog.error_message }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="copyLogDetail">复制详情</el-button>
          <el-button @click="exportLogDetail">导出详情</el-button>
          <el-button type="primary" @click="logDetailVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Calendar, Warning, Lock, Search, Refresh, Download,
  Grid, Clock, ArrowDown, Location, Position, Monitor
} from '@element-plus/icons-vue'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuditLog {
  id: string
  timestamp: string
  user?: User
  type: 'user' | 'system' | 'security' | 'application' | 'permission'
  action: string
  level: 'info' | 'warning' | 'error' | 'critical'
  ip_address: string
  location?: string
  user_agent?: string
  success: boolean
  details?: any
  error_message?: string
}

// 响应式数据
const logsLoading = ref(false)
const viewMode = ref<'table' | 'timeline'>('table')
const logDetailVisible = ref(false)
const selectedLog = ref<AuditLog | null>(null)
const selectedLogs = ref<AuditLog[]>([])

// 搜索和筛选
const searchQuery = ref('')
const logTypeFilter = ref('')
const logLevelFilter = ref('')
const dateRange = ref<[string, string] | null>(null)

// 分页
const currentPage = ref(1)
const pageSize = ref(20)

// 统计数据
const logStats = reactive({
  totalLogs: 2847,
  todayLogs: 156,
  errorLogs: 23,
  securityLogs: 45
})

// 模拟日志数据
const logs = ref<AuditLog[]>([
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    user: {
      id: '1',
      name: '张三',
      email: 'zhang.san@example.com',
      avatar: ''
    },
    type: 'user',
    action: '用户登录成功',
    level: 'info',
    ip_address: '192.168.1.100',
    location: '北京市',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: {
      login_method: 'password',
      session_id: 'sess_123456789'
    }
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:25:00Z',
    user: {
      id: '2',
      name: '李四',
      email: 'li.si@example.com'
    },
    type: 'application',
    action: '创建新应用 "测试应用"',
    level: 'info',
    ip_address: '192.168.1.101',
    location: '上海市',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    success: true,
    details: {
      application_id: 'app_123',
      application_name: '测试应用',
      application_type: 'web'
    }
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:20:00Z',
    type: 'security',
    action: '检测到异常登录尝试',
    level: 'warning',
    ip_address: '203.0.113.1',
    location: '未知',
    user_agent: 'curl/7.68.0',
    success: false,
    details: {
      attempt_count: 5,
      blocked: true,
      reason: 'too_many_attempts'
    },
    error_message: '登录尝试次数过多，IP已被临时封禁'
  },
  {
    id: '4',
    timestamp: '2024-01-15T10:15:00Z',
    user: {
      id: '1',
      name: '张三',
      email: 'zhang.san@example.com'
    },
    type: 'permission',
    action: '修改用户角色权限',
    level: 'info',
    ip_address: '192.168.1.100',
    location: '北京市',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
    details: {
      target_user_id: '5',
      old_role: 'user',
      new_role: 'admin',
      permissions_added: ['user.create', 'user.delete']
    }
  },
  {
    id: '5',
    timestamp: '2024-01-15T10:10:00Z',
    type: 'system',
    action: '系统配置更新',
    level: 'info',
    ip_address: '127.0.0.1',
    location: '本地',
    success: true,
    details: {
      config_key: 'session_timeout',
      old_value: '3600',
      new_value: '7200'
    }
  }
])

// 计算属性
const filteredLogs = computed(() => {
  let result = logs.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(log => 
      log.action.toLowerCase().includes(query) ||
      log.user?.name?.toLowerCase().includes(query) ||
      log.user?.email?.toLowerCase().includes(query) ||
      log.ip_address.includes(query) ||
      (log.location && log.location.toLowerCase().includes(query))
    )
  }
  
  // 类型过滤
  if (logTypeFilter.value) {
    result = result.filter(log => log.type === logTypeFilter.value)
  }
  
  // 级别过滤
  if (logLevelFilter.value) {
    result = result.filter(log => log.level === logLevelFilter.value)
  }
  
  // 时间范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(log => {
      const logTime = new Date(log.timestamp).getTime()
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      return logTime >= start && logTime <= end
    })
  }
  
  // 按时间倒序排列
  return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatUserAgent = (userAgent: string) => {
  if (!userAgent) return '-'
  
  // 简化用户代理字符串显示
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('curl')) return 'cURL'
  
  return '其他'
}

const getLogTypeLabel = (type: string) => {
  const labels = {
    user: '用户操作',
    system: '系统操作',
    security: '安全事件',
    application: '应用操作',
    permission: '权限变更'
  }
  return labels[type as keyof typeof labels] || type
}

const getLogTypeTagType = (type: string) => {
  const types = {
    user: 'primary',
    system: 'info',
    security: 'danger',
    application: 'success',
    permission: 'warning'
  }
  return types[type as keyof typeof types] || 'info'
}

const getLogLevelLabel = (level: string) => {
  const labels = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return labels[level as keyof typeof labels] || level
}

const getLogLevelTagType = (level: string) => {
  const types = {
    info: 'primary',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  }
  return types[level as keyof typeof types] || 'info'
}

const getTimelineType = (level: string) => {
  const types = {
    info: 'primary',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  }
  return types[level as keyof typeof types] || 'primary'
}

const getTimelineColor = (level: string) => {
  const colors = {
    info: '#409eff',
    warning: '#e6a23c',
    error: '#f56c6c',
    critical: '#f56c6c'
  }
  return colors[level as keyof typeof colors] || '#409eff'
}

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleDateRangeChange = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  logTypeFilter.value = ''
  logLevelFilter.value = ''
  dateRange.value = null
  currentPage.value = 1
}

const refreshLogs = async () => {
  logsLoading.value = true
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('日志已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    logsLoading.value = false
  }
}

const exportLogs = () => {
  ElMessage.info('导出功能开发中')
}

const handleSelectionChange = (selection: AuditLog[]) => {
  selectedLogs.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const viewLogDetail = (log: AuditLog) => {
  selectedLog.value = log
  logDetailVisible.value = true
}

const handleLogAction = async (command: { action: string; log: AuditLog }) => {
  const { action, log } = command
  
  switch (action) {
    case 'copy':
      await copyLog(log)
      break
    case 'export':
      exportLog(log)
      break
    case 'related':
      viewRelatedLogs(log)
      break
  }
}

const copyLog = async (log: AuditLog) => {
  try {
    const logText = `时间: ${formatDateTime(log.timestamp)}\n用户: ${log.user?.name || '系统'}\n操作: ${log.action}\nIP: ${log.ip_address}\n状态: ${log.success ? '成功' : '失败'}`
    await navigator.clipboard.writeText(logText)
    ElMessage.success('日志已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const exportLog = (log: AuditLog) => {
  ElMessage.info(`导出日志: ${log.id}`)
}

const viewRelatedLogs = (log: AuditLog) => {
  // 查看相关日志（相同用户或IP的日志）
  if (log.user) {
    searchQuery.value = log.user.email
  } else {
    searchQuery.value = log.ip_address
  }
  ElMessage.info('已筛选相关日志')
}

const resetLogDetail = () => {
  selectedLog.value = null
}

const copyLogDetail = async () => {
  if (!selectedLog.value) return
  
  try {
    const logDetail = JSON.stringify(selectedLog.value, null, 2)
    await navigator.clipboard.writeText(logDetail)
    ElMessage.success('日志详情已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const exportLogDetail = () => {
  if (!selectedLog.value) return
  
  ElMessage.info('导出日志详情功能开发中')
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的日志数据
  // loadAuditLogs()
})
</script>

<style scoped lang="scss">
.content-section {
  animation: slideInRight 0.4s ease-out;
}

.section-header {
  margin-bottom: 32px;
  
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

// 日志概览卡片
.logs-overview {
  margin-bottom: 32px;
}

.overview-card {
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
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

.card-icon {
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
  
  &.total {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.today {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.errors {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }
  
  &.security {
    background: linear-gradient(135deg, #ff6b6b, #feca57);
  }
}

.card-content {
  .card-value {
    font-size: 28px;
    font-weight: 800;
    color: #111827;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .card-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 600;
  }
}

// 筛选卡片
.filter-card {
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.filter-row {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }
}

.filter-actions {
  display: flex;
  gap: 12px;
}

// 日志卡片
.logs-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.logs-title {
  display: flex;
  align-items: center;
  gap: 12px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  
  .logs-count {
    font-size: 14px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 6px;
  }
}

.logs-actions {
  display: flex;
  gap: 12px;
}

// 表格视图
.table-view {
  .log-time {
    .time-primary {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 2px;
    }
    
    .time-secondary {
      font-size: 12px;
      color: #6b7280;
    }
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }
  
  .user-details {
    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 2px;
    }
    
    .user-email {
      font-size: 12px;
      color: #6b7280;
    }
  }
  
  .log-action {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .action-tag {
      flex-shrink: 0;
    }
    
    .action-description {
      font-size: 14px;
      color: #111827;
      line-height: 1.4;
    }
  }
  
  .ip-address {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: #374151;
  }
  
  .location {
    font-size: 14px;
    color: #6b7280;
  }
}

// 时间线视图
.timeline-view {
  :deep(.el-timeline) {
    padding-left: 0;
  }
  
  :deep(.el-timeline-item__timestamp) {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }
}

.timeline-content {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-user {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .avatar-placeholder {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
  }
  
  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
}

.timeline-tags {
  display: flex;
  gap: 8px;
}

.timeline-body {
  margin-bottom: 12px;
  
  .action-description {
    font-size: 16px;
    font-weight: 500;
    color: #111827;
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .log-details {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #6b7280;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.timeline-footer {
  display: flex;
  justify-content: flex-end;
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

// 日志详情对话框
.log-detail {
  .detail-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    }
  }
  
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      &.full-width {
        grid-column: 1 / -1;
      }
      
      label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      span {
        font-size: 14px;
        color: #111827;
        
        &.user-agent {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          word-break: break-all;
        }
      }
    }
  }
  
  .action-description {
    font-size: 16px;
    color: #111827;
    line-height: 1.5;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
  }
  
  .json-viewer {
    background: #1f2937;
    border-radius: 8px;
    padding: 16px;
    overflow-x: auto;
    
    pre {
      color: #e5e7eb;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      line-height: 1.5;
      margin: 0;
    }
  }
  
  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 12px;
    color: #dc2626;
    font-size: 14px;
    line-height: 1.5;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Element UI组件样式
:deep(.el-table) {
  .el-table__header {
    th {
      background: #f8fafc;
      color: #374151;
      font-weight: 600;
      border-bottom: 1px solid #e5e7eb;
    }
  }
  
  .el-table__row {
    &:hover {
      background: #f8fafc;
    }
  }
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.el-input) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-date-editor) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
}

:deep(.el-dialog) {
  border-radius: 12px;
  
  .el-dialog__header {
    padding: 24px 24px 0;
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    padding: 0 24px 24px;
  }
}

:deep(.el-timeline-item__node) {
  width: 12px;
  height: 12px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 24px;
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
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-row {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .filter-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .logs-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .logs-actions {
    justify-content: center;
  }
  
  .filter-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .filter-group {
    .el-input,
    .el-select,
    .el-date-editor {
      width: 100% !important;
    }
  }
  
  .overview-card {
    padding: 16px;
  }
  
  .logs-card :deep(.el-card__body) {
    padding: 16px;
  }
  
  .filter-card :deep(.el-card__body) {
    padding: 16px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    
    .detail-item.full-width {
      grid-column: 1;
    }
  }
}
</style>