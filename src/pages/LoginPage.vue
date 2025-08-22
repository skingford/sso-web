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

          <el-form-item prop="captcha">
            <div class="captcha-input-group">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                prefix-icon="Picture"
                class="captcha-input"
                maxlength="4"
              />
              <Captcha
                ref="captchaRef"
                :width="120"
                :height="40"
                @change="onCaptchaChange"
                class="captcha-component"
              />
            </div>
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

          <el-form-item prop="smsCaptcha">
            <div class="captcha-group">
              <el-input
                v-model="smsForm.captcha"
                placeholder="请输入验证码"
                prefix-icon="Picture"
                class="captcha-input"
                maxlength="4"
              />
              <Captcha
                ref="smsCaptchaRef"
                @change="onSmsCaptchaChange"
                :width="120"
                :height="40"
              />
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

      <!-- 第三方登录 -->
      <div class="third-party-login">
        
        <!-- 展开/收起按钮 -->
        <div class="third-party-toggle">
          <button 
            class="toggle-btn"
            @click="toggleThirdPartyExpanded"
            :class="{ 'expanded': isThirdPartyExpanded }"
          >
            <span>{{ isThirdPartyExpanded ? '收起登录方式' : '更多登录方式' }}</span>
            <i class="toggle-icon" :class="isThirdPartyExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </button>
        </div>
        
        <!-- 可折叠的第三方登录按钮容器 -->
        <div 
          class="third-party-buttons"
          :class="{ 'expanded': isThirdPartyExpanded }"
        >
          <button 
            v-for="platform in visiblePlatforms"
            :key="platform.key"
            :class="['third-party-btn', platform.key]"
            @click="handleThirdPartyLogin(platform.key)"
            :disabled="thirdPartyLoading[platform.key]"
          >
            <div class="btn-content">
              <i :class="platform.iconClass"></i>
              <span v-if="!thirdPartyLoading[platform.key]">{{ platform.name }}</span>
              <span v-else class="loading-text">登录中...</span>
            </div>
          </button>
        </div>
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
import { Lock, User, Phone, Message, Picture } from '@element-plus/icons-vue';
import { useAuthStore } from '@/stores/auth';
import type { LoginRequest } from '@/utils/api';
import Captcha from '@/components/Captcha.vue';

// 使用认证store
const authStore = useAuthStore();

// 表单引用
const loginFormRef = ref<FormInstance>();
const smsFormRef = ref<FormInstance>();
const captchaRef = ref<InstanceType<typeof Captcha>>();
const smsCaptchaRef = ref<InstanceType<typeof Captcha>>();

// 当前激活的选项卡
const activeTab = ref('password');

// 登录方式选项卡配置
const loginTabs = [
  { key: 'password', label: '账密登录', icon: 'el-icon-user' },
  { key: 'qrcode', label: '扫码登录', icon: 'el-icon-qrcode' },
  { key: 'sms', label: '验证码登录', icon: 'el-icon-message' }
];

// 登录表单
const loginForm = reactive<LoginRequest & { captcha: string }>({
  username: 'admin',
  password: 'password',
  remember_me: true,
  captcha: '',
});

// 当前验证码值
const currentCaptcha = ref('');
const currentSmsCaptcha = ref('');

// 验证码自动刷新定时器
let captchaTimer: NodeJS.Timeout | null = null;
const CAPTCHA_REFRESH_INTERVAL = 5 * 60 * 1000; // 5分钟自动刷新

// 短信登录表单
const smsForm = reactive({
  phone: '',
  code: '',
  captcha: ''
});

// 短信验证码倒计时
const smsCountdown = ref(0);
let smsTimer: NodeJS.Timeout | null = null;

// 第三方登录平台配置
interface ThirdPartyPlatform {
  key: string;
  name: string;
  iconClass: string;
  color: string;
  authUrl: string;
  enabled: boolean;
}

