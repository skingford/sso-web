import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock角色数据
let mockRoles = [
  {
    id: '1',
    name: 'admin',
    display_name: '系统管理员',
    description: '拥有系统所有权限',
    permissions: ['user:read', 'user:write', 'user:delete', 'app:read', 'app:write', 'app:delete', 'role:read', 'role:write', 'role:delete', 'audit:read'],
    is_system: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'system'
  },
  {
    id: '2',
    name: 'user',
    display_name: '普通用户',
    description: '基础用户权限',
    permissions: ['profile:read', 'profile:write'],
    is_system: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'system'
  },
  {
    id: '3',
    name: 'app_manager',
    display_name: '应用管理员',
    description: '管理应用和用户权限',
    permissions: ['user:read', 'user:write', 'app:read', 'app:write', 'role:read'],
    is_system: false,
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    created_by: '1'
  },
  {
    id: '4',
    name: 'auditor',
    display_name: '审计员',
    description: '查看审计日志和用户信息',
    permissions: ['user:read', 'app:read', 'audit:read'],
    is_system: false,
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    created_by: '1'
  }
];

// Mock权限定义
const mockPermissions = [
  { id: 'user:read', name: '查看用户', category: '用户管理', description: '查看用户列表和详细信息' },
  { id: 'user:write', name: '编辑用户', category: '用户管理', description: '创建和编辑用户信息' },
  { id: 'user:delete', name: '删除用户', category: '用户管理', description: '删除用户账户' },
  { id: 'app:read', name: '查看应用', category: '应用管理', description: '查看应用列表和详细信息' },
  { id: 'app:write', name: '编辑应用', category: '应用管理', description: '创建和编辑应用信息' },
  { id: 'app:delete', name: '删除应用', category: '应用管理', description: '删除应用' },
  { id: 'role:read', name: '查看角色', category: '权限管理', description: '查看角色列表和权限信息' },
  { id: 'role:write', name: '编辑角色', category: '权限管理', description: '创建和编辑角色权限' },
  { id: 'role:delete', name: '删除角色', category: '权限管理', description: '删除自定义角色' },
  { id: 'audit:read', name: '查看审计', category: '审计管理', description: '查看系统审计日志' },
  { id: 'profile:read', name: '查看个人信息', category: '个人中心', description: '查看个人资料' },
  { id: 'profile:write', name: '编辑个人信息', category: '个人中心', description: '编辑个人资料' }
];

// Mock用户角色关联
let mockUserRoles = [
  { user_id: '1', role_id: '1' },
  { user_id: '2', role_id: '2' },
  { user_id: '3', role_id: '2' }
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

// 权限检查中间件
const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    // 获取用户角色的所有权限
    const userPermissions = new Set<string>();
    
    for (const roleName of req.user.roles) {
      const role = mockRoles.find(r => r.name === roleName);
      if (role) {
        role.permissions.forEach(p => userPermissions.add(p));
      }
    }
    
    if (!userPermissions.has(permission)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    
    next();
  };
};

