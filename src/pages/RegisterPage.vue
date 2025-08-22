<template>
  <div class="register-container">
    <div class="register-card">
      <!-- 标题 -->  
      <div class="register-header">
        <h1 class="title">创建账户</h1>
        <p class="subtitle">加入我们，开始您的SSO之旅</p>
      </div>

      <!-- 注册方式选项卡 -->
      <div class="register-tabs">
        <div 
          v-for="tab in registerTabs" 
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </div>
      </div>

      <!-- 邮箱注册 -->
      <div v-show="activeTab === 'email'" class="tab-content">
        <el-form
          ref="emailFormRef"
          :model="emailForm"
          :rules="emailRules"
          class="register-form"
          @keyup.enter="handleEmailRegister"
        >
          <el-form-item prop="username">
            <el-input
              v-model="emailForm.username"
              placeholder="用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="emailForm.email"
              placeholder="邮箱地址"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="emailForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="emailForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-input-group">
              <el-input
                v-model="emailForm.captcha"
                placeholder="请输入验证码"
                maxlength="4"
                class="captcha-input"
              />
              <Captcha ref="emailCaptchaRef" class="captcha-image" />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="register-button"
              :loading="loading"
              @click="handleEmailRegister"
            >
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 手机号注册 -->
      <div v-show="activeTab === 'phone'" class="tab-content">
        <el-form
          ref="phoneFormRef"
          :model="phoneForm"
          :rules="phoneRules"
          class="register-form"
          @keyup.enter="handlePhoneRegister"
        >
          <el-form-item prop="phone">
            <el-input
              v-model="phoneForm.phone"
              placeholder="手机号"
              prefix-icon="Phone"
            />
          </el-form-item>

          <el-form-item prop="code">
            <div class="sms-input-group">
              <el-input
                v-model="phoneForm.code"
                placeholder="验证码"
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

          <el-form-item prop="username">
            <el-input
              v-model="phoneForm.username"
              placeholder="用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="phoneForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="phoneForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-input-group">
              <el-input
                v-model="phoneForm.captcha"
                placeholder="请输入验证码"
                maxlength="4"
                class="captcha-input"
              />
              <Captcha ref="phoneCaptchaRef" class="captcha-image" />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="register-button"
              :loading="loading"
              @click="handlePhoneRegister"
            >
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 快速注册 -->
      <div v-show="activeTab === 'quick'" class="tab-content">
        <el-form
          ref="quickFormRef"
          :model="quickForm"
          :rules="quickRules"
          class="register-form"
          @keyup.enter="handleQuickRegister"
        >
          <el-form-item prop="email">
            <el-input
              v-model="quickForm.email"
              placeholder="邮箱地址"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="quickForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-input-group">
              <el-input
                v-model="quickForm.captcha"
                placeholder="请输入验证码"
                maxlength="4"
                class="captcha-input"
              />
              <Captcha ref="quickCaptchaRef" class="captcha-image" />
            </div>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="quickForm.agree">
              我同意<a href="#" class="link">用户协议</a>和<a href="#" class="link">隐私政策</a>
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              class="register-button"
              :loading="loading"
              @click="handleQuickRegister"
            >
              {{ loading ? '注册中...' : '快速注册' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 登录链接 -->
      <div class="login-link">
        <span>已有账户？</span>
        <router-link to="/login" class="login-btn">
          立即登录
        </router-link>
      </div>

      <div v-if="message" class="success-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, User, Phone, Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import Captcha from '@/components/Captcha.vue'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const emailFormRef = ref<FormInstance>()
const phoneFormRef = ref<FormInstance>()
const quickFormRef = ref<FormInstance>()
const emailCaptchaRef = ref()
const phoneCaptchaRef = ref()
const quickCaptchaRef = ref()

// 当前激活的选项卡
const activeTab = ref('email')

// 注册方式选项卡配置
const registerTabs = [
  { key: 'email', label: '邮箱注册', icon: 'el-icon-message' },
  { key: 'phone', label: '手机注册', icon: 'el-icon-phone' },
  { key: 'quick', label: '快速注册', icon: 'el-icon-star' }
]

const loading = ref(false)
const message = ref('')

// 邮箱注册表单
const emailForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

// 手机号注册表单
const phoneForm = reactive({
  phone: '',
  code: '',
  username: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

// 快速注册表单
const quickForm = reactive({
  email: '',
  password: '',
  agree: false,
  captcha: ''
})

// 短信验证码倒计时
const smsCountdown = ref(0)
let smsTimer: NodeJS.Timeout | null = null

// 邮箱注册验证规则
const emailRules: FormRules = {
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
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== emailForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4位字符', trigger: 'blur' }
  ]
}

// 手机号注册验证规则
const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== phoneForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4位字符', trigger: 'blur' }
  ]
}

// 快速注册验证规则
const quickRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码为4位字符', trigger: 'blur' }
  ]
}