const thirdPartyPlatforms: ThirdPartyPlatform[] = [
  {
    key: 'wechat',
    name: '微信',
    iconClass: 'icon-wechat',
    color: '#07c160',
    authUrl: 'https://open.weixin.qq.com/connect/qrconnect',
    enabled: true
  },
  {
    key: 'qq',
    name: 'QQ',
    iconClass: 'icon-qq',
    color: '#12b7f5',
    authUrl: 'https://graph.qq.com/oauth2.0/authorize',
    enabled: true
  },
  {
    key: 'alipay',
    name: '支付宝',
    iconClass: 'icon-alipay',
    color: '#1677ff',
    authUrl: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm',
    enabled: true
  },
  {
    key: 'douyin',
    name: '抖音',
    iconClass: 'icon-douyin',
    color: '#fe2c55',
    authUrl: 'https://open.douyin.com/platform/oauth/connect',
    enabled: true
  },
  {
    key: 'dingtalk',
    name: '钉钉',
    iconClass: 'icon-dingtalk',
    color: '#0089ff',
    authUrl: 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize',
    enabled: true
  },
  {
    key: 'github',
    name: 'GitHub',
    iconClass: 'icon-github',
    color: '#24292f',
    authUrl: 'https://github.com/login/oauth/authorize',
    enabled: true
  },
  {
    key: 'google',
    name: 'Google',
    iconClass: 'icon-google',
    color: '#4285f4',
    authUrl: 'https://accounts.google.com/oauth2/v2/auth',
    enabled: true
  },
  {
    key: 'microsoft',
    name: 'Microsoft',
    iconClass: 'icon-microsoft',
    color: '#00a1f1',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    enabled: false
  }
];

// 可见的第三方登录平台（只显示启用的平台）
const visiblePlatforms = computed(() => 
  thirdPartyPlatforms.filter(platform => platform.enabled)
);

// 第三方登录展开/收起状态
const isThirdPartyExpanded = ref(false);

// 切换第三方登录展开状态
const toggleThirdPartyExpanded = () => {
  isThirdPartyExpanded.value = !isThirdPartyExpanded.value;
};

