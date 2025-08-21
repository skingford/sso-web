<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <el-header class="dashboard-header">
      <div class="header-left">
        <div class="logo">
          <el-icon :size="32" color="#409EFF">
            <Lock />
          </el-icon>
          <span class="logo-text">SSO 控制台</span>
        </div>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="authStore.user?.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="username">{{ authStore.user?.display_name || authStore.user?.username }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                账户设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside class="sidebar" width="240px">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><Odometer /></el-icon>
            <span>概览</span>
          </el-menu-item>
          <el-menu-item index="applications">
            <el-icon><Grid /></el-icon>
            <span>我的应用</span>
          </el-menu-item>
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon><Lock /></el-icon>
            <span>安全设置</span>
          </el-menu-item>
          <el-menu-item index="sessions">
            <el-icon><Monitor /></el-icon>
            <span>登录会话</span>
          </el-menu-item>
          <el-menu-item index="logs" v-if="authStore.user?.roles?.includes('admin')">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
          <el-menu-item index="admin" v-if="authStore.hasAnyUserPermission(['管理员', '超级管理员'])" @click="() => goToAdmin()">
            <el-icon><Tools /></el-icon>
            <span>系统管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 概览页面 -->
        <div v-if="activeMenu === 'overview'" class="content-section">
          <div class="section-header">
            <h2>概览</h2>
            <p>欢迎回来，{{ authStore.user?.display_name || authStore.user?.username }}！</p>
          </div>

          <!-- 统计卡片 -->
          <el-row :gutter="20" class="stats-row">
            <el-col :span="6">
              <el-card class="stats-card">
                <div class="stats-content">
                  <div class="stats-icon apps">
                    <el-icon><Grid /></el-icon>
                  </div>
                  <div class="stats-info">
                    <div class="stats-number">{{ userApplications.length }}</div>
                    <div class="stats-label">可访问应用</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stats-card">
                <div class="stats-content">
                  <div class="stats-icon sessions">
                    <el-icon><Monitor /></el-icon>
                  </div>
                  <div class="stats-info">
                    <div class="stats-number">{{ activeSessions.length }}</div>
                    <div class="stats-label">活跃会话</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stats-card">
                <div class="stats-content">
                  <div class="stats-icon logins">
                    <el-icon><Calendar /></el-icon>
                  </div>
                  <div class="stats-info">
                    <div class="stats-number">{{ recentLogins }}</div>
                    <div class="stats-label">本月登录</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stats-card">
                <div class="stats-content">
                  <div class="stats-icon security">
                    <el-icon><Lock /></el-icon>
                  </div>
                  <div class="stats-info">
                    <div class="stats-number">{{ securityScore }}</div>
                    <div class="stats-label">安全评分</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 快速访问 -->
          <el-card class="quick-access-card">
            <template #header>
              <div class="card-header">
                <span>快速访问</span>
              </div>
            </template>
            <el-row :gutter="16">
              <el-col :span="6" v-for="app in userApplications.slice(0, 4)" :key="app.id">
                <div class="app-item" @click="accessApplication(app)">
                  <div class="app-icon">
                    <el-avatar :size="48" :src="app.logo_url">
                      <el-icon><Grid /></el-icon>
                    </el-avatar>
                  </div>
                  <div class="app-info">
                    <div class="app-name">{{ app.name }}</div>
                    <div class="app-desc">{{ app.description }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <!-- 我的应用页面 -->
        <div v-if="activeMenu === 'applications'" class="content-section">
          <div class="section-header">
            <h2>我的应用</h2>
            <p>您可以访问的所有应用程序</p>
          </div>

          <el-row :gutter="20">
            <el-col :span="8" v-for="app in userApplications" :key="app.id">
              <el-card class="application-card" @click="accessApplication(app)">
                <div class="app-header">
                  <el-avatar :size="64" :src="app.logo_url">
                    <el-icon><Grid /></el-icon>
                  </el-avatar>
                  <div class="app-status" :class="app.status">
                    {{ app.status === 'active' ? '正常' : '维护中' }}
                  </div>
                </div>
                <div class="app-content">
                  <h3>{{ app.name }}</h3>
                  <p>{{ app.description }}</p>
                  <div class="app-meta">
                    <span class="app-type">应用</span>
                    <span class="app-url">{{ app.redirect_uris[0] || '未配置' }}</span>
                  </div>
                </div>
                <div class="app-actions">
                  <el-button type="primary" size="small" @click.stop="accessApplication(app)">
                    访问应用
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 个人资料页面 -->
        <div v-if="activeMenu === 'profile'" class="content-section">
          <div class="section-header">
            <h2>个人资料</h2>
            <p>管理您的个人信息</p>
          </div>

          <el-card>
            <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="profileForm.username" disabled />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" />
                  </el-form-item>
                  <el-form-item label="显示名称" prop="display_name">
                    <el-input v-model="profileForm.display_name" />
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileForm.phone" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="头像">
                    <div class="avatar-upload">
                      <el-avatar :size="80" :src="profileForm.avatar_url">
                        <el-icon><User /></el-icon>
                      </el-avatar>
                      <el-button size="small" class="upload-btn">更换头像</el-button>
                    </div>
                  </el-form-item>

                </el-col>
              </el-row>
              <el-form-item>
                <el-button type="primary" @click="updateProfile">保存更改</el-button>
                <el-button @click="resetProfile">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>

        <!-- 安全设置页面 -->
        <div v-if="activeMenu === 'security'" class="content-section">
          <div class="section-header">
            <h2>安全设置</h2>
            <p>管理您的账户安全</p>
          </div>

          <!-- 修改密码 -->
          <el-card class="security-card">
            <template #header>
              <div class="card-header">
                <span>修改密码</span>
              </div>
            </template>
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
              <el-form-item label="当前密码" prop="current_password">
                <el-input v-model="passwordForm.current_password" type="password" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="new_password">
                <el-input v-model="passwordForm.new_password" type="password" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirm_password">
                <el-input v-model="passwordForm.confirm_password" type="password" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 两步验证 -->
          <el-card class="security-card">
            <template #header>
              <div class="card-header">
                <span>两步验证</span>
                <el-tag :type="twoFactorEnabled ? 'success' : 'warning'">
                  {{ twoFactorEnabled ? '已启用' : '未启用' }}
                </el-tag>
              </div>
            </template>
            <div class="two-factor-content">
              <p>两步验证为您的账户提供额外的安全保护</p>
              <el-button 
                :type="twoFactorEnabled ? 'danger' : 'primary'"
                @click="toggleTwoFactor"
              >
                {{ twoFactorEnabled ? '禁用两步验证' : '启用两步验证' }}
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 登录会话页面 -->
        <div v-if="activeMenu === 'sessions'" class="content-section">
          <div class="section-header">
            <h2>登录会话</h2>
            <p>管理您的活跃登录会话</p>
          </div>

          <el-card>
            <el-table :data="activeSessions" style="width: 100%">
              <el-table-column prop="device" label="设备" width="200" />
              <el-table-column prop="location" label="位置" width="150" />
              <el-table-column prop="ip_address" label="IP地址" width="150" />
              <el-table-column prop="login_time" label="登录时间" width="180" />
              <el-table-column prop="last_activity" label="最后活动" width="180" />
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.is_current ? 'success' : 'info'">
                    {{ scope.row.is_current ? '当前会话' : '活跃' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button 
                    v-if="!scope.row.is_current"
                    type="danger" 
                    size="small" 
                    @click="terminateSession(scope.row.id)"
                  >
                    终止
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 管理员入口 -->
        <div v-if="activeMenu === 'admin' && authStore.hasAnyUserPermission(['管理员', '超级管理员'])" class="content-section">
          <div class="section-header">
            <h2>系统管理</h2>
            <p>管理系统用户、应用和权限</p>
          </div>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="admin-card" @click="goToAdmin('users')">
                <div class="admin-icon">
                  <el-icon :size="48"><UserFilled /></el-icon>
                </div>
                <h3>用户管理</h3>
                <p>管理系统用户账户</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="admin-card" @click="goToAdmin('applications')">
                <div class="admin-icon">
                  <el-icon :size="48"><Grid /></el-icon>
                </div>
                <h3>应用管理</h3>
                <p>管理接入的应用系统</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="admin-card" @click="goToAdmin('permissions')">
                <div class="admin-icon">
                  <el-icon :size="48"><Lock /></el-icon>
                </div>
                <h3>权限管理</h3>
                <p>管理用户角色和权限</p>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import {
  Lock, User, ArrowDown, Setting, SwitchButton, Odometer, Grid,
  Monitor, Document, Tools, Calendar, UserFilled
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import { authAPI, usersAPI, applicationsAPI } from '@/utils/api';
import type { User as UserType, Application } from '@/utils/api';

// 使用认证store和路由
const authStore = useAuthStore();
const router = useRouter();

// 当前激活的菜单
const activeMenu = ref('overview');

// 表单引用
const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

// 用户应用列表
const userApplications = ref<Application[]>([]);

// 活跃会话列表
const activeSessions = ref([
  {
    id: '1',
    device: 'Chrome on Windows',
    location: '北京',
    ip_address: '192.168.1.100',
    login_time: '2024-01-15 09:30:00',
    last_activity: '2024-01-15 14:25:00',
    is_current: true
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: '上海',
    ip_address: '192.168.1.101',
    login_time: '2024-01-14 18:20:00',
    last_activity: '2024-01-15 08:15:00',
    is_current: false
  }
]);

// 统计数据
const recentLogins = ref(28);
const securityScore = ref(85);

// 个人资料表单
const profileForm = reactive({
  username: '',
  email: '',
  display_name: '',
  phone: '',
  avatar_url: ''
});

// 密码修改表单
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
});

// 两步验证状态
const twoFactorEnabled = ref(false);

// 表单验证规则
const profileRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ]
};

