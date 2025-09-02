import express from 'express';
import { verifyToken, requireScopes, verifyClientCredentials, verifyUserToken } from '../middleware/tokenAuth.js';
import { logAuditEvent } from './audit.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// 受保护的API端点示例

// 需要任何有效令牌的端点
router.get('/profile', verifyToken, apiRateLimit, (req, res) => {
  // 记录用户信息访问事件
  logAuditEvent({
    user_id: req.token?.sub,
    username: req.token?.sub || 'unknown',
    action: 'user:profile_access',
    resource_type: 'user',
    resource_id: req.token?.sub,
    details: {
      accessed_fields: ['id', 'name', 'email', 'avatar']
    },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    status: 'success'
  });

  res.json({
    message: '用户资料信息',
    token_info: {
      sub: req.token?.sub,
      client_id: req.token?.client_id,
      token_type: req.token?.token_type,
      scopes: req.scopes
    },
    profile: {
      id: req.token?.sub,
      name: '系统管理员',
      email: 'admin@example.com',
      avatar: 'https://via.placeholder.com/150'
    }
  });
});

// 需要特定作用域的端点
router.get('/users', verifyToken, requireScopes(['user:read']), apiRateLimit, (req, res) => {
  // 记录权限查询事件
  logAuditEvent({
    user_id: req.token?.sub,
    username: req.token?.sub || 'unknown',
    action: 'user:permissions_access',
    resource_type: 'permissions',
    resource_id: req.token?.sub,
    details: {
      scopes: req.scopes,
      accessed_users: 3
    },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    status: 'success'
  });

  res.json({
    message: '用户列表',
    users: [
      { id: '1', name: '管理员', email: 'admin@example.com', role: 'admin' },
      { id: '2', name: '用户1', email: 'user1@example.com', role: 'user' },
      { id: '3', name: '用户2', email: 'user2@example.com', role: 'user' }
    ],
    total: 3,
    requested_by: {
      sub: req.token?.sub,
      client_id: req.token?.client_id,
      scopes: req.scopes
    }
  });
});

// 需要写权限的端点
router.post('/users', verifyToken, requireScopes(['api:write', 'user:read']), (req, res) => {
  const { name, email, role } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'invalid_request',
      message: '缺少必需的字段: name, email'
    });
  }

  // 模拟创建用户
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    role: role || 'user',
    created_at: new Date().toISOString(),
    created_by: req.token?.sub
  };

  res.status(201).json({
    message: '用户创建成功',
    user: newUser,
    created_by: {
      sub: req.token?.sub,
      client_id: req.token?.client_id
    }
  });
});

// 仅限客户端凭证的端点
router.get('/api/stats', verifyClientCredentials, requireScopes(['api:read']), apiRateLimit, (req, res) => {
  const statsData = {
    total_requests: 12345,
    active_clients: 25,
    daily_requests: 1234,
    error_rate: 0.02
  };

  // 记录管理员统计数据访问事件
  logAuditEvent({
    user_id: req.token?.client_id,
    username: req.token?.client_id || 'unknown',
    action: 'admin:stats_access',
    resource_type: 'system_stats',
    resource_id: 'system',
    details: {
      accessed_stats: Object.keys(statsData)
    },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    status: 'success'
  });

  res.json({
    message: 'API统计信息',
    stats: statsData,
    client_info: {
      client_id: req.token?.client_id,
      scopes: req.scopes
    },
    timestamp: new Date().toISOString()
  });
});

// 仅限用户令牌的端点
router.get('/user/preferences', verifyUserToken, (req, res) => {
  res.json({
    message: '用户偏好设置',
    preferences: {
      theme: 'dark',
      language: 'zh-CN',
      notifications: true,
      timezone: 'Asia/Shanghai'
    },
    user_info: {
      sub: req.token?.sub,
      scopes: req.scopes
    }
  });
});

// 需要多个作用域的端点
router.delete('/users/:id', verifyToken, requireScopes(['api:write', 'user:read']), (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      error: 'invalid_request',
      message: '缺少用户ID'
    });
  }

  // 模拟删除用户
  res.json({
    message: `用户 ${id} 删除成功`,
    deleted_user_id: id,
    deleted_by: {
      sub: req.token?.sub,
      client_id: req.token?.client_id
    },
    timestamp: new Date().toISOString()
  });
});

// 公开端点（不需要认证）
router.get('/public/info', (req, res) => {
  res.json({
    message: '公开API信息',
    version: '1.0.0',
    endpoints: {
      protected: [
        'GET /api/protected/profile - 需要有效令牌',
        'GET /api/protected/users - 需要 user:read 作用域',
        'POST /api/protected/users - 需要 api:write, user:read 作用域',
        'GET /api/protected/api/stats - 需要客户端凭证和 api:read 作用域',
        'GET /api/protected/user/preferences - 需要用户令牌',
        'DELETE /api/protected/users/:id - 需要 api:write, user:read 作用域'
      ],
      public: [
        'GET /api/protected/public/info - 公开端点'
      ]
    },
    oauth: {
      token_endpoint: '/api/oauth/token',
      introspection_endpoint: '/api/oauth/introspect',
      userinfo_endpoint: '/api/oauth/userinfo'
    }
  });
});

export default router;