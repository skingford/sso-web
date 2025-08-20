<template>
  <div class="content-section">
    <div class="section-header">
      <h2>安全设置</h2>
      <p>管理您的账户安全设置，包括密码和两步验证</p>
    </div>

    <!-- 密码修改 -->
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="120px"
        size="large"
      >
        <el-form-item label="当前密码" prop="current_password">
          <el-input 
            v-model="passwordForm.current_password" 
            type="password" 
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="new_password">
          <el-input 
            v-model="passwordForm.new_password" 
            type="password" 
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirm_password">
          <el-input 
            v-model="passwordForm.confirm_password" 
            type="password" 
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="changePassword" :loading="changingPassword">
            修改密码
          </el-button>
          <el-button @click="resetPasswordForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 两步验证 -->
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>两步验证</span>
        </div>
      </template>
      
      <div class="two-factor-content">
        <div>
          <h4>增强账户安全性</h4>
          <p>启用两步验证后，登录时除了密码外还需要提供验证码，大大提高账户安全性。</p>
        </div>
        <el-switch
          v-model="twoFactorEnabled"
          @change="toggleTwoFactor"
          :loading="togglingTwoFactor"
        />
      </div>
      
      <div v-if="twoFactorEnabled" class="two-factor-setup">
        <el-divider />
        <h4>设置验证器应用</h4>
        <p>请使用 Google Authenticator、Microsoft Authenticator 或其他兼容的验证器应用扫描下方二维码：</p>
        
        <div class="qr-code-section">
          <div class="qr-placeholder">
            <el-icon size="64"><Picture /></el-icon>
            <p>二维码占位符</p>
            <p class="secret-key">手动输入密钥：ABCD-EFGH-IJKL-MNOP</p>
          </div>
        </div>
        
        <el-form :model="verificationForm" label-width="120px">
          <el-form-item label="验证码">
            <el-input 
              v-model="verificationForm.code" 
              placeholder="请输入6位验证码"
              maxlength="6"
              style="width: 200px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="verifyTwoFactor">验证并启用</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 安全日志 -->
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <span>最近安全活动</span>
        </div>
      </template>
      
      <el-table :data="securityLogs" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="action" label="操作" width="150" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'

// 表单引用
const passwordFormRef = ref<FormInstance>()
const changingPassword = ref(false)
const togglingTwoFactor = ref(false)

// 密码修改表单
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// 两步验证相关
const twoFactorEnabled = ref(false)
const verificationForm = reactive({
  code: ''
})

// 安全日志
const securityLogs = ref([
  {
    time: '2024-01-15 14:30:25',
    action: '登录',
    ip: '192.168.1.100',
    location: '北京',
    status: 'success'
  },
  {
    time: '2024-01-15 09:15:10',
    action: '修改密码',
    ip: '192.168.1.100',
    location: '北京',
    status: 'success'
  },
  {
    time: '2024-01-14 18:45:33',
    action: '登录失败',
    ip: '192.168.1.101',
    location: '上海',
    status: 'failed'
  },
  {
    time: '2024-01-14 18:20:15',
    action: '登录',
    ip: '192.168.1.101',
    location: '上海',
    status: 'success'
  }
])

// 表单验证规则
const passwordRules: FormRules = {
  current_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度在 6 到 50 个字符', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
      message: '密码必须包含大小写字母和数字',
      trigger: 'blur'
    }
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.new_password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    const valid = await passwordFormRef.value.validate()
    if (valid) {
      changingPassword.value = true
      
      // 这里应该调用实际的API
      // await apiService.user.changePassword(passwordForm)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('密码修改成功')
      resetPasswordForm()
    }
  } catch (error) {
    console.error('Password change error:', error)
    ElMessage.error('密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 切换两步验证
const toggleTwoFactor = async () => {
  if (twoFactorEnabled.value) {
    // 启用两步验证
    ElMessage.info('请完成下方的验证器设置')
  } else {
    // 禁用两步验证
    try {
      await ElMessageBox.confirm(
        '确定要禁用两步验证吗？这会降低您账户的安全性。',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      togglingTwoFactor.value = true
      
      // 这里应该调用实际的API
      // await apiService.user.disableTwoFactor()
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('两步验证已禁用')
    } catch {
      // 用户取消操作，恢复开关状态
      twoFactorEnabled.value = true
    } finally {
      togglingTwoFactor.value = false
    }
  }
}

// 验证两步验证码
const verifyTwoFactor = async () => {
  if (!verificationForm.code || verificationForm.code.length !== 6) {
    ElMessage.error('请输入6位验证码')
    return
  }
  
  try {
    // 这里应该调用实际的API验证
    // await apiService.user.verifyTwoFactor(verificationForm.code)
    
    // 模拟验证成功
    ElMessage.success('两步验证设置成功')
    verificationForm.code = ''
  } catch (error) {
    ElMessage.error('验证码错误，请重试')
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  // 这里可以加载用户的两步验证状态
  // loadTwoFactorStatus()
})
</script>

<style scoped lang="scss">
.content-section {
  max-width: 800px;
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

// 安全设置卡片
.security-card {
  margin-bottom: 48px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  :deep(.el-card__header) {
    padding: 32px 32px 0;
  }
  
  :deep(.el-card__body) {
    padding: 24px 32px 32px;
  }
  
  .card-header {
    span {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.3px;
    }
  }
}

.two-factor-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }
}

.two-factor-setup {
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 24px 0 8px 0;
  }
  
  p {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
}

.qr-code-section {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.qr-placeholder {
  text-align: center;
  padding: 32px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  
  .el-icon {
    color: #6b7280;
    margin-bottom: 16px;
  }
  
  p {
    color: #6b7280;
    font-size: 14px;
    margin: 8px 0;
  }
  
  .secret-key {
    font-family: monospace;
    background: #f3f4f6;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    color: #374151;
    margin-top: 16px;
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

:deep(.el-switch) {
  --el-switch-on-color: #667eea;
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
@media (max-width: 768px) {
  .section-header h2 {
    font-size: 20px;
  }
  
  .security-card {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .two-factor-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .qr-placeholder {
    padding: 24px;
  }
}
</style>