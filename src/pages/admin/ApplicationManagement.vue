<template>
  <div class="content-section">
    <div class="section-header">
      <h2>应用管理</h2>
      <p>管理系统中的所有应用和OAuth配置</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-filters">
        <el-input
          v-model="searchQuery"
          placeholder="搜索应用名称或描述"
          prefix-icon="Search"
          clearable
          style="width: 300px;"
          @input="handleSearch"
        />
        
        <el-select
          v-model="statusFilter"
          placeholder="状态筛选"
          clearable
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="维护中" value="maintenance" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        
        <el-select
          v-model="typeFilter"
          placeholder="类型筛选"
          clearable
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="Web应用" value="web" />
          <el-option label="移动应用" value="mobile" />
          <el-option label="桌面应用" value="desktop" />
          <el-option label="API服务" value="api" />
        </el-select>
      </div>
      
      <div class="action-buttons">
        <el-button @click="exportApplications">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="primary" @click="showCreateAppDialog">
          <el-icon><Plus /></el-icon>
          新建应用
        </el-button>
      </div>
    </div>

    <!-- 应用统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ appStats.total }}</div>
              <div class="stat-label">应用总数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ appStats.active }}</div>
              <div class="stat-label">活跃应用</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon requests">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ appStats.requests }}</div>
              <div class="stat-label">今日请求</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ appStats.users }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 应用列表 -->
    <el-card class="apps-table-card">
      <template #header>
        <div class="card-header">
          <span>应用列表</span>
          <div class="table-actions">
            <el-button size="small" @click="refreshApplications">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="filteredApplications"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="应用信息" min-width="250">
          <template #default="{ row }">
            <div class="app-info">
              <div class="app-icon" :class="row.type">
                <el-icon>
                  <Grid v-if="row.type === 'web'" />
                  <Iphone v-else-if="row.type === 'mobile'" />
                  <Monitor v-else-if="row.type === 'desktop'" />
                  <Connection v-else />
                </el-icon>
              </div>
              <div class="app-details">
                <div class="app-name">{{ row.name }}</div>
                <div class="app-description">{{ row.description }}</div>
                <div class="app-url" v-if="row.homepage_url">
                  <el-link :href="row.homepage_url" target="_blank" type="primary">
                    {{ row.homepage_url }}
                  </el-link>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="客户端ID" width="200">
          <template #default="{ row }">
            <div class="client-id">
              <code>{{ row.client_id }}</code>
              <el-button 
                size="small" 
                text 
                @click="copyToClipboard(row.client_id)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="创建者" width="120">
          <template #default="{ row }">
            {{ row.created_by }}
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="最后更新" width="120">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewApplication(row)">
              查看
            </el-button>
            <el-button size="small" type="primary" @click="editApplication(row)">
              编辑
            </el-button>
            <el-dropdown @command="handleAppAction">
              <el-button size="small">
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'toggle-status', app: row }">
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'reset-secret', app: row }">
                    重置密钥
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'view-logs', app: row }">
                    查看日志
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'view-users', app: row }">
                    查看用户
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="{ action: 'delete', app: row }"
                    divided
                  >
                    删除应用
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
          :total="totalApplications"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑应用对话框 -->
    <el-dialog
      v-model="appDialogVisible"
      :title="isEditMode ? '编辑应用' : '创建应用'"
      width="800px"
      @close="resetAppForm"
    >
      <el-form
        ref="appFormRef"
        :model="appForm"
        :rules="appFormRules"
        label-width="120px"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="应用名称" prop="name">
              <el-input v-model="appForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应用类型" prop="type">
              <el-select v-model="appForm.type" style="width: 100%;">
                <el-option label="Web应用" value="web" />
                <el-option label="移动应用" value="mobile" />
                <el-option label="桌面应用" value="desktop" />
                <el-option label="API服务" value="api" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="应用描述" prop="description">
          <el-input 
            v-model="appForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入应用描述"
          />
        </el-form-item>
        
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="主页URL" prop="homepage_url">
              <el-input v-model="appForm.homepage_url" placeholder="https://" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="appForm.status" style="width: 100%;">
                <el-option label="活跃" value="active" />
                <el-option label="维护中" value="maintenance" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="回调URL" prop="redirect_uris">
          <div class="redirect-uris">
            <div 
              v-for="(uri, index) in appForm.redirect_uris" 
              :key="index" 
              class="uri-item"
            >
              <el-input 
                v-model="appForm.redirect_uris[index]" 
                placeholder="https://example.com/callback"
              />
              <el-button 
                type="danger" 
                text 
                @click="removeRedirectUri(index)"
                :disabled="appForm.redirect_uris.length <= 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" text @click="addRedirectUri">
              <el-icon><Plus /></el-icon>
              添加回调URL
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="权限范围">
          <el-checkbox-group v-model="appForm.scopes">
            <el-checkbox label="read" border>读取权限</el-checkbox>
            <el-checkbox label="write" border>写入权限</el-checkbox>
            <el-checkbox label="admin" border>管理权限</el-checkbox>
            <el-checkbox label="profile" border>用户资料</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="appDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitAppForm">
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 应用详情对话框 -->
    <el-dialog
      v-model="appDetailDialogVisible"
      title="应用详情"
      width="900px"
    >
      <div v-if="selectedApp" class="app-detail">
        <div class="app-header">
          <div class="app-icon large" :class="selectedApp.type">
            <el-icon>
              <Grid v-if="selectedApp.type === 'web'" />
              <Iphone v-else-if="selectedApp.type === 'mobile'" />
              <Monitor v-else-if="selectedApp.type === 'desktop'" />
              <Connection v-else />
            </el-icon>
          </div>
          <div class="app-info">
            <h3>{{ selectedApp.name }}</h3>
            <p>{{ selectedApp.description }}</p>
            <div class="app-tags">
              <el-tag :type="getTypeTagType(selectedApp.type)">
                {{ getTypeLabel(selectedApp.type) }}
              </el-tag>
              <el-tag :type="getStatusTagType(selectedApp.status)">
                {{ getStatusLabel(selectedApp.status) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="应用ID">{{ selectedApp.id }}</el-descriptions-item>
              <el-descriptions-item label="客户端ID">
                <div class="client-id">
                  <code>{{ selectedApp.client_id }}</code>
                  <el-button 
                    size="small" 
                    text 
                    @click="copyToClipboard(selectedApp.client_id)"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="客户端密钥">
                <div class="client-secret">
                  <code v-if="showSecret">{{ selectedApp.client_secret }}</code>
                  <code v-else>••••••••••••••••</code>
                  <el-button 
                    size="small" 
                    text 
                    @click="toggleSecret"
                  >
                    <el-icon><View v-if="!showSecret" /><Hide v-else /></el-icon>
                  </el-button>
                  <el-button 
                    v-if="showSecret"
                    size="small" 
                    text 
                    @click="copyToClipboard(selectedApp.client_secret)"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="主页URL">
                <el-link v-if="selectedApp.homepage_url" :href="selectedApp.homepage_url" target="_blank">
                  {{ selectedApp.homepage_url }}
                </el-link>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="创建者">{{ selectedApp.created_by }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDate(selectedApp.created_at) }}</el-descriptions-item>
              <el-descriptions-item label="最后更新">{{ formatDate(selectedApp.updated_at) }}</el-descriptions-item>
              <el-descriptions-item label="权限范围">
                <el-tag v-for="scope in selectedApp.scopes" :key="scope" size="small" style="margin-right: 8px;">
                  {{ getScopeLabel(scope) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="回调URL" name="callbacks">
            <div class="callback-urls">
              <div v-for="(uri, index) in selectedApp.redirect_uris" :key="index" class="callback-item">
                <el-input :value="uri" readonly>
                  <template #append>
                    <el-button @click="copyToClipboard(uri)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="使用统计" name="stats">
            <div class="app-stats">
              <el-row :gutter="24">
                <el-col :span="8">
                  <div class="stat-item">
                    <div class="stat-number">{{ selectedApp.stats?.total_requests || 0 }}</div>
                    <div class="stat-label">总请求数</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <div class="stat-number">{{ selectedApp.stats?.active_users || 0 }}</div>
                    <div class="stat-label">活跃用户</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <div class="stat-number">{{ selectedApp.stats?.success_rate || 0 }}%</div>
                    <div class="stat-label">成功率</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">


interface Application {
  id: string
  name: string
  description: string
  type: 'web' | 'mobile' | 'desktop' | 'api'
  status: 'active' | 'maintenance' | 'disabled'
  client_id: string
  client_secret: string
  homepage_url?: string
  redirect_uris: string[]
  scopes: string[]
  created_by: string
  created_at: string
  updated_at: string
  stats?: {
    total_requests: number
    active_users: number
    success_rate: number
  }
}

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedApps = ref<Application[]>([])

// 对话框状态
const appDialogVisible = ref(false)
const appDetailDialogVisible = ref(false)
const isEditMode = ref(false)
const selectedApp = ref<Application | null>(null)
const activeTab = ref('basic')
const showSecret = ref(false)

// 表单引用
const appFormRef = ref()

// 应用统计
const appStats = reactive({
  total: 45,
  active: 38,
  requests: 12580,
  users: 892
})

// 应用表单
const appForm = reactive({
  name: '',
  description: '',
  type: 'web' as Application['type'],
  status: 'active' as Application['status'],
  homepage_url: '',
  redirect_uris: [''],
  scopes: ['read', 'profile']
})

// 表单验证规则
const appFormRules: Record<string, any> = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 2, max: 50, message: '应用名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入应用描述', trigger: 'blur' },
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择应用类型', trigger: 'change' }
  ],
  homepage_url: [
    { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
  ]
}

// 模拟应用数据
const applications = ref<Application[]>([
  {
    id: '1',
    name: '项目管理系统',
    description: '企业级项目管理和协作平台',
    type: 'web',
    status: 'active',
    client_id: 'pm_client_123456789',
    client_secret: 'pm_secret_abcdefghijklmnop',
    homepage_url: 'https://pm.example.com',
    redirect_uris: ['https://pm.example.com/callback', 'https://pm.example.com/auth/callback'],
    scopes: ['read', 'write', 'profile'],
    created_by: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    stats: {
      total_requests: 5420,
      active_users: 156,
      success_rate: 98.5
    }
  },
  {
    id: '2',
    name: '移动办公App',
    description: '移动端办公应用，支持考勤、审批等功能',
    type: 'mobile',
    status: 'active',
    client_id: 'mobile_client_987654321',
    client_secret: 'mobile_secret_qrstuvwxyz123456',
    redirect_uris: ['com.example.mobile://callback'],
    scopes: ['read', 'profile'],
    created_by: 'zhang.wei',
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-14T16:20:00Z',
    stats: {
      total_requests: 3280,
      active_users: 89,
      success_rate: 97.2
    }
  },
  {
    id: '3',
    name: 'API网关服务',
    description: '统一API网关，提供认证和路由功能',
    type: 'api',
    status: 'maintenance',
    client_id: 'api_gateway_456789123',
    client_secret: 'api_secret_789123456abcdef',
    redirect_uris: ['https://api.example.com/oauth/callback'],
    scopes: ['admin'],
    created_by: 'li.ming',
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-15T11:45:00Z',
    stats: {
      total_requests: 8950,
      active_users: 245,
      success_rate: 99.1
    }
  },
  {
    id: '4',
    name: '桌面客户端',
    description: '跨平台桌面应用程序',
    type: 'desktop',
    status: 'disabled',
    client_id: 'desktop_client_321654987',
    client_secret: 'desktop_secret_fedcba987654321',
    redirect_uris: ['http://localhost:8080/callback'],
    scopes: ['read', 'write'],
    created_by: 'wang.fang',
    created_at: '2024-01-08T11:20:00Z',
    updated_at: '2024-01-12T15:10:00Z',
    stats: {
      total_requests: 1250,
      active_users: 32,
      success_rate: 95.8
    }
  }
])

// 计算属性
const filteredApplications = computed(() => {
  let result = applications.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(app => 
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query)
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(app => app.status === statusFilter.value)
  }
  
  // 类型过滤
  if (typeFilter.value) {
    result = result.filter(app => app.type === typeFilter.value)
  }
  
  return result
})

