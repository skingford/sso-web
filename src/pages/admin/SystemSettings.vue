<template>
  <div class="content-section">
    <div class="section-header">
      <h2>系统设置</h2>
      <p>管理系统配置和参数设置</p>
    </div>

    <!-- 设置导航标签页 -->
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <div class="settings-section">
          <el-card class="settings-card">
            <template #header>
              <div class="card-header">
                <h3>系统基本信息</h3>
                <p>配置系统的基本信息和显示设置</p>
              </div>
            </template>
            
            <el-form
              ref="basicFormRef"
              :model="basicSettings"
              :rules="basicRules"
              label-width="120px"
              class="settings-form"
            >
              <el-form-item label="系统名称" prop="systemName">
                <el-input
                  v-model="basicSettings.systemName"
                  placeholder="请输入系统名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="系统描述" prop="systemDescription">
                <el-input
                  v-model="basicSettings.systemDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入系统描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="系统版本" prop="systemVersion">
                <el-input
                  v-model="basicSettings.systemVersion"
                  placeholder="请输入系统版本"
                  readonly
                >
                  <template #append>
                    <el-button @click="checkUpdate">检查更新</el-button>
                  </template>
                </el-input>
              </el-form-item>
              
              <el-form-item label="系统Logo">
                <div class="logo-upload">
                  <el-upload
                    class="logo-uploader"
                    action="#"
                    :show-file-list="false"
                    :before-upload="beforeLogoUpload"
                    :on-success="handleLogoSuccess"
                  >
                    <img v-if="basicSettings.systemLogo" :src="basicSettings.systemLogo" class="logo" />
                    <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="logo-tips">
                    <p>建议尺寸：200x60px，支持 JPG、PNG 格式</p>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="时区设置" prop="timezone">
                <el-select
                  v-model="basicSettings.timezone"
                  placeholder="选择时区"
                  style="width: 300px;"
                >
                  <el-option
                    v-for="tz in timezones"
                    :key="tz.value"
                    :label="tz.label"
                    :value="tz.value"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="语言设置" prop="language">
                <el-select
                  v-model="basicSettings.language"
                  placeholder="选择语言"
                  style="width: 200px;"
                >
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                  <el-option label="繁體中文" value="zh-TW" />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveBasicSettings" :loading="saving">
                  保存设置
                </el-button>
                <el-button @click="resetBasicSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <div class="settings-section">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-card class="settings-card">
                <template #header>
                  <div class="card-header">
                    <h3>密码策略</h3>
                    <p>配置用户密码安全策略</p>
                  </div>
                </template>
                
                <el-form
                  ref="passwordFormRef"
                  :model="securitySettings.password"
                  label-width="140px"
                  class="settings-form"
                >
                  <el-form-item label="最小长度">
                    <el-input-number
                      v-model="securitySettings.password.minLength"
                      :min="6"
                      :max="32"
                      controls-position="right"
                    />
                  </el-form-item>
                  
                  <el-form-item label="密码复杂度">
                    <el-checkbox-group v-model="securitySettings.password.complexity">
                      <el-checkbox label="uppercase">包含大写字母</el-checkbox>
                      <el-checkbox label="lowercase">包含小写字母</el-checkbox>
                      <el-checkbox label="numbers">包含数字</el-checkbox>
                      <el-checkbox label="symbols">包含特殊字符</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                  
                  <el-form-item label="密码有效期">
                    <el-input-number
                      v-model="securitySettings.password.expireDays"
                      :min="0"
                      :max="365"
                      controls-position="right"
                    />
                    <span class="form-tip">天（0表示永不过期）</span>
                  </el-form-item>
                  
                  <el-form-item label="历史密码检查">
                    <el-input-number
                      v-model="securitySettings.password.historyCount"
                      :min="0"
                      :max="10"
                      controls-position="right"
                    />
                    <span class="form-tip">个（0表示不检查）</span>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
            
            <el-col :span="12">
              <el-card class="settings-card">
                <template #header>
                  <div class="card-header">
                    <h3>登录安全</h3>
                    <p>配置用户登录安全策略</p>
                  </div>
                </template>
                
                <el-form
                  ref="loginFormRef"
                  :model="securitySettings.login"
                  label-width="140px"
                  class="settings-form"
                >
                  <el-form-item label="最大失败次数">
                    <el-input-number
                      v-model="securitySettings.login.maxFailAttempts"
                      :min="3"
                      :max="10"
                      controls-position="right"
                    />
                  </el-form-item>
                  
                  <el-form-item label="锁定时间">
                    <el-input-number
                      v-model="securitySettings.login.lockoutDuration"
                      :min="5"
                      :max="1440"
                      controls-position="right"
                    />
                    <span class="form-tip">分钟</span>
                  </el-form-item>
                  
                  <el-form-item label="会话超时">
                    <el-input-number
                      v-model="securitySettings.login.sessionTimeout"
                      :min="30"
                      :max="1440"
                      controls-position="right"
                    />
                    <span class="form-tip">分钟</span>
                  </el-form-item>
                  
                  <el-form-item label="强制HTTPS">
                    <el-switch
                      v-model="securitySettings.login.forceHttps"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                  </el-form-item>
                  
                  <el-form-item label="双因子认证">
                    <el-switch
                      v-model="securitySettings.login.twoFactorAuth"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
          
          <div class="settings-actions">
            <el-button type="primary" @click="saveSecuritySettings" :loading="saving">
              保存安全设置
            </el-button>
            <el-button @click="resetSecuritySettings">重置</el-button>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 邮件设置 -->
      <el-tab-pane label="邮件设置" name="email">
        <div class="settings-section">
          <el-card class="settings-card">
            <template #header>
              <div class="card-header">
                <h3>SMTP配置</h3>
                <p>配置系统邮件发送服务</p>
              </div>
            </template>
            
            <el-form
              ref="emailFormRef"
              :model="emailSettings"
              :rules="emailRules"
              label-width="120px"
              class="settings-form"
            >
              <el-form-item label="SMTP服务器" prop="smtpHost">
                <el-input
                  v-model="emailSettings.smtpHost"
                  placeholder="请输入SMTP服务器地址"
                />
              </el-form-item>
              
              <el-form-item label="端口" prop="smtpPort">
                <el-input-number
                  v-model="emailSettings.smtpPort"
                  :min="1"
                  :max="65535"
                  controls-position="right"
                />
              </el-form-item>
              
              <el-form-item label="加密方式" prop="encryption">
                <el-select v-model="emailSettings.encryption" placeholder="选择加密方式">
                  <el-option label="无" value="none" />
                  <el-option label="SSL" value="ssl" />
                  <el-option label="TLS" value="tls" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="emailSettings.username"
                  placeholder="请输入SMTP用户名"
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="emailSettings.password"
                  type="password"
                  placeholder="请输入SMTP密码"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="发件人邮箱" prop="fromEmail">
                <el-input
                  v-model="emailSettings.fromEmail"
                  placeholder="请输入发件人邮箱"
                />
              </el-form-item>
              
              <el-form-item label="发件人名称" prop="fromName">
                <el-input
                  v-model="emailSettings.fromName"
                  placeholder="请输入发件人名称"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveEmailSettings" :loading="saving">
                  保存设置
                </el-button>
                <el-button @click="testEmailConnection" :loading="testing">
                  测试连接
                </el-button>
                <el-button @click="resetEmailSettings">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>
      
      <!-- 存储设置 -->
      <el-tab-pane label="存储设置" name="storage">
        <div class="settings-section">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-card class="settings-card">
                <template #header>
                  <div class="card-header">
                    <h3>文件存储</h3>
                    <p>配置文件上传和存储设置</p>
                  </div>
                </template>
                
                <el-form
                  ref="storageFormRef"
                  :model="storageSettings.file"
                  label-width="120px"
                  class="settings-form"
                >
                  <el-form-item label="存储类型">
                    <el-select v-model="storageSettings.file.type" placeholder="选择存储类型">
                      <el-option label="本地存储" value="local" />
                      <el-option label="阿里云OSS" value="aliyun" />
                      <el-option label="腾讯云COS" value="tencent" />
                      <el-option label="AWS S3" value="aws" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="最大文件大小">
                    <el-input-number
                      v-model="storageSettings.file.maxSize"
                      :min="1"
                      :max="100"
                      controls-position="right"
                    />
                    <span class="form-tip">MB</span>
                  </el-form-item>
                  
                  <el-form-item label="允许的文件类型">
                    <el-select
                      v-model="storageSettings.file.allowedTypes"
                      multiple
                      placeholder="选择允许的文件类型"
                      style="width: 100%;"
                    >
                      <el-option label="图片 (jpg, png, gif)" value="image" />
                      <el-option label="文档 (pdf, doc, docx)" value="document" />
                      <el-option label="压缩包 (zip, rar)" value="archive" />
                      <el-option label="视频 (mp4, avi)" value="video" />
                      <el-option label="音频 (mp3, wav)" value="audio" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="存储路径">
                    <el-input
                      v-model="storageSettings.file.path"
                      placeholder="请输入存储路径"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
            
            <el-col :span="12">
              <el-card class="settings-card">
                <template #header>
                  <div class="card-header">
                    <h3>缓存设置</h3>
                    <p>配置系统缓存策略</p>
                  </div>
                </template>
                
                <el-form
                  ref="cacheFormRef"
                  :model="storageSettings.cache"
                  label-width="120px"
                  class="settings-form"
                >
                  <el-form-item label="缓存类型">
                    <el-select v-model="storageSettings.cache.type" placeholder="选择缓存类型">
                      <el-option label="内存缓存" value="memory" />
                      <el-option label="Redis" value="redis" />
                      <el-option label="Memcached" value="memcached" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="缓存服务器">
                    <el-input
                      v-model="storageSettings.cache.host"
                      placeholder="请输入缓存服务器地址"
                    />
                  </el-form-item>
                  
                  <el-form-item label="端口">
                    <el-input-number
                      v-model="storageSettings.cache.port"
                      :min="1"
                      :max="65535"
                      controls-position="right"
                    />
                  </el-form-item>
                  
                  <el-form-item label="默认过期时间">
                    <el-input-number
                      v-model="storageSettings.cache.ttl"
                      :min="60"
                      :max="86400"
                      controls-position="right"
                    />
                    <span class="form-tip">秒</span>
                  </el-form-item>
                  
                  <el-form-item label="启用缓存">
                    <el-switch
                      v-model="storageSettings.cache.enabled"
                      active-text="开启"
                      inactive-text="关闭"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
          
          <div class="settings-actions">
            <el-button type="primary" @click="saveStorageSettings" :loading="saving">
              保存存储设置
            </el-button>
            <el-button @click="resetStorageSettings">重置</el-button>
          </div>
        </div>
      </el-tab-pane>
      
      <!-- 系统监控 -->
      <el-tab-pane label="系统监控" name="monitoring">
        <div class="settings-section">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-card class="status-card">
                <div class="status-item">
                  <div class="status-icon cpu">
                    <el-icon><Monitor /></el-icon>
                  </div>
                  <div class="status-content">
                    <div class="status-label">CPU使用率</div>
                    <div class="status-value">{{ systemStatus.cpu }}%</div>
                    <el-progress :percentage="systemStatus.cpu" :show-text="false" />
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="status-card">
                <div class="status-item">
                  <div class="status-icon memory">
                    <el-icon><Cpu /></el-icon>
                  </div>
                  <div class="status-content">
                    <div class="status-label">内存使用率</div>
                    <div class="status-value">{{ systemStatus.memory }}%</div>
                    <el-progress :percentage="systemStatus.memory" :show-text="false" />
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="status-card">
                <div class="status-item">
                  <div class="status-icon disk">
                    <el-icon><FolderOpened /></el-icon>
                  </div>
                  <div class="status-content">
                    <div class="status-label">磁盘使用率</div>
                    <div class="status-value">{{ systemStatus.disk }}%</div>
                    <el-progress :percentage="systemStatus.disk" :show-text="false" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="24" style="margin-top: 24px;">
            <el-col :span="12">
              <el-card class="settings-card">
                <template #header>
                  <div class="card-header">
                    <h3>服务状态</h3>
                    <p>查看系统各项服务运行状态</p>
                  </div>
                </template>
                
                <div class="service-list">
                  <div
                    v-for="service in services"
                    :key="service.name"
                    class="service-item"
                  >
                    <div class="service-info">
                      <div class="service-name">{{ service.name }}</div>
                      <div class="service-description">{{ service.description }}</div>
                    </div>
                    <div class="service-status">
                      <el-tag :type="service.status === 'running' ? 'success' : 'danger'">
                        {{ service.status === 'running' ? '运行中' : '已停止' }}
                      </el-tag>
                      <el-button
                        size="small"
                        :type="service.status === 'running' ? 'danger' : 'success'"
                        @click="toggleService(service)"
                      >
                        {{ service.status === 'running' ? '停止' : '启动' }}
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="12">
              <el-card class="settings-card">
                <template #header>
                  <div class="card-header">
                    <h3>系统信息</h3>
                    <p>查看系统基本信息和运行环境</p>
                  </div>
                </template>
                
                <div class="system-info">
                  <div class="info-item">
                    <label>操作系统</label>
                    <span>{{ systemInfo.os }}</span>
                  </div>
                  <div class="info-item">
                    <label>Node.js版本</label>
                    <span>{{ systemInfo.nodeVersion }}</span>
                  </div>
                  <div class="info-item">
                    <label>数据库版本</label>
                    <span>{{ systemInfo.dbVersion }}</span>
                  </div>
                  <div class="info-item">
                    <label>运行时间</label>
                    <span>{{ systemInfo.uptime }}</span>
                  </div>
                  <div class="info-item">
                    <label>最后重启</label>
                    <span>{{ systemInfo.lastRestart }}</span>
                  </div>
                </div>
                
                <div class="system-actions">
                  <el-button @click="refreshSystemInfo">
                    <el-icon><Refresh /></el-icon>
                    刷新信息
                  </el-button>
                  <el-button type="warning" @click="restartSystem">
                    <el-icon><RefreshRight /></el-icon>
                    重启系统
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import type { FormRules } from 'element-plus'
import { 
  Plus, Monitor, Cpu, FolderOpened, Refresh, RefreshRight
} from '@element-plus/icons-vue'