// 第三方登录状态（动态生成）
const thirdPartyLoading = ref(
  thirdPartyPlatforms.reduce((acc, platform) => {
    acc[platform.key] = false;
    return acc;
  }, {} as Record<string, boolean>)
);

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
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为4位字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('请输入验证码'));
        } else if (value.toUpperCase() !== currentCaptcha.value.toUpperCase()) {
          callback(new Error('验证码错误'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
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
  smsCaptcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码为4位字符', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (!value) {
          callback(new Error('请输入验证码'));
        } else if (value.toUpperCase() !== currentSmsCaptcha.value.toUpperCase()) {
          callback(new Error('验证码错误'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
};

// 切换选项卡
const switchTab = (tabKey: string) => {
  activeTab.value = tabKey;
};

// 处理验证码变化
const onCaptchaChange = (value: string) => {
  currentCaptcha.value = value;
  
  // 清除之前的定时器
  if (captchaTimer) {
    clearTimeout(captchaTimer);
  }
  
  // 设置新的自动刷新定时器
  captchaTimer = setTimeout(() => {
    if (captchaRef.value) {
      captchaRef.value.refresh();
      loginForm.captcha = '';
    }
  }, CAPTCHA_REFRESH_INTERVAL);
};

// 处理短信验证码变化
const onSmsCaptchaChange = (value: string) => {
  currentSmsCaptcha.value = value;
};

// 处理账密登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    const valid = await loginFormRef.value.validate();
    if (valid) {
      // 验证验证码
      if (!captchaRef.value?.validate(loginForm.captcha)) {
        ElMessage.error('验证码错误');
        // 刷新验证码
        captchaRef.value?.refresh();
        loginForm.captcha = '';
        return;
      }
      
      ElMessage.success('登录成功');
      //await authStore.login(loginForm);
      
      // 登录成功后刷新验证码
      captchaRef.value?.refresh();
      loginForm.captcha = '';
    }
  } catch (error) {
    console.error('Login validation error:', error);
    // 登录失败时刷新验证码
    captchaRef.value?.refresh();
    loginForm.captcha = '';
  }
};

// 处理短信登录
const handleSmsLogin = async () => {
  if (!smsFormRef.value) return;
  
  try {
    const valid = await smsFormRef.value.validate();
    if (valid) {
      // 验证图形验证码
      if (!smsCaptchaRef.value?.validate(smsForm.captcha)) {
        ElMessage.error('验证码错误');
        // 刷新验证码
        smsCaptchaRef.value?.refresh();
        smsForm.captcha = '';
        return;
      }
      
      // 这里可以调用短信登录API
      console.log('SMS login:', smsForm);
      ElMessage.success('短信登录功能待实现');
      
      // 登录成功后刷新验证码
      smsCaptchaRef.value?.refresh();
      smsForm.captcha = '';
    }
  } catch (error) {
    console.error('SMS login validation error:', error);
    // 登录失败时刷新验证码
    smsCaptchaRef.value?.refresh();
    smsForm.captcha = '';
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

// 第三方登录处理
const handleThirdPartyLogin = async (platformKey: string) => {
  try {
    // 查找平台配置
    const platform = thirdPartyPlatforms.find(p => p.key === platformKey)
    if (!platform || !platform.enabled) {
      ElMessage.error('该登录方式暂不可用')
      return
    }
    
    thirdPartyLoading.value[platformKey] = true
    
    // 根据平台生成OAuth授权URL
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback')
    let authUrl = ''
    
    switch (platformKey) {
      case 'wechat':
        authUrl = `${platform.authUrl}?appid=YOUR_WECHAT_APPID&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${platformKey}#wechat_redirect`
        break
      case 'qq':
        authUrl = `${platform.authUrl}?client_id=YOUR_QQ_APPID&redirect_uri=${redirectUri}&response_type=code&scope=get_user_info&state=${platformKey}`
        break
      case 'alipay':
        authUrl = `${platform.authUrl}?app_id=YOUR_ALIPAY_APPID&redirect_uri=${redirectUri}&scope=auth_user&state=${platformKey}`
        break
      case 'douyin':
        authUrl = `${platform.authUrl}?client_key=YOUR_DOUYIN_CLIENT_KEY&response_type=code&scope=user_info&redirect_uri=${redirectUri}&state=${platformKey}`
        break
      case 'dingtalk':
        authUrl = `${platform.authUrl}?appid=YOUR_DINGTALK_APPID&response_type=code&scope=snsapi_auth&redirect_uri=${redirectUri}&state=${platformKey}`
        break
      case 'github':
        authUrl = `${platform.authUrl}?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=${redirectUri}&scope=user:email&state=${platformKey}`
        break
      case 'google':
        authUrl = `${platform.authUrl}?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=${platformKey}`
        break
      case 'microsoft':
        authUrl = `${platform.authUrl}?client_id=YOUR_MICROSOFT_CLIENT_ID&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&state=${platformKey}`
        break
      default:
        ElMessage.error(`暂不支持${platform.name}登录`)
        thirdPartyLoading.value[platformKey] = false
        return
    }
    
    // 打开新窗口进行OAuth授权
    const popup = window.open(
      authUrl,
      `${platformKey}_login`,
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )
    
    // 监听授权回调
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        thirdPartyLoading.value[platformKey] = false
      }
    }, 1000)
    
    // 监听来自弹窗的消息
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'THIRD_PARTY_LOGIN_SUCCESS') {
        const { platform: loginPlatform, userInfo } = event.data
        if (loginPlatform === platformKey) {
          popup?.close()
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          
          // 处理登录成功
          handleThirdPartyLoginSuccess(platformKey, userInfo)
        }
      } else if (event.data.type === 'THIRD_PARTY_LOGIN_ERROR') {
        const { platform: loginPlatform, error } = event.data
        if (loginPlatform === platformKey) {
          popup?.close()
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
          
          // 处理登录失败
          handleThirdPartyLoginError(platformKey, error)
        }
      }
    }
    
    window.addEventListener('message', messageHandler)
    
  } catch (error) {
    console.error(`${platform.name}登录失败:`, error)
    ElMessage.error(`${platform.name}登录失败，请重试`)
    thirdPartyLoading.value[platformKey] = false
  }
}

// 第三方登录成功处理
const handleThirdPartyLoginSuccess = (platform: string, userInfo: any) => {
  console.log(`${platform}登录成功:`, userInfo)
  ElMessage.success(`${platform}登录成功！`)
  
  // 这里应该调用后端API保存用户信息并生成token
  // 然后跳转到主页
  router.push('/dashboard')
  
  thirdPartyLoading.value[platform as keyof typeof thirdPartyLoading.value] = false
}

// 第三方登录失败处理
const handleThirdPartyLoginError = (platform: string, error: any) => {
  console.error(`${platform}登录失败:`, error)
  ElMessage.error(`${platform}登录失败：${error.message || '未知错误'}`)
  thirdPartyLoading.value[platform as keyof typeof thirdPartyLoading.value] = false
}

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
  if (captchaTimer) {
    clearTimeout(captchaTimer);
  }
});
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  /* 确保背景色覆盖整个容器，防止白屏 */
  background-color: var(--color-bg-base);
  position: relative;
  /* 添加渐变背景作为装饰层 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 0;
  }
  /* 确保内容在背景之上 */
  > * {
    position: relative;
    z-index: 1;
  }
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



