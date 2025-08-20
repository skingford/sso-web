import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';
import router from '@/router';

// 扩展InternalAxiosRequestConfig类型
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求时间戳，用于调试
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 记录响应时间
    if (response.config.metadata?.startTime) {
      const duration = new Date().getTime() - response.config.metadata.startTime.getTime();
      console.log(`API请求耗时: ${duration}ms - ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // 尝试刷新token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken
          });
          
          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
          
          // 重新发送原请求
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除token并跳转到登录页
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          ElMessage.error('登录已过期，请重新登录');
          
          // 延迟跳转，确保消息显示
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          
          return Promise.reject(refreshError);
        }
      } else {
        // 没有refresh token，跳转到登录页
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        ElMessage.error('请先登录');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    // 处理其他错误
    if (error.response?.status === 403) {
      ElMessage.error('权限不足，无法访问该资源');
    } else if (error.response?.status === 404) {
      ElMessage.error('请求的资源不存在');
    } else if (error.response?.status === 429) {
      ElMessage.error('请求过于频繁，请稍后重试');
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器内部错误，请稍后重试');
    } else if (error.code === 'NETWORK_ERROR') {
      ElMessage.error('网络连接失败，请检查网络设置');
    } else if (error.code === 'TIMEOUT') {
      ElMessage.error('请求超时，请稍后重试');
    }
    
    return Promise.reject(error);
  }
);

// API接口定义
export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    display_name: string;
    avatar?: string;
    roles: string[];
    permissions: string[];
    status: string;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
  };
  message?: string;
  requires_mfa?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar?: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  status: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  client_secret?: string;
  redirect_uris: string[];
  allowed_scopes: string[];
  logo_url?: string;
  homepage_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  event_category: string;
  user_id?: string;
  username?: string;
  user_agent?: string;
  ip_address: string;
  application_id?: string;
  application_name?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure';
  details?: any;
  timestamp: string;
}

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
    return api.post('/auth/login', data);
  },
  
  // 用户注册
  register: (data: RegisterRequest): Promise<AxiosResponse<LoginResponse>> => {
    return api.post('/auth/register', data);
  },
  
  // 用户登出
  logout: (): Promise<AxiosResponse> => {
    return api.post('/auth/logout');
  },
  
  // 刷新token
  refreshToken: (refreshToken: string): Promise<AxiosResponse> => {
    return api.post('/auth/refresh', { refresh_token: refreshToken });
  },
  
  // 验证token
  verifyToken: (): Promise<AxiosResponse> => {
    return api.post('/auth/verify');
  },
  
  // 获取当前用户信息
  getCurrentUser: (): Promise<AxiosResponse<{ success: boolean; user: User }>> => {
    return api.get('/auth/me');
  },
};

// 用户管理API
export const usersAPI = {
  // 获取用户列表
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/users', { params });
  },
  
  // 获取单个用户
  getUser: (id: string): Promise<AxiosResponse<{ success: boolean; data: User }>> => {
    return api.get(`/users/${id}`);
  },
  
  // 创建用户
  createUser: (data: Partial<User>): Promise<AxiosResponse> => {
    return api.post('/users', data);
  },
  
  // 更新用户
  updateUser: (id: string, data: Partial<User>): Promise<AxiosResponse> => {
    return api.put(`/users/${id}`, data);
  },
  
  // 删除用户
  deleteUser: (id: string): Promise<AxiosResponse> => {
    return api.delete(`/users/${id}`);
  },
  
  // 重置用户密码
  resetPassword: (id: string, newPassword: string): Promise<AxiosResponse> => {
    return api.post(`/users/${id}/reset-password`, { new_password: newPassword });
  },
  
  // 批量导入用户
  importUsers: (users: Partial<User>[]): Promise<AxiosResponse> => {
    return api.post('/users/import', { users });
  },
};

// 应用管理API
export const applicationsAPI = {
  // 获取应用列表
  getApplications: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/applications', { params });
  },
  
  // 获取单个应用
  getApplication: (id: string): Promise<AxiosResponse<{ success: boolean; data: Application }>> => {
    return api.get(`/applications/${id}`);
  },
  
  // 创建应用
  createApplication: (data: Partial<Application>): Promise<AxiosResponse> => {
    return api.post('/applications', data);
  },
  
  // 更新应用
  updateApplication: (id: string, data: Partial<Application>): Promise<AxiosResponse> => {
    return api.put(`/applications/${id}`, data);
  },
  
  // 删除应用
  deleteApplication: (id: string): Promise<AxiosResponse> => {
    return api.delete(`/applications/${id}`);
  },
  
  // 重新生成客户端密钥
  regenerateSecret: (id: string): Promise<AxiosResponse> => {
    return api.post(`/applications/${id}/regenerate-secret`);
  },
  
  // 获取应用统计
  getApplicationStats: (id: string): Promise<AxiosResponse> => {
    return api.get(`/applications/${id}/stats`);
  },
};

// 权限管理API
export const permissionsAPI = {
  // 获取所有权限定义
  getPermissions: (): Promise<AxiosResponse> => {
    return api.get('/permissions');
  },
  
  // 获取角色列表
  getRoles: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/permissions/roles', { params });
  },
  
  // 获取单个角色
  getRole: (id: string): Promise<AxiosResponse<{ success: boolean; data: Role }>> => {
    return api.get(`/permissions/roles/${id}`);
  },
  
  // 创建角色
  createRole: (data: Partial<Role>): Promise<AxiosResponse> => {
    return api.post('/permissions/roles', data);
  },
  
  // 更新角色
  updateRole: (id: string, data: Partial<Role>): Promise<AxiosResponse> => {
    return api.put(`/permissions/roles/${id}`, data);
  },
  
  // 删除角色
  deleteRole: (id: string): Promise<AxiosResponse> => {
    return api.delete(`/permissions/roles/${id}`);
  },
  
  // 为用户分配角色
  assignUserRoles: (userId: string, roleIds: string[]): Promise<AxiosResponse> => {
    return api.post(`/permissions/users/${userId}/roles`, { role_ids: roleIds });
  },
  
  // 移除用户角色
  removeUserRole: (userId: string, roleId: string): Promise<AxiosResponse> => {
    return api.delete(`/permissions/users/${userId}/roles/${roleId}`);
  },
  
  // 获取用户权限
  getUserPermissions: (userId: string): Promise<AxiosResponse> => {
    return api.get(`/permissions/users/${userId}`);
  },
};

// 审计日志API
export const auditAPI = {
  // 获取审计日志列表
  getAuditLogs: (params?: {
    page?: number;
    limit?: number;
    event_type?: string;
    event_category?: string;
    user_id?: string;
    username?: string;
    application_id?: string;
    result?: string;
    start_date?: string;
    end_date?: string;
    ip_address?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/audit/logs', { params });
  },
  
  // 获取单个审计日志
  getAuditLog: (id: string): Promise<AxiosResponse<{ success: boolean; data: AuditLog }>> => {
    return api.get(`/audit/logs/${id}`);
  },
  
  // 获取登录日志
  getLoginLogs: (params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    username?: string;
    result?: string;
    start_date?: string;
    end_date?: string;
    ip_address?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/audit/login-logs', { params });
  },
  
  // 获取操作日志
  getOperationLogs: (params?: {
    page?: number;
    limit?: number;
    user_id?: string;
    username?: string;
    event_category?: string;
    result?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/audit/operation-logs', { params });
  },
  
  // 获取审计统计
  getAuditStats: (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AxiosResponse> => {
    return api.get('/audit/stats', { params });
  },
  
  // 导出审计日志
  exportAuditLogs: (data: {
    format?: 'json' | 'csv';
    event_type?: string;
    event_category?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AxiosResponse> => {
    return api.post('/audit/export', data, {
      responseType: 'blob',
    });
  },
};

export default api;