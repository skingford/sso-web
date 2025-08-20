<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo和标题 -->
      <div class="login-header">
        <div class="logo">
          <el-icon :size="48" color="#409EFF">
            <Lock />
          </el-icon>
        </div>
        <h1 class="title">SSO 单点登录</h1>
        <p class="subtitle">统一身份认证平台</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名或邮箱"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember_me">
              记住我
            </el-checkbox>
            <el-link type="primary" :underline="false" @click="showForgotPassword">
              忘记密码？
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="authStore.isLoading"
            @click="handleLogin"
          >
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 分割线 -->
      <div class="divider">
        <span>或</span>
      </div>

      <!-- 第三方登录 -->
      <div class="third-party-login">
        <p class="third-party-title">第三方登录</p>
        <div class="third-party-buttons">
          <el-tooltip content="微信登录" placement="top">
            <el-button
              circle
              size="large"
              class="third-party-btn wechat"
              @click="handleThirdPartyLogin('wechat')"
            >
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="QQ登录" placement="top">
            <el-button
              circle
              size="large"
              class="third-party-btn qq"
              @click="handleThirdPartyLogin('qq')"
            >
              <el-icon><User /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="GitHub登录" placement="top">
            <el-button
              circle
              size="large"
              class="third-party-btn github"
              @click="handleThirdPartyLogin('github')"
            >
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="Google登录" placement="top">
            <el-button
              circle
              size="large"
              class="third-party-btn google"
              @click="handleThirdPartyLogin('google')"
            >
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 注册链接 -->
      <div class="register-link">
        <span>还没有账号？</span>
        <el-link type="primary" :underline="false" @click="showRegister">
          立即注册
        </el-link>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="忘记密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="forgotPasswordForm" :rules="forgotPasswordRules" ref="forgotPasswordFormRef">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            placeholder="请输入注册邮箱"
            prefix-icon="Message"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="forgotPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="handleForgotPassword">发送重置邮件</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 注册对话框 -->
    <el-dialog
      v-model="registerVisible"
      title="用户注册"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        <el-form-item label="显示名称" prop="display_name">
          <el-input
            v-model="registerForm.display_name"
            placeholder="请输入显示名称"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="registerVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRegister">注册</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Lock, User, ChatDotRound, Link, Search } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import type { LoginRequest } from '@/utils/api';

// 使用认证store
const authStore = useAuthStore();

// 表单引用
const loginFormRef = ref<FormInstance>();
const forgotPasswordFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();

// 登录表单
const loginForm = reactive<LoginRequest>({
  username: 'admin',
  password: 'password',
  remember_me: true,
});

// 忘记密码表单
const forgotPasswordForm = reactive({
  email: '',
});

// 注册表单
const registerForm = reactive({
  username: '',
  email: '',
  display_name: '',
  password: '',
  confirmPassword: '',
});

// 对话框显示状态
const forgotPasswordVisible = ref(false);
const registerVisible = ref(false);

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
  ],
};

const forgotPasswordRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
};

const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
    { min: 2, max: 20, message: '显示名称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    const valid = await loginFormRef.value.validate();
    if (valid) {
      await authStore.login(loginForm);
    }
  } catch (error) {
    console.error('Login validation error:', error);
  }
};

// 处理第三方登录
const handleThirdPartyLogin = (provider: string) => {
  ElMessage.info(`${provider} 登录功能正在开发中...`);
  
  // 这里可以实现实际的第三方登录逻辑
  // 例如跳转到OAuth授权页面
  // window.location.href = `/api/oauth/authorize?provider=${provider}&redirect_uri=${encodeURIComponent(window.location.origin)}`;
};

// 显示忘记密码对话框
const showForgotPassword = () => {
  forgotPasswordVisible.value = true;
};

// 处理忘记密码
const handleForgotPassword = async () => {
  if (!forgotPasswordFormRef.value) return;
  
  try {
    const valid = await forgotPasswordFormRef.value.validate();
    if (valid) {
      ElMessage.success('重置密码邮件已发送，请查收邮箱');
      forgotPasswordVisible.value = false;
      forgotPasswordForm.email = '';
    }
  } catch (error) {
    console.error('Forgot password validation error:', error);
  }
};

// 显示注册对话框
const showRegister = () => {
  registerVisible.value = true;
};

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  try {
    const valid = await registerFormRef.value.validate();
    if (valid) {
      ElMessage.success('注册成功，请联系管理员激活账号');
      registerVisible.value = false;
      // 重置表单
      Object.assign(registerForm, {
        username: '',
        email: '',
        display_name: '',
        password: '',
        confirmPassword: '',
      });
    }
  } catch (error) {
    console.error('Register validation error:', error);
  }
};

// 组件挂载时检查是否已登录
onMounted(() => {
  if (authStore.isAuthenticated) {
    // 如果已登录，跳转到仪表板
    window.location.href = '/dashboard';
  }
});
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  position: relative;
  overflow: hidden;
  padding: 24px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    pointer-events: none;
  }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
  padding: 64px 48px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.6s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 48px;
  
  .logo {
    margin-bottom: 24px;
  }
  
  .title {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
}

.login-form {
  margin-bottom: 32px;
  
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }
    
    &.is-focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
  
  :deep(.el-input__inner) {
    height: 48px;
    font-size: 16px;
    color: #111827;
  }
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 32px;
  
  :deep(.el-link) {
    color: #667eea;
    font-weight: 500;
    transition: color 0.3s ease;
    
    &:hover {
      color: #764ba2;
    }
  }
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: 48px 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    z-index: 1;
  }
  
  span {
    background: rgba(255, 255, 255, 0.95);
    padding: 0 24px;
    position: relative;
    z-index: 10;
  }
}

.third-party-login {
  text-align: center;
  margin-bottom: 32px;
  
  .third-party-title {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 24px 0;
    font-weight: 500;
  }
  
  .third-party-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

.third-party-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  color: #4b5563;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  
  &.wechat:hover {
    border-color: #07c160;
    color: #07c160;
    background: rgba(7, 193, 96, 0.05);
  }
  
  &.qq:hover {
    border-color: #12b7f5;
    color: #12b7f5;
    background: rgba(18, 183, 245, 0.05);
  }
  
  &.github:hover {
    border-color: #333;
    color: #333;
    background: rgba(51, 51, 51, 0.05);
  }
  
  &.google:hover {
    border-color: #4285f4;
    color: #4285f4;
    background: rgba(66, 133, 244, 0.05);
  }
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
  
  span {
    margin-right: 8px;
  }
  
  :deep(.el-link) {
    color: #667eea;
    font-weight: 600;
    transition: color 0.3s ease;
    
    &:hover {
      color: #764ba2;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-card {
    padding: 48px 32px;
    margin: 0 24px;
  }
  
  .login-header .title {
    font-size: 28px;
  }
  
  .third-party-login .third-party-buttons {
    gap: 8px;
  }
  
  .third-party-btn {
    width: 40px;
    height: 40px;
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

:deep(.el-dialog__header) {
  padding: 32px 32px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:deep(.el-dialog__body) {
  padding: 16px 32px 32px;
}

:deep(.el-dialog__footer) {
  padding: 16px 32px 32px;
}

:deep(.el-form-item__label) {
  color: #4b5563;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}
</style>