const totalApplications = computed(() => filteredApplications.value.length)

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getTypeLabel = (type: string) => {
  const labels = {
    web: 'Web应用',
    mobile: '移动应用',
    desktop: '桌面应用',
    api: 'API服务'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeTagType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    web: 'primary',
    mobile: 'success',
    desktop: 'warning',
    api: 'info'
  }
  return types[type as keyof typeof types] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: '活跃',
    maintenance: '维护中',
    disabled: '禁用'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    maintenance: 'warning',
    disabled: 'danger'
  }
  return types[status as keyof typeof types] || 'info'
}

const getScopeLabel = (scope: string) => {
  const labels = {
    read: '读取权限',
    write: '写入权限',
    admin: '管理权限',
    profile: '用户资料'
  }
  return labels[scope as keyof typeof labels] || scope
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection: Application[]) => {
  selectedApps.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const refreshApplications = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('应用列表已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const exportApplications = () => {
  ElMessage.info('导出功能开发中')
}

const showCreateAppDialog = () => {
  isEditMode.value = false
  appDialogVisible.value = true
}

const viewApplication = (app: Application) => {
  selectedApp.value = app
  activeTab.value = 'basic'
  showSecret.value = false
  appDetailDialogVisible.value = true
}

const editApplication = (app: Application) => {
  isEditMode.value = true
  Object.assign(appForm, {
    name: app.name,
    description: app.description,
    type: app.type,
    status: app.status,
    homepage_url: app.homepage_url || '',
    redirect_uris: [...app.redirect_uris],
    scopes: [...app.scopes]
  })
  selectedApp.value = app
  appDialogVisible.value = true
}

const handleAppAction = async (command: { action: string; app: Application }) => {
  const { action, app } = command
  
  switch (action) {
    case 'toggle-status':
      await toggleAppStatus(app)
      break
    case 'reset-secret':
      await resetAppSecret(app)
      break
    case 'view-logs':
      viewAppLogs(app)
      break
    case 'view-users':
      viewAppUsers(app)
      break
    case 'delete':
      await deleteApplication(app)
      break
  }
}

const toggleAppStatus = async (app: Application) => {
  const newStatus = app.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}应用 "${app.name}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用实际的API
    app.status = newStatus
    app.updated_at = new Date().toISOString()
    ElMessage.success(`应用已${action}`)
  } catch {
    // 用户取消操作
  }
}

