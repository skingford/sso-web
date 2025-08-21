/**
 * 主题管理工具
 * 提供主题切换、检测和持久化功能
 */

// 主题类型常量
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// 本地存储键名
const THEME_STORAGE_KEY = 'preferred-theme';

/**
 * 获取系统偏好主题
 * @returns {string} 'light' 或 'dark'
 */
export function getSystemTheme() {
  if (typeof window === 'undefined') return THEMES.LIGHT;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? THEMES.DARK 
    : THEMES.LIGHT;
}

/**
 * 获取当前存储的主题偏好
 * @returns {string} 主题名称
 */
export function getStoredTheme() {
  if (typeof window === 'undefined') return THEMES.AUTO;
  
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || THEMES.AUTO;
  } catch (error) {
    console.warn('无法读取主题偏好设置:', error);
    return THEMES.AUTO;
  }
}

/**
 * 保存主题偏好到本地存储
 * @param {string} theme - 主题名称
 */
export function setStoredTheme(theme) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('无法保存主题偏好设置:', error);
  }
}

/**
 * 获取实际应用的主题
 * @param {string} preferredTheme - 偏好主题
 * @returns {string} 'light' 或 'dark'
 */
export function getEffectiveTheme(preferredTheme = getStoredTheme()) {
  if (preferredTheme === THEMES.AUTO) {
    return getSystemTheme();
  }
  return preferredTheme;
}

/**
 * 应用主题到DOM
 * @param {string} theme - 主题名称 ('light', 'dark', 'auto')
 */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  
  const effectiveTheme = getEffectiveTheme(theme);
  const root = document.documentElement;
  
  // 移除所有主题类
  root.removeAttribute('data-theme');
  root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  
  // 应用新主题
  if (effectiveTheme === THEMES.DARK) {
    root.setAttribute('data-theme', 'dark');
  }
  
  // 添加主题类
  root.classList.add(`theme-${theme}`);
  
  // 保存偏好设置
  setStoredTheme(theme);
  
  // 触发主题变更事件
  const event = new CustomEvent('themechange', {
    detail: { theme, effectiveTheme }
  });
  document.dispatchEvent(event);
}

/**
 * 切换主题
 * @param {string} [targetTheme] - 目标主题，如果不提供则在light/dark之间切换
 */
export function toggleTheme(targetTheme) {
  const currentTheme = getStoredTheme();
  
  if (targetTheme) {
    applyTheme(targetTheme);
    return;
  }
  
  // 在light和dark之间切换
  const effectiveTheme = getEffectiveTheme(currentTheme);
  const newTheme = effectiveTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  applyTheme(newTheme);
}

/**
 * 初始化主题系统
 * 应该在应用启动时调用
 */
export function initTheme() {
  if (typeof window === 'undefined') return;
  
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    const currentTheme = getStoredTheme();
    if (currentTheme === THEMES.AUTO) {
      applyTheme(THEMES.AUTO);
    }
  };
  
  // 现代浏览器使用addEventListener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    // 兼容旧版浏览器
    mediaQuery.addListener(handleSystemThemeChange);
  }
  
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.removeListener(handleSystemThemeChange);
    }
  };
}

/**
 * 主题管理类
 * 提供面向对象的主题管理接口
 */
export class ThemeManager {
  constructor() {
    this.listeners = new Set();
    this.cleanup = null;
  }
  
  /**
   * 初始化主题管理器
   */
  init() {
    this.cleanup = initTheme();
    
    // 监听主题变更事件
    if (typeof document !== 'undefined') {
      document.addEventListener('themechange', this.handleThemeChange.bind(this));
    }
  }
  
  /**
   * 销毁主题管理器
   */
  destroy() {
    if (this.cleanup) {
      this.cleanup();
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('themechange', this.handleThemeChange.bind(this));
    }
    
    this.listeners.clear();
  }
  
  /**
   * 处理主题变更事件
   */
  handleThemeChange(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event.detail);
      } catch (error) {
        console.error('主题变更监听器执行错误:', error);
      }
    });
  }
  
  /**
   * 添加主题变更监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    this.listeners.add(listener);
  }
  
  /**
   * 移除主题变更监听器
   * @param {Function} listener - 监听器函数
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    return getStoredTheme();
  }
  
  /**
   * 获取有效主题
   */
  getEffectiveTheme() {
    return getEffectiveTheme();
  }
  
  /**
   * 设置主题
   */
  setTheme(theme) {
    applyTheme(theme);
  }
  
  /**
   * 切换主题
   */
  toggle(targetTheme) {
    toggleTheme(targetTheme);
  }
}

// 创建默认实例
export const themeManager = new ThemeManager();

// 默认导出
export default {
  THEMES,
  getSystemTheme,
  getStoredTheme,
  setStoredTheme,
  getEffectiveTheme,
  applyTheme,
  toggleTheme,
  initTheme,
  ThemeManager,
  themeManager
};