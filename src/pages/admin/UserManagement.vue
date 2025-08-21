<template>
  <div class="content-section">
    <div class="section-header">
      <h2>用户管理</h2>
      <p>管理系统中的所有用户账户和权限</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-filters">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名、邮箱或姓名"
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
          <el-option label="禁用" value="disabled" />
          <el-option label="待激活" value="pending" />
        </el-select>
        
        <el-select
          v-model="roleFilter"
          placeholder="角色筛选"
          clearable
          style="width: 150px;"
          @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
          <el-option label="访客" value="guest" />
        </el-select>
      </div>
      
      <div class="action-buttons">
        <el-button @click="exportUsers">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button type="primary" @click="showCreateUserDialog">
          <el-icon><Plus /></el-icon>
          新建用户
        </el-button>
      </div>
    </div>

    <!-- 用户统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon active">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.total }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon online">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.online }}</div>
              <div class="stat-label">在线用户</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon new">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.newToday }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon disabled">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ userStats.disabled }}</div>
              <div class="stat-label">禁用用户</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 用户列表 -->
    <el-card class="users-table-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="table-actions">
            <el-button size="small" @click="refreshUsers">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="filteredUsers"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.display_name?.charAt(0) || row.username.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ row.display_name || row.username }}</div>
                <div class="user-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户名" width="150" />
        
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">
              {{ getRoleLabel(row.role) }}
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
        
        <el-table-column label="最后登录" width="180">
          <template #default="{ row }">
            <div v-if="row.last_login">
              <div class="login-time">{{ formatDate(row.last_login) }}</div>
              <div class="login-ip">{{ row.last_login_ip }}</div>
            </div>
            <span v-else class="never-login">从未登录</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="注册时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewUser(row)">
              查看
            </el-button>
            <el-button size="small" type="primary" @click="editUser(row)">
              编辑
            </el-button>
            <el-dropdown @command="handleUserAction">
              <el-button size="small">
                更多
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    :command="{ action: 'toggle-status', user: row }"
                    :disabled="row.role === 'admin' && row.status === 'active'"
                  >
                    {{ row.status === 'active' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'reset-password', user: row }">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'view-sessions', user: row }">
                    查看会话
                  </el-dropdown-item>
                  <el-dropdown-item 
                    :command="{ action: 'delete', user: row }"
                    :disabled="row.role === 'admin'"
                    divided
                  >
                    删除用户
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
          :total="totalUsers"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="isEditMode ? '编辑用户' : '创建用户'"
      width="600px"
      @close="resetUserForm"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEditMode" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" type="email" />
        </el-form-item>
        
        <el-form-item label="显示名称" prop="display_name">
          <el-input v-model="userForm.display_name" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%;">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
            <el-option label="访客" value="guest" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" style="width: 100%;">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="待激活" value="pending" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="!isEditMode" label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        
        <el-form-item v-if="!isEditMode" label="确认密码" prop="confirmPassword">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitUserForm">
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="userDetailDialogVisible"
      title="用户详情"
      width="800px"
    >
      <div v-if="selectedUser" class="user-detail">
        <div class="user-profile">
          <el-avatar :size="80" :src="selectedUser.avatar">
            {{ selectedUser.display_name?.charAt(0) || selectedUser.username.charAt(0) }}
          </el-avatar>
          <div class="profile-info">
            <h3>{{ selectedUser.display_name || selectedUser.username }}</h3>
            <p>{{ selectedUser.email }}</p>
            <div class="profile-tags">
              <el-tag :type="getRoleTagType(selectedUser.role)">
                {{ getRoleLabel(selectedUser.role) }}
              </el-tag>
              <el-tag :type="getStatusTagType(selectedUser.status)">
                {{ getStatusLabel(selectedUser.status) }}
              </el-tag>
            </div>
          </div>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(selectedUser.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ formatDate(selectedUser.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">
            {{ selectedUser.last_login ? formatDate(selectedUser.last_login) : '从未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="登录IP">{{ selectedUser.last_login_ip || '-' }}</el-descriptions-item>
          <el-descriptions-item label="登录次数">{{ selectedUser.login_count || 0 }}</el-descriptions-item>
          <el-descriptions-item label="两步验证">
            {{ selectedUser.two_factor_enabled ? '已启用' : '未启用' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">


interface User {
  id: string
  username: string
  email: string
  display_name?: string
  phone?: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'disabled' | 'pending'
  avatar?: string
  created_at: string
  updated_at: string
  last_login?: string
  last_login_ip?: string
  login_count?: number
  two_factor_enabled: boolean
}

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedUsers = ref<User[]>([])

// 对话框状态
const userDialogVisible = ref(false)
const userDetailDialogVisible = ref(false)
const isEditMode = ref(false)
const selectedUser = ref<User | null>(null)

// 表单引用
const userFormRef = ref()

// 用户统计
const userStats = reactive({
  total: 1248,
  online: 156,
  newToday: 23,
  disabled: 12
})

// 用户表单
const userForm = reactive({
  username: '',
  email: '',
  display_name: '',
  phone: '',
  role: 'user' as User['role'],
  status: 'active' as User['status'],
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const userFormRules: Record<string, any> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 模拟用户数据
const users = ref<User[]>([
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    display_name: '系统管理员',
    phone: '13800138000',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    last_login: '2024-01-15T14:30:00Z',
    last_login_ip: '192.168.1.100',
    login_count: 245,
    two_factor_enabled: true
  },
  {
    id: '2',
    username: 'zhang.wei',
    email: 'zhang.wei@example.com',
    display_name: '张伟',
    phone: '13900139000',
    role: 'user',
    status: 'active',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-14T16:20:00Z',
    last_login: '2024-01-14T16:20:00Z',
    last_login_ip: '192.168.1.101',
    login_count: 28,
    two_factor_enabled: false
  },
  {
    id: '3',
    username: 'li.ming',
    email: 'li.ming@example.com',
    display_name: '李明',
    role: 'user',
    status: 'pending',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z',
    login_count: 0,
    two_factor_enabled: false
  },
  {
    id: '4',
    username: 'wang.fang',
    email: 'wang.fang@example.com',
    display_name: '王芳',
    phone: '13700137000',
    role: 'user',
    status: 'disabled',
    created_at: '2024-01-05T14:30:00Z',
    updated_at: '2024-01-12T09:45:00Z',
    last_login: '2024-01-12T09:45:00Z',
    last_login_ip: '192.168.1.102',
    login_count: 15,
    two_factor_enabled: true
  }
])

// 计算属性
const filteredUsers = computed(() => {
  let result = users.value
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.display_name && user.display_name.toLowerCase().includes(query))
    )
  }
  
  // 状态过滤
  if (statusFilter.value) {
    result = result.filter(user => user.status === statusFilter.value)
  }
  
  // 角色过滤
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }
  
  return result
})

const totalUsers = computed(() => filteredUsers.value.length)

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getRoleLabel = (role: string) => {
  const labels = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客'
  }
  return labels[role as keyof typeof labels] || role
}

const getRoleTagType = (role: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    admin: 'danger',
    user: 'primary',
    guest: 'info'
  }
  return types[role as keyof typeof types] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels = {
    active: '活跃',
    disabled: '禁用',
    pending: '待激活'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return types[status as keyof typeof types] || 'info'
}

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const refreshUsers = async () => {
  loading.value = true
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('用户列表已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const exportUsers = () => {
  ElMessage.info('导出功能开发中')
}

const showCreateUserDialog = () => {
  isEditMode.value = false
  userDialogVisible.value = true
}

const viewUser = (user: User) => {
  selectedUser.value = user
  userDetailDialogVisible.value = true
}

const editUser = (user: User) => {
  isEditMode.value = true
  Object.assign(userForm, {
    username: user.username,
    email: user.email,
    display_name: user.display_name || '',
    phone: user.phone || '',
    role: user.role,
    status: user.status,
    password: '',
    confirmPassword: ''
  })
  selectedUser.value = user
  userDialogVisible.value = true
}

const handleUserAction = async (command: { action: string; user: User }) => {
  const { action, user } = command
  
  switch (action) {
    case 'toggle-status':
      await toggleUserStatus(user)
      break
    case 'reset-password':
      await resetUserPassword(user)
      break
    case 'view-sessions':
      viewUserSessions(user)
      break
    case 'delete':
      await deleteUser(user)
      break
  }
}

const toggleUserStatus = async (user: User) => {
  const newStatus = user.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.display_name || user.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用实际的API
    user.status = newStatus
    ElMessage.success(`用户已${action}`)
  } catch {
    // 用户取消操作
  }
}

const resetUserPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.display_name || user.username}" 的密码吗？\n新密码将通过邮件发送给用户。`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用实际的API
    ElMessage.success('密码重置邮件已发送')
  } catch {
    // 用户取消操作
  }
}

