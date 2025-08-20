import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock审计日志数据
let mockAuditLogs = [
  {
    id: '1',
    event_type: 'user_login',
    event_category: 'authentication',
    user_id: '1',
    username: 'admin',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip_address: '192.168.1.100',
    application_id: '1',
    application_name: 'CRM系统',
    resource: '/api/auth/login',
    action: 'POST',
    result: 'success',
    details: {
      login_method: 'password',
      session_id: 'sess_123456',
      location: '北京市'
    },
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    event_type: 'user_logout',
    event_category: 'authentication',
    user_id: '1',
    username: 'admin',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip_address: '192.168.1.100',
    application_id: '1',
    application_name: 'CRM系统',
    resource: '/api/auth/logout',
    action: 'POST',
    result: 'success',
    details: {
      session_id: 'sess_123456',
      logout_reason: 'user_initiated'
    },
    timestamp: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    event_type: 'user_create',
    event_category: 'user_management',
    user_id: '1',
    username: 'admin',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip_address: '192.168.1.100',
    application_id: null,
    application_name: 'SSO管理后台',
    resource: '/api/users',
    action: 'POST',
    result: 'success',
    details: {
      target_user_id: '3',
      target_username: 'user2',
      assigned_roles: ['user']
    },
    timestamp: '2024-01-15T09:15:00Z'
  },
  {
    id: '4',
    event_type: 'login_failed',
    event_category: 'authentication',
    user_id: null,
    username: 'unknown_user',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip_address: '192.168.1.200',
    application_id: '2',
    application_name: 'ERP系统',
    resource: '/api/auth/login',
    action: 'POST',
    result: 'failure',
    details: {
      error_code: 'invalid_credentials',
      error_message: '用户名或密码错误',
      attempt_count: 3
    },
    timestamp: '2024-01-15T08:30:00Z'
  },
  {
    id: '5',
    event_type: 'app_create',
    event_category: 'application_management',
    user_id: '1',
    username: 'admin',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip_address: '192.168.1.100',
    application_id: null,
    application_name: 'SSO管理后台',
    resource: '/api/applications',
    action: 'POST',
    result: 'success',
    details: {
      app_id: '3',
      app_name: '移动应用',
      client_id: 'mobile_app_003'
    },
    timestamp: '2024-01-14T16:20:00Z'
  },
  {
    id: '6',
    event_type: 'role_assign',
    event_category: 'permission_management',
    user_id: '1',
    username: 'admin',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip_address: '192.168.1.100',
    application_id: null,
    application_name: 'SSO管理后台',
    resource: '/api/permissions/users/2/roles',
    action: 'POST',
    result: 'success',
    details: {
      target_user_id: '2',
      target_username: 'user1',
      assigned_roles: ['user', 'app_manager'],
      previous_roles: ['user']
    },
    timestamp: '2024-01-14T14:10:00Z'
  },
  {
    id: '7',
    event_type: 'password_reset',
    event_category: 'user_management',
    user_id: '1',
    username: 'admin',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip_address: '192.168.1.100',
    application_id: null,
    application_name: 'SSO管理后台',
    resource: '/api/users/2/reset-password',
    action: 'POST',
    result: 'success',
    details: {
      target_user_id: '2',
      target_username: 'user1',
      reset_method: 'admin_reset'
    },
    timestamp: '2024-01-14T13:45:00Z'
  },
  {
    id: '8',
    event_type: 'oauth_authorize',
    event_category: 'oauth',
    user_id: '2',
    username: 'user1',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    ip_address: '192.168.1.150',
    application_id: '3',
    application_name: '移动应用',
    resource: '/api/oauth/authorize',
    action: 'GET',
    result: 'success',
    details: {
      client_id: 'mobile_app_003',
      scope: 'read',
      response_type: 'code',
      redirect_uri: 'com.example.mobile://callback'
    },
    timestamp: '2024-01-13T20:30:00Z'
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

// 审计权限中间件
const requireAuditPermission = (req: any, res: any, next: any) => {
  if (!req.user.roles.includes('admin') && !req.user.roles.includes('auditor')) {
    return res.status(403).json({
      success: false,
      message: '需要审计权限'
    });
  }
  next();
};

// 记录审计日志的辅助函数
export const logAuditEvent = (eventData: {
  event_type: string;
  event_category: string;
  user_id?: string;
  username?: string;
  user_agent?: string;
  ip_address?: string;
  application_id?: string;
  application_name?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure';
  details?: any;
}) => {
  const auditLog = {
    id: (mockAuditLogs.length + 1).toString(),
    event_type: eventData.event_type,
    event_category: eventData.event_category,
    user_id: eventData.user_id || '',
    username: eventData.username || '',
    user_agent: eventData.user_agent || '',
    ip_address: eventData.ip_address || '',
    application_id: eventData.application_id || null,
    application_name: eventData.application_name || '',
    resource: eventData.resource,
    action: eventData.action,
    result: eventData.result,
    details: eventData.details || {},
    timestamp: new Date().toISOString()
  };
  
  mockAuditLogs.unshift(auditLog); // 添加到开头，保持时间倒序
  
  // 限制日志数量，避免内存溢出
  if (mockAuditLogs.length > 10000) {
    mockAuditLogs = mockAuditLogs.slice(0, 10000);
  }
};

// 获取审计日志列表
router.get('/logs', authenticateToken, requireAuditPermission, (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      event_type,
      event_category,
      user_id,
      username,
      application_id,
      result,
      start_date,
      end_date,
      ip_address
    } = req.query;
    
    let filteredLogs = [...mockAuditLogs];
    
    // 事件类型过滤
    if (event_type) {
      filteredLogs = filteredLogs.filter(log => log.event_type === event_type);
    }
    
    // 事件分类过滤
    if (event_category) {
      filteredLogs = filteredLogs.filter(log => log.event_category === event_category);
    }
    
    // 用户ID过滤
    if (user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === user_id);
    }
    
    // 用户名过滤
    if (username) {
      const searchTerm = (username as string).toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.username?.toLowerCase().includes(searchTerm)
      );
    }
    
    // 应用过滤
    if (application_id) {
      filteredLogs = filteredLogs.filter(log => log.application_id === application_id);
    }
    
    // 结果过滤
    if (result) {
      filteredLogs = filteredLogs.filter(log => log.result === result);
    }
    
    // IP地址过滤
    if (ip_address) {
      filteredLogs = filteredLogs.filter(log => log.ip_address === ip_address);
    }
    
    // 时间范围过滤
    if (start_date) {
      const startDate = new Date(start_date as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredLogs.length,
        pages: Math.ceil(filteredLogs.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个审计日志详情
router.get('/logs/:id', authenticateToken, requireAuditPermission, (req, res) => {
  try {
    const { id } = req.params;
    
    const log = mockAuditLogs.find(l => l.id === id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: '审计日志不存在'
      });
    }
    
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取登录日志
router.get('/login-logs', authenticateToken, requireAuditPermission, (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id,
      username,
      result,
      start_date,
      end_date,
      ip_address
    } = req.query;
    
    // 过滤登录相关事件
    let loginLogs = mockAuditLogs.filter(log => 
      ['user_login', 'login_failed', 'user_logout'].includes(log.event_type)
    );
    
    // 应用其他过滤条件
    if (user_id) {
      loginLogs = loginLogs.filter(log => log.user_id === user_id);
    }
    
    if (username) {
      const searchTerm = (username as string).toLowerCase();
      loginLogs = loginLogs.filter(log => 
        log.username?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (result) {
      loginLogs = loginLogs.filter(log => log.result === result);
    }
    
    if (ip_address) {
      loginLogs = loginLogs.filter(log => log.ip_address === ip_address);
    }
    
    if (start_date) {
      const startDate = new Date(start_date as string);
      loginLogs = loginLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date as string);
      loginLogs = loginLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedLogs = loginLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: loginLogs.length,
        pages: Math.ceil(loginLogs.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get login logs error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取操作日志
router.get('/operation-logs', authenticateToken, requireAuditPermission, (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id,
      username,
      event_category,
      result,
      start_date,
      end_date
    } = req.query;
    
    // 过滤操作相关事件（排除登录相关）
    let operationLogs = mockAuditLogs.filter(log => 
      !['user_login', 'login_failed', 'user_logout'].includes(log.event_type)
    );
    
    // 应用其他过滤条件
    if (user_id) {
      operationLogs = operationLogs.filter(log => log.user_id === user_id);
    }
    
    if (username) {
      const searchTerm = (username as string).toLowerCase();
      operationLogs = operationLogs.filter(log => 
        log.username?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (event_category) {
      operationLogs = operationLogs.filter(log => log.event_category === event_category);
    }
    
    if (result) {
      operationLogs = operationLogs.filter(log => log.result === result);
    }
    
    if (start_date) {
      const startDate = new Date(start_date as string);
      operationLogs = operationLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date as string);
      operationLogs = operationLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // 分页
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedLogs = operationLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: operationLogs.length,
        pages: Math.ceil(operationLogs.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get operation logs error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取审计统计信息
router.get('/stats', authenticateToken, requireAuditPermission, (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let filteredLogs = [...mockAuditLogs];
    
    // 时间范围过滤
    if (start_date) {
      const startDate = new Date(start_date as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date as string);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // 统计数据
    const stats = {
      total_events: filteredLogs.length,
      successful_events: filteredLogs.filter(log => log.result === 'success').length,
      failed_events: filteredLogs.filter(log => log.result === 'failure').length,
      login_events: filteredLogs.filter(log => log.event_type === 'user_login').length,
      failed_logins: filteredLogs.filter(log => log.event_type === 'login_failed').length,
      unique_users: new Set(filteredLogs.filter(log => log.user_id).map(log => log.user_id)).size,
      unique_ips: new Set(filteredLogs.map(log => log.ip_address)).size,
      
      // 按事件类型分组
      events_by_type: filteredLogs.reduce((acc, log) => {
        acc[log.event_type] = (acc[log.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // 按事件分类分组
      events_by_category: filteredLogs.reduce((acc, log) => {
        acc[log.event_category] = (acc[log.event_category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // 按应用分组
      events_by_application: filteredLogs.reduce((acc, log) => {
        const appName = log.application_name || '未知应用';
        acc[appName] = (acc[appName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // 按小时分组（最近24小时）
      events_by_hour: (() => {
        const hourlyStats: Record<string, number> = {};
        const now = new Date();
        
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
          hourlyStats[hourKey] = 0;
        }
        
        filteredLogs.forEach(log => {
          const logDate = new Date(log.timestamp);
          if (logDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
            const hourKey = logDate.getHours().toString().padStart(2, '0') + ':00';
            hourlyStats[hourKey] = (hourlyStats[hourKey] || 0) + 1;
          }
        });
        
        return hourlyStats;
      })()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 导出审计日志
router.post('/export', authenticateToken, requireAuditPermission, (req, res) => {
  try {
    const {
      format = 'json',
      event_type,
      event_category,
      user_id,
      start_date,
      end_date,
      limit = 10000
    } = req.body;
    
    let filteredLogs = [...mockAuditLogs];
    
    // 应用过滤条件
    if (event_type) {
      filteredLogs = filteredLogs.filter(log => log.event_type === event_type);
    }
    
    if (event_category) {
      filteredLogs = filteredLogs.filter(log => log.event_category === event_category);
    }
    
    if (user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === user_id);
    }
    
    if (start_date) {
      const startDate = new Date(start_date);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
    }
    
    if (end_date) {
      const endDate = new Date(end_date);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // 限制导出数量
    filteredLogs = filteredLogs.slice(0, limit);
    
    // 生成导出文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit_logs_${timestamp}.${format}`;
    
    if (format === 'csv') {
      // CSV格式
      const csvHeaders = [
        'ID', '事件类型', '事件分类', '用户ID', '用户名', 'IP地址',
        '应用ID', '应用名称', '资源', '操作', '结果', '时间', '详情'
      ];
      
      const csvRows = filteredLogs.map(log => [
        log.id,
        log.event_type,
        log.event_category,
        log.user_id || '',
        log.username || '',
        log.ip_address,
        log.application_id || '',
        log.application_name || '',
        log.resource,
        log.action,
        log.result,
        log.timestamp,
        JSON.stringify(log.details || {})
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } else {
      // JSON格式
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json({
        export_info: {
          timestamp: new Date().toISOString(),
          total_records: filteredLogs.length,
          format: format
        },
        data: filteredLogs
      });
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;