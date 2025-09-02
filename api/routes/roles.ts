import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { logAuditEvent } from './audit';
import { sensitiveOperationRateLimit } from '../middleware/rateLimit';

const router = express.Router();

// Mock角色数据
const mockRoles = [
  {
    id: '1',
    name: 'admin',
    display_name: '系统管理员',
    description: '拥有系统所有权限',
    permissions: [
      'user:read', 'user:write', 'user:delete',
      'app:read', 'app:write', 'app:delete',
      'role:read', 'role:write', 'role:delete',
      'audit:read', 'system:config'
    ],
    is_system: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'user',
    display_name: '普通用户',
    description: '基础用户权限',
    permissions: ['user:read'],
    is_system: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'app_manager',
    display_name: '应用管理员',
    description: '管理第三方应用',
    permissions: [
      'user:read',
      'app:read', 'app:write', 'app:delete'
    ],
    is_system: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];

// 获取所有角色
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let filteredRoles = [...mockRoles];
    
    // 搜索过滤
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredRoles = filteredRoles.filter(role => 
        role.name.toLowerCase().includes(searchTerm) ||
        role.display_name.toLowerCase().includes(searchTerm) ||
        role.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // 分页
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        roles: paginatedRoles,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total: filteredRoles.length,
          total_pages: Math.ceil(filteredRoles.length / limitNum)
        }
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
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
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
router.post('/', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
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
    
    // 检查角色名是否已存在
    const existingRole = mockRoles.find(r => r.name === name);
    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: '角色名称已存在'
      });
    }
    
    // 验证权限格式
    const validPermissions = [
      'user:read', 'user:write', 'user:delete',
      'app:read', 'app:write', 'app:delete',
      'role:read', 'role:write', 'role:delete',
      'audit:read', 'system:config'
    ];
    
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockRoles.push(newRole);
    
    // 记录角色创建事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'role:create',
      resource_type: 'role',
      resource_id: newRole.id,
      details: {
        role_name: newRole.name,
        permissions: newRole.permissions,
        description: newRole.description
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
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
router.put('/:id', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      display_name,
      description,
      permissions
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
    if (role.is_system && (name !== role.name)) {
      return res.status(400).json({
        success: false,
        message: '系统角色不能修改名称'
      });
    }
    
    // 检查角色名是否已被其他角色使用
    if (name && name !== role.name) {
      const existingRole = mockRoles.find(r => r.name === name && r.id !== id);
      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: '角色名称已存在'
        });
      }
    }
    
    // 验证权限格式
    if (permissions) {
      const validPermissions = [
        'user:read', 'user:write', 'user:delete',
        'app:read', 'app:write', 'app:delete',
        'role:read', 'role:write', 'role:delete',
        'audit:read', 'system:config'
      ];
      
      const invalidPermissions = permissions.filter((p: string) => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `无效的权限: ${invalidPermissions.join(', ')}`
        });
      }
    }
    
    // 记录变更前的状态
    const beforeState = { ...role };
    
    // 更新角色信息
    mockRoles[roleIndex] = {
      ...role,
      name: name || role.name,
      display_name: display_name || role.display_name,
      description: description !== undefined ? description : role.description,
      permissions: permissions || role.permissions,
      updated_at: new Date().toISOString()
    };
    
    // 记录角色更新事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'role:update',
      resource_type: 'role',
      resource_id: role.id,
      details: {
        role_name: role.name,
        changes: {
          before: beforeState,
          after: mockRoles[roleIndex]
        }
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
    res.json({
      success: true,
      data: mockRoles[roleIndex],
      message: '角色更新成功'
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
router.delete('/:id', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
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
    
    // TODO: 检查是否有用户正在使用此角色
    // 在实际应用中，这里应该检查用户表
    
    // 记录删除前的角色信息
    const deletedRole = { ...role };
    
    mockRoles.splice(roleIndex, 1);
    
    // 记录角色删除事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'role:delete',
      resource_type: 'role',
      resource_id: role.id,
      details: {
        role_name: deletedRole.name,
        deleted_role: deletedRole
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });
    
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

// 获取所有可用权限
router.get('/permissions/list', authenticateToken, requireAdmin, (req, res) => {
  try {
    const permissions = [
      {
        category: 'user',
        name: '用户管理',
        permissions: [
          { key: 'user:read', name: '查看用户', description: '查看用户列表和详情' },
          { key: 'user:write', name: '编辑用户', description: '创建和编辑用户信息' },
          { key: 'user:delete', name: '删除用户', description: '删除用户账户' }
        ]
      },
      {
        category: 'app',
        name: '应用管理',
        permissions: [
          { key: 'app:read', name: '查看应用', description: '查看第三方应用列表和详情' },
          { key: 'app:write', name: '编辑应用', description: '创建和编辑第三方应用' },
          { key: 'app:delete', name: '删除应用', description: '删除第三方应用' }
        ]
      },
      {
        category: 'role',
        name: '角色管理',
        permissions: [
          { key: 'role:read', name: '查看角色', description: '查看角色列表和详情' },
          { key: 'role:write', name: '编辑角色', description: '创建和编辑角色' },
          { key: 'role:delete', name: '删除角色', description: '删除角色' }
        ]
      },
      {
        category: 'system',
        name: '系统管理',
        permissions: [
          { key: 'audit:read', name: '查看审计日志', description: '查看系统审计日志' },
          { key: 'system:config', name: '系统配置', description: '修改系统配置' }
        ]
      }
    ];
    
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;
export { mockRoles };