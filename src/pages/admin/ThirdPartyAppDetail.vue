<template>
  <div class="third-party-app-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <el-button @click="goBack" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="app-title">
          <div class="app-avatar">
            <img v-if="appDetail.logo_url" :src="appDetail.logo_url" :alt="appDetail.name" />
            <el-icon v-else><Grid /></el-icon>
          </div>
          <div class="title-info">
            <h1>{{ appDetail.name }}</h1>
            <p>{{ appDetail.description }}</p>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="editApplication">
          <el-icon><Edit /></el-icon>
          编辑应用
        </el-button>
        <el-button type="primary" @click="showAddUserDialog = true">
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
      </div>
    </div>

    <!-- 应用基本信息 -->
    <el-row :gutter="24">
      <el-col :span="16">
        <!-- 用户管理 -->
        <el-card class="users-card">
          <template #header>
            <div class="card-header">
              <span>用户管理</span>
              <div class="header-actions">
                <el-input
                  v-model="userSearchQuery"
                  placeholder="搜索用户"
                  clearable
                  style="width: 200px; margin-right: 12px;"
                  @input="handleUserSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-select
                  v-model="userRoleFilter"
                  placeholder="角色筛选"
                  clearable
                  style="width: 120px; margin-right: 12px;"
                  @change="loadAppUsers"
                >
                  <el-option label="全部" value="" />
                  <el-option label="管理员" value="admin" />
                  <el-option label="普通用户" value="user" />
                </el-select>
                <el-select
                  v-model="userStatusFilter"
                  placeholder="状态筛选"
                  clearable
                  style="width: 120px;"
                  @change="loadAppUsers"
                >
                  <el-option label="全部" value="" />
                  <el-option label="活跃" value="active" />
                  <el-option label="禁用" value="disabled" />
                  <el-option label="待激活" value="pending" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- 用户统计 -->
          <div class="user-stats">
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.total }}</div>
                  <div class="stat-label">总用户数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.active }}</div>
                  <div class="stat-label">活跃用户</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.admin }}</div>
                  <div class="stat-label">管理员</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-item">
                  <div class="stat-value">{{ userStats.pending }}</div>
                  <div class="stat-label">待激活</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 用户列表 -->
          <el-table
            :data="filteredAppUsers"
            v-loading="usersLoading"
            stripe
            style="margin-top: 20px;"
          >
            <el-table-column prop="display_name" label="用户" width="200">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :size="32" :src="row.avatar">
                    {{ row.display_name?.charAt(0) || row.username.charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ row.display_name || row.username }}</div>
                    <div class="user-email">{{ row.email }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="getRoleTagType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="third_party_accounts" label="绑定账号" width="200">
              <template #default="{ row }">
                <div class="third-party-accounts">
                  <el-tag
                    v-for="account in row.third_party_accounts"
                    :key="account.provider"
                    size="small"
                    style="margin-right: 4px;"
                  >
                    {{ getProviderLabel(account.provider) }}
                  </el-tag>
                  <el-text v-if="!row.third_party_accounts?.length" type="info">未绑定</el-text>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="last_login" label="最后登录" width="180">
              <template #default="{ row }">
                {{ row.last_login ? formatDate(row.last_login) : '从未登录' }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button size="small" @click="viewUser(row)">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button size="small" @click="editAppUser(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" @click="manageUserBindings(row)">
                    <el-icon><Link /></el-icon>
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="removeUserFromApp(row)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="userCurrentPage"
              v-model:page-size="userPageSize"
              :total="userTotal"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadAppUsers"
              @current-change="loadAppUsers"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 应用详细信息 -->
        <el-card class="app-info-card">
          <template #header>
            <span>应用信息</span>
          </template>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="应用名称">{{ appDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="客户端ID">
              <el-text copyable>{{ appDetail.client_id }}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="应用类型">
              <el-tag :type="getTypeTagType(appDetail.type)">{{ getTypeLabel(appDetail.type) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusTagType(appDetail.status)">{{ getStatusLabel(appDetail.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建者">{{ appDetail.owner_name }}</el-descriptions-item>
            <el-descriptions-item label="使用次数">{{ appDetail.usage_count?.toLocaleString() }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(appDetail.created_at) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(appDetail.updated_at) }}</el-descriptions-item>
            <el-descriptions-item label="主页地址">
              <el-link :href="appDetail.homepage_url" target="_blank">{{ appDetail.homepage_url }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="应用描述" :span="2">{{ appDetail.description }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 权限配置 -->
        <el-card class="permissions-card" style="margin-top: 20px;">
          <template #header>
            <span>权限配置</span>
          </template>
          
          <div class="permissions-list">
            <div class="permission-item" v-for="scope in appDetail.scopes" :key="scope">
              <el-tag>{{ getScopeLabel(scope) }}</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 快速操作 -->
        <el-card class="quick-actions-card" style="margin-top: 20px;">
          <template #header>
            <span>快速操作</span>
          </template>
          
          <div class="quick-actions">
            <el-button @click="resetAppSecret" type="warning" style="width: 100%; margin-bottom: 12px;">
              <el-icon><Key /></el-icon>
              重置应用密钥
            </el-button>
            <el-button @click="exportAppUsers" style="width: 100%; margin-bottom: 12px;">
              <el-icon><Download /></el-icon>
              导出用户列表
            </el-button>
            <el-button @click="viewAuditLogs" style="width: 100%;">
              <el-icon><Document /></el-icon>
              查看审计日志
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="showAddUserDialog"
      title="添加用户到应用"
      width="600px"
    >
      <el-form :model="addUserForm" label-width="100px">
        <el-form-item label="选择用户">
          <el-select
            v-model="addUserForm.user_id"
            placeholder="请选择用户"
            filterable
            remote
            :remote-method="searchUsers"
            :loading="searchLoading"
            style="width: 100%;"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.display_name || user.username} (${user.email})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="addUserForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限范围">
          <el-checkbox-group v-model="addUserForm.permissions">
            <el-checkbox label="read">读取权限</el-checkbox>
            <el-checkbox label="write">写入权限</el-checkbox>
            <el-checkbox label="admin">管理权限</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddUserDialog = false">取消</el-button>
        <el-button type="primary" @click="addUserToApp" :loading="addUserLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="showEditUserDialog"
      title="编辑用户权限"
      width="600px"
    >
      <el-form :model="editUserForm" label-width="100px">
        <el-form-item label="用户信息">
          <div class="user-info">
            <el-avatar :size="40" :src="selectedAppUser?.avatar">
              {{ selectedAppUser?.display_name?.charAt(0) || selectedAppUser?.username.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ selectedAppUser?.display_name || selectedAppUser?.username }}</div>
              <div class="user-email">{{ selectedAppUser?.email }}</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="editUserForm.role" placeholder="请选择角色">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="editUserForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="待激活" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限范围">
          <el-checkbox-group v-model="editUserForm.permissions">
            <el-checkbox label="read">读取权限</el-checkbox>
            <el-checkbox label="write">写入权限</el-checkbox>
            <el-checkbox label="admin">管理权限</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditUserDialog = false">取消</el-button>
        <el-button type="primary" @click="updateAppUser" :loading="updateUserLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 用户绑定管理对话框 -->
    <el-dialog
      v-model="showBindingDialog"
      title="管理第三方账号绑定"
      width="700px"
    >
      <div class="binding-management">
        <div class="current-bindings">
          <h4>已绑定账号</h4>
          <div class="binding-list">
            <div 
              v-for="binding in selectedAppUser?.third_party_accounts" 
              :key="binding.provider"
              class="binding-item"
            >
              <div class="binding-info">
                <el-tag :type="getProviderTagType(binding.provider)">{{ getProviderLabel(binding.provider) }}</el-tag>
                <span class="binding-account">{{ binding.account_name }}</span>
                <span class="binding-time">{{ formatDate(binding.bound_at) }}</span>
              </div>
              <el-button size="small" type="danger" @click="unbindAccount(binding)">
                解绑
              </el-button>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="add-binding">
          <h4>添加绑定</h4>
          <el-form :model="bindingForm" inline>
            <el-form-item label="平台">
              <el-select v-model="bindingForm.provider" placeholder="选择平台">
                <el-option label="钉钉" value="dingtalk" />
                <el-option label="微信" value="wechat" />
                <el-option label="企业微信" value="wechat_work" />
                <el-option label="飞书" value="feishu" />
              </el-select>
            </el-form-item>
            <el-form-item label="账号">
              <el-input v-model="bindingForm.account_name" placeholder="输入账号名称" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="bindAccount" :loading="bindingLoading">
                绑定
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showBindingDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Grid, Edit, Plus, Search, View, Link, Delete, Key, Download, Document
} from '@element-plus/icons-vue'

// 路由
const route = useRoute()
const router = useRouter()

// 响应式数据
const appDetail = ref({
  id: '',
  name: '',
  description: '',
  client_id: '',
  type: '',
  status: '',
  owner_name: '',
  usage_count: 0,
  created_at: '',
  updated_at: '',
  logo_url: '',
  homepage_url: '',
  scopes: [] as string[]
})

const appUsers = ref<any[]>([])
const usersLoading = ref(false)
const userSearchQuery = ref('')
const userRoleFilter = ref('')
const userStatusFilter = ref('')
const userCurrentPage = ref(1)
const userPageSize = ref(20)
const userTotal = ref(0)

// 对话框状态
const showAddUserDialog = ref(false)
const showEditUserDialog = ref(false)
const showBindingDialog = ref(false)

// 表单数据
const addUserForm = ref({
  user_id: '',
  role: 'user',
  permissions: ['read']
})

const editUserForm = ref({
  role: '',
  status: '',
  permissions: [] as string[]
})

const bindingForm = ref({
  provider: '',
  account_name: ''
})

// 加载状态
const addUserLoading = ref(false)
const updateUserLoading = ref(false)
const bindingLoading = ref(false)
const searchLoading = ref(false)

// 选中的用户
const selectedAppUser = ref<any>(null)
const availableUsers = ref<any[]>([])

// 计算属性
const filteredAppUsers = computed(() => {
  let result = appUsers.value
  
  if (userSearchQuery.value) {
    const query = userSearchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.display_name && user.display_name.toLowerCase().includes(query))
    )
  }
  
  if (userRoleFilter.value) {
    result = result.filter(user => user.role === userRoleFilter.value)
  }
  
  if (userStatusFilter.value) {
    result = result.filter(user => user.status === userStatusFilter.value)
  }
  
  return result
})

const userStats = computed(() => {
  const stats = {
    total: appUsers.value.length,
    active: 0,
    admin: 0,
    pending: 0
  }
  
  appUsers.value.forEach(user => {
    if (user.status === 'active') stats.active++
    if (user.role === 'admin') stats.admin++
    if (user.status === 'pending') stats.pending++
  })
  
  return stats
})

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getRoleLabel = (role: string) => {
  const labels = {
    admin: '管理员',
    user: '普通用户'
  }
  return labels[role as keyof typeof labels] || role
}

const getRoleTagType = (role: string) => {
  const types: Record<string, any> = {
    admin: 'danger',
    user: 'primary'
  }
  return types[role] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: '活跃',
    disabled: '禁用',
    pending: '待激活'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusTagType = (status: string) => {
  const types: Record<string, any> = {
    active: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

const getTypeLabel = (type: string) => {
  const labels = {
    web: 'Web应用',
    mobile: '移动应用',
    desktop: '桌面应用',
    api: 'API应用'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeTagType = (type: string) => {
  const types: Record<string, any> = {
    web: 'primary',
    mobile: 'success',
    desktop: 'warning',
    api: 'info'
  }
  return types[type] || 'info'
}

const getProviderLabel = (provider: string) => {
  const labels = {
    dingtalk: '钉钉',
    wechat: '微信',
    wechat_work: '企业微信',
    feishu: '飞书'
  }
  return labels[provider as keyof typeof labels] || provider
}

const getProviderTagType = (provider: string) => {
  const types: Record<string, any> = {
    dingtalk: 'primary',
    wechat: 'success',
    wechat_work: 'warning',
    feishu: 'info'
  }
  return types[provider] || 'info'
}

const getScopeLabel = (scope: string) => {
  const labels = {
    read: '读取权限',
    write: '写入权限',
    admin: '管理权限'
  }
  return labels[scope as keyof typeof labels] || scope
}

// 事件处理函数
const goBack = () => {
  router.push('/admin/third-party-apps')
}

const handleUserSearch = () => {
  userCurrentPage.value = 1
}

const loadAppDetail = async () => {
  try {
    const appId = route.params.id as string
    // 模拟获取应用详情
    appDetail.value = {
      id: appId,
      name: '钉钉企业应用',
      description: '企业内部钉钉集成应用，支持消息推送、考勤管理等功能',
      client_id: 'dingtalk_client_001',
      type: 'web',
      status: 'active',
      owner_name: '技术部门',
      usage_count: 1250,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      logo_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=dingtalk%20logo%20blue%20corporate%20app%20icon&image_size=square',
      homepage_url: 'https://dingtalk.example.com',
      scopes: ['read', 'write', 'admin']
    }
  } catch (error) {
    ElMessage.error('加载应用详情失败')
  }
}

const loadAppUsers = async () => {
  usersLoading.value = true
  try {
    // 模拟获取应用用户列表
    await new Promise(resolve => setTimeout(resolve, 500))
    appUsers.value = [
      {
        id: '1',
        username: 'zhang.wei',
        email: 'zhang.wei@example.com',
        display_name: '张伟',
        role: 'admin',
        status: 'active',
        avatar: '',
        last_login: '2024-01-15T14:30:00Z',
        third_party_accounts: [
          { provider: 'dingtalk', account_name: '张伟-技术部', bound_at: '2024-01-01T00:00:00Z' },
          { provider: 'wechat', account_name: 'zhangwei_wx', bound_at: '2024-01-02T00:00:00Z' }
        ]
      },
      {
        id: '2',
        username: 'li.ming',
        email: 'li.ming@example.com',
        display_name: '李明',
        role: 'user',
        status: 'active',
        avatar: '',
        last_login: '2024-01-14T16:20:00Z',
        third_party_accounts: [
          { provider: 'dingtalk', account_name: '李明-销售部', bound_at: '2024-01-03T00:00:00Z' }
        ]
      },
      {
        id: '3',
        username: 'wang.fang',
        email: 'wang.fang@example.com',
        display_name: '王芳',
        role: 'user',
        status: 'pending',
        avatar: '',
        last_login: null,
        third_party_accounts: []
      }
    ]
    userTotal.value = appUsers.value.length
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    usersLoading.value = false
  }
}

const searchUsers = async (query: string) => {
  if (!query) {
    availableUsers.value = []
    return
  }
  
  searchLoading.value = true
  try {
    // 模拟搜索用户
    await new Promise(resolve => setTimeout(resolve, 300))
    availableUsers.value = [
      { id: '4', username: 'chen.jun', email: 'chen.jun@example.com', display_name: '陈军' },
      { id: '5', username: 'liu.yan', email: 'liu.yan@example.com', display_name: '刘燕' }
    ].filter(user => 
      user.username.includes(query) || 
      user.email.includes(query) || 
      user.display_name.includes(query)
    )
  } catch (error) {
    ElMessage.error('搜索用户失败')
  } finally {
    searchLoading.value = false
  }
}

const addUserToApp = async () => {
  if (!addUserForm.value.user_id) {
    ElMessage.warning('请选择用户')
    return
  }
  
  addUserLoading.value = true
  try {
    // 模拟添加用户到应用
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('用户添加成功')
    showAddUserDialog.value = false
    addUserForm.value = { user_id: '', role: 'user', permissions: ['read'] }
    loadAppUsers()
  } catch (error) {
    ElMessage.error('添加用户失败')
  } finally {
    addUserLoading.value = false
  }
}

const viewUser = (user: any) => {
  ElMessage.info('查看用户详情功能开发中')
}

const editAppUser = (user: any) => {
  selectedAppUser.value = user
  editUserForm.value = {
    role: user.role,
    status: user.status,
    permissions: ['read', 'write'] // 模拟权限
  }
  showEditUserDialog.value = true
}

const updateAppUser = async () => {
  updateUserLoading.value = true
  try {
    // 模拟更新用户
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('用户信息更新成功')
    showEditUserDialog.value = false
    loadAppUsers()
  } catch (error) {
    ElMessage.error('更新用户失败')
  } finally {
    updateUserLoading.value = false
  }
}

const manageUserBindings = (user: any) => {
  selectedAppUser.value = user
  showBindingDialog.value = true
}

const bindAccount = async () => {
  if (!bindingForm.value.provider || !bindingForm.value.account_name) {
    ElMessage.warning('请填写完整的绑定信息')
    return
  }
  
  bindingLoading.value = true
  try {
    // 模拟绑定账号
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('账号绑定成功')
    bindingForm.value = { provider: '', account_name: '' }
    loadAppUsers()
  } catch (error) {
    ElMessage.error('绑定账号失败')
  } finally {
    bindingLoading.value = false
  }
}

const unbindAccount = async (binding: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要解绑 ${getProviderLabel(binding.provider)} 账号吗？`,
      '确认解绑',
      { type: 'warning' }
    )
    
    // 模拟解绑账号
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('账号解绑成功')
    loadAppUsers()
  } catch (error) {
    // 用户取消
  }
}

const removeUserFromApp = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要将用户 ${user.display_name || user.username} 从应用中移除吗？`,
      '确认移除',
      { type: 'warning' }
    )
    
    // 模拟移除用户
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('用户移除成功')
    loadAppUsers()
  } catch (error) {
    // 用户取消
  }
}

const editApplication = () => {
  ElMessage.info('编辑应用功能开发中')
}

const resetAppSecret = async () => {
  try {
    await ElMessageBox.confirm(
      '重置应用密钥后，旧密钥将立即失效，确定要继续吗？',
      '确认重置',
      { type: 'warning' }
    )
    
    ElMessage.success('应用密钥重置成功')
  } catch (error) {
    // 用户取消
  }
}

const exportAppUsers = () => {
  ElMessage.info('导出用户列表功能开发中')
}

const viewAuditLogs = () => {
  ElMessage.info('查看审计日志功能开发中')
}

// 生命周期
onMounted(() => {
  loadAppDetail()
  loadAppUsers()
})
</script>

<style scoped>
.third-party-app-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  margin-right: 16px;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.app-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title-info h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.title-info p {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.users-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-stats {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
}

.third-party-accounts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.app-info-card,
.permissions-card,
.quick-actions-card {
  margin-bottom: 20px;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}

.binding-management {
  max-height: 400px;
  overflow-y: auto;
}

.binding-list {
  margin-top: 12px;
}

.binding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
}

.binding-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.binding-account {
  font-weight: 500;
  color: #1f2937;
}

.binding-time {
  font-size: 12px;
  color: #6b7280;
}

.add-binding {
  margin-top: 20px;
}

.add-binding h4 {
  margin-bottom: 12px;
  color: #1f2937;
}
</style>