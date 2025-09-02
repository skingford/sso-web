import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Mock审计日志数据
const mockAuditLogs = [
  {
    id: '1',
    user_id: '1',
    username: 'admin',
    action: 'user:create',
    resource_type: 'user',
    resource_id: '3',
    details: {
      target_user: 'testuser',
      email: 'test@example.com',
      roles: ['user']
    },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    created_at: '2024-01-15T10:30:00.000Z'
  },
  {
    id: '2',
    user_id: '1',
    username: 'admin',
    action: 'app:create',
    resource_type: 'application',
    resource_id: '2',
    details: {
      app_name: 'Test App',
      app_type: 'web',
      redirect_uris: ['https://testapp.com/callback']
    },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    created_at: '2024-01-15T09:15:00.000Z'
  },
  {
    id: '3',
    user_id: '2',
    username: 'user1',
    action: 'auth:login',
    resource_type: 'session',
    resource_id: null,
    details: {
      login_method: 'password',
      remember_me: false
    },
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    created_at: '2024-01-15T08:45:00.000Z'
  },
  {
    id: '4',
    user_id: null,
    username: 'unknown',
    action: 'auth:login',
    resource_type: 'session',
    resource_id: null,
    details: {
      login_method: 'password',
      attempted_username: 'wronguser',
      failure_reason: 'invalid_credentials'
    },
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'failed',
    created_at: '2024-01-15T08:30:00.000Z'
  },
  {
    id: '5',
    user_id: '1',
    username: 'admin',
    action: 'role:update',
    resource_type: 'role',
    resource_id: '3',
    details: {
      role_name: 'app_manager',
      changes: {
        permissions: {
          added: ['app:delete'],
          removed: []
        }
      }
    },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    created_at: '2024-01-14T16:20:00.000Z'
  }
];

// 审计日志记录函数
const logAuditEvent = ({
  user_id,
  username,
  action,
  resource_type,
  resource_id = null,
  details = {},
  ip_address,
  user_agent,
  status = 'success'
}: {
  user_id?: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  status?: 'success' | 'failed';
}) => {
  const auditLog = {
    id: (mockAuditLogs.length + 1).toString(),
    user_id: user_id || null,
    username,
    action,
    resource_type,
    resource_id,
    details,
    ip_address: ip_address || 'unknown',
    user_agent: user_agent || 'unknown',
    status,
    created_at: new Date().toISOString()
  };
  
  mockAuditLogs.unshift(auditLog); // 添加到开头，保持时间倒序
  
  // 限制日志数量，避免内存溢出
  if (mockAuditLogs.length > 1000) {
    mockAuditLogs.splice(1000);
  }
  
  return auditLog;
};

// 获取审计日志列表
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      user_id,
      username,
      action,
      resource_type,
      status,
      start_date,
      end_date,
      ip_address
    } = req.query;
    
    let filteredLogs = [...mockAuditLogs];
    
    // 过滤条件
    if (user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === user_id);
    }
    
    if (username) {
      const searchTerm = username.toString().toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.username.toLowerCase().includes(searchTerm)
      );
    }
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (resource_type) {
      filteredLogs = filteredLogs.filter(log => log.resource_type === resource_type);
    }
    
    if (status) {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }
    
    if (ip_address) {
      filteredLogs = filteredLogs.filter(log => log.ip_address === ip_address);
    }
    
    // 日期范围过滤
    if (start_date) {
      const startDate = new Date(start_date.toString());
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.created_at) >= startDate
      );
    }
    
    if (end_date) {
      const endDate = new Date(end_date.toString());
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.created_at) <= endDate
      );
    }
    
    // 分页
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          current_page: pageNum,
          per_page: limitNum,
          total: filteredLogs.length,
          total_pages: Math.ceil(filteredLogs.length / limitNum)
        },
        filters: {
          user_id,
          username,
          action,
          resource_type,
          status,
          start_date,
          end_date,
          ip_address
        }
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
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
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

// 获取审计统计信息
router.get('/stats/summary', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days.toString());
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    const recentLogs = mockAuditLogs.filter(log => 
      new Date(log.created_at) >= startDate
    );
    
    // 按操作类型统计
    const actionStats = recentLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 按状态统计
    const statusStats = recentLogs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 按用户统计
    const userStats = recentLogs.reduce((acc, log) => {
      if (log.username) {
        acc[log.username] = (acc[log.username] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // 按IP地址统计
    const ipStats = recentLogs.reduce((acc, log) => {
      acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 每日统计
    const dailyStats = [];
    for (let i = daysNum - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = recentLogs.filter(log => 
        log.created_at.startsWith(dateStr)
      );
      
      dailyStats.push({
        date: dateStr,
        total: dayLogs.length,
        success: dayLogs.filter(log => log.status === 'success').length,
        failed: dayLogs.filter(log => log.status === 'failed').length
      });
    }
    
    res.json({
      success: true,
      data: {
        period: {
          days: daysNum,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        },
        summary: {
          total_events: recentLogs.length,
          success_events: statusStats.success || 0,
          failed_events: statusStats.failed || 0,
          unique_users: Object.keys(userStats).length,
          unique_ips: Object.keys(ipStats).length
        },
        action_stats: Object.entries(actionStats)
          .map(([action, count]) => ({ action, count }))
          .sort((a, b) => b.count - a.count),
        user_stats: Object.entries(userStats)
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10), // 只返回前10个最活跃用户
        ip_stats: Object.entries(ipStats)
          .map(([ip_address, count]) => ({ ip_address, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10), // 只返回前10个最活跃IP
        daily_stats: dailyStats
      }
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
router.post('/export', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      format = 'json',
      start_date,
      end_date,
      filters = {}
    } = req.body;
    
    let filteredLogs = [...mockAuditLogs];
    
    // 应用过滤条件
    if (filters.user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === filters.user_id);
    }
    
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }
    
    if (filters.resource_type) {
      filteredLogs = filteredLogs.filter(log => log.resource_type === filters.resource_type);
    }
    
    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }
    
    // 日期范围过滤
    if (start_date) {
      const startDate = new Date(start_date);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.created_at) >= startDate
      );
    }
    
    if (end_date) {
      const endDate = new Date(end_date);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.created_at) <= endDate
      );
    }
    
    // 生成导出数据
    let exportData: string;
    let contentType: string;
    let filename: string;
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'csv') {
      // CSV格式
      const headers = ['ID', '用户ID', '用户名', '操作', '资源类型', '资源ID', 'IP地址', '状态', '创建时间'];
      const csvRows = [headers.join(',')];
      
      filteredLogs.forEach(log => {
        const row = [
          log.id,
          log.user_id || '',
          log.username,
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.ip_address,
          log.status,
          log.created_at
        ];
        csvRows.push(row.map(field => `"${field}"`).join(','));
      });
      
      exportData = csvRows.join('\n');
      contentType = 'text/csv';
      filename = `audit_logs_${timestamp}.csv`;
    } else {
      // JSON格式
      exportData = JSON.stringify({
        export_info: {
          timestamp: new Date().toISOString(),
          total_records: filteredLogs.length,
          filters,
          date_range: { start_date, end_date }
        },
        logs: filteredLogs
      }, null, 2);
      contentType = 'application/json';
      filename = `audit_logs_${timestamp}.json`;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

export default router;
export { logAuditEvent };