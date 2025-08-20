import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Mock数据
const mockClients = [
  {
    client_id: 'demo-app-1',
    client_secret: 'demo-secret-1',
    name: '演示应用1',
    redirect_uris: ['http://localhost:3001/callback', 'https://demo1.example.com/callback'],
    scopes: ['openid', 'profile', 'email'],
    grant_types: ['authorization_code', 'refresh_token']
  },
  {
    client_id: 'demo-app-2',
    client_secret: 'demo-secret-2',
    name: '演示应用2',
    redirect_uris: ['http://localhost:3002/callback', 'https://demo2.example.com/callback'],
    scopes: ['openid', 'profile'],
    grant_types: ['authorization_code']
  }
];

const mockAuthCodes = new Map();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 授权端点
router.get('/authorize', (req, res) => {
  try {
    const {
      client_id,
      redirect_uri,
      response_type,
      scope = 'openid profile',
      state,
      nonce,
      prompt
    } = req.query;

    // 验证必需参数
    if (!client_id || !redirect_uri || !response_type) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: '缺少必需参数'
      });
    }

    // 验证客户端
    const client = mockClients.find(c => c.client_id === client_id);
    if (!client) {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: '无效的客户端ID'
      });
    }

    // 验证重定向URI
    if (!client.redirect_uris.includes(redirect_uri as string)) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: '无效的重定向URI'
      });
    }

    // 验证响应类型
    if (response_type !== 'code') {
      return res.status(400).json({
        error: 'unsupported_response_type',
        error_description: '不支持的响应类型'
      });
    }

    // 生成授权码
    const authCode = crypto.randomBytes(32).toString('hex');
    mockAuthCodes.set(authCode, {
      client_id,
      redirect_uri,
      scope,
      user_id: '1', // 假设已登录用户ID为1
      expires_at: Date.now() + 10 * 60 * 1000, // 10分钟过期
      nonce
    });

    // 构建重定向URL
    const redirectUrl = new URL(redirect_uri as string);
    redirectUrl.searchParams.set('code', authCode);
    if (state) {
      redirectUrl.searchParams.set('state', state as string);
    }

    res.json({
      redirect_url: redirectUrl.toString(),
      code: authCode,
      state
    });
  } catch (error) {
    console.error('OAuth authorize error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: '服务器内部错误'
    });
  }
});

// 令牌端点
router.post('/token', (req, res) => {
  try {
    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      client_secret,
      refresh_token
    } = req.body;

    // 验证客户端
    const client = mockClients.find(c => 
      c.client_id === client_id && c.client_secret === client_secret
    );
    if (!client) {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: '客户端认证失败'
      });
    }

    if (grant_type === 'authorization_code') {
      // 授权码模式
      if (!code || !redirect_uri) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: '缺少授权码或重定向URI'
        });
      }

      const authData = mockAuthCodes.get(code);
      if (!authData) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: '无效的授权码'
        });
      }

      // 检查授权码是否过期
      if (Date.now() > authData.expires_at) {
        mockAuthCodes.delete(code);
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: '授权码已过期'
        });
      }

      // 验证重定向URI
      if (authData.redirect_uri !== redirect_uri) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: '重定向URI不匹配'
        });
      }

      // 删除已使用的授权码
      mockAuthCodes.delete(code);

      // 生成令牌
      const payload = {
        sub: authData.user_id,
        aud: client_id,
        iss: 'https://sso.example.com',
        scope: authData.scope
      };

      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({ sub: authData.user_id, client_id }, JWT_SECRET, { expiresIn: '30d' });
      
      // 生成ID Token (OIDC)
      const idTokenPayload = {
        sub: authData.user_id,
        aud: client_id,
        iss: 'https://sso.example.com',
        name: '系统管理员',
        email: 'admin@example.com',
        preferred_username: 'admin',
        nonce: authData.nonce
      };
      const idToken = jwt.sign(idTokenPayload, JWT_SECRET, { expiresIn: '1h' });

      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        id_token: idToken,
        scope: authData.scope
      });
    } else if (grant_type === 'refresh_token') {
      // 刷新令牌模式
      if (!refresh_token) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: '缺少刷新令牌'
        });
      }

      try {
        const decoded = jwt.verify(refresh_token, JWT_SECRET) as any;
        
        if (decoded.client_id !== client_id) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: '刷新令牌不匹配'
          });
        }

        // 生成新的访问令牌
        const payload = {
          sub: decoded.sub,
          aud: client_id,
          iss: 'https://sso.example.com',
          scope: 'openid profile email'
        };

        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        res.json({
          access_token: newAccessToken,
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'openid profile email'
        });
      } catch (error) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: '无效的刷新令牌'
        });
      }
    } else {
      res.status(400).json({
        error: 'unsupported_grant_type',
        error_description: '不支持的授权类型'
      });
    }
  } catch (error) {
    console.error('OAuth token error:', error);
    res.status(500).json({
      error: 'server_error',
      error_description: '服务器内部错误'
    });
  }
});

// 用户信息端点
router.get('/userinfo', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: '缺少访问令牌'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Mock用户信息
    const userInfo = {
      sub: decoded.sub,
      name: '系统管理员',
      email: 'admin@example.com',
      picture: 'https://via.placeholder.com/150',
      preferred_username: 'admin'
    };

    res.json(userInfo);
  } catch (error) {
    res.status(401).json({
      error: 'invalid_token',
      error_description: '无效的访问令牌'
    });
  }
});

// OIDC发现端点
router.get('/.well-known/openid_configuration', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    userinfo_endpoint: `${baseUrl}/api/oauth/userinfo`,
    jwks_uri: `${baseUrl}/api/oauth/jwks`,
    response_types_supported: ['code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['HS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    claims_supported: ['sub', 'name', 'email', 'picture', 'preferred_username']
  });
});

export default router;