const passwordRules: FormRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      activeMenu.value = 'profile';
      break;
    case 'settings':
      activeMenu.value = 'security';
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    await authStore.logout();
  } catch (error) {
    // 用户取消登出
  }
};

// 访问应用
const accessApplication = (app: Application) => {
  if (app.status !== 'active') {
    ElMessage.warning('应用正在维护中，暂时无法访问');
    return;
  }
  
  // 这里可以实现SSO跳转逻辑
  ElMessage.success(`正在跳转到 ${app.name}...`);
  // window.open(app.redirect_uri, '_blank');
};

// 更新个人资料
const updateProfile = async () => {
  if (!profileFormRef.value) return;
  
  try {
    const valid = await profileFormRef.value.validate();
    if (valid) {
      // 调用API更新用户信息
      ElMessage.success('个人资料更新成功');
    }
  } catch (error) {
    console.error('Profile update error:', error);
  }
};

// 重置个人资料
const resetProfile = () => {
  if (authStore.user) {
    Object.assign(profileForm, {
      username: authStore.user.username,
      email: authStore.user.email,
      display_name: authStore.user.display_name || '',
      phone: '',
      avatar_url: authStore.user.avatar || ''
    });
  }
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    const valid = await passwordFormRef.value.validate();
    if (valid) {
      ElMessage.success('密码修改成功');
      // 重置表单
      Object.assign(passwordForm, {
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  } catch (error) {
    console.error('Password change error:', error);
  }
};

// 切换两步验证
const toggleTwoFactor = () => {
  if (twoFactorEnabled.value) {
    ElMessageBox.confirm('确定要禁用两步验证吗？这会降低您账户的安全性。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      twoFactorEnabled.value = false;
      ElMessage.success('两步验证已禁用');
    }).catch(() => {});
  } else {
    ElMessage.info('两步验证设置功能正在开发中...');
  }
};

// 终止会话
const terminateSession = (sessionId: string) => {
  ElMessageBox.confirm('确定要终止这个会话吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从列表中移除会话
    const index = activeSessions.value.findIndex(session => session.id === sessionId);
    if (index > -1) {
      activeSessions.value.splice(index, 1);
      ElMessage.success('会话已终止');
    }
  }).catch(() => {});
};

