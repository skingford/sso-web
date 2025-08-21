import { ref, readonly, watchEffect, onMounted, onUnmounted, computed } from 'vue'

// 主题类型定义
export type Theme = 'light' | 'dark' | 'auto'
export type EffectiveTheme = 'light' | 'dark'

// 主题常量
export const THEMES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
  AUTO: 'auto' as const
} as const

// 本地存储键名
const THEME_STORAGE_KEY = 'preferred-theme'

export function useTheme() {
  const theme = ref<Theme>(THEMES.AUTO)
  const effectiveTheme = ref<EffectiveTheme>(THEMES.LIGHT)
  const systemTheme = ref<EffectiveTheme>(THEMES.LIGHT)
  
  let mediaQuery: MediaQueryList | null = null
  let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null

  /**
   * 获取系统偏好主题
   */
  const getSystemTheme = (): EffectiveTheme => {
    if (typeof window === 'undefined') return THEMES.LIGHT
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT
  }

  /**
   * 获取存储的主题偏好
   */
  const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return THEMES.AUTO
    
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
      if (stored && Object.values(THEMES).includes(stored as Theme)) {
        return stored
      }
    } catch (error) {
      console.warn('无法读取主题偏好设置:', error)
    }
    
    return THEMES.AUTO
  }

  /**
   * 保存主题偏好
   */
  const setStoredTheme = (t: Theme) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t)
    } catch (error) {
      console.warn('无法保存主题偏好设置:', error)
    }
  }

  /**
   * 计算有效主题
   */
  const computeEffectiveTheme = (preferredTheme: Theme, sysTheme: EffectiveTheme): EffectiveTheme => {
    if (preferredTheme === THEMES.AUTO) {
      return sysTheme
    }
    return preferredTheme as EffectiveTheme
  }

  /**
   * 应用主题到DOM
   */
  const applyTheme = (t: Theme, effective: EffectiveTheme) => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    
    // 移除所有主题相关的类和属性
    root.removeAttribute('data-theme')
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto')
    
    // 应用新主题
    if (effective === THEMES.DARK) {
      root.setAttribute('data-theme', 'dark')
    }
    
    // 添加主题类
    root.classList.add(`theme-${t}`)
    
    // 保存偏好设置
    setStoredTheme(t)
    
    // 触发自定义事件
    const event = new CustomEvent('themechange', {
      detail: { theme: t, effectiveTheme: effective }
    })
    document.dispatchEvent(event)
  }

  /**
   * 设置主题
   */
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    const effective = computeEffectiveTheme(newTheme, systemTheme.value)
    effectiveTheme.value = effective
    applyTheme(newTheme, effective)
  }

  /**
   * 切换主题
   */
  const toggleTheme = (targetTheme?: Theme) => {
    if (targetTheme) {
      setTheme(targetTheme)
      return
    }
    
    // 在light和dark之间切换
    const current = effectiveTheme.value
    const newTheme = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    setTheme(newTheme)
  }

  /**
   * 处理系统主题变化
   */
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const newSystemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT
    systemTheme.value = newSystemTheme
    
    // 如果当前是auto模式，更新有效主题
    if (theme.value === THEMES.AUTO) {
      const newEffective = computeEffectiveTheme(theme.value, newSystemTheme)
      effectiveTheme.value = newEffective
      applyTheme(theme.value, newEffective)
    }
  }

  /**
   * 初始化主题系统
   */
  const initTheme = () => {
    if (typeof window === 'undefined') return
    
    // 获取系统主题
    systemTheme.value = getSystemTheme()
    
    // 获取存储的主题偏好
    const storedTheme = getStoredTheme()
    theme.value = storedTheme
    
    // 计算有效主题
    const effective = computeEffectiveTheme(storedTheme, systemTheme.value)
    effectiveTheme.value = effective
    
    // 应用主题
    applyTheme(storedTheme, effective)
    
    // 监听系统主题变化
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListener = handleSystemThemeChange
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', mediaQueryListener)
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(mediaQueryListener)
    }
  }

  /**
   * 清理资源
   */
  const cleanup = () => {
    if (mediaQuery && mediaQueryListener) {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', mediaQueryListener)
      } else {
        mediaQuery.removeListener(mediaQueryListener)
      }
    }
  }

  // 生命周期钩子
  onMounted(() => {
    initTheme()
  })

  onUnmounted(() => {
    cleanup()
  })

  // 响应式更新
  watchEffect(() => {
    if (theme.value && systemTheme.value) {
      const effective = computeEffectiveTheme(theme.value, systemTheme.value)
      if (effective !== effectiveTheme.value) {
        effectiveTheme.value = effective
        applyTheme(theme.value, effective)
      }
    }
  })

  return {
    // 状态
    theme: readonly(theme),
    effectiveTheme: readonly(effectiveTheme),
    systemTheme: readonly(systemTheme),
    
    // 计算属性
    isDark: computed(() => effectiveTheme.value === THEMES.DARK),
    isLight: computed(() => effectiveTheme.value === THEMES.LIGHT),
    isAuto: computed(() => theme.value === THEMES.AUTO),
    
    // 方法
    setTheme,
    toggleTheme,
    initTheme,
    
    // 常量
    THEMES
  }
}