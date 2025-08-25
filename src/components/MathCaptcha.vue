<template>
  <div class="math-captcha-container">
    <div class="captcha-row">
      <div class="captcha-input">
        <input
          v-model="userAnswer"
          type="number"
          placeholder="请输入计算结果"
          class="input-field"
          :disabled="loading"
          @input="handleInput"
        />
      </div>
      <div class="captcha-display">
        <canvas 
          ref="captchaCanvas"
          class="captcha-canvas" 
          :class="{ 'refreshing': loading }"
          @click="refreshCaptcha"
          :width="props.width"
          :height="props.height"
          :title="loading ? '正在刷新...' : '点击刷新'"
        ></canvas>
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>
      </div>
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authAPI } from '@/utils/api'

interface MathCaptchaProps {
  width?: number
  height?: number
}

interface MathCaptchaEmits {
  (e: 'change', data: { captchaId: string; answer: string }): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<MathCaptchaProps>(), {
  width: 150,
  height: 50
})

const emit = defineEmits<MathCaptchaEmits>()

const captchaCanvas = ref<HTMLCanvasElement | null>(null)
const captchaId = ref('')
const userAnswer = ref('')
const loading = ref(false)
const errorMessage = ref('')
const mathExpression = ref('')

// 绘制验证码到Canvas
const drawCaptcha = (expression: string) => {
  if (!captchaCanvas.value) return
  
  const canvas = captchaCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 设置背景
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#f8fafc')
  gradient.addColorStop(1, '#e2e8f0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 添加噪点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2)
  }
  
  // 绘制干扰线
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.4)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
    ctx.stroke()
  }
  
  // 绘制文字
  ctx.font = 'bold 20px Arial'
  ctx.fillStyle = '#374151'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // 添加文字阴影效果
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 1
  
  ctx.fillText(expression, canvas.width / 2, canvas.height / 2)
}

// 获取验证码
const fetchCaptcha = async () => {
  try {
    loading.value = true
    const response = await authAPI.getCaptcha()
    
    if (response.data.success) {
      captchaId.value = response.data.captcha_id
      mathExpression.value = response.data.expression
      // 绘制验证码到Canvas
      drawCaptcha(response.data.expression)
    } else {
      ElMessage.error('获取验证码失败')
    }
    
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败，请重试')
  } finally {
    loading.value = false
  }
}

// 刷新验证码
const refreshCaptcha = async () => {
  userAnswer.value = ''
  await fetchCaptcha()
}

// 处理用户输入
const handleInput = () => {
  errorMessage.value = ''
  if (captchaId.value && userAnswer.value) {
    emit('change', {
      captchaId: captchaId.value,
      answer: userAnswer.value
    })
  }
}

// 验证验证码
const verifyCaptcha = async (answer: string): Promise<boolean> => {
  try {
    const response = await authAPI.verifyCaptcha({
      captcha_id: captchaId.value,
      captcha_answer: answer
    })
    
    if (!response.data.success) {
      errorMessage.value = response.data.message || '验证码验证失败'
      return false
    }
    
    return true
  } catch (error) {
    errorMessage.value = '验证码验证失败'
    console.error('Verify captcha error:', error)
    return false
  }
}

// 获取当前验证码数据
const getCaptchaData = () => {
  return {
    captchaId: captchaId.value,
    answer: userAnswer.value
  }
}

// 清空输入
const clear = () => {
  userAnswer.value = ''
  errorMessage.value = ''
}

// 验证验证码
const validate = async (): Promise<boolean> => {
  if (!userAnswer.value.trim()) {
    ElMessage.error('请输入计算结果')
    return false
  }
  
  try {
    const response = await authAPI.verifyCaptcha({
      captcha_id: captchaId.value,
      captcha_answer: userAnswer.value
    })
    
    if (response.data.success) {
      return true
    } else {
      ElMessage.error(response.data.message || '验证码错误')
      return false
    }
  } catch (error) {
    console.error('验证验证码失败:', error)
    ElMessage.error('验证失败，请重试')
    return false
  }
}

// 暴露方法给父组件
defineExpose({
  refresh: refreshCaptcha,
  validate,
  getCaptchaData,
  clear
})

// 组件挂载后获取验证码
onMounted(() => {
  fetchCaptcha()
})
</script>

<style scoped>
.math-captcha-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-display {
  position: relative;
  flex-shrink: 0;
}

.captcha-canvas {
  width: 150px;
  height: 50px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.captcha-canvas:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15), 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: #fafbff;
}

.captcha-canvas.refreshing {
  animation: pulse 1s ease-in-out;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e5e9;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}



.captcha-input {
  flex: 1;
  min-width: 0;
}

.input-field {
  width: 100%;
  height: 50px;
  padding: 0 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  outline: none;
  box-sizing: border-box;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  color: #374151;
}

.input-field:hover:not(:disabled) {
  border-color: #a0aec0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15), 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.input-field:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.input-field::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  font-weight: 500;
  margin-top: 4px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
}



.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .math-captcha-container {
    max-width: 100%;
  }
  
  .captcha-container {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    max-width: 100%;
  }
  
  .canvas-wrapper {
    align-self: center;
  }
  
  .captcha-canvas {
    width: 140px;
    height: 45px;
  }
  
  .input-field {
    height: 45px;
    font-size: 15px;
    padding: 10px 14px;
  }
  

}

@media (max-width: 480px) {
  .captcha-canvas {
    width: 120px;
    height: 40px;
  }
  
  .input-field {
    height: 40px;
    font-size: 14px;
    padding: 8px 12px;
  }
  

}
</style>