/* 第三方登录样式 */
.third-party-login {
  margin-top: 32px;
}

/* 第三方登录展开/收起按钮 */
.third-party-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.toggle-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  color: #495057;
}

.toggle-btn.expanded {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.toggle-btn.expanded .toggle-icon {
  transform: rotate(180deg);
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.third-party-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  max-width: 100%;
  justify-items: center;
  max-height: 0;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(-10px);
}

.third-party-buttons.expanded {
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
  margin-top: 8px;
}

.third-party-btn {
  width: 80px;
  height: 48px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.third-party-btn:hover:not(:disabled) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.third-party-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 2px;
  text-align: center;
}

.third-party-btn i {
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.third-party-btn span {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #409eff;
}

/* 平台特定颜色 */
.third-party-btn.wechat:hover:not(:disabled) {
  border-color: #07c160;
  box-shadow: 0 2px 8px rgba(7, 193, 96, 0.1);
}

.third-party-btn.wechat .icon-wechat {
  color: #07c160;
}

.third-party-btn.qq:hover:not(:disabled) {
  border-color: #12b7f5;
  box-shadow: 0 2px 8px rgba(18, 183, 245, 0.1);
}

.third-party-btn.qq .icon-qq {
  color: #12b7f5;
}

.third-party-btn.alipay:hover:not(:disabled) {
  border-color: #1677ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.1);
}

.third-party-btn.alipay .icon-alipay {
  color: #1677ff;
}

.third-party-btn.douyin:hover:not(:disabled) {
  border-color: #fe2c55;
  box-shadow: 0 2px 8px rgba(254, 44, 85, 0.1);
}

.third-party-btn.douyin .icon-douyin {
  color: #fe2c55;
}

.third-party-btn.dingtalk:hover:not(:disabled) {
  border-color: #0089ff;
  box-shadow: 0 2px 8px rgba(0, 137, 255, 0.1);
}

.third-party-btn.dingtalk .icon-dingtalk {
  color: #0089ff;
}

.third-party-btn.github:hover:not(:disabled) {
  border-color: #24292f;
  box-shadow: 0 2px 8px rgba(36, 41, 47, 0.1);
}

.third-party-btn.github .icon-github {
  color: #24292f;
}

.third-party-btn.google:hover:not(:disabled) {
  border-color: #4285f4;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
}

.third-party-btn.google .icon-google {
  color: #4285f4;
}

.third-party-btn.microsoft:hover:not(:disabled) {
  border-color: #00a1f1;
  box-shadow: 0 2px 8px rgba(0, 161, 241, 0.1);
}

.third-party-btn.microsoft .icon-microsoft {
  color: #00a1f1;
}

/* 图标字体 */
.icon-wechat::before {
  content: '\e7eb';
}

.icon-qq::before {
  content: '\e7ee';
}

.icon-alipay::before {
  content: '\e7ef';
}

.icon-douyin::before {
  content: '\e7ec';
}

.icon-dingtalk::before {
  content: '\e7ed';
}

.icon-github::before {
  content: '\e7f0';
}

.icon-google::before {
  content: '\e7f1';
}

.icon-microsoft::before {
  content: '\e7f2';
}

/* 注册链接样式 */
.register-link {
  text-align: center;
  margin-top: 24px;
  color: #666;
  font-size: 14px;
}

.register-btn {
  color: #409eff;
  text-decoration: none;
  margin-left: 8px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-btn:hover {
  color: #66b1ff;
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

/* 验证码输入框样式 */
.captcha-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-component {
  flex-shrink: 0;
}

/* 验证码组样式（通用） */
.captcha-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.captcha-group .captcha-input {
  flex: 1;
}

.captcha-group .captcha-container {
  flex-shrink: 0;
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
  
  .captcha-input-group {
    gap: 6px;
  }
  
  .captcha-component {
    width: 100px;
  }
  
  .tab-content {
    min-height: 180px;
  }
  
  /* 第三方登录响应式优化 */
  .toggle-btn {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }
  
  .third-party-buttons {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 8px;
  }
  
  .third-party-btn {
    width: 70px;
    height: 44px;
  }
  
  .third-party-btn i {
    font-size: 18px;
  }
  
  .third-party-btn span {
    font-size: 11px;
  }
  
  .third-party-buttons.expanded {
    max-height: 150px;
  }
}


</style>