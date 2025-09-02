import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logAuditEvent } from './audit';
import { sensitiveOperationRateLimit, passwordResetRateLimit, registrationRateLimit } from '../middleware/rateLimit';

const router = express.Router();

// Mock用户数据
let mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    display_name: '系统管理员',
    phone: '13800138000',
    roles: ['admin'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    display_name: '普通用户',
    phone: '13800138001',
    roles: ['user'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    display_name: '测试用户',
    phone: '13800138002',
    roles: ['user'],
    is_active: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    last_login: null
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

// 获取用户列表
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_active } = req.query;
    
    let filteredUsers = [...mockUsers];
    
    // 搜索过滤
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.display_name.toLowerCase().includes(searchTerm)
      );
    }
    
    // 状态过滤
    if (is_active !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        user.is_active === (is_active === 'true')
      );
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // 移除密码字段
    const safeUsers = paginatedUsers.map(({ password, ...user }) => user);
    
    res.json({
      success: true,
      data: safeUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个用户
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // 只有管理员或用户本人可以查看详细信息
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const { password, ...safeUser } = user;
    res.json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建用户
router.post('/', authenticateToken, requireAdmin, registrationRateLimit, async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      display_name,
      phone,
      roles = ['user']
    } = req.body;
    
    // 验证必需字段
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      });
    }
    
    // 检查用户名和邮箱是否已存在
    const existingUser = mockUsers.find(u => 
      u.username === username || u.email === email
    );
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '用户名或邮箱已存在'
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      username,
      email,
      password: hashedPassword,
      display_name: display_name || username,
      phone: phone || '',
      roles,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: null
    };
    
    mockUsers.push(newUser);
    
    // 记录审计日志
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'system',
      action: 'user:create',
      resource_type: 'user',
      resource_id: newUser.id,
      details: {
        target_user: username,
        email,
        roles
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      data: safeUser,
      message: '用户创建成功'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新用户
router.put('/:id', authenticateToken, sensitiveOperationRateLimit, (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      display_name,
      phone,
      roles,
      is_active
    } = req.body;
    
    // 只有管理员或用户本人可以更新信息
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const user = mockUsers[userIndex];
    
    // 非管理员用户不能修改某些字段
    if (req.user.role !== 'admin') {
      if (roles !== undefined || is_active !== undefined) {
        return res.status(403).json({
          success: false,
          message: '权限不足，无法修改角色或状态'
        });
      }
    }
    
    // 检查用户名和邮箱是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = mockUsers.find(u => u.username === username && u.id !== id);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: '用户名已存在'
        });
      }
    }
    
    if (email && email !== user.email) {
      const existingUser = mockUsers.find(u => u.email === email && u.id !== id);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: '邮箱已存在'
        });
      }
    }
    
    // 更新用户信息
    mockUsers[userIndex] = {
      ...user,
      username: username || user.username,
      email: email || user.email,
      display_name: display_name || user.display_name,
      phone: phone || user.phone,
      roles: roles || user.roles,
      is_active: is_active !== undefined ? is_active : user.is_active,
      updated_at: new Date().toISOString()
    };
    
    // 记录审计日志
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'system',
      action: 'user:update',
      resource_type: 'user',
      resource_id: id,
      details: {
        target_user: mockUsers[userIndex].username,
        changes: {
          username: username !== user.username ? { from: user.username, to: username } : undefined,
          email: email !== user.email ? { from: user.email, to: email } : undefined,
          roles: JSON.stringify(roles) !== JSON.stringify(user.roles) ? { from: user.roles, to: roles } : undefined,
          is_active: is_active !== user.is_active ? { from: user.is_active, to: is_active } : undefined
        }
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    const { password, ...safeUser } = mockUsers[userIndex];
    res.json({
      success: true,
      data: safeUser,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除用户
router.delete('/:id', authenticateToken, requireAdmin, sensitiveOperationRateLimit, (req, res) => {
  try {
    const { id } = req.params;
    
    // 不能删除自己
    if (req.user?.id === id) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账户'
      });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const deletedUser = mockUsers[userIndex];
    mockUsers.splice(userIndex, 1);
    
    // 记录审计日志
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'system',
      action: 'user:delete',
      resource_type: 'user',
      resource_id: id,
      details: {
        target_user: deletedUser.username,
        email: deletedUser.email
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 重置用户密码
router.post('/:id/reset-password', authenticateToken, requireAdmin, passwordResetRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: '新密码不能为空'
      });
    }
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    mockUsers[userIndex].password = hashedPassword;
    mockUsers[userIndex].updated_at = new Date().toISOString();
    
    // 记录审计日志
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'system',
      action: 'user:reset_password',
      resource_type: 'user',
      resource_id: id,
      details: {
        target_user: mockUsers[userIndex].username
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 批量导入用户
router.post('/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { users, notify = false } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: '用户数据不能为空'
      });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    for (const userData of users) {
      try {
        const { username, email, password, display_name, phone, roles = ['user'] } = userData;
        
        // 验证必需字段
        if (!username || !email || !password) {
          results.failed++;
          results.errors.push(`用户 ${username || email} 缺少必需字段`);
          continue;
        }
        
        // 检查是否已存在
        const existingUser = mockUsers.find(u => 
          u.username === username || u.email === email
        );
        if (existingUser) {
          results.failed++;
          results.errors.push(`用户 ${username} 已存在`);
          continue;
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 创建用户
        const newUser = {
          id: (mockUsers.length + 1).toString(),
          username,
          email,
          password: hashedPassword,
          display_name: display_name || username,
          phone: phone || '',
          roles,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: null
        };
        
        mockUsers.push(newUser);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`用户 ${userData.username} 导入失败: ${error}`);
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `导入完成，成功 ${results.success} 个，失败 ${results.failed} 个`
    });
  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;