const viewUserSessions = (user: User) => {
  ElMessage.info(`查看用户 "${user.display_name || user.username}" 的会话记录`)
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.display_name || user.username}" 吗？\n此操作不可恢复！`,
      '删除用户',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 这里应该调用实际的API
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
    ElMessage.success('用户已删除')
  } catch {
    // 用户取消操作
  }
}

const submitUserForm = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    submitting.value = true
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEditMode.value && selectedUser.value) {
      // 更新用户
      Object.assign(selectedUser.value, {
        email: userForm.email,
        display_name: userForm.display_name,
        phone: userForm.phone,
        role: userForm.role,
        status: userForm.status,
        updated_at: new Date().toISOString()
      })
      ElMessage.success('用户信息已更新')
    } else {
      // 创建新用户
      const newUser: User = {
        id: Date.now().toString(),
        username: userForm.username,
        email: userForm.email,
        display_name: userForm.display_name,
        phone: userForm.phone,
        role: userForm.role,
        status: userForm.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        login_count: 0,
        two_factor_enabled: false
      }
      users.value.unshift(newUser)
      ElMessage.success('用户创建成功')
    }
    
    userDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.assign(userForm, {
    username: '',
    email: '',
    display_name: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: ''
  })
  selectedUser.value = null
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的用户数据
  // loadUsers()
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
  
  &.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.online {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.new {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
  }
  
  &.disabled {
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

// 用户表格卡片
.users-table-card {
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

// 用户信息
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  .user-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }
  
  .user-email {
    font-size: 13px;
    color: #6b7280;
  }
}

.login-time {
  font-size: 13px;
  color: #111827;
  margin-bottom: 2px;
}

.login-ip {
  font-size: 12px;
  color: #6b7280;
}

.never-login {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}

// 分页
.pagination-wrapper {
  padding: 24px;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f3f4f6;
}

// 用户详情
.user-detail {
  .user-profile {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
    padding: 24px;
    background: #f8fafc;
    border-radius: 12px;
  }
  
  .profile-info {
    h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 12px 0;
    }
  }
  
  .profile-tags {
    display: flex;
    gap: 8px;
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
  
  .users-table-card {
    :deep(.el-card__header),
    .pagination-wrapper {
      padding: 16px;
    }
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
}
</style>