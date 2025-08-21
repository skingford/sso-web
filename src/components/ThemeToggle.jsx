import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { themeManager, THEMES } from '../utils/theme';

/**
 * 主题切换组件
 * 提供亮色/暗色/自动主题切换功能
 */
const ThemeToggle = ({ 
  variant = 'toggle', // 'toggle' | 'dropdown' | 'buttons'
  size = 'md', // 'sm' | 'md' | 'lg'
  showLabel = false,
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState(THEMES.AUTO);
  const [effectiveTheme, setEffectiveTheme] = useState(THEMES.LIGHT);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // 初始化主题管理器
    themeManager.init();
    
    // 设置初始状态
    setCurrentTheme(themeManager.getCurrentTheme());
    setEffectiveTheme(themeManager.getEffectiveTheme());
    
    // 监听主题变更
    const handleThemeChange = ({ theme, effectiveTheme }) => {
      setCurrentTheme(theme);
      setEffectiveTheme(effectiveTheme);
    };
    
    themeManager.addListener(handleThemeChange);
    
    return () => {
      themeManager.removeListener(handleThemeChange);
    };
  }, []);

  const handleThemeChange = (theme) => {
    themeManager.setTheme(theme);
    setIsDropdownOpen(false);
  };

  const toggleTheme = () => {
    if (variant === 'toggle') {
      themeManager.toggle();
    }
  };

  // 尺寸样式
  const sizeClasses = {
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
  };

  const currentSize = sizeClasses[size];

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
  ];

  // 切换按钮样式
  if (variant === 'toggle') {
    return (
      <div className={`theme-toggle-wrapper ${className}`}>
        <button
          onClick={toggleTheme}
          className={`
            theme-toggle relative inline-flex items-center rounded-full
            border-2 transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${currentSize.toggle}
            ${effectiveTheme === THEMES.DARK ? 'dark' : ''}
          `}
          aria-label={`切换到${effectiveTheme === THEMES.DARK ? '亮色' : '暗色'}主题`}
          title={`当前: ${effectiveTheme === THEMES.DARK ? '暗色' : '亮色'}主题`}
        >
          <span className="sr-only">
            {effectiveTheme === THEMES.DARK ? '切换到亮色主题' : '切换到暗色主题'}
          </span>
        </button>
        
        {showLabel && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {effectiveTheme === THEMES.DARK ? '暗色' : '亮色'}
          </span>
        )}
      </div>
    );
  }

  // 下拉菜单样式
  if (variant === 'dropdown') {
    const currentOption = themeOptions.find(option => option.value === currentTheme);
    const CurrentIcon = currentOption?.icon || Monitor;

    return (
      <div className={`theme-dropdown relative ${className}`}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            inline-flex items-center justify-center rounded-lg
            bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
            ${currentSize.button}
          `}
          aria-label="选择主题"
          aria-expanded={isDropdownOpen}
        >
          <CurrentIcon className={currentSize.icon} />
          {showLabel && (
            <span className="ml-2">{currentOption?.label}</span>
          )}
        </button>

        {isDropdownOpen && (
          <>
            {/* 遮罩层 */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* 下拉菜单 */}
            <div className="
              absolute right-0 top-full mt-2 w-48 z-20
              bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
              py-1 animate-fadeInDown
            ">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === currentTheme;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={`
                      w-full px-4 py-2 text-left flex items-center
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150
                      ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // 按钮组样式
  if (variant === 'buttons') {
    return (
      <div className={`theme-buttons flex rounded-lg border border-gray-300 dark:border-gray-600 ${className}`}>
        {themeOptions.map((option, index) => {
          const Icon = option.icon;
          const isActive = option.value === currentTheme;
          const isFirst = index === 0;
          const isLast = index === themeOptions.length - 1;
          
          return (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={`
                flex items-center justify-center transition-all duration-200
                ${currentSize.button}
                ${isFirst ? 'rounded-l-lg' : ''}
                ${isLast ? 'rounded-r-lg' : ''}
                ${!isFirst && !isLast ? 'border-x border-gray-300 dark:border-gray-600' : ''}
                ${isActive 
                  ? 'bg-primary-500 text-white shadow-sm' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10
              `}
              aria-label={option.label}
              title={option.description}
            >
              <Icon className={currentSize.icon} />
              {showLabel && (
                <span className="ml-2 text-sm">{option.label}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
};

export default ThemeToggle;