<template>
  <div class="third-party-apps">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>第三方应用管理</h1>
        <p>管理接入SSO系统的第三方应用</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建应用
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="24" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总应用数</div>
          </div>
          <div class="stat-icon total">
            <el-icon><Grid /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.active }}</div>
            <div class="stat-label">活跃应用</div>
          </div>
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.inactive }}</div>
            <div class="stat-label">停用应用</div>
          </div>
          <div class="stat-icon inactive">
            <el-icon><Close /></el-icon>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.suspended }}</div>
            <div class="stat-label">暂停应用</div>
          </div>
          <div class="stat-icon suspended">
            <el-icon><Warning /></el-icon>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            placeholder="搜索应用名称、客户端ID"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="loadApplications">
            <el-option label="全部" value="" />
            <el-option label="活跃" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="暂停" value="suspended" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="typeFilter" placeholder="类型筛选" clearable @change="loadApplications">
            <el-option label="全部" value="" />
            <el-option label="Web应用" value="web" />
            <el-option label="移动应用" value="mobile" />
            <el-option label="桌面应用" value="desktop" />
            <el-option label="API应用" value="api" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <div class="filter-actions">
            <el-button @click="resetFilters">重置</el-button>
            <el-button type="primary" @click="exportApplications">导出</el-button>
            <el-button @click="loadApplications">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 应用列表 -->
    <el-card class="table-card">
      <el-table
        :data="applications"
        v-loading="loading"
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="应用名称" sortable min-width="200">
          <template #default="{ row }">
            <div class="app-info">
              <div class="app-avatar">
                <img v-if="row.logo_url" :src="row.logo_url" :alt="row.name" />
                <el-icon v-else><Grid /></el-icon>
              </div>
              <div class="app-details">
                <div class="app-name">{{ row.name }}</div>
                <div class="app-description">{{ row.description }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="client_id" label="客户端ID" width="180">
          <template #default="{ row }">
            <el-text class="client-id" copyable>{{ row.client_id }}</el-text>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="owner_name" label="创建者" width="120" />
        
        <el-table-column prop="usage_count" label="使用次数" width="100" sortable>
          <template #default="{ row }">
            <el-text type="primary">{{ row.usage_count.toLocaleString() }}</el-text>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="viewApplication(row)" title="查看详情">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button size="small" @click="manageUsers(row)" type="primary" title="查看用户">
                <el-icon><User /></el-icon>
              </el-button>
              <el-dropdown @command="handleCommand" trigger="click">
                <el-button size="small" title="更多操作">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'edit', row }">
                      <el-icon><Edit /></el-icon>
                      编辑应用
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'credentials', row }">
                      <el-icon><Key /></el-icon>
                      凭证管理
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'delete', row }" divided>
                      <el-icon><Delete /></el-icon>
                      删除应用
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadApplications"
          @current-change="loadApplications"
        />
      </div>
    </el-card>

    <!-- 创建/编辑应用对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingApp ? '编辑应用' : '创建应用'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="appFormRef"
        :model="appForm"
        :rules="appFormRules"
        label-width="100px"
      >
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="appForm.name" placeholder="请输入应用名称" />
        </el-form-item>
        
        <el-form-item label="应用描述" prop="description">
          <el-input
            v-model="appForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入应用描述"
          />
        </el-form-item>
        
        <el-form-item label="应用类型" prop="type">
          <el-select v-model="appForm.type" placeholder="请选择应用类型">
            <el-option label="Web应用" value="web" />
            <el-option label="移动应用" value="mobile" />
            <el-option label="桌面应用" value="desktop" />
            <el-option label="API应用" value="api" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="回调地址" prop="redirect_uris">
          <el-input
            v-model="redirectUrisText"
            type="textarea"
            :rows="3"
            placeholder="请输入回调地址，多个地址用换行分隔"
          />
        </el-form-item>
        
        <el-form-item label="权限范围" prop="scopes">
          <el-checkbox-group v-model="appForm.scopes">
            <el-checkbox label="read">读取权限</el-checkbox>
            <el-checkbox label="write">写入权限</el-checkbox>
            <el-checkbox label="admin">管理权限</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="主页地址">
          <el-input v-model="appForm.homepage_url" placeholder="请输入应用主页地址" />
        </el-form-item>
        
        <el-form-item label="应用状态" prop="status">
          <el-select v-model="appForm.status" placeholder="请选择应用状态">
            <el-option label="活跃" value="active" />
            <el-option label="停用" value="inactive" />
            <el-option label="暂停" value="suspended" />
            <el-option label="维护中" value="maintenance" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveApplication" :loading="saving">
          {{ editingApp ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 应用详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="应用详情" width="800px">
      <div v-if="selectedApp" class="app-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="应用名称">{{ selectedApp.name }}</el-descriptions-item>
          <el-descriptions-item label="客户端ID">{{ selectedApp.client_id }}</el-descriptions-item>
          <el-descriptions-item label="应用类型">
            <el-tag :type="getTypeTagType(selectedApp.type)">{{ getTypeLabel(selectedApp.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(selectedApp.status)">{{ getStatusLabel(selectedApp.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建者">{{ selectedApp.owner_name }}</el-descriptions-item>
          <el-descriptions-item label="使用次数">{{ selectedApp.usage_count.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedApp.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(selectedApp.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="应用描述" :span="2">{{ selectedApp.description }}</el-descriptions-item>
          <el-descriptions-item label="主页地址" :span="2">
            <el-link :href="selectedApp.homepage_url" target="_blank">{{ selectedApp.homepage_url }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="回调地址" :span="2">
            <div v-for="uri in selectedApp.redirect_uris" :key="uri" class="redirect-uri">
              {{ uri }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="权限范围" :span="2">
            <el-tag v-for="scope in selectedApp.scopes" :key="scope" class="scope-tag">
              {{ scope }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 凭证管理对话框 -->
    <el-dialog v-model="showCredentialsDialog" title="凭证管理" width="800px">
      <div v-if="selectedApp" class="credentials-management">
        <div class="credentials-header">
          <h3>{{ selectedApp.name }} - 凭证管理</h3>
          <el-button type="primary" @click="generateCredentials">
            <el-icon><Plus /></el-icon>
            生成新凭证
          </el-button>
        </div>
        
        <el-table :data="credentials" v-loading="credentialsLoading">
          <el-table-column prop="id" label="凭证ID" width="200" />
          <el-table-column prop="scopes" label="权限范围" width="200">
            <template #default="{ row }">
              <el-tag v-for="scope in row.scopes" :key="scope" size="small" class="scope-tag">
                {{ scope }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="expires_at" label="过期时间" width="180">
            <template #default="{ row }">
              {{ row.expires_at ? formatDate(row.expires_at) : '永不过期' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '活跃' : '已撤销' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'active'"
                size="small" 
                type="danger" 
                @click="revokeCredential(row.id)"
              >
                撤销
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="secret-management">
          <h4>应用密钥管理</h4>
          <el-alert
            title="安全提示"
            description="应用密钥用于客户端认证，请妥善保管。重新生成密钥后，旧密钥将立即失效。"
            type="warning"
            :closable="false"
            class="security-alert"
          />
          <div class="secret-actions">
            <el-button type="danger" @click="regenerateAppSecret">
              <el-icon><Refresh /></el-icon>
              重新生成密钥
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Grid, Check, Close, Warning, Search, Refresh, View, Edit, Key, Delete, User, MoreFilled } from '@element-plus/icons-vue'
import type { Application, ApplicationStats } from '@/types/application'
import { applicationsAPI, credentialsAPI } from '@/utils/api'
import { debounce } from 'lodash-es'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const credentialsLoading = ref(false)
const applications = ref<Application[]>([])
const credentials = ref<any[]>([])
const stats = ref<ApplicationStats>({
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0
})

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 对话框状态
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const showCredentialsDialog = ref(false)
const editingApp = ref<Application | null>(null)
const selectedApp = ref<Application | null>(null)

// 表单数据
const appFormRef = ref()
const appForm = reactive({
  name: '',
  description: '',
  type: 'web',
  redirect_uris: [] as string[],
  scopes: ['read'],
  homepage_url: '',
  status: 'active'
})

const redirectUrisText = ref('')

// 表单验证规则
const appFormRules = {
  name: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 2, max: 50, message: '应用名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入应用描述', trigger: 'blur' },
    { max: 200, message: '应用描述不能超过 200 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择应用类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择应用状态', trigger: 'change' }
  ]
}

// 计算属性
const handleSearch = debounce(() => {
  currentPage.value = 1
  loadApplications()
}, 300)

// 方法
const loadApplications = async () => {
  loading.value = true
  try {
    // 使用mock数据
    const mockApplications: Application[] = [
      {
        id: '1',
        name: 'OA办公系统',
        description: '企业办公自动化系统，包含考勤、审批、文档管理等功能',
        client_id: 'oa_system_client',
        client_secret: 'oa_secret_123',
        redirect_uris: ['https://oa.example.com/callback', 'https://oa.example.com/auth'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'admin1',
        owner_name: '系统管理员',
        usage_count: 1250,
        logo_url: '',
        homepage_url: 'https://oa.example.com',
        created_at: '2024-01-15T08:30:00Z',
        updated_at: '2024-01-20T14:22:00Z'
      },
      {
        id: '2',
        name: 'CRM客户管理',
        description: '客户关系管理系统，帮助企业更好地管理客户信息和销售流程',
        client_id: 'crm_system_client',
        client_secret: 'crm_secret_456',
        redirect_uris: ['https://crm.example.com/callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'admin1',
        owner_name: '系统管理员',
        usage_count: 890,
        logo_url: '',
        homepage_url: 'https://crm.example.com',
        created_at: '2024-01-10T10:15:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      {
        id: '3',
        name: '财务管理系统',
        description: '企业财务管理系统，提供财务报表、预算管理、成本控制等功能',
        client_id: 'finance_system_client',
        client_secret: 'finance_secret_789',
        redirect_uris: ['https://finance.example.com/callback'],
        scopes: ['read', 'write', 'admin'],
        allowed_scopes: ['read', 'write', 'admin'],
        status: 'maintenance',
        type: 'web',
        owner_id: 'admin2',
        owner_name: '财务部门',
        usage_count: 567,
        logo_url: '',
        homepage_url: 'https://finance.example.com',
        created_at: '2024-01-05T14:20:00Z',
        updated_at: '2024-01-22T09:30:00Z'
      },
      {
        id: '4',
        name: 'HR人事系统',
        description: '人力资源管理系统，包含员工档案、薪资管理、绩效考核、招聘管理等',
        client_id: 'hr_system_client',
        client_secret: 'hr_secret_101',
        redirect_uris: ['https://hr.example.com/callback', 'https://hr.example.com/sso'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'web',
        owner_id: 'admin3',
        owner_name: 'HR部门',
        usage_count: 1120,
        logo_url: '',
        homepage_url: 'https://hr.example.com',
        created_at: '2024-01-08T11:45:00Z',
        updated_at: '2024-01-19T13:15:00Z'
      },
      {
        id: '5',
        name: '移动办公APP',
        description: '企业移动办公应用，支持移动考勤、审批、通讯录等功能',
        client_id: 'mobile_app_client',
        client_secret: 'mobile_secret_202',
        redirect_uris: ['com.example.mobile://callback'],
        scopes: ['read', 'write'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        type: 'mobile',
        owner_id: 'admin1',
        owner_name: '系统管理员',
        usage_count: 2340,
        logo_url: '',
        homepage_url: 'https://mobile.example.com',
        created_at: '2024-01-12T16:00:00Z',
        updated_at: '2024-01-21T10:30:00Z'
      },
      {
        id: '6',
        name: 'API服务接口',
        description: '第三方API服务接口，提供数据查询和业务处理能力',
        client_id: 'api_service_client',
        client_secret: 'api_secret_303',
        redirect_uris: [],
        scopes: ['read'],
        allowed_scopes: ['read'],
        status: 'suspended',
        type: 'api',
        owner_id: 'admin4',
        owner_name: '技术部门',
        usage_count: 156,
        logo_url: '',
        homepage_url: 'https://api.example.com',
        created_at: '2024-01-03T09:20:00Z',
        updated_at: '2024-01-16T15:40:00Z'
      }
    ]
    
    // 应用筛选逻辑
    let filteredApps = mockApplications
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filteredApps = filteredApps.filter(app => 
        app.name.toLowerCase().includes(query) || 
        app.client_id.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
      )
    }
    
    if (statusFilter.value) {
      filteredApps = filteredApps.filter(app => app.status === statusFilter.value)
    }
    
    if (typeFilter.value) {
      filteredApps = filteredApps.filter(app => app.type === typeFilter.value)
    }
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    applications.value = filteredApps.slice(start, end)
    total.value = filteredApps.length
    
    // 更新统计数据
    stats.value = {
      total: mockApplications.length,
      active: mockApplications.filter(app => app.status === 'active').length,
      inactive: mockApplications.filter(app => app.status === 'inactive').length,
      suspended: mockApplications.filter(app => app.status === 'suspended').length
    }
    
  } catch (error) {
    console.error('Failed to load applications:', error)
    ElMessage.error('加载应用列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  currentPage.value = 1
  loadApplications()
}

const handleSortChange = ({ prop, order }: any) => {
  // 实现排序逻辑
  console.log('Sort change:', prop, order)
}

const exportApplications = () => {
  ElMessage.success('导出功能开发中...')
}

const viewApplication = (app: Application) => {
  selectedApp.value = app
  showDetailDialog.value = true
}

const editApplication = (app: Application) => {
  editingApp.value = app
  Object.assign(appForm, {
    name: app.name,
    description: app.description,
    type: app.type,
    redirect_uris: app.redirect_uris,
    scopes: app.scopes,
    homepage_url: app.homepage_url || '',
    status: app.status
  })
  redirectUrisText.value = app.redirect_uris.join('\n')
  showCreateDialog.value = true
}

const deleteApplication = async (app: Application) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除应用 "${app.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('应用删除成功')
    loadApplications()
  } catch {
    // 用户取消删除
  }
}

const manageCredentials = async (app: Application) => {
  selectedApp.value = app
  showCredentialsDialog.value = true
  await loadCredentials(app.client_id)
}

const manageUsers = (app: Application) => {
  // 跳转到第三方应用详情页面的用户管理部分
  router.push({
    name: 'admin-third-party-app-detail',
    params: { id: app.id }
  })
}

const handleCommand = (command: { action: string; row: Application }) => {
  const { action, row } = command
  
  switch (action) {
    case 'edit':
      editApplication(row)
      break
    case 'credentials':
      manageCredentials(row)
      break
    case 'delete':
      deleteApplication(row)
      break
    default:
      console.warn('Unknown action:', action)
  }
}

const loadCredentials = async (clientId: string) => {
  credentialsLoading.value = true
  try {
    // 使用mock数据
    credentials.value = [
      {
        id: 'cred_001',
        client_id: clientId,
        scopes: ['read', 'write'],
        status: 'active',
        expires_at: '2024-12-31T23:59:59Z',
        created_at: '2024-01-15T08:30:00Z'
      },
      {
        id: 'cred_002',
        client_id: clientId,
        scopes: ['read'],
        status: 'revoked',
        expires_at: null,
        created_at: '2024-01-10T10:15:00Z'
      }
    ]
  } catch (error) {
    console.error('Failed to load credentials:', error)
    ElMessage.error('加载凭证列表失败')
  } finally {
    credentialsLoading.value = false
  }
}

const generateCredentials = async () => {
  if (!selectedApp.value) return
  
  try {
    await ElMessageBox.confirm(
      '确定要为此应用生成新的访问凭证吗？',
      '确认生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    ElMessage.success('凭证生成成功')
    await loadCredentials(selectedApp.value.client_id)
  } catch {
    // 用户取消
  }
}

const revokeCredential = async (credentialId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要撤销此凭证吗？撤销后将无法恢复。',
      '确认撤销',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('凭证撤销成功')
    if (selectedApp.value) {
      await loadCredentials(selectedApp.value.client_id)
    }
  } catch {
    // 用户取消
  }
}

const regenerateAppSecret = async () => {
  if (!selectedApp.value) return
  
  try {
    await ElMessageBox.confirm(
      '确定要重新生成应用密钥吗？旧密钥将立即失效，请确保已更新客户端配置。',
      '确认重新生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('应用密钥重新生成成功')
  } catch {
    // 用户取消
  }
}

const saveApplication = async () => {
  if (!appFormRef.value) return
  
  try {
    await appFormRef.value.validate()
    
    saving.value = true
    
    // 处理回调地址
    appForm.redirect_uris = redirectUrisText.value
      .split('\n')
      .map(uri => uri.trim())
      .filter(uri => uri.length > 0)
    
    if (editingApp.value) {
      ElMessage.success('应用更新成功')
    } else {
      ElMessage.success('应用创建成功')
    }
    
    showCreateDialog.value = false
    resetForm()
    loadApplications()
  } catch (error) {
    console.error('Save application failed:', error)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  editingApp.value = null
  Object.assign(appForm, {
    name: '',
    description: '',
    type: 'web',
    redirect_uris: [],
    scopes: ['read'],
    homepage_url: '',
    status: 'active'
  })
  redirectUrisText.value = ''
  appFormRef.value?.resetFields()
}

// 工具方法
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    web: 'Web应用',
    mobile: '移动应用',
    desktop: '桌面应用',
    api: 'API应用'
  }
  return labels[type] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    web: 'primary',
    mobile: 'success',
    desktop: 'info',
    api: 'warning'
  }
  return types[type] || 'primary'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: '活跃',
    inactive: '停用',
    suspended: '暂停',
    maintenance: '维护中'
  }
  return labels[status] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    inactive: 'info',
    suspended: 'warning',
    maintenance: 'danger'
  }
  return types[status] || 'primary'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 组件挂载
onMounted(() => {
  loadApplications()
})
</script>

<style scoped lang="scss">
.third-party-apps {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  
  .header-content {
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }
    
    p {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }
  }
  
  .header-actions {
    :deep(.el-button) {
      border-radius: 8px;
      font-weight: 600;
    }
  }
}

.stats-cards {
  margin-bottom: 24px;
  
  .stat-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    :deep(.el-card__body) {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .stat-content {
    .stat-number {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    
    &.total {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    
    &.active {
      background: linear-gradient(135deg, #84fab0, #8fd3f4);
      color: #059669;
    }
    
    &.inactive {
      background: linear-gradient(135deg, #a8edea, #fed6e3);
      color: #6b7280;
    }
    
    &.suspended {
      background: linear-gradient(135deg, #ffecd2, #fcb69f);
      color: #d97706;
    }
  }
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  :deep(.el-card__body) {
    padding: 24px;
  }
  
  .filter-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}

.table-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  :deep(.el-card__body) {
    padding: 0;
  }
  
  :deep(.el-table) {
    border-radius: 12px;
    
    .el-table__header {
      background: #f8fafc;
      
      th {
        background: transparent;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
      }
    }
    
    .el-table__body {
      tr:hover {
        background: #f8fafc;
      }
    }
  }
}

.app-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .app-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    
    img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
  }
  
  .app-details {
    .app-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }
    
    .app-description {
      font-size: 12px;
      color: #6b7280;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.client-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .el-dropdown {
    .el-button {
      padding: 6px 8px;
    }
  }
}

.pagination-wrapper {
  padding: 24px;
  display: flex;
  justify-content: center;
}

.app-detail {
  .redirect-uri {
    margin-bottom: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
  }
  
  .scope-tag {
    margin-right: 8px;
    margin-bottom: 4px;
  }
}

.credentials-management {
  .credentials-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h3 {
      margin: 0;
      color: #1f2937;
    }
  }
  
  .scope-tag {
    margin-right: 4px;
    margin-bottom: 4px;
  }
  
  .secret-management {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
    
    h4 {
      margin: 0 0 16px 0;
      color: #1f2937;
    }
    
    .security-alert {
      margin-bottom: 16px;
    }
    
    .secret-actions {
      display: flex;
      gap: 12px;
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .stats-cards {
    .el-col {
      margin-bottom: 16px;
    }
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .third-party-apps {
    padding: 16px;
  }
  
  .page-header {
    .header-content h1 {
      font-size: 24px;
    }
  }
  
  .filter-card {
    :deep(.el-row) {
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>