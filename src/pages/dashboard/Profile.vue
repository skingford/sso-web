<template>
  <div class="content-section">
    <div class="section-header">
      <h2>个人资料</h2>
      <p>管理您的个人信息和账户设置</p>
    </div>

    <el-card>
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="profileRules"
        label-width="120px"
        size="large"
      >
        <el-row :gutter="32">
          <el-col :span="16">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" type="email" />
            </el-form-item>
            
            <el-form-item label="显示名称" prop="display_name">
              <el-input v-model="profileForm.display_name" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="头像">
              <div class="avatar-upload">
                <el-avatar 
                  :size="100" 
                  :src="profileForm.avatar_url || undefined"
                  :icon="UserFilled"
                />
                <el-upload
                  class="upload-btn"
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :http-request="handleAvatarUpload"
                >
                  <el-button size="small" type="primary">更换头像</el-button>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button type="primary" @click="updateProfile" :loading="updating">
            保存修改
          </el-button>
          <el-button @click="resetProfile">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 表单引用
const profileFormRef = ref<FormInstance>()
const updating = ref(false)

// 个人资料表单
const profileForm = reactive({
  username: '',
  email: '',
  display_name: '',
  phone: '',
  avatar_url: ''
})

// 表单验证规则
const profileRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  display_name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 更新个人资料
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    const valid = await profileFormRef.value.validate()
    if (valid) {
      updating.value = true
      
      // 这里应该调用实际的API
      // await apiService.user.updateProfile(profileForm)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 更新store中的用户信息
      if (authStore.user) {
        authStore.user.email = profileForm.email
        authStore.user.display_name = profileForm.display_name
        authStore.user.avatar = profileForm.avatar_url
      }
      
      ElMessage.success('个人资料更新成功')
    }
  } catch (error) {
    console.error('Profile update error:', error)
    ElMessage.error('个人资料更新失败')
  } finally {
    updating.value = false
  }
}

// 重置个人资料
const resetProfile = () => {
  if (authStore.user) {
    Object.assign(profileForm, {
      username: authStore.user.username,
      email: authStore.user.email,
      display_name: authStore.user.display_name || '',
      phone: authStore.user.phone || '',
      avatar_url: authStore.user.avatar || ''
    })
  }
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type)) {
    ElMessage.error('头像只能是 JPG/PNG/GIF 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像上传
const handleAvatarUpload = async (options: any) => {
  try {
    // 这里应该调用实际的文件上传API
    // const formData = new FormData()
    // formData.append('file', options.file)
    // const response = await apiService.upload.uploadAvatar(formData)
    // profileForm.avatar_url = response.data.url
    
    // 模拟上传成功
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.avatar_url = e.target?.result as string
    }
    reader.readAsDataURL(options.file)
    
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('Avatar upload error:', error)
    ElMessage.error('头像上传失败')
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  resetProfile()
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

// 头像上传样式
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  
  .upload-btn {
    width: 100px;
    
    :deep(.el-button) {
      width: 100%;
      border-radius: 8px;
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
  
  .el-card__body {
    padding: 48px;
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
  
  :deep(.el-card .el-card__body) {
    padding: 32px;
  }
  
  :deep(.el-form--label-top .el-form-item__label) {
    padding-bottom: 8px;
  }
}
</style>