const resetAppSecret = async (app: Application) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置应用 "${app.name}" 的客户端密钥吗？\n重置后需要更新应用配置。`,
      '重置密钥',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用实际的API生成新密钥
    app.client_secret = 'new_secret_' + Date.now()
    app.updated_at = new Date().toISOString()
    ElMessage.success('客户端密钥已重置')
  } catch {
    // 用户取消操作
  }
}

const viewAppLogs = (app: Application) => {
  ElMessage.info(`查看应用 "${app.name}" 的访问日志`)
}

const viewAppUsers = (app: Application) => {
  ElMessage.info(`查看应用 "${app.name}" 的用户列表`)
}

const deleteApplication = async (app: Application) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除应用 "${app.name}" 吗？\n此操作不可恢复！`,
      '删除应用',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 这里应该调用实际的API
    const index = applications.value.findIndex(a => a.id === app.id)
    if (index > -1) {
      applications.value.splice(index, 1)
    }
    ElMessage.success('应用已删除')
  } catch {
    // 用户取消操作
  }
}

const addRedirectUri = () => {
  appForm.redirect_uris.push('')
}

const removeRedirectUri = (index: number) => {
  appForm.redirect_uris.splice(index, 1)
}

const toggleSecret = () => {
  showSecret.value = !showSecret.value
}

