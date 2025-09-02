import type { Request, Response, NextFunction } from 'express';
import { logAuditEvent } from '../routes/audit';

// 内存存储的请求记录
interface RateLimitRecord {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (record.resetTime < now && (!record.blocked || (record.blockUntil && record.blockUntil < now))) {
      requestCounts.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

// 获取客户端标识符
function getClientId(req: Request): string {
  // 优先使用用户ID，其次使用IP地址
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  return userId ? `user:${userId}` : `ip:${ip}`;
}

// 基础频率限制中间件
export function createRateLimit({
  windowMs = 15 * 60 * 1000, // 15分钟窗口
  maxRequests = 100, // 最大请求数
  blockDurationMs = 60 * 60 * 1000, // 阻止时长1小时
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
  keyGenerator = getClientId,
  message = '请求过于频繁，请稍后再试'
} = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let record = requestCounts.get(key);
    
    // 如果记录不存在或已过期，创建新记录
    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + windowMs,
        blocked: false
      };
      requestCounts.set(key, record);
    }
    
    // 检查是否在阻止期内
    if (record.blocked && record.blockUntil && record.blockUntil > now) {
      // 记录被阻止的请求
      logAuditEvent({
        user_id: (req as any).user?.id,
        username: (req as any).user?.username || 'anonymous',
        action: 'rate_limit:blocked',
        resource_type: 'request',
        details: {
          path: req.path,
          method: req.method,
          client_id: key,
          block_until: new Date(record.blockUntil).toISOString()
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'failed'
      });
      
      return res.status(429).json({
        success: false,
        message,
        retry_after: Math.ceil((record.blockUntil - now) / 1000)
      });
    }
    
    // 增加请求计数
    record.count++;
    
    // 检查是否超过限制
    if (record.count > maxRequests) {
      // 设置阻止状态
      record.blocked = true;
      record.blockUntil = now + blockDurationMs;
      
      // 记录超限事件
      logAuditEvent({
        user_id: (req as any).user?.id,
        username: (req as any).user?.username || 'anonymous',
        action: 'rate_limit:exceeded',
        resource_type: 'request',
        details: {
          path: req.path,
          method: req.method,
          client_id: key,
          request_count: record.count,
          max_requests: maxRequests,
          window_ms: windowMs
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        status: 'failed'
      });
      
      return res.status(429).json({
        success: false,
        message,
        retry_after: Math.ceil(blockDurationMs / 1000)
      });
    }
    
    // 设置响应头
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    });
    
    next();
  };
}

// 登录频率限制
export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 5, // 最多5次登录尝试
  blockDurationMs: 30 * 60 * 1000, // 阻止30分钟
  message: '登录尝试过于频繁，请30分钟后再试'
});

// API调用频率限制
export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 1000, // 最多1000次API调用
  blockDurationMs: 60 * 60 * 1000, // 阻止1小时
  message: 'API调用过于频繁，请1小时后再试'
});

// 敏感操作频率限制
export const sensitiveOperationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  maxRequests: 10, // 最多10次敏感操作
  blockDurationMs: 2 * 60 * 60 * 1000, // 阻止2小时
  message: '敏感操作过于频繁，请2小时后再试'
});

// 密码重置频率限制
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  maxRequests: 3, // 最多3次密码重置
  blockDurationMs: 24 * 60 * 60 * 1000, // 阻止24小时
  message: '密码重置请求过于频繁，请24小时后再试'
});

// 注册频率限制
export const registrationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  maxRequests: 5, // 最多5次注册
  blockDurationMs: 24 * 60 * 60 * 1000, // 阻止24小时
  keyGenerator: (req: Request) => {
    // 注册使用IP地址作为标识
    return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
  },
  message: '注册请求过于频繁，请24小时后再试'
});

// 获取频率限制状态
export function getRateLimitStatus(req: Request): {
  limited: boolean;
  remaining?: number;
  resetTime?: Date;
  blockUntil?: Date;
} {
  const key = getClientId(req);
  const record = requestCounts.get(key);
  
  if (!record) {
    return { limited: false };
  }
  
  const now = Date.now();
  
  return {
    limited: record.blocked && record.blockUntil ? record.blockUntil > now : false,
    remaining: Math.max(0, 100 - record.count), // 假设默认限制为100
    resetTime: new Date(record.resetTime),
    blockUntil: record.blockUntil ? new Date(record.blockUntil) : undefined
  };
}

// 清除特定客户端的频率限制记录（管理员功能）
export function clearRateLimit(clientId: string): boolean {
  return requestCounts.delete(clientId);
}

// 获取所有频率限制记录（管理员功能）
export function getAllRateLimitRecords(): Array<{
  clientId: string;
  count: number;
  resetTime: Date;
  blocked: boolean;
  blockUntil?: Date;
}> {
  const records = [];
  for (const [clientId, record] of requestCounts.entries()) {
    records.push({
      clientId,
      count: record.count,
      resetTime: new Date(record.resetTime),
      blocked: record.blocked,
      blockUntil: record.blockUntil ? new Date(record.blockUntil) : undefined
    });
  }
  return records;
}