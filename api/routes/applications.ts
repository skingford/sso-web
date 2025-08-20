import express from 'express';
import jwt from 'jsonwebtoken';

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

// 认证中间件
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期'
    });
  }
};

// 管理员权限中间件
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user.roles.includes('admin')) {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// 生成客户端ID和密钥
const generateClientCredentials = () => {
  const clientId = 'app_' + Math.random().toString(36).substr(2, 9);
  const clientSecret = Math.random().toString(36).substr(2, 32);
  return { clientId, clientSecret };
};

// 获取应用列表
router.get('/', authenticateToken, requireAdmin, (req, res) => {
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
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
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
router.post('/', authenticateToken, requireAdmin, (req, res) => {
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
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
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
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    mockApplications.splice(appIndex, 1);
    
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

// 重新生成客户端密钥
router.post('/:id/regenerate-secret', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 生成新的客户端密钥
    const { clientSecret } = generateClientCredentials();
    
    mockApplications[appIndex].client_secret = clientSecret;
    mockApplications[appIndex].updated_at = new Date().toISOString();
    
    res.json({
      success: true,
      data: {
        client_id: mockApplications[appIndex].client_id,
        client_secret: clientSecret
      },
      message: '客户端密钥重新生成成功，请妥善保存'
    });
  } catch (error) {
    console.error('Regenerate secret error:', error);
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

export default router;