const submitAppForm = async () => {
  if (!appFormRef.value) return
  
  try {
    await appFormRef.value.validate()
    
    // 验证回调URL
    const validUris = appForm.redirect_uris.filter(uri => uri.trim())
    if (validUris.length === 0) {
      ElMessage.error('至少需要一个有效的回调URL')
      return
    }
    
    submitting.value = true
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEditMode.value && selectedApp.value) {
      // 更新应用
      Object.assign(selectedApp.value, {
        name: appForm.name,
        description: appForm.description,
        type: appForm.type,
        status: appForm.status,
        homepage_url: appForm.homepage_url,
        redirect_uris: validUris,
        scopes: appForm.scopes,
        updated_at: new Date().toISOString()
      })
      ElMessage.success('应用信息已更新')
    } else {
      // 创建新应用
      const newApp: Application = {
        id: Date.now().toString(),
        name: appForm.name,
        description: appForm.description,
        type: appForm.type,
        status: appForm.status,
        client_id: `client_${Date.now()}`,
        client_secret: `secret_${Date.now()}`,
        homepage_url: appForm.homepage_url,
        redirect_uris: validUris,
        scopes: appForm.scopes,
        created_by: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: {
          total_requests: 0,
          active_users: 0,
          success_rate: 0
        }
      }
      applications.value.unshift(newApp)
      ElMessage.success('应用创建成功')
    }
    
    appDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const resetAppForm = () => {
  if (appFormRef.value) {
    appFormRef.value.resetFields()
  }
  Object.assign(appForm, {
    name: '',
    description: '',
    type: 'web',
    status: 'active',
    homepage_url: '',
    redirect_uris: [''],
    scopes: ['read', 'profile']
  })
  selectedApp.value = null
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的应用数据
  // loadApplications()
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

// 操作栏
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.search-filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

// 统计卡片
.stats-cards {
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
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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
  
  &.total {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.active {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.requests {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
  
  &.users {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }
}

.stat-content {
  .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #111827;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 600;
  }
}

// 应用表格卡片
.apps-table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 24px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  :deep(.el-card__body) {
    padding: 0;
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
  }
}

.table-actions {
  display: flex;
  gap: 12px;
}

// 应用信息
.app-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.app-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .el-icon {
    font-size: 24px;
    color: white;
  }
  
  &.web {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.mobile {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.desktop {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
  
  &.api {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }
  
  &.large {
    width: 64px;
    height: 64px;
    
    .el-icon {
      font-size: 32px;
    }
  }
}

.app-details {
  flex: 1;
  
  .app-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .app-description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  
  .app-url {
    font-size: 13px;
  }
}

.client-id {
  display: flex;
  align-items: center;
  gap: 8px;
  
  code {
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #374151;
  }
}

.client-secret {
  display: flex;
  align-items: center;
  gap: 8px;
  
  code {
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #374151;
    min-width: 120px;
  }
}

// 分页
.pagination-wrapper {
  padding: 24px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f3f4f6;
}

// 表单样式
.redirect-uris {
  .uri-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
}

// 应用详情
.app-detail {
  .app-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
  }
  
  .app-info {
    h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }
    
    p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 12px 0;
      line-height: 1.4;
    }
  }
  
  .app-tags {
    display: flex;
    gap: 8px;
  }
}

.callback-urls {
  .callback-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.app-stats {
  .stat-item {
    text-align: center;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
    
    .stat-number {
      font-size: 32px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
    }
  }
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

:deep(.el-checkbox) {
  margin-right: 16px;
  margin-bottom: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  .action-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-filters {
    flex-wrap: wrap;
  }
  
  .stats-cards {
    :deep(.el-col) {
      margin-bottom: 16px;
    }
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .action-bar {
    padding: 16px;
  }
  
  .search-filters {
    flex-direction: column;
    align-items: stretch;
    
    .el-input,
    .el-select {
      width: 100% !important;
    }
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .apps-table-card {
    :deep(.el-card__header),
    .pagination-wrapper {
      padding: 16px;
    }
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  .app-detail .app-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>