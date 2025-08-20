<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <div class="error-code">403</div>
      <h1 class="error-title">访问被拒绝</h1>
      <p class="error-description">
        抱歉，您没有权限访问此页面。请联系管理员获取相应权限。
      </p>
      <div class="error-actions">
        <el-button type="primary" @click="goToDashboard">
          <el-icon><User /></el-icon>
          返回控制台
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElIcon } from 'element-plus'
import { User, ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.forbidden-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
}

.forbidden-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #F56C6C;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 8px rgba(245, 108, 108, 0.3);
}

.error-title {
  font-size: 32px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-description {
  font-size: 16px;
  color: #606266;
  margin-bottom: 40px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions .el-button {
  padding: 12px 24px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .forbidden-content {
    padding: 40px 20px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-actions .el-button {
    width: 200px;
  }
}
</style>