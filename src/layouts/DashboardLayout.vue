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
          :default-active="$route.path"
          class="sidebar-menu"
          router
        >
          <el-menu-item index="/dashboard/overview">
            <el-icon><Odometer /></el-icon>
            <span>概览</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/applications">
            <el-icon><Grid /></el-icon>
            <span>我的应用</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/profile">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/security">
            <el-icon><Lock /></el-icon>
            <span>安全设置</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/sessions">
            <el-icon><Monitor /></el-icon>
            <span>登录会话</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/logs" v-if="authStore.user?.roles?.includes('admin')">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
          <el-menu-item index="/admin" v-if="authStore.hasAnyUserPermission(['管理员', '超级管理员'])" @click="goToAdmin">
            <el-icon><Tools /></el-icon>
            <span>系统管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Lock, User, ArrowDown, Setting, SwitchButton, Odometer, Grid,
  Monitor, Document, Tools
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 使用认证store和路由
const authStore = useAuthStore();
const router = useRouter();

// 处理用户下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push({ name: 'profile' });
      break;
    case 'settings':
      router.push({ name: 'security' });
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '确认退出',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
        await authStore.logout();
      } catch {
        // 用户取消退出
      }
      break;
  }
};

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin');
};
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
}

.main-container {
  flex: 1;
  height: calc(100vh - 64px);
  overflow: hidden;
  min-width: 0; /* 允许flex子元素收缩 */
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
  flex-shrink: 0; /* 防止侧边栏被压缩 */
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.main-content {
  background: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
  overflow-x: auto; /* 添加水平滚动 */
  height: 100%;
  min-width: 800px; /* 设置最小宽度确保内容不被截断 */
  width: 100%;
}
</style>