// 跳转到管理页面
 const goToAdmin = (section?: string) => {
   if (section) {
     ElMessage.info(`正在跳转到${section === 'users' ? '用户' : section === 'applications' ? '应用' : '权限'}管理页面...`);
     // 这里可以实现路由跳转到具体的管理页面
     router.push('/admin');
   } else {
     // 从菜单点击进入管理后台
     router.push('/admin');
   }
}

// 加载用户应用
const loadUserApplications = async () => {
  try {
    // 这里应该调用实际的API
    // const response = await apiService.applications.getUserApplications();
    // userApplications.value = response.data;
    
    // 使用mock数据
    userApplications.value = [
      {
        id: '1',
        name: 'OA办公系统',
        description: '企业办公自动化系统',
        client_id: 'oa_system',
        client_secret: 'secret123',
        redirect_uris: ['https://oa.example.com/callback'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        logo_url: '',
        homepage_url: 'https://oa.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'CRM客户管理',
        description: '客户关系管理系统',
        client_id: 'crm_system',
        client_secret: 'secret456',
        redirect_uris: ['https://crm.example.com/callback'],
        allowed_scopes: ['read', 'write'],
        status: 'active',
        logo_url: '',
        homepage_url: 'https://crm.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: '财务系统',
        description: '企业财务管理系统',
        client_id: 'finance_system',
        client_secret: 'secret789',
        redirect_uris: ['https://finance.example.com/callback'],
        allowed_scopes: ['read', 'write'],
        status: 'maintenance',
        logo_url: '',
        homepage_url: 'https://finance.example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  } catch (error) {
    console.error('Failed to load user applications:', error);
    ElMessage.error('加载应用列表失败');
  }
};

// 组件挂载时初始化数据
onMounted(async () => {
  // 确保用户已登录
  if (!authStore.isAuthenticated) {
    window.location.href = '/login';
    return;
  }
  
  // 初始化个人资料表单
  resetProfile();
  
  // 加载用户应用
  await loadUserApplications();
});
</script>

<style scoped lang="scss">
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.dashboard-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 48px;
  height: 70px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1000;
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
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
  
  .username {
    font-size: 14px;
    color: white;
    font-weight: 600;
  }
  
  .dropdown-icon {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.main-container {
  flex: 1;
  background: #f8fafc;
}

.sidebar {
  background: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  border: none;
  height: 100%;
  
  :deep(.el-menu-item) {
    padding: 16px 48px;
    color: #6b7280;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.3s ease;
    position: relative;
    
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
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.08), transparent);
      color: #667eea;
      
      &::before {
        background: #667eea;
      }
    }
    
    &.is-active {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.12), transparent);
      color: #667eea;
      font-weight: 600;
      
      &::before {
        background: #667eea;
      }
    }
  }
}

