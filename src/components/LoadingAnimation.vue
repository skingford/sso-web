<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-container">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div class="loading-text">
        <span class="loading-letter" v-for="(letter, index) in loadingText" :key="index" :style="{ animationDelay: index * 0.1 + 's' }">
          {{ letter === ' ' ? '&nbsp;' : letter }}
        </span>
      </div>
      <div class="loading-progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 2000
})

const emit = defineEmits<{
  finished: []
}>()

const isLoading = ref(true)
const progress = ref(0)
const loadingText = 'EPOCH SSO'

let progressInterval: NodeJS.Timeout
let finishTimeout: NodeJS.Timeout

const startLoading = () => {
  // 进度条动画
  progressInterval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += Math.random() * 15
      if (progress.value > 100) progress.value = 100
    }
  }, 100)
  
  // 完成加载
  finishTimeout = setTimeout(() => {
    progress.value = 100
    setTimeout(() => {
      isLoading.value = false
      emit('finished')
    }, 500)
  }, props.duration)
}

onMounted(() => {
  startLoading()
})

// 清理定时器
const cleanup = () => {
  if (progressInterval) clearInterval(progressInterval)
  if (finishTimeout) clearTimeout(finishTimeout)
}

// 组件卸载时清理
defineExpose({
  cleanup
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeOut 0.5s ease-out 2s forwards;
}

.loading-container {
  text-align: center;
  color: white;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: rgba(255, 255, 255, 0.6);
  animation-duration: 1.2s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: rgba(255, 255, 255, 0.4);
  animation-duration: 0.9s;
}

.loading-text {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin-bottom: 2rem;
}

.loading-letter {
  display: inline-block;
  animation: bounce 1.5s ease-in-out infinite;
}

.loading-progress {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 2px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
</style>