// 切换选项卡
const switchTab = (tabKey: string) => {
  activeTab.value = tabKey
}

// 处理邮箱注册
const handleEmailRegister = async () => {
  if (!emailFormRef.value) return
  
  try {
    const valid = await emailFormRef.value.validate()
    if (valid) {
      // 验证图形验证码
      if (!emailCaptchaRef.value?.validateCaptcha(emailForm.captcha)) {
        ElMessage.error('验证码错误，请重新输入')
        emailCaptchaRef.value?.refreshCaptcha()
        emailForm.captcha = ''
        return
      }
      
      loading.value = true
      message.value = ''
      
      await authStore.register({
        username: emailForm.username,
        email: emailForm.email,
        password: emailForm.password
      })
      
      ElMessage.success('邮箱注册成功！')
      message.value = '注册成功，正在跳转到登录页面...'
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error: any) {
    console.error('邮箱注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
    // 注册失败后刷新验证码
    emailCaptchaRef.value?.refreshCaptcha()
    emailForm.captcha = ''
  } finally {
    loading.value = false
  }
}

// 处理手机号注册
const handlePhoneRegister = async () => {
  if (!phoneFormRef.value) return
  
  try {
    const valid = await phoneFormRef.value.validate()
    if (valid) {
      // 验证图形验证码
      if (!phoneCaptchaRef.value?.validateCaptcha(phoneForm.captcha)) {
        ElMessage.error('验证码错误，请重新输入')
        phoneCaptchaRef.value?.refreshCaptcha()
        phoneForm.captcha = ''
        return
      }
      
      loading.value = true
      message.value = ''
      
      await authStore.register({
        username: phoneForm.username,
        phone: phoneForm.phone,
        password: phoneForm.password
      })
      
      ElMessage.success('手机号注册成功！')
      message.value = '注册成功，正在跳转到登录页面...'
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error: any) {
    console.error('手机号注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
    // 注册失败后刷新验证码
    phoneCaptchaRef.value?.refreshCaptcha()
    phoneForm.captcha = ''
  } finally {
    loading.value = false
  }
}

// 处理快速注册
const handleQuickRegister = async () => {
  if (!quickFormRef.value) return
  
  if (!quickForm.agree) {
    ElMessage.warning('请先同意用户协议和隐私政策')
    return
  }
  
  try {
    const valid = await quickFormRef.value.validate()
    if (valid) {
      // 验证图形验证码
      if (!quickCaptchaRef.value?.validateCaptcha(quickForm.captcha)) {
        ElMessage.error('验证码错误，请重新输入')
        quickCaptchaRef.value?.refreshCaptcha()
        quickForm.captcha = ''
        return
      }
      
      loading.value = true
      message.value = ''
      
      // 生成随机用户名
      const randomUsername = 'user_' + Date.now().toString().slice(-6)
      
      await authStore.register({
        username: randomUsername,
        email: quickForm.email,
        password: quickForm.password
      })
      
      ElMessage.success('快速注册成功！')
      message.value = '注册成功，正在跳转到登录页面...'
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } catch (error: any) {
    console.error('快速注册失败:', error)
    ElMessage.error(error.message || '注册失败，请重试')
    // 注册失败后刷新验证码
    quickCaptchaRef.value?.refreshCaptcha()
    quickForm.captcha = ''
  } finally {
    loading.value = false
  }
}

// 发送短信验证码
const sendSmsCode = async () => {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  // 开始倒计时
  smsCountdown.value = 60
  smsTimer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(smsTimer!)
      smsTimer = null
    }
  }, 1000)
  
  // 这里可以调用发送短信验证码API
  console.log('Send SMS code to:', phoneForm.phone)
  ElMessage.success('验证码已发送')
}

// 组件挂载时检查是否已登录
onMounted(() => {
  if (authStore.isAuthenticated) {
    // 如果已登录，跳转到仪表板
    window.location.href = '/dashboard'
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (smsTimer) {
    clearInterval(smsTimer)
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-header {
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 选项卡样式 */
.register-tabs {
  display: flex;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 30px;
  position: relative;
}

.tab-item {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.tab-item.active {
  color: #667eea;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-item:hover:not(.active) {
  color: #333;
}

/* 选项卡内容 */
.tab-content {
  min-height: 320px;
}

.register-form {
  text-align: left;
}

/* 快速注册样式 */
.quick-register-form {
  text-align: left;
}

.agreement-checkbox {
  margin-top: 20px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.agreement-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.agreement-text a {
  color: #667eea;
  text-decoration: none;
}

.agreement-text a:hover {
  text-decoration: underline;
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
  border-radius: 6px;
  border: 1px solid #e1e5e9;
  background: #fff;
  color: #666;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  font-weight: 500;
}

.sms-button:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.sms-button:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* 验证码输入组样式 */
.captcha-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.captcha-image:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

/* 登录链接 */
.login-link {
  color: #666;
  font-size: 14px;
  margin-top: 20px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.success-message {
  color: #27ae60;
  font-size: 14px;
  margin-top: 15px;
  padding: 10px;
  background: #d5f4e6;
  border-radius: 8px;
  border: 1px solid #27ae60;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-container {
    padding: 10px;
  }
  
  .register-card {
    padding: 30px 20px;
    border-radius: 15px;
    max-width: 100%;
  }
  
  .register-header h1 {
    font-size: 24px;
  }
  
  .register-tabs {
    flex-direction: column;
    gap: 2px;
  }
  
  .tab-item {
    padding: 10px;
  }
  
  .tab-content {
    min-height: 320px;
  }
  
  :deep(.el-input) {
    height: 42px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 28px;
  }
  
  :deep(.el-form-item__error) {
    font-size: 12px;
    margin-top: 6px;
  }
  
  .sms-input-group {
    flex-direction: column;
    gap: 15px;
  }
  
  .sms-button {
    width: 100%;
    height: 48px;
  }
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-card {
  animation: slideIn 0.6s ease-out;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Element Plus 组件样式优化 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  color: #333;
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
}

:deep(.el-input__wrapper) {
  height: 48px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper):hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-input__wrapper).is-focus {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

:deep(.el-input__inner) {
  height: 48px;
  font-size: 16px;
  color: #111827;
}

:deep(.el-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  width: 100%;
  height: 44px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

:deep(.el-button.is-disabled) {
  opacity: 0.7;
  transform: none !important;
}

:deep(.el-checkbox__label) {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

:deep(.el-checkbox__inner) {
  border-radius: 4px;
}

:deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

/* 表单验证错误样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c;
  background: #fef0f0;
}

:deep(.el-form-item__error) {
  font-size: 13px;
  color: #f56c6c;
  margin-top: 8px;
  line-height: 1.4;
  word-wrap: break-word;
  white-space: normal;
  max-width: 100%;
}
</style>