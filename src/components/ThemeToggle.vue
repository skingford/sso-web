<template>
  <div :class="`theme-toggle-wrapper ${className}`">
    <!-- 切换按钮样式 -->
    <template v-if="variant === 'toggle'">
      <button
        @click="handleToggle"
        :class="[
          'theme-toggle relative inline-flex items-center rounded-full',
          'border-2 transition-all duration-300 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          sizeClasses.toggle,
          { 'dark': isDark }
        ]"
        :aria-label="`切换到${isDark ? '亮色' : '暗色'}主题`"
        :title="`当前: ${isDark ? '暗色' : '亮色'}主题`"
      >
        <span class="sr-only">
          {{ isDark ? '切换到亮色主题' : '切换到暗色主题' }}
        </span>
      </button>
      
      <span v-if="showLabel" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {{ isDark ? '暗色' : '亮色' }}
      </span>
    </template>

    <!-- 下拉菜单样式 -->
    <template v-else-if="variant === 'dropdown'">
      <button
        @click="isDropdownOpen = !isDropdownOpen"
        :class="[
          'inline-flex items-center justify-center rounded-lg',
          'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
          'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500',
          sizeClasses.button
        ]"
        aria-label="选择主题"
        :aria-expanded="isDropdownOpen"
      >
        <component :is="currentOption.icon" :class="sizeClasses.icon" />
        <span v-if="showLabel" class="ml-2">{{ currentOption.label }}</span>
      </button>

      <Teleport to="body" v-if="isDropdownOpen">
        <!-- 遮罩层 -->
        <div 
          class="fixed inset-0 z-10" 
          @click="isDropdownOpen = false"
        />
        
        <!-- 下拉菜单 -->
        <div 
          ref="dropdownRef"
          :class="[
            'absolute z-20 w-48',
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
            'py-1 animate-fadeInDown'
          ]"
          :style="dropdownStyle"
        >
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="handleThemeChange(option.value)"
            :class="[
              'w-full px-4 py-2 text-left flex items-center',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              'transition-colors duration-150',
              option.value === theme
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300'
            ]"
          >
            <component :is="option.icon" class="w-4 h-4 mr-3" />
            <div>
              <div class="font-medium">{{ option.label }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ option.description }}
              </div>
            </div>
            <div 
              v-if="option.value === theme"
              class="ml-auto w-2 h-2 bg-primary-500 rounded-full"
            />
          </button>
        </div>
      </Teleport>
    </template>

    <!-- 按钮组样式 -->
    <template v-else-if="variant === 'buttons'">
      <div class="theme-buttons flex rounded-lg border border-gray-300 dark:border-gray-600">
        <button
          v-for="(option, index) in themeOptions"
          :key="option.value"
          @click="handleThemeChange(option.value)"
          :class="[
            'flex items-center justify-center transition-all duration-200',
            sizeClasses.button,
            {
              'rounded-l-lg': index === 0,
              'rounded-r-lg': index === themeOptions.length - 1,
              'border-x border-gray-300 dark:border-gray-600': index > 0 && index < themeOptions.length - 1
            },
            option.value === theme
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10'
          ]"
          :aria-label="option.label"
          :title="option.description"
        >
          <component :is="option.icon" :class="sizeClasses.icon" />
          <span v-if="showLabel" class="ml-2 text-sm">{{ option.label }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme, type Theme } from '../composables/useTheme'

// Props
interface Props {
  variant?: 'toggle' | 'dropdown' | 'buttons'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'toggle',
  size: 'md',
  showLabel: false,
  className: ''
})

// 使用主题 composable
const { theme, effectiveTheme, isDark, setTheme, toggleTheme, THEMES } = useTheme()

// 响应式数据
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref({})

// 尺寸样式
const sizeClasses = computed(() => {
  const sizes = {
    sm: {
      toggle: 'w-12 h-6',
      button: 'p-1.5 text-sm',
      icon: 'w-3 h-3'
    },
    md: {
      toggle: 'w-14 h-7',
      button: 'p-2 text-base',
      icon: 'w-4 h-4'
    },
    lg: {
      toggle: 'w-16 h-8',
      button: 'p-3 text-lg',
      icon: 'w-5 h-5'
    }
  }
  return sizes[props.size]
})

// 主题选项
const themeOptions = [
  {
    value: THEMES.LIGHT,
    label: '亮色主题',
    icon: Sun,
    description: '始终使用亮色主题'
  },
  {
    value: THEMES.DARK,
    label: '暗色主题',
    icon: Moon,
    description: '始终使用暗色主题'
  },
  {
    value: THEMES.AUTO,
    label: '跟随系统',
    icon: Monitor,
    description: '跟随系统设置自动切换'
  }
]

// 当前选项
const currentOption = computed(() => {
  return themeOptions.find(option => option.value === theme.value) || themeOptions[2]
})

// 事件处理
const handleToggle = () => {
  if (props.variant === 'toggle') {
    toggleTheme()
  }
}

const handleThemeChange = (newTheme: Theme) => {
  setTheme(newTheme)
  isDropdownOpen.value = false
}

// 下拉菜单定位
const updateDropdownPosition = async () => {
  if (!isDropdownOpen.value) return
  
  await nextTick()
  
  const button = document.querySelector('.theme-dropdown button')
  const dropdown = dropdownRef.value
  
  if (!button || !dropdown) return
  
  const buttonRect = button.getBoundingClientRect()
  const dropdownRect = dropdown.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  
  let top = buttonRect.bottom + 8
  let left = buttonRect.right - dropdownRect.width
  
  // 防止下拉菜单超出视口
  if (top + dropdownRect.height > viewportHeight) {
    top = buttonRect.top - dropdownRect.height - 8
  }
  
  if (left < 0) {
    left = buttonRect.left
  }
  
  if (left + dropdownRect.width > viewportWidth) {
    left = viewportWidth - dropdownRect.width - 8
  }
  
  dropdownStyle.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

// 监听下拉菜单开关
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.theme-dropdown') && !target.closest('[data-dropdown-content]')) {
    isDropdownOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
})

// 监听下拉菜单状态变化
watch(isDropdownOpen, (isOpen) => {
  if (isOpen) {
    updateDropdownPosition()
  }
})
</script>

<style scoped>
/* 主题切换按钮的自定义样式已在全局CSS中定义 */
.theme-toggle {
  /* 继承全局样式 */
}

/* 下拉菜单动画 */
.animate-fadeInDown {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 无障碍访问 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>