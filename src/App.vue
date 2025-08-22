<template>
  <div id="app" class="min-h-screen transition-colors duration-300" 
       :style="{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }">
    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view v-slot="{ Component, route }">
        <transition name="page-transition" appear>
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from './composables/useTheme'

// 初始化主题系统
const { initTheme } = useTheme()
initTheme()
</script>

<style>
/* 全局样式已在style.scss中定义 */

/* 全屏背景保护层 - 防止路由切换白屏 */
#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-base);
  z-index: -10;
  pointer-events: none;
}

/* 路由过渡动画 - 优化版本，减少白屏 */
.page-transition-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-leave-active {
  transition: all 0.15s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 确保过渡期间背景色保持一致，防止白屏 */
.page-transition-enter-active,
.page-transition-leave-active {
  background-color: var(--color-bg-base) !important;
  position: relative;
  z-index: 1;
}

/* 过渡容器背景保护 */
.page-transition-enter-active::before,
.page-transition-leave-active::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-base);
  z-index: -1;
  pointer-events: none;
}

/* 防止闪白的全局保护 */
#app {
  background-color: var(--color-bg-base) !important;
}

/* 路由视图容器背景保护 */
main {
  background-color: var(--color-bg-base);
  min-height: 100vh;
  position: relative;
}

/* 路由视图额外背景保护 */
main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-base);
  z-index: -1;
  pointer-events: none;
}

/* 过渡组件背景强制设置 */
.page-transition-enter-active,
.page-transition-leave-active {
  background-color: var(--color-bg-base) !important;
  min-height: 100vh;
  position: relative;
}
</style>