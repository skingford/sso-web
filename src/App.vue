<template>
  <div id="app" class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view />
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
</style>