// 响应式数据
const activeTab = ref('basic')
const saving = ref(false)
const testing = ref(false)

// 表单引用
const basicFormRef = ref()
const passwordFormRef = ref()
const loginFormRef = ref()
const emailFormRef = ref()
const storageFormRef = ref()
const cacheFormRef = ref()

// 基本设置
const basicSettings = reactive({
  systemName: 'Epoch SSO',
  systemDescription: '企业级单点登录系统',
  systemVersion: 'v1.0.0',
  systemLogo: '',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

// 安全设置
const securitySettings = reactive({
  password: {
    minLength: 8,
    complexity: ['lowercase', 'numbers'],
    expireDays: 90,
    historyCount: 3
  },
  login: {
    maxFailAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 120,
    forceHttps: true,
    twoFactorAuth: false
  }
})

// 邮件设置
const emailSettings = reactive({
  smtpHost: '',
  smtpPort: 587,
  encryption: 'tls',
  username: '',
  password: '',
  fromEmail: '',
  fromName: ''
})

// 存储设置
const storageSettings = reactive({
  file: {
    type: 'local',
    maxSize: 10,
    allowedTypes: ['image', 'document'],
    path: '/uploads'
  },
  cache: {
    type: 'memory',
    host: 'localhost',
    port: 6379,
    ttl: 3600,
    enabled: true
  }
})

// 系统状态
const systemStatus = reactive({
  cpu: 45,
  memory: 68,
  disk: 32
})

// 服务列表
const services = ref([
  {
    name: 'Web服务',
    description: 'HTTP/HTTPS Web服务器',
    status: 'running'
  },
  {
    name: '数据库服务',
    description: 'PostgreSQL数据库服务',
    status: 'running'
  },
  {
    name: '缓存服务',
    description: 'Redis缓存服务',
    status: 'running'
  },
  {
    name: '邮件服务',
    description: 'SMTP邮件发送服务',
    status: 'stopped'
  }
])

// 系统信息
const systemInfo = reactive({
  os: 'Ubuntu 20.04 LTS',
  nodeVersion: 'v18.17.0',
  dbVersion: 'PostgreSQL 13.11',
  uptime: '15天 8小时 32分钟',
  lastRestart: '2024-01-01 10:30:00'
})

// 时区选项
const timezones = [
  { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
  { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '纽约时间 (UTC-5)', value: 'America/New_York' },
  { label: '伦敦时间 (UTC+0)', value: 'Europe/London' },
  { label: '巴黎时间 (UTC+1)', value: 'Europe/Paris' }
]

// 表单验证规则
const basicRules: FormRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  systemDescription: [
    { required: true, message: '请输入系统描述', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ],
  timezone: [
    { required: true, message: '请选择时区', trigger: 'change' }
  ],
  language: [
    { required: true, message: '请选择语言', trigger: 'change' }
  ]
}

const emailRules: FormRules = {
  smtpHost: [
    { required: true, message: '请输入SMTP服务器地址', trigger: 'blur' }
  ],
  smtpPort: [
    { required: true, message: '请输入端口号', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  fromEmail: [
    { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  fromName: [
    { required: true, message: '请输入发件人名称', trigger: 'blur' }
  ]
}

// 事件处理函数
const saveBasicSettings = async () => {
  if (!basicFormRef.value) return
  
  try {
    await basicFormRef.value.validate()
    saving.value = true
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('基本设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请检查输入信息')
  } finally {
    saving.value = false
  }
}

const resetBasicSettings = () => {
  basicFormRef.value?.resetFields()
}

const saveSecuritySettings = async () => {
  saving.value = true
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('安全设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetSecuritySettings = () => {
  // 重置安全设置到默认值
  Object.assign(securitySettings.password, {
    minLength: 8,
    complexity: ['lowercase', 'numbers'],
    expireDays: 90,
    historyCount: 3
  })
  
  Object.assign(securitySettings.login, {
    maxFailAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 120,
    forceHttps: true,
    twoFactorAuth: false
  })
}

const saveEmailSettings = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    saving.value = true
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('邮件设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败，请检查输入信息')
  } finally {
    saving.value = false
  }
}

const testEmailConnection = async () => {
  if (!emailFormRef.value) return
  
  try {
    await emailFormRef.value.validate()
    testing.value = true
    
    // 这里应该调用实际的API测试邮件连接
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('邮件连接测试成功')
  } catch (error) {
    ElMessage.error('邮件连接测试失败，请检查配置')
  } finally {
    testing.value = false
  }
}

const resetEmailSettings = () => {
  emailFormRef.value?.resetFields()
}

const saveStorageSettings = async () => {
  saving.value = true
  try {
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('存储设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const resetStorageSettings = () => {
  // 重置存储设置到默认值
  Object.assign(storageSettings.file, {
    type: 'local',
    maxSize: 10,
    allowedTypes: ['image', 'document'],
    path: '/uploads'
  })
  
  Object.assign(storageSettings.cache, {
    type: 'memory',
    host: 'localhost',
    port: 6379,
    ttl: 3600,
    enabled: true
  })
}

const checkUpdate = () => {
  ElMessage.info('检查更新功能开发中')
}

const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleLogoSuccess = (response: any, uploadFile: any, fileList: any) => {
  // 这里应该处理上传成功后的逻辑
  basicSettings.systemLogo = URL.createObjectURL(uploadFile.raw)
  ElMessage.success('Logo上传成功')
}

const toggleService = async (service: any) => {
  try {
    const action = service.status === 'running' ? '停止' : '启动'
    await ElMessageBox.confirm(
      `确定要${action}${service.name}吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    service.status = service.status === 'running' ? 'stopped' : 'running'
    ElMessage.success(`${service.name}${action}成功`)
  } catch (error) {
    // 用户取消操作
  }
}

const refreshSystemInfo = async () => {
  try {
    // 这里应该调用实际的API获取系统信息
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新系统状态
    systemStatus.cpu = Math.floor(Math.random() * 100)
    systemStatus.memory = Math.floor(Math.random() * 100)
    systemStatus.disk = Math.floor(Math.random() * 100)
    
    ElMessage.success('系统信息已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

const restartSystem = async () => {
  try {
    await ElMessageBox.confirm(
      '重启系统将中断所有用户连接，确定要继续吗？',
      '重启系统',
      {
        confirmButtonText: '确定重启',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('系统重启指令已发送，请稍后...')
    
    // 这里应该调用实际的API重启系统
  } catch (error) {
    // 用户取消操作
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 这里可以加载实际的系统设置数据
  // loadSystemSettings()
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

// 设置标签页
.settings-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 32px;
  }
  
  :deep(.el-tabs__nav-wrap) {
    background: white;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
  }
  
  :deep(.el-tabs__item) {
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &.is-active {
      background: #3b82f6;
      color: white;
    }
  }
}

// 设置区域
.settings-section {
  .settings-actions {
    margin-top: 32px;
    text-align: center;
    padding-top: 24px;
    border-top: 1px solid #f3f4f6;
  }
}

// 设置卡片
.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
  
  :deep(.el-card__header) {
    padding: 24px 24px 0;
    border-bottom: none;
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

.card-header {
  h3 {
    font-size: 18px;
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

// 表单样式
.settings-form {
  .form-tip {
    margin-left: 8px;
    font-size: 12px;
    color: #6b7280;
  }
  
  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #374151;
  }
  
  :deep(.el-checkbox-group) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

// Logo上传
.logo-upload {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  
  .logo-uploader {
    :deep(.el-upload) {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #3b82f6;
      }
    }
    
    .logo {
      width: 200px;
      height: 60px;
      object-fit: contain;
      display: block;
    }
    
    .logo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 200px;
      height: 60px;
      text-align: center;
      line-height: 60px;
    }
  }
  
  .logo-tips {
    p {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
  }
}

// 状态卡片
.status-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
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
  
  &.cpu {
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  
  &.memory {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
  }
  
  &.disk {
    background: linear-gradient(135deg, #fa709a, #fee140);
  }
}

.status-content {
  flex: 1;
  
  .status-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .status-value {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }
  
  :deep(.el-progress) {
    .el-progress-bar__outer {
      background: #f3f4f6;
    }
  }
}

// 服务列表
.service-list {
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .service-info {
    .service-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }
    
    .service-description {
      font-size: 14px;
      color: #6b7280;
    }
  }
  
  .service-status {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

// 系统信息
.system-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    
    span {
      font-size: 14px;
      color: #6b7280;
    }
  }
}

.system-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

// Element UI组件样式
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

:deep(.el-textarea) {
  .el-textarea__inner {
    border-radius: 8px;
  }
}

:deep(.el-input-number) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-switch) {
  --el-switch-on-color: #3b82f6;
}

:deep(.el-checkbox) {
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
}

:deep(.el-progress) {
  .el-progress-bar__inner {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  }
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
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
  .settings-section {
    .el-row {
      .el-col {
        margin-bottom: 24px;
      }
    }
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .settings-card :deep(.el-card__body) {
    padding: 16px;
  }
  
  .settings-form {
    :deep(.el-form-item__label) {
      width: 100px !important;
    }
  }
  
  .logo-upload {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .service-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .service-status {
    width: 100%;
    justify-content: space-between;
  }
  
  .system-actions {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
  
  .status-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
</style>