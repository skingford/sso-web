<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 标题 -->
      <div class="login-header">
        <h1 class="title">SSO 登录</h1>
      </div>

      <!-- 登录方式选项卡 -->
      <div class="login-tabs">
        <div 
          v-for="tab in loginTabs" 
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </div>
      </div>

      <!-- 账密登录 -->
      <div v-show="activeTab === 'password'" class="tab-content">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名或邮箱"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.remember_me">
                记住我
              </el-checkbox>
              <router-link to="/forgot-password" class="forgot-link">
                忘记密码？
              </router-link>
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
      </div>

      <!-- 扫码登录 -->
      <div v-show="activeTab === 'qrcode'" class="tab-content">
        <div class="qrcode-container">
          <div class="qrcode-box">
            <div class="qrcode-placeholder">
              <i class="el-icon-qrcode qrcode-icon"></i>
              <div class="qrcode-image">
                <!-- 这里可以放置实际的二维码图片 -->
                <img src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20for%20login%20authentication%2C%20black%20and%20white%20pattern%2C%20square%20format%2C%20clean%20design&image_size=square" alt="登录二维码" />
              </div>
            </div>
            <p class="qrcode-tip">使用手机扫码登录</p>
            <div class="qrcode-actions">
              <el-button text @click="refreshQRCode">
                <i class="el-icon-refresh"></i>
                刷新二维码
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 验证码登录 -->
      <div v-show="activeTab === 'sms'" class="tab-content">
        <el-form
          ref="smsFormRef"
          :model="smsForm"
          :rules="smsRules"
          class="login-form"
          @keyup.enter="handleSmsLogin"
        >
          <el-form-item prop="phone">
            <el-input
              v-model="smsForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Phone"
            />
          </el-form-item>

          <el-form-item prop="code">
            <div class="sms-input-group">
              <el-input
                v-model="smsForm.code"
                placeholder="请输入验证码"
                prefix-icon="Message"
                class="sms-input"
              />
              <el-button 
                :disabled="smsCountdown > 0"
                @click="sendSmsCode"
                class="sms-button"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="authStore.isLoading"
              @click="handleSmsLogin"
            >
              {{ authStore.isLoading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 注册链接 -->
      <div class="register-link">
        <span>还没有账号？</span>
        <router-link to="/register" class="register-btn">
          立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Lock, User, Phone, Message } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import type { LoginRequest } from '@/utils/api';

// 使用认证store
const authStore = useAuthStore();

// 表单引用
const loginFormRef = ref<FormInstance>();
const smsFormRef = ref<FormInstance>();

// 当前激活的选项卡
const activeTab = ref('password');

// 登录方式选项卡配置
const loginTabs = [
  { key: 'password', label: '账密登录', icon: 'el-icon-user' },
  { key: 'qrcode', label: '扫码登录', icon: 'el-icon-qrcode' },
  { key: 'sms', label: '验证码登录', icon: 'el-icon-message' }
];

// 登录表单
const loginForm = reactive<LoginRequest>({
  username: 'admin',
  password: 'password',
  remember_me: true,
});

// 短信登录表单
const smsForm = reactive({
  phone: '',
  code: ''
});

// 短信验证码倒计时
const smsCountdown = ref(0);
let smsTimer: NodeJS.Timeout | null = null;

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

// 短信验证规则
const smsRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' },
  ],
};

// 切换选项卡
const switchTab = (tabKey: string) => {
  activeTab.value = tabKey;
};

// 处理账密登录
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

// 处理短信登录
const handleSmsLogin = async () => {
  if (!smsFormRef.value) return;
  
  try {
    const valid = await smsFormRef.value.validate();
    if (valid) {
      // 这里可以调用短信登录API
      console.log('SMS login:', smsForm);
      ElMessage.success('短信登录功能待实现');
    }
  } catch (error) {
    console.error('SMS login validation error:', error);
  }
};

// 发送短信验证码
const sendSmsCode = async () => {
  if (!smsForm.phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  
  // 开始倒计时
  smsCountdown.value = 60;
  smsTimer = setInterval(() => {
    smsCountdown.value--;
    if (smsCountdown.value <= 0) {
      clearInterval(smsTimer!);
      smsTimer = null;
    }
  }, 1000);
  
  // 这里可以调用发送短信验证码API
  console.log('Send SMS code to:', smsForm.phone);
  ElMessage.success('验证码已发送');
};

// 刷新二维码
const refreshQRCode = () => {
  // 这里可以调用刷新二维码API
  console.log('Refresh QR code');
  ElMessage.success('二维码已刷新');
};

// 组件挂载时检查是否已登录
onMounted(() => {
  if (authStore.isAuthenticated) {
    // 如果已登录，跳转到仪表板
    window.location.href = '/dashboard';
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer);
  }
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  padding: 24px;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-header h1 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

/* 登录选项卡样式 */
.login-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
  position: relative;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #666;
  font-size: 13px;
  position: relative;
}

.tab-item i {
  font-size: 18px;
  margin-bottom: 4px;
}

.tab-item.active {
  background: #fff;
  color: #1890ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 500;
}

.tab-item:hover:not(.active) {
  color: #333;
}

/* 选项卡内容 */
.tab-content {
  min-height: 200px;
}

.login-form {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-input) {
  height: 44px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper):hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.login-form :deep(.el-input__wrapper).is-focus {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.login-form :deep(.el-input__inner) {
  height: 48px;
  font-size: 16px;
  color: #111827;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 44px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}



.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 16px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin: 0 8px;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 二维码登录样式 */
.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.qrcode-box {
  text-align: center;
}

.qrcode-placeholder {
  width: 160px;
  height: 160px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: #fafafa;
  position: relative;
}

.qrcode-image {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qrcode-image img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.qrcode-icon {
  font-size: 40px;
  color: #ccc;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.qrcode-tip {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.qrcode-actions {
  display: flex;
  justify-content: center;
}

.qrcode-actions .el-button {
  color: #1890ff;
  font-size: 13px;
}

/* 短信验证码样式 */
.sms-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sms-input {
  flex: 1;
}

.sms-button {
  width: 100px;
  height: 48px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  font-weight: 500;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.sms-button:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  box-shadow: 0 2px 4px 0 rgba(102, 126, 234, 0.1);
}

.sms-button:disabled {
  background: #f9fafb;
  color: #d1d5db;
  border-color: #e5e7eb;
  cursor: not-allowed;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    padding: 20px;
    max-width: 340px;
  }
  
  .login-header h1 {
    font-size: 22px;
  }
  
  .tab-item {
    padding: 10px 6px;
    font-size: 12px;
  }
  
  .tab-item i {
    font-size: 16px;
  }
  
  .login-form .el-input {
    height: 42px;
  }
  
  .login-button {
    height: 42px;
  }
  
  .qrcode-placeholder {
    width: 140px;
    height: 140px;
  }
  
  .qrcode-image {
    width: 120px;
    height: 120px;
  }
  
  .sms-button {
    width: 90px;
    height: 48px;
    font-size: 13px;
  }
  
  .tab-content {
    min-height: 180px;
  }
}


</style>