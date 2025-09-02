import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

import { generateClientCredentials, validateCredentialsFormat, generateConfirmationCode } from '../utils/credentials.js';
import { logAuditEvent } from './audit.js';
import { sensitiveOperationRateLimit, apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Mock应用数据
let mockApplications = [
  {
    id: '1',
    name: 'CRM系统',
    client_id: 'crm_client_001',
    client_secret: 'crm_secret_001',
    description: '客户关系管理系统',
    redirect_uris: ['https://crm.example.com/callback'],
    allowed_origins: ['https://crm.example.com'],
    scopes: ['read', 'write'],
    grant_types: ['authorization_code', 'refresh_token'],
    is_active: true,
    logo_url: 'https://example.com/logos/crm.png',
    homepage_url: 'https://crm.example.com',
    privacy_policy_url: 'https://crm.example.com/privacy',
    terms_of_service_url: 'https://crm.example.com/terms',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: '1'
  },
  {
    id: '2',
    name: 'ERP系统',
    client_id: 'erp_client_002',
    client_secret: 'erp_secret_002',
    description: '企业资源规划系统',
    redirect_uris: ['https://erp.example.com/callback', 'https://erp.example.com/auth/callback'],
    allowed_origins: ['https://erp.example.com'],
    scopes: ['read', 'write', 'admin'],
    grant_types: ['authorization_code', 'refresh_token', 'client_credentials'],
    is_active: true,
    logo_url: 'https://example.com/logos/erp.png',
    homepage_url: 'https://erp.example.com',
    privacy_policy_url: 'https://erp.example.com/privacy',
    terms_of_service_url: 'https://erp.example.com/terms',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    created_by: '1'
  },
  {
    id: '3',
    name: '移动应用',
    client_id: 'mobile_app_003',
    client_secret: 'mobile_secret_003',
    description: '企业移动端应用',
    redirect_uris: ['com.example.mobile://callback'],
    allowed_origins: ['*'],
    scopes: ['read'],
    grant_types: ['authorization_code', 'refresh_token'],
    is_active: false,
    logo_url: 'https://example.com/logos/mobile.png',
    homepage_url: 'https://mobile.example.com',
    privacy_policy_url: 'https://mobile.example.com/privacy',
    terms_of_service_url: 'https://mobile.example.com/terms',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    created_by: '1'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock应用用户关联数据
let mockAppUsers = [
  {
    id: '1',
    app_id: '1',
    user_id: '1',
    username: 'zhang.wei',
    email: 'zhang.wei@example.com',
    display_name: '张伟',
    role: 'admin',
    status: 'active',
    permissions: ['read', 'write', 'admin'],
    avatar: '',
    last_login: '2024-01-15T14:30:00Z',
    joined_at: '2024-01-01T00:00:00Z',
    third_party_accounts: [
      { provider: 'dingtalk', account_name: '张伟-技术部', account_id: 'dt_001', bound_at: '2024-01-01T00:00:00Z' },
      { provider: 'wechat', account_name: 'zhangwei_wx', account_id: 'wx_001', bound_at: '2024-01-02T00:00:00Z' }
    ]
  },
  {
    id: '2',
    app_id: '1',
    user_id: '2',
    username: 'li.ming',
    email: 'li.ming@example.com',
    display_name: '李明',
    role: 'user',
    status: 'active',
    permissions: ['read', 'write'],
    avatar: '',
    last_login: '2024-01-14T16:20:00Z',
    joined_at: '2024-01-03T00:00:00Z',
    third_party_accounts: [
      { provider: 'dingtalk', account_name: '李明-销售部', account_id: 'dt_002', bound_at: '2024-01-03T00:00:00Z' }
    ]
  },
  {
    id: '3',
    app_id: '1',
    user_id: '3',
    username: 'wang.fang',
    email: 'wang.fang@example.com',
    display_name: '王芳',
    role: 'user',
    status: 'pending',
    permissions: ['read'],
    avatar: '',
    last_login: null,
    joined_at: '2024-01-10T00:00:00Z',
    third_party_accounts: []
  },
  {
    id: '4',
    app_id: '2',
    user_id: '1',
    username: 'zhang.wei',
    email: 'zhang.wei@example.com',
    display_name: '张伟',
    role: 'admin',
    status: 'active',
    permissions: ['read', 'write', 'admin'],
    avatar: '',
    last_login: '2024-01-15T14:30:00Z',
    joined_at: '2024-01-02T00:00:00Z',
    third_party_accounts: [
      { provider: 'wechat_work', account_name: '张伟-ERP管理', account_id: 'wxw_001', bound_at: '2024-01-02T00:00:00Z' }
    ]
  }
];

// Mock全部用户数据（用于搜索添加用户）
let mockAllUsers = [
  { id: '1', username: 'zhang.wei', email: 'zhang.wei@example.com', display_name: '张伟', status: 'active' },
  { id: '2', username: 'li.ming', email: 'li.ming@example.com', display_name: '李明', status: 'active' },
  { id: '3', username: 'wang.fang', email: 'wang.fang@example.com', display_name: '王芳', status: 'pending' },
  { id: '4', username: 'chen.jun', email: 'chen.jun@example.com', display_name: '陈军', status: 'active' },
  { id: '5', username: 'liu.yan', email: 'liu.yan@example.com', display_name: '刘燕', status: 'active' },
  { id: '6', username: 'zhao.lei', email: 'zhao.lei@example.com', display_name: '赵雷', status: 'active' }
];

// 凭据验证中间件
const validateClientCredentials = (req: any, res: any, next: any) => {
  const { client_id, client_secret } = req.body;
  
  if (client_id && client_secret && !validateCredentialsFormat(client_id, client_secret)) {
    return res.status(400).json({
      success: false,
      message: '客户端凭据格式无效'
    });
  }
  
  next();
};

// 获取应用列表
router.get('/', authenticateToken, requireAdmin, apiRateLimit, (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_active } = req.query;
    
    let filteredApps = [...mockApplications];
    
    // 搜索过滤
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredApps = filteredApps.filter(app => 
        app.name.toLowerCase().includes(searchTerm) ||
        app.description.toLowerCase().includes(searchTerm) ||
        app.client_id.toLowerCase().includes(searchTerm)
      );
    }
    
    // 状态过滤
    if (is_active !== undefined) {
      filteredApps = filteredApps.filter(app => 
        app.is_active === (is_active === 'true')
      );
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedApps = filteredApps.slice(startIndex, endIndex);
    
    // 隐藏客户端密钥
    const safeApps = paginatedApps.map(({ client_secret, ...app }) => ({
      ...app,
      client_secret: '***'
    }));
    
    res.json({
      success: true,
      data: safeApps,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredApps.length,
        pages: Math.ceil(filteredApps.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个应用
router.get('/:id', authenticateToken, requireAdmin, apiRateLimit, (req, res) => {
  try {
    const { id } = req.params;
    
    const app = mockApplications.find(a => a.id === id);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 隐藏客户端密钥
    const { client_secret, ...safeApp } = app;
    res.json({
      success: true,
      data: {
        ...safeApp,
        client_secret: '***'
      }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建应用
router.post('/', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const {
      name,
      description,
      redirect_uris,
      allowed_origins,
      scopes = ['read'],
      grant_types = ['authorization_code', 'refresh_token'],
      logo_url,
      homepage_url,
      privacy_policy_url,
      terms_of_service_url
    } = req.body;
    
    // 验证必需字段
    if (!name || !redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({
        success: false,
        message: '应用名称和重定向URI不能为空'
      });
    }
    
    // 检查应用名称是否已存在
    const existingApp = mockApplications.find(a => a.name === name);
    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: '应用名称已存在'
      });
    }
    
    // 生成客户端凭据
    const { clientId, clientSecret } = generateClientCredentials();
    
    // 创建新应用
    const newApp = {
      id: (mockApplications.length + 1).toString(),
      name,
      client_id: clientId,
      client_secret: clientSecret,
      description: description || '',
      redirect_uris,
      allowed_origins: allowed_origins || ['*'],
      scopes,
      grant_types,
      is_active: true,
      logo_url: logo_url || '',
      homepage_url: homepage_url || '',
      privacy_policy_url: privacy_policy_url || '',
      terms_of_service_url: terms_of_service_url || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: req.user?.id || ''
    };
    
    mockApplications.push(newApp);
    
    // 记录应用创建事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'app:create',
      resource_type: 'application',
      resource_id: newApp.id,
      details: {
        app_name: newApp.name,
        client_id: newApp.client_id,
        redirect_uris: newApp.redirect_uris,
        scopes: newApp.scopes
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    // 返回包含客户端密钥的完整信息（仅在创建时返回）
    res.status(201).json({
      success: true,
      data: newApp,
      message: '应用创建成功，请妥善保存客户端密钥'
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新应用
router.put('/:id', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      redirect_uris,
      allowed_origins,
      scopes,
      grant_types,
      is_active,
      logo_url,
      homepage_url,
      privacy_policy_url,
      terms_of_service_url
    } = req.body;
    
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    const app = mockApplications[appIndex];
    
    // 检查应用名称是否已被其他应用使用
    if (name && name !== app.name) {
      const existingApp = mockApplications.find(a => a.name === name && a.id !== id);
      if (existingApp) {
        return res.status(409).json({
          success: false,
          message: '应用名称已存在'
        });
      }
    }
    
    // 记录变更前的状态
    const beforeState = { ...app };
    
    // 更新应用信息
    mockApplications[appIndex] = {
      ...app,
      name: name || app.name,
      description: description !== undefined ? description : app.description,
      redirect_uris: redirect_uris || app.redirect_uris,
      allowed_origins: allowed_origins || app.allowed_origins,
      scopes: scopes || app.scopes,
      grant_types: grant_types || app.grant_types,
      is_active: is_active !== undefined ? is_active : app.is_active,
      logo_url: logo_url !== undefined ? logo_url : app.logo_url,
      homepage_url: homepage_url !== undefined ? homepage_url : app.homepage_url,
      privacy_policy_url: privacy_policy_url !== undefined ? privacy_policy_url : app.privacy_policy_url,
      terms_of_service_url: terms_of_service_url !== undefined ? terms_of_service_url : app.terms_of_service_url,
      updated_at: new Date().toISOString()
    };
    
    // 记录应用更新事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'app:update',
      resource_type: 'application',
      resource_id: app.id,
      details: {
        app_name: app.name,
        changes: {
          before: beforeState,
          after: mockApplications[appIndex]
        }
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    const { client_secret, ...safeApp } = mockApplications[appIndex];
    res.json({
      success: true,
      data: {
        ...safeApp,
        client_secret: '***'
      },
      message: '应用信息更新成功'
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除应用
router.delete('/:id', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 记录删除前的应用信息
    const deletedApp = { ...mockApplications[appIndex] };
    
    mockApplications.splice(appIndex, 1);
    
    // 记录应用删除事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'app:delete',
      resource_type: 'application',
      resource_id: deletedApp.id,
      details: {
        app_name: deletedApp.name,
        deleted_app: deletedApp
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      message: '应用删除成功'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 重新生成客户端密钥（带安全验证）
router.post('/:id/regenerate-secret', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation_code, reason } = req.body;
    
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 验证确认码（模拟2FA验证）
    if (!confirmation_code) {
      return res.status(400).json({
        success: false,
        message: '请提供确认码'
      });
    }
    
    // 简单的确认码验证（实际应用中应该从缓存或数据库验证）
    const validCodes = ['123456', '000000', 'admin123'];
    if (!validCodes.includes(confirmation_code)) {
      return res.status(400).json({
        success: false,
        message: '确认码无效或已过期'
      });
    }
    
    const app = mockApplications[appIndex];
    const oldSecret = app.client_secret;
    
    // 生成新的客户端密钥
    const { clientSecret } = generateClientCredentials();
    
    mockApplications[appIndex].client_secret = clientSecret;
    mockApplications[appIndex].updated_at = new Date().toISOString();
    
    // 记录密钥重置事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'app:regenerate_secret',
      resource_type: 'application',
      resource_id: app.id,
      details: {
        app_name: app.name,
        client_id: app.client_id,
        old_secret_preview: oldSecret.substring(0, 8) + '***',
        new_secret_preview: clientSecret.substring(0, 8) + '***',
        reason: reason || 'Not specified'
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    // 记录安全日志
    console.log(`[SECURITY] Client secret regenerated for app ${app.name} (${app.client_id}) by user ${req.user.id}. Reason: ${reason || 'Not specified'}`);
    
    res.json({
      success: true,
      data: {
        client_id: app.client_id,
        client_secret: clientSecret,
        old_secret_preview: oldSecret.substring(0, 8) + '***',
        regenerated_at: new Date().toISOString()
      },
      message: '客户端密钥重新生成成功，旧密钥将在24小时后失效'
    });
  } catch (error) {
    console.error('Regenerate secret error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取应用凭据（仅显示部分信息）
router.get('/:id/credentials', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const app = mockApplications.find(a => a.id === id);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    res.json({
      success: true,
      data: {
        client_id: app.client_id,
        client_secret_preview: app.client_secret.substring(0, 8) + '***',
        created_at: app.created_at,
        updated_at: app.updated_at
      }
    });
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 验证重定向URI
router.post('/validate-redirect-uri', (req, res) => {
  try {
    const { client_id, redirect_uri } = req.body;
    
    if (!client_id || !redirect_uri) {
      return res.status(400).json({
        success: false,
        message: '客户端ID和重定向URI不能为空'
      });
    }
    
    const app = mockApplications.find(a => a.client_id === client_id && a.is_active);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: '应用不存在或已禁用'
      });
    }
    
    const isValidUri = app.redirect_uris.includes(redirect_uri);
    
    res.json({
      success: true,
      data: {
        is_valid: isValidUri,
        app_name: app.name,
        allowed_uris: app.redirect_uris
      }
    });
  } catch (error) {
    console.error('Validate redirect URI error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取应用统计信息
router.get('/:id/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const app = mockApplications.find(a => a.id === id);
    if (!app) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // Mock统计数据
    const stats = {
      total_users: Math.floor(Math.random() * 1000) + 100,
      active_users_today: Math.floor(Math.random() * 100) + 10,
      active_users_week: Math.floor(Math.random() * 500) + 50,
      active_users_month: Math.floor(Math.random() * 800) + 80,
      total_logins: Math.floor(Math.random() * 10000) + 1000,
      logins_today: Math.floor(Math.random() * 200) + 20,
      logins_week: Math.floor(Math.random() * 1000) + 100,
      logins_month: Math.floor(Math.random() * 5000) + 500,
      last_login: new Date(Date.now() - Math.random() * 86400000).toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 批量操作
router.post('/batch', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { action, app_ids } = req.body;
    
    if (!action || !app_ids || !Array.isArray(app_ids)) {
      return res.status(400).json({
        success: false,
        message: '操作类型和应用ID列表不能为空'
      });
    }
    
    let successCount = 0;
    let failedCount = 0;
    const results = [];
    
    for (const appId of app_ids) {
      const appIndex = mockApplications.findIndex(a => a.id === appId);
      if (appIndex === -1) {
        failedCount++;
        results.push({ id: appId, success: false, message: '应用不存在' });
        continue;
      }
      
      try {
        switch (action) {
          case 'activate':
            mockApplications[appIndex].is_active = true;
            break;
          case 'deactivate':
            mockApplications[appIndex].is_active = false;
            break;
          case 'delete':
            mockApplications.splice(appIndex, 1);
            break;
          default:
            throw new Error('不支持的操作类型');
        }
        
        mockApplications[appIndex] && (mockApplications[appIndex].updated_at = new Date().toISOString());
        successCount++;
        results.push({ id: appId, success: true, message: '操作成功' });
      } catch (error) {
        failedCount++;
        results.push({ id: appId, success: false, message: error.message });
      }
    }
    
    res.json({
      success: true,
      data: {
        total: app_ids.length,
        success_count: successCount,
        failed_count: failedCount,
        results
      },
      message: `批量操作完成：成功 ${successCount} 个，失败 ${failedCount} 个`
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取应用用户列表
router.get('/:id/users', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10', search = '', role = '', status = '' } = req.query;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 过滤应用用户
    let filteredUsers = mockAppUsers.filter(user => user.app_id === id);
    
    // 搜索过滤
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes((search as string).toLowerCase()) ||
        user.email.toLowerCase().includes((search as string).toLowerCase()) ||
        user.display_name.includes(search as string)
      );
    }
    
    // 角色过滤
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // 状态过滤
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    // 分页
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // 统计信息
    const stats = {
      total: filteredUsers.length,
      active: filteredUsers.filter(u => u.status === 'active').length,
      pending: filteredUsers.filter(u => u.status === 'pending').length,
      inactive: filteredUsers.filter(u => u.status === 'inactive').length,
      admins: filteredUsers.filter(u => u.role === 'admin').length,
      users: filteredUsers.filter(u => u.role === 'user').length
    };
    
    res.json({
      users: paginatedUsers,
      pagination: {
        current_page: parseInt(page as string),
        per_page: parseInt(limit as string),
        total: filteredUsers.length,
        total_pages: Math.ceil(filteredUsers.length / parseInt(limit as string))
      },
      stats
    });
    
  } catch (error) {
    console.error('获取应用用户列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 添加用户到应用
router.post('/:id/users', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, role = 'user', permissions = ['read'] } = req.body;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 检查用户是否存在
    const user = mockAllUsers.find(u => u.id === user_id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 检查用户是否已经在应用中
    const existingAppUser = mockAppUsers.find(au => au.app_id === id && au.user_id === user_id);
    if (existingAppUser) {
      return res.status(400).json({ error: '用户已经在该应用中' });
    }
    
    // 创建新的应用用户关联
    const newAppUser = {
      id: (mockAppUsers.length + 1).toString(),
      app_id: id,
      user_id: user_id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      role,
      status: 'active',
      permissions,
      avatar: '',
      last_login: null,
      joined_at: new Date().toISOString(),
      third_party_accounts: []
    };
    
    mockAppUsers.push(newAppUser);
    
    // 记录审计日志
    console.log(`用户 ${req.user.username} 将用户 ${user.username} 添加到应用 ${app.name}`);
    
    res.status(201).json({
      message: '用户添加成功',
      user: newAppUser
    });
    
  } catch (error) {
    console.error('添加用户到应用失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新应用用户信息
router.put('/:id/users/:userId', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role, permissions, status } = req.body;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 查找应用用户
    const appUserIndex = mockAppUsers.findIndex(au => au.app_id === id && au.id === userId);
    if (appUserIndex === -1) {
      return res.status(404).json({ error: '用户不在该应用中' });
    }
    
    const oldAppUser = { ...mockAppUsers[appUserIndex] };
    
    // 更新用户信息
    if (role !== undefined) mockAppUsers[appUserIndex].role = role;
    if (permissions !== undefined) mockAppUsers[appUserIndex].permissions = permissions;
    if (status !== undefined) mockAppUsers[appUserIndex].status = status;
    
    // 记录审计日志
    console.log(`用户 ${req.user.username} 更新了应用 ${app.name} 中用户 ${mockAppUsers[appUserIndex].username} 的信息`);
    
    res.json({
      message: '用户信息更新成功',
      user: mockAppUsers[appUserIndex]
    });
    
  } catch (error) {
    console.error('更新应用用户信息失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 从应用中移除用户
router.delete('/:id/users/:userId', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 查找应用用户
    const appUserIndex = mockAppUsers.findIndex(au => au.app_id === id && au.id === userId);
    if (appUserIndex === -1) {
      return res.status(404).json({ error: '用户不在该应用中' });
    }
    
    const removedUser = mockAppUsers[appUserIndex];
    mockAppUsers.splice(appUserIndex, 1);
    
    // 记录审计日志
    console.log(`用户 ${req.user.username} 从应用 ${app.name} 中移除了用户 ${removedUser.username}`);
    
    res.json({
      message: '用户移除成功'
    });
    
  } catch (error) {
    console.error('从应用中移除用户失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 搜索可添加的用户
router.get('/:id/available-users', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '', page = 1, limit = 10 } = req.query;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 获取已在应用中的用户ID
    const existingUserIds = mockAppUsers
      .filter(au => au.app_id === id)
      .map(au => au.user_id);
    
    // 过滤出可添加的用户
    let availableUsers = mockAllUsers.filter(user => 
      !existingUserIds.includes(user.id) && user.status === 'active'
    );
    
    // 搜索过滤
    if (search) {
      availableUsers = availableUsers.filter(user => 
        user.username.toLowerCase().includes((search as string).toLowerCase()) ||
        user.email.toLowerCase().includes((search as string).toLowerCase()) ||
        user.display_name.includes(search as string)
      );
    }
    
    // 分页
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = availableUsers.slice(startIndex, endIndex);
    
    res.json({
      users: paginatedUsers,
      pagination: {
        current_page: parseInt(page as string),
        per_page: parseInt(limit as string),
        total: availableUsers.length,
        total_pages: Math.ceil(availableUsers.length / parseInt(limit as string))
      }
    });
    
  } catch (error) {
    console.error('搜索可添加用户失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 绑定第三方账号
router.post('/:id/users/:userId/bind-account', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { provider, account_name, account_id } = req.body;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 查找应用用户
    const appUserIndex = mockAppUsers.findIndex(au => au.app_id === id && au.id === userId);
    if (appUserIndex === -1) {
      return res.status(404).json({ error: '用户不在该应用中' });
    }
    
    // 检查是否已绑定该平台账号
    const existingAccount = mockAppUsers[appUserIndex].third_party_accounts.find(
      acc => acc.provider === provider
    );
    if (existingAccount) {
      return res.status(400).json({ error: '该平台账号已绑定' });
    }
    
    // 添加第三方账号绑定
    const newAccount = {
      provider,
      account_name,
      account_id,
      bound_at: new Date().toISOString()
    };
    
    mockAppUsers[appUserIndex].third_party_accounts.push(newAccount);
    
    // 记录审计日志
    console.log(`用户 ${req.user.username} 为应用 ${app.name} 中的用户 ${mockAppUsers[appUserIndex].username} 绑定了 ${provider} 账号`);
    
    res.json({
      message: '第三方账号绑定成功',
      account: newAccount
    });
    
  } catch (error) {
    console.error('绑定第三方账号失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 解绑第三方账号
router.delete('/:id/users/:userId/bind-account/:provider', authenticateToken, requireAdmin, apiRateLimit, async (req, res) => {
  try {
    const { id, userId, provider } = req.params;
    
    // 检查应用是否存在
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      return res.status(404).json({ error: '应用不存在' });
    }
    
    // 查找应用用户
    const appUserIndex = mockAppUsers.findIndex(au => au.app_id === id && au.id === userId);
    if (appUserIndex === -1) {
      return res.status(404).json({ error: '用户不在该应用中' });
    }
    
    // 查找并移除第三方账号绑定
    const accountIndex = mockAppUsers[appUserIndex].third_party_accounts.findIndex(
      acc => acc.provider === provider
    );
    if (accountIndex === -1) {
      return res.status(404).json({ error: '未找到该平台的绑定账号' });
    }
    
    mockAppUsers[appUserIndex].third_party_accounts.splice(accountIndex, 1);
    
    // 记录审计日志
    console.log(`用户 ${req.user.username} 为应用 ${app.name} 中的用户 ${mockAppUsers[appUserIndex].username} 解绑了 ${provider} 账号`);
    
    res.json({
      message: '第三方账号解绑成功'
    });
    
  } catch (error) {
    console.error('解绑第三方账号失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;