.main-content {
  padding: 48px;
  overflow-y: auto;
  background: #f8fafc;
}

.content-section {
  max-width: 1200px;
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

// 统计卡片样式
.stats-row {
  margin-bottom: 64px;
}

.stats-card {
  cursor: pointer;
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
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 48px 24px 24px;
}

.stats-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stats-icon {
  &.apps {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.sessions {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  &.logins {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  &.security {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.stats-info {
  flex: 1;
  
  .stats-number {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stats-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

// 快速访问卡片
.quick-access-card {
  margin-bottom: 64px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 48px 48px 0;
  }
  
  :deep(.el-card__body) {
    padding: 24px 48px 48px;
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

.app-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
  
  .app-info {
    flex: 1;
    
    .app-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    
    .app-desc {
      font-size: 14px;
      color: #6b7280;
    }
  }
}

// 应用卡片样式
.application-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  :deep(.el-card__body) {
    padding: 32px;
  }
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.app-status {
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.active {
    background: #dcfce7;
    color: #16a34a;
  }
  
  &.maintenance {
    background: #fef3c7;
    color: #d97706;
  }
}

.app-content {
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 4px 0;
    letter-spacing: -0.3px;
  }
  
  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 16px 0;
    line-height: 1.6;
  }
}

.app-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.app-actions {
  margin-top: 24px;
  text-align: right;
  
  :deep(.el-button) {
    border-radius: 8px;
    font-weight: 600;
    padding: 8px 24px;
  }
}

// 头像上传样式
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  .upload-btn {
    width: 100px;
    border-radius: 8px;
  }
}

// 安全设置卡片
.security-card {
  margin-bottom: 48px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 48px 48px 0;
  }
  
  :deep(.el-card__body) {
    padding: 24px 48px 48px;
  }
  
  .two-factor-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    p {
      margin: 0;
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
    }
  }
}

// Element UI组件样式
:deep(.el-form-item__label) {
  color: #111827;
  font-weight: 600;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
  }
  
  &.is-focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 600;
  padding: 8px 24px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
}

:deep(.el-card) {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  
  th {
    background: #f9fafb;
    color: #111827;
    font-weight: 600;
  }
}

// 管理员卡片
.admin-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 64px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  .admin-icon {
    font-size: 48px;
    color: #667eea;
    margin-bottom: 24px;
    transition: all 0.3s ease;
  }
  
  .admin-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }
  
  .admin-desc {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
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

// 滚动条样式
.sidebar,
.main-content {
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 4px;
    
    &:hover {
      background: #6b7280;
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .sidebar {
    width: 240px !important;
  }
  
  .main-content {
    padding: 32px;
  }
  
  .stats-row .el-col {
    margin-bottom: 32px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 0 32px;
    height: 60px;
    
    .logo-text {
      font-size: 18px;
    }
  }
  
  .sidebar {
    width: 200px !important;
  }
  
  .main-content {
    padding: 32px;
  }
  
  .section-header h2 {
    font-size: 24px;
  }
  
  .stats-row .el-col,
  .application-card .el-col {
    margin-bottom: 24px;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 0 24px;
    
    .logo-text {
      font-size: 16px;
    }
  }
  
  .sidebar {
    width: 180px !important;
  }
  
  .main-content {
    padding: 24px;
  }
  
  .section-header h2 {
    font-size: 18px;
  }
  
  .stats-content {
    padding: 32px;
  }
  
  .quick-access-card,
  .security-card {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 32px;
    }
  }
  
  .admin-card {
    padding: 32px;
  }
}
</style>