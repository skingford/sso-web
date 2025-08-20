<template>
  <div class="content-section">
    <div class="section-header">
      <h2>权限管理</h2>
      <p>管理系统角色和权限配置</p>
    </div>

    <!-- 权限概览卡片 -->
    <div class="permission-overview">
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="overview-card">
            <div class="card-icon roles">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ permissionStats.totalRoles }}</div>
              <div class="card-label">系统角色</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="overview-card">
            <div class="card-icon permissions">
              <el-icon><Key /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ permissionStats.totalPermissions }}</div>
              <div class="card-label">权限项目</div>
            </div>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="overview-card">
            <div class="card-icon assignments">
              <el-icon><Link /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ permissionStats.totalAssignments }}</div>
              <div class="card-label">权限分配</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 权限管理标签页 -->
    <el-card class="permission-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 角色管理 -->
        <el-tab-pane label="角色管理" name="roles">
          <div class="tab-content">
            <div class="tab-header">
              <div class="search-area">
                <el-input
                  v-model="roleSearchQuery"
                  placeholder="搜索角色名称或描述"
                  prefix-icon="Search"
                  clearable
                  style="width: 300px;"
                  @input="handleRoleSearch"
                />
              </div>
              
              <div class="action-buttons">
                <el-button @click="exportRoles">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
                <el-button type="primary" @click="showCreateRoleDialog">
                  <el-icon><Plus /></el-icon>
                  新建角色
                </el-button>
              </div>
            </div>
            
            <el-table
              v-loading="rolesLoading"
              :data="filteredRoles"
              style="width: 100%"
              @selection-change="handleRoleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              
              <el-table-column label="角色信息" min-width="200">
                <template #default="{ row }">
                  <div class="role-info">
                    <div class="role-name">{{ row.name }}</div>
                    <div class="role-description">{{ row.description }}</div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="角色类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getRoleTypeTagType(row.type)" size="small">
                    {{ getRoleTypeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">
                    {{ row.enabled ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="用户数量" width="100">
                <template #default="{ row }">
                  <span>{{ row.user_count }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="权限数量" width="100">
                <template #default="{ row }">
                  <span>{{ row.permissions?.length || 0 }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="创建时间" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.created_at) }}
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="viewRole(row)">
                    查看
                  </el-button>
                  <el-button size="small" type="primary" @click="editRole(row)">
                    编辑
                  </el-button>
                  <el-dropdown @command="handleRoleAction">
                    <el-button size="small">
                      更多
                      <el-icon><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item :command="{ action: 'toggle-status', role: row }">
                          {{ row.enabled ? '禁用' : '启用' }}
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'copy', role: row }">
                          复制角色
                        </el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'view-users', role: row }">
                          查看用户
                        </el-dropdown-item>
                        <el-dropdown-item 
                          :command="{ action: 'delete', role: row }"
                          divided
                        >
                          删除角色
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 权限管理 -->
        <el-tab-pane label="权限管理" name="permissions">
          <div class="tab-content">
            <div class="tab-header">
              <div class="search-area">
                <el-input
                  v-model="permissionSearchQuery"
                  placeholder="搜索权限名称或描述"
                  prefix-icon="Search"
                  clearable
                  style="width: 300px;"
                  @input="handlePermissionSearch"
                />
                
                <el-select
                  v-model="permissionCategoryFilter"
                  placeholder="权限分类"
                  clearable
                  style="width: 150px; margin-left: 16px;"
                  @change="handlePermissionFilter"
                >
                  <el-option label="全部" value="" />
                  <el-option label="用户管理" value="user" />
                  <el-option label="应用管理" value="application" />
                  <el-option label="系统管理" value="system" />
                  <el-option label="审计日志" value="audit" />
                </el-select>
              </div>
              
              <div class="action-buttons">
                <el-button @click="exportPermissions">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
                <el-button type="primary" @click="showCreatePermissionDialog">
                  <el-icon><Plus /></el-icon>
                  新建权限
                </el-button>
              </div>
            </div>
            
            <div class="permission-tree">
              <el-tree
                ref="permissionTreeRef"
                :data="permissionTreeData"
                :props="treeProps"
                show-checkbox
                node-key="id"
                :default-expanded-keys="expandedKeys"
                :check-strictly="false"
                @check-change="handlePermissionCheck"
              >
                <template #default="{ node, data }">
                  <div class="tree-node">
                    <div class="node-content">
                      <el-icon class="node-icon">
                        <Folder v-if="data.type === 'category'" />
                        <Key v-else />
                      </el-icon>
                      <span class="node-label">{{ data.name }}</span>
                      <el-tag v-if="data.code" size="small" type="info" class="node-code">
                        {{ data.code }}
                      </el-tag>
                    </div>
                    
                    <div class="node-actions" v-if="data.type === 'permission'">
                      <el-button size="small" text @click="editPermission(data)">
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button size="small" text type="danger" @click="deletePermission(data)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </template>
              </el-tree>
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 权限分配 -->
        <el-tab-pane label="权限分配" name="assignments">
          <div class="tab-content">
            <div class="assignment-container">
              <div class="assignment-left">
                <div class="panel-header">
                  <h3>用户/角色</h3>
                  <el-input
                    v-model="assignmentSearchQuery"
                    placeholder="搜索用户或角色"
                    prefix-icon="Search"
                    size="small"
                    clearable
                  />
                </div>
                
                <el-tabs v-model="assignmentType" size="small">
                  <el-tab-pane label="用户" name="users">
                    <div class="user-list">
                      <div 
                        v-for="user in filteredUsers" 
                        :key="user.id" 
                        class="user-item"
                        :class="{ active: selectedUser?.id === user.id }"
                        @click="selectUser(user)"
                      >
                        <div class="user-avatar">
                          <img v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                          <div v-else class="avatar-placeholder">
                            {{ user.name.charAt(0) }}
                          </div>
                        </div>
                        <div class="user-info">
                          <div class="user-name">{{ user.name }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                  
                  <el-tab-pane label="角色" name="roles">
                    <div class="role-list">
                      <div 
                        v-for="role in filteredAssignmentRoles" 
                        :key="role.id" 
                        class="role-item"
                        :class="{ active: selectedRole?.id === role.id }"
                        @click="selectRole(role)"
                      >
                        <div class="role-icon">
                          <el-icon><UserFilled /></el-icon>
                        </div>
                        <div class="role-info">
                          <div class="role-name">{{ role.name }}</div>
                          <div class="role-description">{{ role.description }}</div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
              
              <div class="assignment-right">
                <div class="panel-header">
                  <h3>权限配置</h3>
                  <div class="permission-actions">
                    <el-button size="small" @click="savePermissionAssignment" type="primary">
                      保存配置
                    </el-button>
                  </div>
                </div>
                
                <div v-if="selectedUser || selectedRole" class="permission-assignment">
                  <div class="assignment-info">
                    <div v-if="selectedUser" class="selected-target">
                      <div class="target-avatar">
                        <img v-if="selectedUser.avatar" :src="selectedUser.avatar" :alt="selectedUser.name" />
                        <div v-else class="avatar-placeholder">
                          {{ selectedUser.name.charAt(0) }}
                        </div>
                      </div>
                      <div class="target-info">
                        <div class="target-name">{{ selectedUser.name }}</div>
                        <div class="target-type">用户权限配置</div>
                      </div>
                    </div>
                    
                    <div v-if="selectedRole" class="selected-target">
                      <div class="target-icon">
                        <el-icon><UserFilled /></el-icon>
                      </div>
                      <div class="target-info">
                        <div class="target-name">{{ selectedRole.name }}</div>
                        <div class="target-type">角色权限配置</div>
                      </div>
                    </div>
                  </div>
                  
                  <el-tree
                    ref="assignmentTreeRef"
                    :data="permissionTreeData"
                    :props="treeProps"
                    show-checkbox
                    node-key="id"
                    :default-checked-keys="getCheckedPermissions()"
                    :check-strictly="false"
                    @check-change="handleAssignmentCheck"
                  >
                    <template #default="{ node, data }">
                      <div class="assignment-tree-node">
                        <el-icon class="node-icon">
                          <Folder v-if="data.type === 'category'" />
                          <Key v-else />
                        </el-icon>
                        <span class="node-label">{{ data.name }}</span>
                        <span v-if="data.description" class="node-description">
                          {{ data.description }}
                        </span>
                      </div>
                    </template>
                  </el-tree>
                </div>
                
                <div v-else class="no-selection">
                  <el-empty description="请选择用户或角色进行权限配置" />
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 创建/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="isEditRoleMode ? '编辑角色' : '创建角色'"
      width="600px"
      @close="resetRoleForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        
        <el-form-item label="角色描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        
        <el-form-item label="角色类型" prop="type">
          <el-select v-model="roleForm.type" style="width: 100%;">
            <el-option label="系统角色" value="system" />
            <el-option label="业务角色" value="business" />
            <el-option label="自定义角色" value="custom" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch v-model="roleForm.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
        
        <el-form-item label="权限配置">
          <el-tree
            ref="rolePermissionTreeRef"
            :data="permissionTreeData"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="roleForm.permissions"
            :check-strictly="false"
            @check-change="handleRolePermissionCheck"
          >
            <template #default="{ node, data }">
              <div class="tree-node-simple">
                <el-icon class="node-icon">
                  <Folder v-if="data.type === 'category'" />
                  <Key v-else />
                </el-icon>
                <span>{{ data.name }}</span>
              </div>
            </template>
          </el-tree>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="roleSubmitting" @click="submitRoleForm">
            {{ isEditRoleMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 创建/编辑权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="isEditPermissionMode ? '编辑权限' : '创建权限'"
      width="500px"
      @close="resetPermissionForm"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-width="100px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" />
        </el-form-item>
        
        <el-form-item label="权限代码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="例如：user.create" />
        </el-form-item>
        
        <el-form-item label="权限描述" prop="description">
          <el-input 
            v-model="permissionForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
        
        <el-form-item label="权限分类" prop="category">
          <el-select v-model="permissionForm.category" style="width: 100%;">
            <el-option label="用户管理" value="user" />
            <el-option label="应用管理" value="application" />
            <el-option label="系统管理" value="system" />
            <el-option label="审计日志" value="audit" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="permissionSubmitting" @click="submitPermissionForm">
            {{ isEditPermissionMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UserFilled, Key, Link, Search, Download, Plus, ArrowDown, 
  Folder, Edit, Delete
} from '@element-plus/icons-vue'

interface Role {
  id: string
  name: string
  description: string
  type: 'system' | 'business' | 'custom'
  enabled: boolean
  user_count: number
  permissions: string[]
  created_at: string
  updated_at: string
}

interface Permission {
  id: string
  name: string
  code: string
  description: string
  category: string
  type: 'category' | 'permission'
  children?: Permission[]
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  permissions: string[]
}

// 响应式数据
const activeTab = ref('roles')
const rolesLoading = ref(false)
const roleSubmitting = ref(false)
const permissionSubmitting = ref(false)

// 搜索和筛选
const roleSearchQuery = ref('')
const permissionSearchQuery = ref('')
const permissionCategoryFilter = ref('')
const assignmentSearchQuery = ref('')
const assignmentType = ref('users')

// 选中的数据
const selectedRoles = ref<Role[]>([])
const selectedUser = ref<User | null>(null)
const selectedRole = ref<Role | null>(null)

// 对话框状态
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEditRoleMode = ref(false)
const isEditPermissionMode = ref(false)

// 表单引用
const roleFormRef = ref()
const permissionFormRef = ref()
const permissionTreeRef = ref()
const assignmentTreeRef = ref()
const rolePermissionTreeRef = ref()

// 统计数据
const permissionStats = reactive({
  totalRoles: 8,
  totalPermissions: 45,
  totalAssignments: 156
})

// 角色表单
const roleForm = reactive({
  name: '',
  description: '',
  type: 'custom' as Role['type'],
  enabled: true,
  permissions: [] as string[]
})

// 权限表单
const permissionForm = reactive({
  name: '',
  code: '',
  description: '',
  category: 'user'
})

// 表单验证规则
const roleFormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择角色类型', trigger: 'change' }
  ]
}

const permissionFormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { pattern: /^[a-z]+\.[a-z]+$/, message: '权限代码格式：模块.操作', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入权限描述', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择权限分类', trigger: 'change' }
  ]
}

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

const expandedKeys = ref(['user', 'application', 'system', 'audit'])

// 模拟数据
const roles = ref<Role[]>([
  {
    id: '1',
    name: '超级管理员',
    description: '拥有系统所有权限的管理员角色',
    type: 'system',
    enabled: true,
    user_count: 2,
    permissions: ['user.create', 'user.read', 'user.update', 'user.delete', 'application.create', 'application.read', 'application.update', 'application.delete'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: '用户管理员',
    description: '负责用户账户管理的管理员',
    type: 'business',
    enabled: true,
    user_count: 5,
    permissions: ['user.create', 'user.read', 'user.update'],
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-14T16:20:00Z'
  },
  {
    id: '3',
    name: '应用管理员',
    description: '负责应用和OAuth配置管理',
    type: 'business',
    enabled: true,
    user_count: 3,
    permissions: ['application.create', 'application.read', 'application.update'],
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-15T11:45:00Z'
  },
  {
    id: '4',
    name: '普通用户',
    description: '系统普通用户角色',
    type: 'system',
    enabled: true,
    user_count: 89,
    permissions: ['user.read'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-12T15:10:00Z'
  }
])

const permissionTreeData = ref<Permission[]>([
  {
    id: 'user',
    name: '用户管理',
    code: '',
    description: '用户相关权限',
    category: 'user',
    type: 'category',
    children: [
      {
        id: 'user.create',
        name: '创建用户',
        code: 'user.create',
        description: '创建新用户账户',
        category: 'user',
        type: 'permission'
      },
      {
        id: 'user.read',
        name: '查看用户',
        code: 'user.read',
        description: '查看用户信息',
        category: 'user',
        type: 'permission'
      },
      {
        id: 'user.update',
        name: '编辑用户',
        code: 'user.update',
        description: '编辑用户信息',
        category: 'user',
        type: 'permission'
      },
      {
        id: 'user.delete',
        name: '删除用户',
        code: 'user.delete',
        description: '删除用户账户',
        category: 'user',
        type: 'permission'
      }
    ]
  },
  {
    id: 'application',
    name: '应用管理',
    code: '',
    description: '应用相关权限',
    category: 'application',
    type: 'category',
    children: [
      {
        id: 'application.create',
        name: '创建应用',
        code: 'application.create',
        description: '创建新应用',
        category: 'application',
        type: 'permission'
      },
      {
        id: 'application.read',
        name: '查看应用',
        code: 'application.read',
        description: '查看应用信息',
        category: 'application',
        type: 'permission'
      },
      {
        id: 'application.update',
        name: '编辑应用',
        code: 'application.update',
        description: '编辑应用配置',
        category: 'application',
        type: 'permission'
      },
      {
        id: 'application.delete',
        name: '删除应用',
        code: 'application.delete',
        description: '删除应用',
        category: 'application',
        type: 'permission'
      }
    ]
  },
  {
    id: 'system',
    name: '系统管理',
    code: '',
    description: '系统相关权限',
    category: 'system',
    type: 'category',
    children: [
      {
        id: 'system.config',
        name: '系统配置',
        code: 'system.config',
        description: '修改系统配置',
        category: 'system',
        type: 'permission'
      },
      {
        id: 'system.monitor',
        name: '系统监控',
        code: 'system.monitor',
        description: '查看系统监控信息',
        category: 'system',
        type: 'permission'
      }
    ]
  },
  {
    id: 'audit',
    name: '审计日志',
    code: '',
    description: '审计相关权限',
    category: 'audit',
    type: 'category',
    children: [
      {
        id: 'audit.read',
        name: '查看日志',
        code: 'audit.read',
        description: '查看审计日志',
        category: 'audit',
        type: 'permission'
      },
      {
        id: 'audit.export',
        name: '导出日志',
        code: 'audit.export',
        description: '导出审计日志',
        category: 'audit',
        type: 'permission'
      }
    ]
  }
])

const users = ref<User[]>([
  {
    id: '1',
    name: '张三',
    email: 'zhang.san@example.com',
    permissions: ['user.read', 'application.read']
  },
  {
    id: '2',
    name: '李四',
    email: 'li.si@example.com',
    permissions: ['user.create', 'user.read', 'user.update']
  },
  {
    id: '3',
    name: '王五',
    email: 'wang.wu@example.com',
    permissions: ['application.create', 'application.read', 'application.update']
  }
])

// 计算属性
const filteredRoles = computed(() => {
  let result = roles.value
  
  if (roleSearchQuery.value) {
    const query = roleSearchQuery.value.toLowerCase()
    result = result.filter(role => 
      role.name.toLowerCase().includes(query) ||
      role.description.toLowerCase().includes(query)
    )
  }
  
  return result
})

const filteredUsers = computed(() => {
  let result = users.value
  
  if (assignmentSearchQuery.value) {
    const query = assignmentSearchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }
  
  return result
})

const filteredAssignmentRoles = computed(() => {
  let result = roles.value
  
  if (assignmentSearchQuery.value) {
    const query = assignmentSearchQuery.value.toLowerCase()
    result = result.filter(role => 
      role.name.toLowerCase().includes(query) ||
      role.description.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 工具函数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getRoleTypeLabel = (type: string) => {
  const labels = {
    system: '系统角色',
    business: '业务角色',
    custom: '自定义角色'
  }
  return labels[type as keyof typeof labels] || type
}

const getRoleTypeTagType = (type: string) => {
  const types = {
    system: 'danger',
    business: 'warning',
    custom: 'primary'
  }
  return types[type as keyof typeof types] || 'info'
}

// 事件处理函数
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
}

const handleRoleSearch = () => {
  // 搜索逻辑
}

const handlePermissionSearch = () => {
  // 搜索逻辑
}

const handlePermissionFilter = () => {
  // 筛选逻辑
}

const handleRoleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
}

const exportRoles = () => {
  ElMessage.info('导出角色功能开发中')
}

const exportPermissions = () => {
  ElMessage.info('导出权限功能开发中')
}

const showCreateRoleDialog = () => {
  isEditRoleMode.value = false
  roleDialogVisible.value = true
}

const showCreatePermissionDialog = () => {
  isEditPermissionMode.value = false
  permissionDialogVisible.value = true
}

const viewRole = (role: Role) => {
  ElMessage.info(`查看角色: ${role.name}`)
}

const editRole = (role: Role) => {
  isEditRoleMode.value = true
  Object.assign(roleForm, {
    name: role.name,
    description: role.description,
    type: role.type,
    enabled: role.enabled,
    permissions: [...role.permissions]
  })
  selectedRole.value = role
  roleDialogVisible.value = true
}

const editPermission = (permission: Permission) => {
  isEditPermissionMode.value = true
  Object.assign(permissionForm, {
    name: permission.name,
    code: permission.code,
    description: permission.description,
    category: permission.category
  })
  permissionDialogVisible.value = true
}

const deletePermission = async (permission: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${permission.name}" 吗？`,
      '删除权限',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    ElMessage.success('权限已删除')
  } catch {
    // 用户取消操作
  }
}

const handleRoleAction = async (command: { action: string; role: Role }) => {
  const { action, role } = command
  
  switch (action) {
    case 'toggle-status':
      await toggleRoleStatus(role)
      break
    case 'copy':
      copyRole(role)
      break
    case 'view-users':
      viewRoleUsers(role)
      break
    case 'delete':
      await deleteRole(role)
      break
  }
}

const toggleRoleStatus = async (role: Role) => {
  const action = role.enabled ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}角色 "${role.name}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    role.enabled = !role.enabled
    role.updated_at = new Date().toISOString()
    ElMessage.success(`角色已${action}`)
  } catch {
    // 用户取消操作
  }
}

const copyRole = (role: Role) => {
  ElMessage.info(`复制角色: ${role.name}`)
}

const viewRoleUsers = (role: Role) => {
  ElMessage.info(`查看角色 "${role.name}" 的用户列表`)
}

const deleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？\n此操作不可恢复！`,
      '删除角色',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      roles.value.splice(index, 1)
    }
    ElMessage.success('角色已删除')
  } catch {
    // 用户取消操作
  }
}

const selectUser = (user: User) => {
  selectedUser.value = user
  selectedRole.value = null
}

const selectRole = (role: Role) => {
  selectedRole.value = role
  selectedUser.value = null
}

const getCheckedPermissions = () => {
  if (selectedUser.value) {
    return selectedUser.value.permissions
  }
  if (selectedRole.value) {
    return selectedRole.value.permissions
  }
  return []
}

const handlePermissionCheck = () => {
  // 权限树选择变化
}

const handleAssignmentCheck = () => {
  // 权限分配树选择变化
}

const handleRolePermissionCheck = () => {
  if (rolePermissionTreeRef.value) {
    roleForm.permissions = rolePermissionTreeRef.value.getCheckedKeys()
  }
}

const savePermissionAssignment = async () => {
  if (!selectedUser.value && !selectedRole.value) {
    ElMessage.warning('请先选择用户或角色')
    return
  }
  
  try {
    const checkedKeys = assignmentTreeRef.value?.getCheckedKeys() || []
    
    if (selectedUser.value) {
      selectedUser.value.permissions = checkedKeys
      ElMessage.success(`用户 "${selectedUser.value.name}" 的权限配置已保存`)
    }
    
    if (selectedRole.value) {
      selectedRole.value.permissions = checkedKeys
      ElMessage.success(`角色 "${selectedRole.value.name}" 的权限配置已保存`)
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const submitRoleForm = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    
    roleSubmitting.value = true
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEditRoleMode.value && selectedRole.value) {
      // 更新角色
      Object.assign(selectedRole.value, {
        name: roleForm.name,
        description: roleForm.description,
        type: roleForm.type,
        enabled: roleForm.enabled,
        permissions: roleForm.permissions,
        updated_at: new Date().toISOString()
      })
      ElMessage.success('角色信息已更新')
    } else {
      // 创建新角色
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleForm.name,
        description: roleForm.description,
        type: roleForm.type,
        enabled: roleForm.enabled,
        user_count: 0,
        permissions: roleForm.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      roles.value.unshift(newRole)
      ElMessage.success('角色创建成功')
    }
    
    roleDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    roleSubmitting.value = false
  }
}

const submitPermissionForm = async () => {
  if (!permissionFormRef.value) return
  
  try {
    await permissionFormRef.value.validate()
    
    permissionSubmitting.value = true
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(isEditPermissionMode.value ? '权限已更新' : '权限创建成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    permissionSubmitting.value = false
  }
}

const resetRoleForm = () => {
  if (roleFormRef.value) {
    roleFormRef.value.resetFields()
  }
  Object.assign(roleForm, {
    name: '',
    description: '',
    type: 'custom',
    enabled: true,
    permissions: []
  })
  selectedRole.value = null
}

const resetPermissionForm = () => {
  if (permissionFormRef.value) {
    permissionFormRef.value.resetFields()
  }
  Object.assign(permissionForm, {
    name: '',
    code: '',
    description: '',
    category: 'user'
  })
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的权限数据
  // loadPermissionData()
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

// 权限概览卡片
.permission-overview {
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
  
  &.roles {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.permissions {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.assignments {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
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

// 权限卡片
.permission-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__body) {
    padding: 0;
  }
  
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  :deep(.el-tabs__content) {
    padding: 0;
  }
}

// 标签页内容
.tab-content {
  padding: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.search-area {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

// 角色信息
.role-info {
  .role-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .role-description {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.4;
  }
}

// 权限树
.permission-tree {
  :deep(.el-tree) {
    background: transparent;
  }
  
  :deep(.el-tree-node__content) {
    height: 40px;
    padding: 0 16px;
    border-radius: 8px;
    margin-bottom: 4px;
    
    &:hover {
      background: #f8fafc;
    }
  }
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .node-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
  
  .node-icon {
    color: #6b7280;
  }
  
  .node-label {
    font-weight: 500;
    color: #111827;
  }
  
  .node-code {
    margin-left: 8px;
  }
  
  .node-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  &:hover .node-actions {
    opacity: 1;
  }
}

.tree-node-simple {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .node-icon {
    color: #6b7280;
  }
}

// 权限分配
.assignment-container {
  display: flex;
  gap: 24px;
  height: 600px;
}

.assignment-left,
.assignment-right {
  flex: 1;
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
}

.permission-actions {
  display: flex;
  gap: 8px;
}

// 用户/角色列表
.user-list,
.role-list {
  flex: 1;
  overflow-y: auto;
}

.user-item,
.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  
  &:hover {
    background: #f0f9ff;
    border-color: #e0f2fe;
  }
  
  &.active {
    background: #dbeafe;
    border-color: #3b82f6;
  }
}

.user-avatar,
.role-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.role-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.user-info,
.role-info {
  flex: 1;
  
  .user-name,
  .role-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }
  
  .user-email,
  .role-description {
    font-size: 12px;
    color: #6b7280;
  }
}

// 权限分配区域
.permission-assignment {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.assignment-info {
  margin-bottom: 20px;
}

.selected-target {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #3b82f6;
}

.target-avatar,
.target-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
}

.target-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.target-info {
  .target-name {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 2px;
  }
  
  .target-type {
    font-size: 12px;
    color: #6b7280;
  }
}

.assignment-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .node-icon {
    color: #6b7280;
  }
  
  .node-label {
    font-weight: 500;
    color: #111827;
  }
  
  .node-description {
    font-size: 12px;
    color: #6b7280;
    margin-left: 8px;
  }
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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

:deep(.el-tabs__item) {
  font-weight: 600;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
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
  .assignment-container {
    flex-direction: column;
    height: auto;
    gap: 16px;
  }
  
  .assignment-left,
  .assignment-right {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .tab-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-area {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    
    .el-input,
    .el-select {
      width: 100% !important;
    }
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .overview-card {
    padding: 16px;
  }
  
  .tab-content {
    padding: 16px;
  }
  
  .assignment-container {
    gap: 16px;
  }
  
  .assignment-left,
  .assignment-right {
    height: 300px;
  }
}
</style>