// 获取所有权限定义
router.get('/definitions', authenticateToken, requirePermission('role:read'), (req, res) => {
  try {
    // 按分类分组权限
    const groupedPermissions = mockPermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof mockPermissions>);
    
    res.json({
      success: true,
      data: groupedPermissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取角色列表
router.get('/roles', authenticateToken, requirePermission('role:read'), (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_active } = req.query;
    
    let filteredRoles = [...mockRoles];
    
    // 搜索过滤
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredRoles = filteredRoles.filter(role => 
        role.name.toLowerCase().includes(searchTerm) ||
        role.display_name.toLowerCase().includes(searchTerm) ||
        role.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // 状态过滤
    if (is_active !== undefined) {
      filteredRoles = filteredRoles.filter(role => 
        role.is_active === (is_active === 'true')
      );
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedRoles,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredRoles.length,
        pages: Math.ceil(filteredRoles.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个角色
router.get('/roles/:id', authenticateToken, requirePermission('role:read'), (req, res) => {
  try {
    const { id } = req.params;
    
    const role = mockRoles.find(r => r.id === id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: '角色不存在'
      });
    }
    
    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 创建角色
router.post('/roles', authenticateToken, requirePermission('role:write'), (req, res) => {
  try {
    const {
      name,
      display_name,
      description,
      permissions = []
    } = req.body;
    
    // 验证必需字段
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        message: '角色名称和显示名称不能为空'
      });
    }
    
    // 检查角色名称是否已存在
    const existingRole = mockRoles.find(r => r.name === name);
    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: '角色名称已存在'
      });
    }
    
    // 验证权限是否有效
    const validPermissions = mockPermissions.map(p => p.id);
    const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p));
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `无效的权限: ${invalidPermissions.join(', ')}`
      });
    }
    
    // 创建新角色
    const newRole = {
      id: (mockRoles.length + 1).toString(),
      name,
      display_name,
      description: description || '',
      permissions,
      is_system: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: req.user?.id || ''
    };
    
    mockRoles.push(newRole);
    
    res.status(201).json({
      success: true,
      data: newRole,
      message: '角色创建成功'
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新角色
router.put('/roles/:id', authenticateToken, requirePermission('role:write'), (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      display_name,
      description,
      permissions,
      is_active
    } = req.body;
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '角色不存在'
      });
    }
    
    const role = mockRoles[roleIndex];
    
    // 系统角色不能修改名称和核心权限
    if (role.is_system && (name !== role.name || (permissions && JSON.stringify(permissions.sort()) !== JSON.stringify(role.permissions.sort())))) {
      return res.status(400).json({
        success: false,
        message: '系统角色不能修改名称和核心权限'
      });
    }
    
    // 检查角色名称是否已被其他角色使用
    if (name && name !== role.name) {
      const existingRole = mockRoles.find(r => r.name === name && r.id !== id);
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: '角色名称已存在'
        });
      }
    }
    
    // 验证权限是否有效
    if (permissions) {
      const validPermissions = mockPermissions.map(p => p.id);
      const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `无效的权限: ${invalidPermissions.join(', ')}`
        });
      }
    }
    
    // 更新角色信息
    mockRoles[roleIndex] = {
      ...role,
      name: name || role.name,
      display_name: display_name || role.display_name,
      description: description !== undefined ? description : role.description,
      permissions: permissions || role.permissions,
      is_active: is_active !== undefined ? is_active : role.is_active,
      updated_at: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockRoles[roleIndex],
      message: '角色信息更新成功'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除角色
router.delete('/roles/:id', authenticateToken, requirePermission('role:delete'), (req, res) => {
  try {
    const { id } = req.params;
    
    const roleIndex = mockRoles.findIndex(r => r.id === id);
    if (roleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '角色不存在'
      });
    }
    
    const role = mockRoles[roleIndex];
    
    // 系统角色不能删除
    if (role.is_system) {
      return res.status(400).json({
        success: false,
        message: '系统角色不能删除'
      });
    }
    
    // 检查是否有用户使用此角色
    const usersWithRole = mockUserRoles.filter(ur => ur.role_id === id);
    if (usersWithRole.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该角色正在被用户使用，无法删除'
      });
    }
    
    mockRoles.splice(roleIndex, 1);
    
    res.json({
      success: true,
      message: '角色删除成功'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户角色
router.get('/users/:userId/roles', authenticateToken, requirePermission('user:read'), (req, res) => {
  try {
    const { userId } = req.params;
    
    // 只有管理员或用户本人可以查看角色
    if (!req.user?.roles?.includes('admin') && req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    
    const userRoles = mockUserRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => {
        const role = mockRoles.find(r => r.id === ur.role_id);
        return role;
      })
      .filter(Boolean);
    
    res.json({
      success: true,
      data: userRoles
    });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 分配用户角色
router.post('/users/:userId/roles', authenticateToken, requirePermission('role:write'), (req, res) => {
  try {
    const { userId } = req.params;
    const { role_ids } = req.body;
    
    if (!Array.isArray(role_ids)) {
      return res.status(400).json({
        success: false,
        message: '角色ID必须是数组'
      });
    }
    
    // 验证角色是否存在
    const validRoles = mockRoles.filter(r => role_ids.includes(r.id) && r.is_active);
    if (validRoles.length !== role_ids.length) {
      return res.status(400).json({
        success: false,
        message: '包含无效或已禁用的角色'
      });
    }
    
    // 移除用户现有角色
    mockUserRoles = mockUserRoles.filter(ur => ur.user_id !== userId);
    
    // 添加新角色
    const newUserRoles = role_ids.map((roleId: string) => ({
      user_id: userId,
      role_id: roleId
    }));
    
    mockUserRoles.push(...newUserRoles);
    
    res.json({
      success: true,
      data: validRoles,
      message: '用户角色分配成功'
    });
  } catch (error) {
    console.error('Assign user roles error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 移除用户角色
router.delete('/users/:userId/roles/:roleId', authenticateToken, requirePermission('role:write'), (req, res) => {
  try {
    const { userId, roleId } = req.params;
    
    const userRoleIndex = mockUserRoles.findIndex(ur => 
      ur.user_id === userId && ur.role_id === roleId
    );
    
    if (userRoleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '用户角色关联不存在'
      });
    }
    
    mockUserRoles.splice(userRoleIndex, 1);
    
    res.json({
      success: true,
      message: '用户角色移除成功'
    });
  } catch (error) {
    console.error('Remove user role error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户权限
router.get('/users/:userId/permissions', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // 只有管理员或用户本人可以查看权限
    if (!req.user?.roles?.includes('admin') && req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }
    
    // 获取用户所有角色的权限
    const userPermissions = new Set<string>();
    const userRoleIds = mockUserRoles
      .filter(ur => ur.user_id === userId)
      .map(ur => ur.role_id);
    
    for (const roleId of userRoleIds) {
      const role = mockRoles.find(r => r.id === roleId && r.is_active);
      if (role) {
        role.permissions.forEach(p => userPermissions.add(p));
      }
    }
    
    // 获取权限详细信息
    const permissionDetails = Array.from(userPermissions).map(permissionId => {
      const permission = mockPermissions.find(p => p.id === permissionId);
      return permission;
    }).filter(Boolean);
    
    res.json({
      success: true,
      data: permissionDetails
    });
  } catch (error) {
    console.error('Get user permissions error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;