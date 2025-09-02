import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 扩展Request接口以包含token信息
declare global {
  namespace Express {
    interface Request {
      token?: {
        sub: string;
        aud: string;
        iss: string;
        scope: string;
        client_id?: string;
        token_type?: string;
        exp: number;
        iat: number;
      };
      scopes?: string[];
    }
  }
}

/**
 * Token验证中间件
 * 支持Bearer token验证，解析JWT并提取用户/客户端信息
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '缺少或无效的访问令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    if (!token) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '访问令牌为空'
      });
    }

    // 验证并解析JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 将解析的token信息附加到请求对象
    req.token = {
      sub: decoded.sub,
      aud: decoded.aud,
      iss: decoded.iss,
      scope: decoded.scope || '',
      client_id: decoded.client_id,
      token_type: decoded.token_type,
      exp: decoded.exp,
      iat: decoded.iat
    };

    // 解析作用域为数组
    req.scopes = decoded.scope ? decoded.scope.split(' ') : [];

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '访问令牌已过期'
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '无效的访问令牌'
      });
    }

    return res.status(500).json({
      error: 'server_error',
      error_description: '令牌验证时发生服务器错误'
    });
  }
};

/**
 * 作用域验证中间件工厂
 * 创建一个中间件来验证请求是否具有所需的作用域
 */
export const requireScopes = (requiredScopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.scopes) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '未找到令牌作用域信息'
      });
    }

    // 检查是否具有所有必需的作用域
    const hasAllScopes = requiredScopes.every(scope => 
      req.scopes!.includes(scope)
    );

    if (!hasAllScopes) {
      return res.status(403).json({
        error: 'insufficient_scope',
        error_description: `需要以下作用域: ${requiredScopes.join(', ')}`,
        required_scopes: requiredScopes,
        current_scopes: req.scopes
      });
    }

    next();
  };
};

/**
 * 客户端凭证验证中间件
 * 专门用于验证客户端凭证模式的令牌
 */
export const verifyClientCredentials = (req: Request, res: Response, next: NextFunction) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    
    // 验证这是一个客户端凭证令牌
    if (req.token?.token_type !== 'client_credentials') {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '此端点需要客户端凭证令牌'
      });
    }

    next();
  });
};

/**
 * 用户令牌验证中间件
 * 专门用于验证用户授权的令牌（authorization_code模式）
 */
export const verifyUserToken = (req: Request, res: Response, next: NextFunction) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err);
    
    // 验证这是一个用户令牌（不是客户端凭证）
    if (req.token?.token_type === 'client_credentials') {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '此端点需要用户授权令牌'
      });
    }

    next();
  });
};

/**
 * 令牌信息端点中间件
 * 提供令牌内省功能
 */
export const getTokenInfo = (req: Request, res: Response) => {
  if (!req.token) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: '未找到有效的令牌信息'
    });
  }

  const tokenInfo = {
    active: true,
    sub: req.token.sub,
    aud: req.token.aud,
    iss: req.token.iss,
    scope: req.token.scope,
    client_id: req.token.client_id,
    token_type: req.token.token_type,
    exp: req.token.exp,
    iat: req.token.iat,
    scopes: req.scopes
  };

  res.json(tokenInfo);
};