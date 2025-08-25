import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Mock数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    display_name: '系统管理员',
    phone: '13800138000',
    roles: ['admin'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: null
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    display_name: '普通用户',
    phone: '13800138001',
    roles: ['user'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-01-15T10:30:00Z'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// 验证码存储（生产环境应使用Redis等缓存）
const captchaStore = new Map<string, { answer: string; expires: number }>();

// 生成JWT令牌
const generateTokens = (user: any) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.roles
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  
  return { accessToken, refreshToken };
};

// 生成随机数学表达式
const generateMathExpression = () => {
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
  const expression = `${num1} + ${num2}`;
  const answer = num1 + num2;
  return { expression, answer: answer.toString() };
};

// 生成数学验证码
router.get('/captcha', (req, res) => {
  try {
    // 生成数学表达式
    const { expression, answer } = generateMathExpression();
    
    // 生成唯一ID
    const captchaId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // 存储验证码答案（5分钟过期）
    captchaStore.set(captchaId, {
      answer: answer,
      expires: Date.now() + 5 * 60 * 1000
    });
    
    // 清理过期的验证码
    const now = Date.now();
    for (const [key, value] of captchaStore.entries()) {
      if (value.expires < now) {
        captchaStore.delete(key);
      }
    }
    
    res.json({
      success: true,
      captcha_id: captchaId,
      expression: expression,
      answer: answer // 仅用于开发调试，生产环境应移除
    });
  } catch (error) {
    console.error('Captcha generation error:', error);
    res.status(500).json({
      success: false,
      message: '验证码生成失败'
    });
  }
});

// 验证验证码
router.post('/verify-captcha', (req, res) => {
  try {
    const { captcha_id, captcha_answer } = req.body;
    
    if (!captcha_id || !captcha_answer) {
      return res.status(400).json({
        success: false,
        message: '验证码ID和答案不能为空'
      });
    }
    
    const storedCaptcha = captchaStore.get(captcha_id);
    
    if (!storedCaptcha) {
      return res.status(400).json({
        success: false,
        message: '验证码不存在或已过期'
      });
    }
    
    if (storedCaptcha.expires < Date.now()) {
      captchaStore.delete(captcha_id);
      return res.status(400).json({
        success: false,
        message: '验证码已过期'
      });
    }
    
    if (storedCaptcha.answer !== captcha_answer.toString()) {
      return res.status(400).json({
        success: false,
        message: '验证码答案错误'
      });
    }
    
    // 验证成功后删除验证码
    captchaStore.delete(captcha_id);
    
    res.json({
      success: true,
      message: '验证码验证成功'
    });
  } catch (error) {
    console.error('Captcha verification error:', error);
    res.status(500).json({
      success: false,
      message: '验证码验证失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password, remember, mfa_code, client_id, captcha_id, captcha_answer } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
    
    // 验证验证码（如果提供了验证码信息）
    if (captcha_id && captcha_answer) {
      const storedCaptcha = captchaStore.get(captcha_id);
      
      if (!storedCaptcha) {
        return res.status(400).json({
          success: false,
          message: '验证码不存在或已过期'
        });
      }
      
      if (storedCaptcha.expires < Date.now()) {
        captchaStore.delete(captcha_id);
        return res.status(400).json({
          success: false,
          message: '验证码已过期'
        });
      }
      
      if (storedCaptcha.answer !== captcha_answer.toString()) {
        return res.status(400).json({
          success: false,
          message: '验证码答案错误'
        });
      }
      
      // 验证成功后删除验证码
      captchaStore.delete(captcha_id);
    }
    
    // 查找用户
    const user = mockUsers.find(u => 
      u.username === username || u.email === username
    );
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 检查用户状态
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用'
      });
    }
    
    // 生成令牌
    const { accessToken, refreshToken } = generateTokens(user);
    
    // 更新最后登录时间
    user.last_login = new Date().toISOString();
    
    res.json({
      success: true,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 86400, // 24小时
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        roles: user.roles
      },
      requires_mfa: false
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 令牌验证
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        valid: false,
        message: '令牌不能为空'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        roles: decoded.roles
      },
      expires_at: new Date(decoded.exp * 1000).toISOString()
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      message: '令牌无效或已过期'
    });
  }
});

// 令牌刷新
router.post('/refresh', (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: '刷新令牌不能为空'
      });
    }
    
    const decoded = jwt.verify(refresh_token, JWT_SECRET) as any;
    const user = mockUsers.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const { accessToken } = generateTokens(user);
    
    res.json({
      success: true,
      access_token: accessToken,
      expires_in: 86400
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '刷新令牌无效或已过期'
    });
  }
});

// 用户登出
router.post('/logout', (req, res) => {
  try {
    const { token, all_devices } = req.body;
    
    res.json({
      success: true,
      message: all_devices ? '已从所有设备登出' : '登出成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登出失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = mockUsers.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        phone: user.phone,
        roles: user.roles,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '令牌无效或已过期'
    });
  }
});

export default router;