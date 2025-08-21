<template>
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <div class="header-content">
        <div class="header-left">
          <el-icon :size="24" color="#409EFF">
            <Lock />
          </el-icon>
          <span class="system-title">SSO 管理后台</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleUserCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="currentUser?.avatar">
                {{ currentUser?.display_name?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ currentUser?.display_name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <div class="admin-main">
      <!-- 侧边栏 -->
      <aside class="admin-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="dashboard">
            <el-icon><Odometer /></el-icon>
            <span>概览</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="applications">
            <el-icon><Grid /></el-icon>
            <span>应用管理</span>
          </el-menu-item>
          <el-menu-item index="permissions">
            <el-icon><Key /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
          <el-menu-item index="audit">
            <el-icon><Document /></el-icon>
            <span>审计日志</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="admin-content">
        <!-- 概览页面 -->
        <div v-if="activeMenu === 'dashboard'" class="content-section">
          <div class="section-header">
            <h2>系统概览</h2>
            <p>查看系统整体运行状态和关键指标</p>
          </div>
          
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon user-icon">
                <el-icon :size="32"><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.totalUsers }}</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon app-icon">
                <el-icon :size="32"><Grid /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.totalApps }}</div>
                <div class="stat-label">应用数量</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon login-icon">
                <el-icon :size="32"><Odometer /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.todayLogins }}</div>
                <div class="stat-label">今日登录</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon active-icon">
                <el-icon :size="32"><Monitor /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ dashboardStats.activeUsers }}</div>
                <div class="stat-label">活跃用户</div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="recent-activities">
            <h3>最近活动</h3>
            <el-table :data="recentActivities" style="width: 100%">
              <el-table-column prop="time" label="时间" width="180" />
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="action" label="操作" />
              <el-table-column prop="resource" label="资源" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 用户管理页面 -->
        <div v-if="activeMenu === 'users'" class="content-section">
          <div class="section-header">
            <h2>用户管理</h2>
            <div class="header-actions">
              <el-button type="primary" @click="showCreateUserDialog = true">
                <el-icon><Plus /></el-icon>
                新增用户
              </el-button>
              <el-button @click="showImportDialog = true">
                <el-icon><Upload /></el-icon>
                批量导入
              </el-button>
            </div>
          </div>

          <!-- 搜索和筛选 -->
          <div class="filter-bar">
            <el-input
              v-model="userSearch"
              placeholder="搜索用户名、邮箱或手机号"
              style="width: 300px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="userStatusFilter" placeholder="状态筛选" style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="disabled" />
            </el-select>
            <el-button type="primary" @click="searchUsers">搜索</el-button>
          </div>

          <!-- 用户列表 -->
          <el-table :data="filteredUsers" style="width: 100%" v-loading="usersLoading">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="avatar" label="头像" width="80">
              <template #default="scope">
                <el-avatar :size="40" :src="scope.row.avatar">
                  {{ scope.row.name.charAt(0) }}
                </el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="roles" label="角色">
              <template #default="scope">
                <el-tag v-for="role in scope.row.roles" :key="role" size="small" style="margin-right: 4px">
                  {{ role }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                  {{ scope.row.status === 'active' ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastLogin" label="最后登录" width="180" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
                <el-button size="small" type="warning" @click="resetPassword(scope.row)">重置密码</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.status === 'active' ? 'danger' : 'success'"
                  @click="toggleUserStatus(scope.row)"
                >
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="userPagination.page"
              v-model:page-size="userPagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="userPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleUserPageSizeChange"
              @current-change="handleUserPageChange"
            />
          </div>
        </div>

        <!-- 应用管理页面 -->
        <div v-if="activeMenu === 'applications'" class="content-section">
          <div class="section-header">
            <h2>应用管理</h2>
            <div class="header-actions">
              <el-button type="primary" @click="showCreateAppDialog = true">
                <el-icon><Plus /></el-icon>
                新增应用
              </el-button>
            </div>
          </div>

          <!-- 应用列表 -->
          <div class="app-grid">
            <div v-for="app in applications" :key="app.id" class="app-card">
              <div class="app-header">
                <div class="app-info">
                  <el-avatar :size="48" :src="app.icon" shape="square">
                    {{ app.name.charAt(0) }}
                  </el-avatar>
                  <div class="app-details">
                    <h4>{{ app.name }}</h4>
                    <p>{{ app.description }}</p>
                  </div>
                </div>
                <el-dropdown @command="(command) => handleAppCommand(command, app)">
                  <el-button text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="config">配置</el-dropdown-item>
                      <el-dropdown-item command="stats">统计</el-dropdown-item>
                      <el-dropdown-item divided command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="app-stats">
                <div class="stat-item">
                  <span class="stat-label">用户数</span>
                  <span class="stat-value">{{ app.userCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">状态</span>
                  <el-tag :type="app.status === 'active' ? 'success' : 'danger'" size="small">
                    {{ app.status === 'active' ? '正常' : '停用' }}
                  </el-tag>
                </div>
              </div>
              <div class="app-footer">
                <span class="app-url">{{ app.redirectUri }}</span>
                <span class="app-date">创建于 {{ app.createdAt }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 权限管理页面 -->
        <div v-if="activeMenu === 'permissions'" class="content-section">
          <div class="section-header">
            <h2>权限管理</h2>
            <div class="header-actions">
              <el-button type="primary" @click="showCreateRoleDialog = true">
                <el-icon><Plus /></el-icon>
                新增角色
              </el-button>
            </div>
          </div>

          <el-tabs v-model="permissionTab">
            <el-tab-pane label="角色管理" name="roles">
              <el-table :data="roles" style="width: 100%">
                <el-table-column prop="name" label="角色名称" />
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="permissions" label="权限">
                  <template #default="scope">
                    <el-tag v-for="permission in scope.row.permissions.slice(0, 3)" :key="permission" size="small" style="margin-right: 4px">
                      {{ permission }}
                    </el-tag>
                    <span v-if="scope.row.permissions.length > 3">+{{ scope.row.permissions.length - 3 }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="userCount" label="用户数量" width="100" />
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="editRole(scope.row)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="权限定义" name="permissions">
              <el-table :data="permissions" style="width: 100%">
                <el-table-column prop="name" label="权限名称" />
                <el-table-column prop="resource" label="资源" />
                <el-table-column prop="action" label="操作" />
                <el-table-column prop="description" label="描述" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 审计日志页面 -->
        <div v-if="activeMenu === 'audit'" class="content-section">
          <div class="section-header">
            <h2>审计日志</h2>
            <div class="header-actions">
              <el-button @click="exportAuditLogs">
                <el-icon><Download /></el-icon>
                导出日志
              </el-button>
            </div>
          </div>

          <!-- 日志筛选 -->
          <div class="filter-bar">
            <el-date-picker
              v-model="auditDateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 350px"
            />
            <el-select v-model="auditTypeFilter" placeholder="事件类型" style="width: 140px" clearable>
              <el-option label="全部" value="" />
              <el-option label="用户登录" value="user_login" />
              <el-option label="用户登出" value="user_logout" />
              <el-option label="用户创建" value="user_create" />
              <el-option label="登录失败" value="login_failed" />
              <el-option label="应用创建" value="app_create" />
              <el-option label="角色分配" value="role_assign" />
              <el-option label="密码重置" value="password_reset" />
              <el-option label="OAuth授权" value="oauth_authorize" />
            </el-select>
            <el-select v-model="auditResultFilter" placeholder="结果" style="width: 100px" clearable>
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failure" />
            </el-select>
            <el-input
              v-model="auditUserFilter"
              placeholder="用户筛选"
              style="width: 150px"
              clearable
            />
            <el-button type="primary" @click="searchAuditLogs(0)">搜索</el-button>
          </div>

          <!-- 日志列表 -->
          <el-table :data="auditLogs" style="width: 100%" v-loading="auditLoading">
            <template #empty>
              <div class="empty-state">
                <el-icon size="48" color="#c0c4cc">
                  <Document />
                </el-icon>
                <p class="empty-text">暂无审计日志数据</p>
                <p class="empty-hint">请尝试调整筛选条件或稍后再试</p>
              </div>
            </template>
            <el-table-column label="时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column label="用户" width="120">
              <template #default="scope">
                {{ scope.row.username || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="事件类型" width="140">
              <template #default="scope">
                <el-tag :type="getEventTypeTagType(scope.row.event_type)" size="small">
                  {{ formatEventType(scope.row.event_type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <span class="operation-text">{{ scope.row.action || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="资源" show-overflow-tooltip>
              <template #default="scope">
                <span class="resource-text">{{ scope.row.resource || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="结果" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.result === 'success' ? 'success' : 'danger'">
                  {{ scope.row.result === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="ip_address" label="IP地址" width="120" />
            <el-table-column label="详情" show-overflow-tooltip width="200">
              <template #default="scope">
                <span class="details-text">{{ scope.row.details || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" link @click="viewAuditDetail(scope.row)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="auditPagination.page"
              v-model:page-size="auditPagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="auditPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleAuditPageSizeChange"
              @current-change="handleAuditPageChange"
            />
          </div>
        </div>

        <!-- 系统设置页面 -->
        <div v-if="activeMenu === 'settings'" class="content-section">
          <div class="section-header">
            <h2>系统设置</h2>
          </div>

          <el-tabs v-model="settingsTab">
            <el-tab-pane label="基本设置" name="basic">
              <el-form :model="systemSettings" label-width="120px">
                <el-form-item label="系统名称">
                  <el-input v-model="systemSettings.systemName" />
                </el-form-item>
                <el-form-item label="系统描述">
                  <el-input v-model="systemSettings.systemDescription" type="textarea" />
                </el-form-item>
                <el-form-item label="登录页标题">
                  <el-input v-model="systemSettings.loginTitle" />
                </el-form-item>
                <el-form-item label="会话超时">
                  <el-input-number v-model="systemSettings.sessionTimeout" :min="1" :max="1440" /> 分钟
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveSystemSettings">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="安全设置" name="security">
              <el-form :model="securitySettings" label-width="120px">
                <el-form-item label="密码策略">
                  <el-checkbox-group v-model="securitySettings.passwordPolicy">
                    <el-checkbox label="requireUppercase">包含大写字母</el-checkbox>
                    <el-checkbox label="requireLowercase">包含小写字母</el-checkbox>
                    <el-checkbox label="requireNumbers">包含数字</el-checkbox>
                    <el-checkbox label="requireSpecialChars">包含特殊字符</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="最小密码长度">
                  <el-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="32" />
                </el-form-item>
                <el-form-item label="登录失败锁定">
                  <el-switch v-model="securitySettings.enableLoginLock" />
                </el-form-item>
                <el-form-item label="最大失败次数" v-if="securitySettings.enableLoginLock">
                  <el-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
      </main>
    </div>

    <!-- 创建用户对话框 -->
    <el-dialog v-model="showCreateUserDialog" title="新增用户" width="600px">
      <el-form :model="newUser" :rules="userRules" ref="userFormRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="newUser.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newUser.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="newUser.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUser.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="newUser.roles" multiple placeholder="选择角色">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateUserDialog = false">取消</el-button>
        <el-button type="primary" @click="createUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建应用对话框 -->
    <el-dialog v-model="showCreateAppDialog" title="新增应用" width="600px">
      <el-form :model="newApp" :rules="appRules" ref="appFormRef" label-width="100px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="newApp.name" />
        </el-form-item>
        <el-form-item label="应用描述" prop="description">
          <el-input v-model="newApp.description" type="textarea" />
        </el-form-item>
        <el-form-item label="回调地址" prop="redirectUri">
          <el-input v-model="newApp.redirectUri" />
        </el-form-item>
        <el-form-item label="应用类型" prop="type">
          <el-select v-model="newApp.type" placeholder="选择应用类型">
            <el-option label="Web应用" value="web" />
            <el-option label="移动应用" value="mobile" />
            <el-option label="桌面应用" value="desktop" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateAppDialog = false">取消</el-button>
        <el-button type="primary" @click="createApp">确定</el-button>
      </template>
    </el-dialog>

    <!-- 创建角色对话框 -->
    <el-dialog v-model="showCreateRoleDialog" title="新增角色" width="600px">
      <el-form :model="newRole" :rules="roleRules" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="newRole.name" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="newRole.description" type="textarea" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group v-model="newRole.permissions">
            <el-checkbox v-for="permission in permissions" :key="permission.name" :label="permission.name">
              {{ permission.description }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="createRole">确定</el-button>
      </template>
    </el-dialog>

    <!-- 审计日志详情对话框 -->
    <el-dialog v-model="showAuditDetailDialog" title="审计日志详情" width="800px">
      <div v-if="selectedAuditLog" class="audit-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="事件类型">
            <el-tag :type="selectedAuditLog.event_type === 'login_failed' ? 'danger' : 'success'">
              {{ selectedAuditLog.event_type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作结果">
            <el-tag :type="selectedAuditLog.result === 'success' ? 'success' : 'danger'">
              {{ selectedAuditLog.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ selectedAuditLog.username || '未知用户' }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ selectedAuditLog.user_id || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedAuditLog.ip_address }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            {{ selectedAuditLog.user_agent || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="应用名称">
            {{ selectedAuditLog.application_name || '系统' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作">
            {{ selectedAuditLog.action || '未知操作' }}
          </el-descriptions-item>
          <el-descriptions-item label="资源">
            {{ selectedAuditLog.resource || '未知资源' }}
          </el-descriptions-item>
          <el-descriptions-item label="时间">
            {{ formatDateTime(selectedAuditLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2">
            <div class="detail-content">
              {{ selectedAuditLog.details || '无详细信息' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showAuditDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import api, { auditAPI, type AuditLog } from '@/utils/api'

const router = useRouter()
const authStore = useAuthStore()

// 当前用户信息
const currentUser = computed(() => authStore.user)

// 活动菜单
const activeMenu = ref('dashboard')

// 概览数据
const dashboardStats = reactive({
  totalUsers: 1248,
  totalApps: 32,
  todayLogins: 456,
  activeUsers: 892
})

// 最近活动
const recentActivities = ref([
  {
    time: '2024-01-15 14:30:25',
    user: '张三',
    action: '登录',
    resource: 'OA系统',
    status: '成功'
  },
  {
    time: '2024-01-15 14:28:12',
    user: '李四',
    action: '创建用户',
    resource: '用户管理',
    status: '成功'
  },
  {
    time: '2024-01-15 14:25:08',
    user: '王五',
    action: '登录',
    resource: 'CRM系统',
    status: '失败'
  }
])

// 用户管理相关
const users = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    avatar: '',
    roles: ['管理员', '用户'],
    status: 'active',
    lastLogin: '2024-01-15 14:30:25'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    avatar: '',
    roles: ['用户'],
    status: 'active',
    lastLogin: '2024-01-15 13:45:12'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    avatar: '',
    roles: ['用户'],
    status: 'disabled',
    lastLogin: '2024-01-14 16:20:30'
  }
])

const userSearch = ref('')
const userStatusFilter = ref('')
const usersLoading = ref(false)
const userPagination = reactive({
  page: 1,
  size: 10,
  total: 100
})

// 筛选后的用户列表
const filteredUsers = computed(() => {
  let result = users.value
  
  if (userSearch.value) {
    result = result.filter(user => 
      user.name.includes(userSearch.value) ||
      user.email.includes(userSearch.value) ||
      user.phone.includes(userSearch.value)
    )
  }
  
  if (userStatusFilter.value) {
    result = result.filter(user => user.status === userStatusFilter.value)
  }
  
  return result
})

// 应用管理相关
const applications = ref([
  {
    id: 1,
    name: 'OA办公系统',
    description: '企业办公自动化系统',
    icon: '',
    redirectUri: 'https://oa.example.com/callback',
    status: 'active',
    userCount: 245,
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'CRM客户管理',
    description: '客户关系管理系统',
    icon: '',
    redirectUri: 'https://crm.example.com/callback',
    status: 'active',
    userCount: 128,
    createdAt: '2024-01-05'
  },
  {
    id: 3,
    name: 'ERP企业资源',
    description: '企业资源规划系统',
    icon: '',
    redirectUri: 'https://erp.example.com/callback',
    status: 'disabled',
    userCount: 89,
    createdAt: '2024-01-10'
  }
])

// 权限管理相关
const permissionTab = ref('roles')
const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限',
    permissions: ['user:read', 'user:write', 'app:read', 'app:write', 'role:read', 'role:write'],
    userCount: 2
  },
  {
    id: 2,
    name: '管理员',
    description: '拥有用户和应用管理权限',
    permissions: ['user:read', 'user:write', 'app:read'],
    userCount: 5
  },
  {
    id: 3,
    name: '普通用户',
    description: '基本用户权限',
    permissions: ['user:read'],
    userCount: 1241
  }
])

const permissions = ref([
  { name: 'user:read', resource: '用户', action: '查看', description: '查看用户信息' },
  { name: 'user:write', resource: '用户', action: '编辑', description: '编辑用户信息' },
  { name: 'app:read', resource: '应用', action: '查看', description: '查看应用信息' },
  { name: 'app:write', resource: '应用', action: '编辑', description: '编辑应用信息' },
  { name: 'role:read', resource: '角色', action: '查看', description: '查看角色信息' },
  { name: 'role:write', resource: '角色', action: '编辑', description: '编辑角色信息' }
])

// 审计日志相关
const auditLogs = ref<AuditLog[]>([])

const auditDateRange = ref([])
const auditTypeFilter = ref('')
const auditResultFilter = ref('')
const auditUserFilter = ref('')
const auditLoading = ref(false)
const auditPagination = reactive({
  page: 1,
  size: 10,
  total: 200
})

// 系统设置相关
const settingsTab = ref('basic')
const systemSettings = reactive({
  systemName: 'SSO 单点登录系统',
  systemDescription: '企业级统一身份认证解决方案',
  loginTitle: '欢迎登录',
  sessionTimeout: 30
})

const securitySettings = reactive({
  passwordPolicy: ['requireUppercase', 'requireLowercase', 'requireNumbers'],
  minPasswordLength: 8,
  enableLoginLock: true,
  maxLoginAttempts: 5
})

// 对话框控制
const showCreateUserDialog = ref(false)
const showCreateAppDialog = ref(false)
const showCreateRoleDialog = ref(false)
const showImportDialog = ref(false)
const showAuditDetailDialog = ref(false)
const selectedAuditLog = ref<AuditLog | null>(null)

// 表单数据
const newUser = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  roles: []
})

const newApp = reactive({
  name: '',
  description: '',
  redirectUri: '',
  type: ''
})

const newRole = reactive({
  name: '',
  description: '',
  permissions: []
})

// 表单验证规则
const userRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const appRules: FormRules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入应用描述', trigger: 'blur' }],
  redirectUri: [{ required: true, message: '请输入回调地址', trigger: 'blur' }],
  type: [{ required: true, message: '请选择应用类型', trigger: 'change' }]
}

const roleRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
}

// 方法
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 跳转到个人资料页面
      break
    case 'settings':
      activeMenu.value = 'settings'
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

// 用户管理方法
const searchUsers = () => {
  usersLoading.value = true
  // 模拟API调用
  setTimeout(() => {
    usersLoading.value = false
  }, 1000)
}

const editUser = (user: any) => {
  ElMessage.info('编辑用户功能开发中')
}

const resetPassword = (user: any) => {
  ElMessageBox.confirm('确定要重置该用户的密码吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码重置成功')
  })
}

const toggleUserStatus = (user: any) => {
  const action = user.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    user.status = user.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`用户${action}成功`)
  })
}

const createUser = () => {
  ElMessage.success('用户创建成功')
  showCreateUserDialog.value = false
  // 重置表单
  Object.assign(newUser, {
    name: '',
    email: '',
    phone: '',
    password: '',
    roles: []
  })
}

const handleUserPageSizeChange = (size: number) => {
  userPagination.size = size
  searchUsers()
}

const handleUserPageChange = (page: number) => {
  userPagination.page = page
  searchUsers()
}

// 应用管理方法
const handleAppCommand = (command: string, app: any) => {
  switch (command) {
    case 'edit':
      ElMessage.info('编辑应用功能开发中')
      break
    case 'config':
      ElMessage.info('应用配置功能开发中')
      break
    case 'stats':
      ElMessage.info('应用统计功能开发中')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除该应用吗？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('应用删除成功')
      })
      break
  }
}

const createApp = () => {
  ElMessage.success('应用创建成功')
  showCreateAppDialog.value = false
  // 重置表单
  Object.assign(newApp, {
    name: '',
    description: '',
    redirectUri: '',
    type: ''
  })
}

// 权限管理方法
const editRole = (role: any) => {
  ElMessage.info('编辑角色功能开发中')
}

const deleteRole = (role: any) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('角色删除成功')
  })
}

const createRole = () => {
  ElMessage.success('角色创建成功')
  showCreateRoleDialog.value = false
  // 重置表单
  Object.assign(newRole, {
    name: '',
    description: '',
    permissions: []
  })
}

// 审计日志方法
const searchAuditLogs = async (retryCount = 0) => {
  auditLoading.value = true
  try {
    const params: any = {
      page: auditPagination.page,
      limit: auditPagination.size
    }
    
    // 添加筛选条件
    if (auditTypeFilter.value) {
      params.event_type = auditTypeFilter.value
    }
    
    if (auditResultFilter.value) {
      params.result = auditResultFilter.value
    }
    
    if (auditUserFilter.value) {
      params.username = auditUserFilter.value
    }
    
    // 添加时间范围筛选
    if (auditDateRange.value && auditDateRange.value.length === 2) {
      params.start_date = auditDateRange.value[0]
      params.end_date = auditDateRange.value[1]
    }
    
    const response = await auditAPI.getAuditLogs(params)
    
    if (response.data.success) {
      auditLogs.value = response.data.data || []
      auditPagination.total = response.data.pagination?.total || 0
      
      // 如果没有数据，显示友好提示
      if (auditLogs.value.length === 0 && auditPagination.page === 1) {
        ElMessage.info('暂无审计日志数据')
      }
    } else {
      const errorMsg = response.data.message || '获取审计日志失败'
      ElMessage.error(errorMsg)
      auditLogs.value = []
    }
  } catch (error: any) {
    console.error('获取审计日志错误:', error)
    
    // 网络错误处理
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      if (retryCount < 2) {
        ElMessage.warning(`网络连接失败，正在重试... (${retryCount + 1}/3)`)
        setTimeout(() => searchAuditLogs(retryCount + 1), 2000)
        return
      } else {
        ElMessage.error('网络连接失败，请检查网络连接后重试')
      }
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      authStore.logout()
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('您没有权限访问审计日志')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试')
    } else {
      const errorMsg = error.response?.data?.message || error.message || '获取审计日志失败，请稍后重试'
      ElMessage.error(errorMsg)
    }
    
    auditLogs.value = []
  } finally {
    auditLoading.value = false
  }
}

const viewAuditDetail = (log: AuditLog) => {
  if (!log) {
    ElMessage.error('审计日志数据无效')
    return
  }
  
  // 验证必要字段
  if (!log.id || !log.timestamp) {
    ElMessage.error('审计日志数据不完整，无法查看详情')
    return
  }
  
  selectedAuditLog.value = log
  showAuditDetailDialog.value = true
}

const exportAuditLogs = async () => {
  // 检查是否有数据可导出
  if (auditLogs.value.length === 0) {
    ElMessage.warning('暂无数据可导出，请先加载审计日志数据')
    return
  }
  
  const loadingMessage = ElMessage.info({
    message: '正在导出审计日志，请稍候...',
    duration: 0 // 不自动关闭
  })
  
  try {
    // 构建导出参数
    const params: any = {
      format: 'csv' // 默认导出CSV格式
    }
    
    // 添加当前筛选条件
    if (auditTypeFilter.value) {
      params.event_type = auditTypeFilter.value
    }
    
    if (auditResultFilter.value) {
      params.result = auditResultFilter.value
    }
    
    if (auditUserFilter.value) {
      params.username = auditUserFilter.value
    }
    
    if (auditDateRange.value && auditDateRange.value.length === 2) {
      params.start_date = auditDateRange.value[0]
      params.end_date = auditDateRange.value[1]
    }
    
    const response = await auditAPI.exportAuditLogs(params)
    
    // 检查响应数据
    if (!response.data) {
      throw new Error('导出数据为空')
    }
    
    // 创建下载链接
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 生成文件名
    const now = new Date()
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '')
    link.download = `audit_logs_${timestamp}.csv`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    loadingMessage.close()
    ElMessage.success('审计日志导出成功')
  } catch (error: any) {
    loadingMessage.close()
    console.error('导出审计日志错误:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      authStore.logout()
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('您没有权限导出审计日志')
    } else if (error.response?.status === 413) {
      ElMessage.error('导出数据量过大，请缩小时间范围或添加筛选条件')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器内部错误，请稍后重试')
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络连接后重试')
    } else {
      const errorMsg = error.response?.data?.message || error.message || '导出审计日志失败，请稍后重试'
      ElMessage.error(errorMsg)
    }
  }
}

const handleAuditPageSizeChange = (size: number) => {
  if (size <= 0 || size > 100) {
    ElMessage.error('页面大小设置无效')
    return
  }
  
  auditPagination.size = size
  auditPagination.page = 1 // 重置到第一页
  searchAuditLogs()
}

const handleAuditPageChange = (page: number) => {
  if (page <= 0) {
    ElMessage.error('页码设置无效')
    return
  }
  
  auditPagination.page = page
  searchAuditLogs()
}

// 系统设置方法
const saveSystemSettings = () => {
  ElMessage.success('系统设置保存成功')
}

const saveSecuritySettings = () => {
  ElMessage.success('安全设置保存成功')
}

// 时间格式化方法
const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 事件类型格式化方法
const formatEventType = (eventType: string) => {
  const eventTypeMap: Record<string, string> = {
    'user_login': '用户登录',
    'user_logout': '用户登出',
    'user_create': '用户创建',
    'login_failed': '登录失败',
    'app_create': '应用创建',
    'role_assign': '角色分配',
    'password_reset': '密码重置',
    'oauth_authorize': 'OAuth授权'
  }
  return eventTypeMap[eventType] || eventType
}

// 获取事件类型标签类型
const getEventTypeTagType = (eventType: string) => {
  const dangerTypes = ['login_failed', 'password_reset']
  const warningTypes = ['user_logout', 'role_assign']
  const successTypes = ['user_login', 'user_create', 'app_create', 'oauth_authorize']
  
  if (dangerTypes.includes(eventType)) {
    return 'danger'
  } else if (warningTypes.includes(eventType)) {
    return 'warning'
  } else if (successTypes.includes(eventType)) {
    return 'success'
  }
  return 'info'
}

// 监听菜单切换，自动加载对应数据
watch(activeMenu, (newMenu) => {
  if (newMenu === 'audit') {
    searchAuditLogs()
  }
})

// 组件挂载时检查权限并加载数据
onMounted(() => {
  if (!authStore.user || !authStore.user.roles?.includes('管理员')) {
    ElMessage.error('您没有访问管理后台的权限')
    router.push('/dashboard')
    return
  }
  
  // 加载审计日志数据
  if (activeMenu.value === 'audit') {
    searchAuditLogs()
  }
})
</script>

<style scoped lang="scss">
.admin-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

// 顶部导航样式
.admin-header {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border-bottom: none;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .system-title {
    font-size: 20px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.5px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  .user-name {
    font-size: 14px;
    color: white;
    font-weight: 600;
  }
}

// 主要布局样式
.admin-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// 侧边栏样式
.admin-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  padding: 24px 0;
  
  .el-menu-item {
    height: 56px;
    line-height: 56px;
    padding: 0 32px;
    margin: 4px 0;
    color: #6b7280;
    font-weight: 500;
    position: relative;
    transition: all 0.3s ease;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: transparent;
      transition: all 0.3s ease;
    }
    
    &:hover {
      background: linear-gradient(90deg, rgba(220, 38, 38, 0.08), transparent);
      color: #dc2626;
      
      &::before {
        background: #dc2626;
      }
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(220, 38, 38, 0.12), transparent);
      color: #dc2626;
      font-weight: 600;
      
      &::before {
        background: #dc2626;
      }
    }
  }
}

// 主内容区样式
.admin-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: #f8fafc;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  animation: slideInUp 0.4s ease-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 16px;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
    letter-spacing: -0.5px;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 4px 0 0 0;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

// 统计卡片样式
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.user-icon {
    background: #e6f7ff;
    color: #1890ff;
  }
  
  &.app-icon {
    background: #f6ffed;
    color: #52c41a;
  }
  
  &.login-icon {
    background: #fff7e6;
    color: #fa8c16;
  }
  
  &.active-icon {
    background: #f9f0ff;
    color: #722ed1;
  }
}

.stat-content {
  flex: 1;
  
  .stat-number {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #6b7280;
  }
}

// 最近活动样式
.recent-activities {
  margin-top: 32px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 16px 0;
  }
}

// 筛选栏样式
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
}

// 应用卡片样式
.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.app-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  .app-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
  
  .app-details {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }
  
  .app-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .stat-label {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }
  }
  
  .app-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #9ca3af;
    
    .app-url {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 8px;
    }
  }
}

// 分页样式
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

// 响应式设计
@media (max-width: 768px) {
  .admin-header {
    padding: 8px 16px;
    
    .header-title {
      font-size: 18px;
    }
    
    .user-info .user-name {
      display: none;
    }
  }
  
  .admin-main {
    flex-direction: column;
    
    .admin-sidebar {
      width: 100%;
      height: auto;
      order: 2;
    }
    
    .admin-content {
      order: 1;
      padding: 16px;
    }
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .app-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .app-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 审计日志详情样式
.audit-detail {
  .detail-content {
    background: #f8fafc;
    padding: 12px;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }
  
  :deep(.el-descriptions__body) {
    .el-descriptions__table {
      .el-descriptions__cell {
        padding: 12px 16px;
      }
      
      .el-descriptions__label {
        font-weight: 600;
        color: #374151;
        background: #f9fafb;
      }
      
      .el-descriptions__content {
        color: #6b7280;
      }
    }
  }
}

// 审计日志表格样式
.operation-text {
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
}

.resource-text {
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.details-text {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  .empty-text {
    font-size: 16px;
    font-weight: 500;
    color: #6b7280;
    margin: 16px 0 8px 0;
  }
  
  .empty-hint {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
  }
}

</style>