import { defineStore } from 'pinia'
import router from '@/router'
import { authAPI, type User, type LoginRequest, type RegisterRequest } from '@/utils/api'
import {
  parseJWT,
  isTokenExpired,
  isTokenExpiringSoon,
  extractUserFromToken,
  hasRole as jwtHasRole,
  hasAnyRole as jwtHasAnyRole,
  tokenRefreshManager
} from '@/utils/jwt'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('access_token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'));
  const isLoading = ref(false);

  // 计算属性
  const isAuthenticated = computed(() => {
    return false
    //return !!accessToken.value && !!user.value;
  });

  const userRoles = computed(() => {
    return user.value?.roles || [];
  });

  const userPermissions = computed(() => {
    return user.value?.permissions || [];
  });

  // 检查用户是否有特定角色
  const hasRole = (role: string) => {
    return userRoles.value.includes(role);
  };

  // 检查用户是否有特定权限
  const hasPermission = (permission: string) => {
    return userPermissions.value.includes(permission);
  };

  // 检查用户是否是管理员
  const isAdmin = computed(() => {
    return hasRole('admin') || hasRole('super_admin');
  });

  // 用户注册
  const register = async (registerData: {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }) => {
    try {
      isLoading.value = true;
      const response = await authAPI.register(registerData);
      
      if (response.data.success) {
        ElMessage.success('注册成功，请登录');
        router.push('/login');
        return { success: true };
      } else {
        ElMessage.error(response.data.message || '注册失败');
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || '注册失败，请检查网络连接';
      ElMessage.error(message);
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  };

  // 用户登录
  const login = async (loginData: LoginRequest) => {
    try {
      isLoading.value = true;
      const response = await authAPI.login(loginData);
      
      if (response.data.success) {
        const { access_token, refresh_token, user: userData } = response.data;
        
        // 保存token和用户信息
        accessToken.value = access_token;
        refreshToken.value = refresh_token;
        user.value = {
          ...userData,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString()
        };
        
        // 持久化存储
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user_info', JSON.stringify(userData));
        
        ElMessage.success('登录成功');
        
        // 跳转到首页或之前访问的页面
        const redirect = router.currentRoute.value.query.redirect as string;
        router.push(redirect || '/dashboard');
        
        return { success: true };
      } else {
        ElMessage.error(response.data.message || '登录失败');
        return { success: false, message: response.data.message };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || '登录失败，请检查网络连接';
      ElMessage.error(message);
      return { success: false, message };
    } finally {
      isLoading.value = false;
    }
  };

  // 用户登出
  const logout = async (showMessage = true) => {
    try {
      // 调用后端登出接口
      if (accessToken.value) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地状态
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      
      // 清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      
      // 清除自动刷新
      tokenRefreshManager.clearAutoRefresh();
      
      if (showMessage) {
        ElMessage.success('已退出登录');
      }
      
      // 跳转到登录页
      router.push('/login');
    }
  };

  // 刷新token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available');
      }
      
      const response = await authAPI.refreshToken(refreshToken.value);
      
      if (response.data.success) {
        const { access_token, refresh_token: newRefreshToken } = response.data;
        
        accessToken.value = access_token;
        if (newRefreshToken) {
          refreshToken.value = newRefreshToken;
          localStorage.setItem('refresh_token', newRefreshToken);
        }
        localStorage.setItem('access_token', access_token);
        
        // 从新令牌中提取用户信息
        const userInfo = extractUserFromToken(access_token);
        if (userInfo) {
          user.value = {
          ...user.value,
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          display_name: userInfo.display_name || userInfo.name || userInfo.username,
          avatar: userInfo.avatar,
          roles: userInfo.roles || [],
          permissions: userInfo.permissions || [],
          status: userInfo.status || 'active',
          created_at: userInfo.created_at || new Date().toISOString(),
          updated_at: userInfo.updated_at || new Date().toISOString(),
          last_login: userInfo.last_login
        };
        }
        
        // 重新设置自动刷新
        setupAutoRefresh();
        
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // 刷新失败，清除认证状态
      await logout(false);
      return false;
    }
  };

  // 验证token有效性
  const verifyToken = async () => {
    try {
      if (!accessToken.value) {
        return false;
      }
      
      // 首先检查令牌格式和过期时间
      if (isTokenExpired(accessToken.value)) {
        console.log('令牌已过期，尝试刷新');
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          await logout(false);
          return false;
        }
      }
      
      const response = await authAPI.verifyToken();
      if (response.data.success) {
        // 设置自动刷新
        setupAutoRefresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      if (!accessToken.value) {
        return false;
      }
      
      const response = await authAPI.getCurrentUser();
      
      if (response.data.success) {
        user.value = response.data.user;
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      return false;
    }
  };

  // 初始化认证状态
  const initializeAuth = async () => {
    try {
      // 从本地存储恢复用户信息
      const storedUserInfo = localStorage.getItem('user_info');
      if (storedUserInfo) {
        user.value = JSON.parse(storedUserInfo);
      }
      
      // 如果有token，验证其有效性
      if (accessToken.value) {
        const isValid = await verifyToken();
        if (isValid) {
          // token有效，获取最新用户信息
          await fetchCurrentUser();
        } else {
          // token无效，尝试刷新
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            await fetchCurrentUser();
          }
        }
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      // 初始化失败，清除认证状态
      await logout(false);
    }
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
      localStorage.setItem('user_info', JSON.stringify(user.value));
    }
  };

  // 设置自动刷新
  const setupAutoRefresh = () => {
    if (accessToken.value) {
      tokenRefreshManager.setAutoRefresh(accessToken.value, async () => {
        await refreshAccessToken();
      });
    }
  };

  // 检查用户权限
  const hasUserPermission = (role: string): boolean => {
    if (!accessToken.value) {
      return false;
    }
    return jwtHasRole(accessToken.value, role);
  };

  // 检查用户是否具有任一权限
  const hasAnyUserPermission = (roles: string[]): boolean => {
    if (!accessToken.value) {
      return false;
    }
    return jwtHasAnyRole(accessToken.value, roles);
  };

  // 检查令牌是否即将过期
  const isTokenExpiringSoonComputed = computed(() => {
    if (!accessToken.value) {
      return false;
    }
    return isTokenExpiringSoon(accessToken.value);
  });

  return {
    // 状态
    user,
    accessToken,
    refreshToken,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    userRoles,
    userPermissions,
    isAdmin,
    isTokenExpiringSoonComputed,
    
    // 方法
    register,
    login,
    logout,
    refreshAccessToken,
    verifyToken,
    fetchCurrentUser,
    initializeAuth,
    updateUser,
    hasRole,
    hasPermission,
    setupAutoRefresh,
    hasUserPermission,
    hasAnyUserPermission,
  };
});