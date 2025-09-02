import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
        display_name?: string;
        avatar?: string;
      };
    }
  }
}

// Mock用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', // 'admin123'
    role: 'admin',
    display_name: '系统管理员',
    avatar: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    password: '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', // 'user123'
    role: 'user',
    display_name: '普通用户1',
    avatar: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];

/**
 * JWT令牌验证中间件
 * 验证Authorization header中的Bearer token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少或无效的访问令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌为空'
      });
    }

    // 验证并解析JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 查找用户信息
    const user = mockUsers.find(u => u.id === decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    // 将用户信息附加到请求对象
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      display_name: user.display_name,
      avatar: user.avatar
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }

    return res.status(500).json({
      success: false,
      message: '令牌验证时发生服务器错误'
    });
  }
};

/**
 * 管理员权限验证中间件
 * 需要在authenticateToken之后使用
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '未认证的用户'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }

  next();
};

/**
 * 角色验证中间件工厂
 * 创建一个中间件来验证用户是否具有指定角色
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未认证的用户'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `需要以下角色之一: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * 可选的令牌验证中间件
 * 如果提供了令牌则验证，但不强制要求
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 没有提供令牌，继续处理但不设置用户信息
    return next();
  }

  // 有令牌，尝试验证
  authenticateToken(req, res, next);
};