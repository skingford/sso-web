import express from 'express';
import crypto from 'crypto';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { generateClientCredentials, generateConfirmationCode, validateCredentialsFormat } from '../utils/credentials.js';
import { logAuditEvent } from './audit.js';
import { sensitiveOperationRateLimit, apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Mock数据存储
const mockCredentials: any[] = [];

// 模拟确认码存储（实际应用中应使用Redis等缓存）
const confirmationCodes = new Map();

// 生成确认码（用于敏感操作）
router.post('/generate-confirmation-code', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { operation, app_id } = req.body;
    
    if (!operation || !app_id) {
      return res.status(400).json({
        success: false,
        message: '操作类型和应用ID不能为空'
      });
    }
    
    const code = generateConfirmationCode(6);
    const codeId = `${req.user.id}_${app_id}_${operation}_${Date.now()}`;
    
    // 存储确认码，5分钟过期
    confirmationCodes.set(codeId, {
      code,
      user_id: req.user.id,
      app_id,
      operation,
      expires_at: Date.now() + 5 * 60 * 1000, // 5分钟
      created_at: Date.now()
    });
    
    // 模拟发送确认码（实际应用中通过短信/邮件发送）
    console.log(`[SECURITY] Confirmation code generated for user ${req.user.id}: ${code}`);
    
    res.json({
      success: true,
      data: {
        code_id: codeId,
        expires_in: 300, // 5分钟
        // 在开发环境下返回确认码，生产环境不应返回
        confirmation_code: process.env.NODE_ENV === 'development' ? code : undefined
      },
      message: '确认码已生成，请查收短信或邮件'
    });
  } catch (error) {
    console.error('Generate confirmation code error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 验证确认码
router.post('/verify-confirmation-code', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { code_id, confirmation_code } = req.body;
    
    if (!code_id || !confirmation_code) {
      return res.status(400).json({
        success: false,
        message: '确认码ID和确认码不能为空'
      });
    }
    
    const storedCode = confirmationCodes.get(code_id);
    if (!storedCode) {
      return res.status(404).json({
        success: false,
        message: '确认码不存在或已过期'
      });
    }
    
    // 检查过期时间
    if (storedCode.expires_at < Date.now()) {
      confirmationCodes.delete(code_id);
      return res.status(400).json({
        success: false,
        message: '确认码已过期'
      });
    }
    
    // 验证用户ID
    if (storedCode.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权验证此确认码'
      });
    }
    
    // 验证确认码
    if (storedCode.code !== confirmation_code) {
      return res.status(400).json({
        success: false,
        message: '确认码错误'
      });
    }
    
    // 验证成功，删除确认码
    confirmationCodes.delete(code_id);
    
    res.json({
      success: true,
      data: {
        app_id: storedCode.app_id,
        operation: storedCode.operation,
        verified_at: new Date().toISOString()
      },
      message: '确认码验证成功'
    });
  } catch (error) {
    console.error('Verify confirmation code error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 生成新的客户端凭据
router.post('/generate', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { app_name, scopes = [] } = req.body;
    
    if (!app_name) {
      return res.status(400).json({
        success: false,
        message: '应用名称不能为空'
      });
    }
    
    const { clientId, clientSecret } = generateClientCredentials();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1年后过期
    
    const newCredential = {
      id: crypto.randomUUID(),
      client_id: clientId,
      client_secret: clientSecret,
      app_name,
      scopes,
      is_active: true,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      created_by: req.user.id
    };
    
    // 存储凭据信息
    mockCredentials.push(newCredential);
    
    // 记录凭据生成事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'credentials:generate',
      resource_type: 'credentials',
      resource_id: newCredential.id,
      details: {
        client_id: clientId,
        app_name: app_name,
        expires_at: expiresAt,
        scopes: scopes
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });

    res.status(201).json({
      success: true,
      message: '客户端凭据生成成功',
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        expires_at: expiresAt,
        created_at: newCredential.created_at
      }
    });
  } catch (error) {
    console.error('Generate credentials error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取凭据列表
router.get('/', authenticateToken, requireAdmin, apiRateLimit, (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let filteredCredentials = mockCredentials;
    if (status === 'active') {
      filteredCredentials = mockCredentials.filter(c => c.is_active);
    } else if (status === 'inactive') {
      filteredCredentials = mockCredentials.filter(c => !c.is_active);
    }
    
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedCredentials = filteredCredentials.slice(startIndex, endIndex);
    
    // 不返回敏感信息
    const safeCredentials = paginatedCredentials.map(c => ({
      id: c.id,
      client_id: c.client_id,
      app_name: c.app_name,
      scopes: c.scopes,
      is_active: c.is_active,
      expires_at: c.expires_at,
      created_at: c.created_at,
      revoked_at: c.revoked_at
    }));
    
    res.json({
      success: true,
      data: {
        credentials: safeCredentials,
        pagination: {
          current_page: parseInt(page as string),
        per_page: parseInt(limit as string),
        total: filteredCredentials.length,
        total_pages: Math.ceil(filteredCredentials.length / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取单个凭据详情
router.get('/:id', authenticateToken, requireAdmin, apiRateLimit, (req, res) => {
  try {
    const { id } = req.params;
    const credential = mockCredentials.find(c => c.id === id);
    
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: '凭据不存在'
      });
    }
    
    // 不返回客户端密钥
    const safeCredential = {
      id: credential.id,
      client_id: credential.client_id,
      app_name: credential.app_name,
      scopes: credential.scopes,
      is_active: credential.is_active,
      expires_at: credential.expires_at,
      created_at: credential.created_at,
      updated_at: credential.updated_at,
      revoked_at: credential.revoked_at,
      revoked_by: credential.revoked_by
    };
    
    res.json({
      success: true,
      data: safeCredential
    });
  } catch (error) {
    console.error('Get credential error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 撤销凭据
router.delete('/:id', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const credential = mockCredentials.find(c => c.id === id);
    
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: '凭据不存在'
      });
    }
    
    if (!credential.is_active) {
      return res.status(400).json({
        success: false,
        message: '凭据已被撤销'
      });
    }
    
    // 记录撤销前的凭据信息
    const revokedCredential = { ...credential };
    
    // 标记为已撤销
    credential.is_active = false;
    credential.revoked_at = new Date().toISOString();
    credential.revoked_by = req.user.id;
    
    // 记录凭据撤销事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'credentials:revoke',
      resource_type: 'credentials',
      resource_id: credential.id,
      details: {
        client_id: revokedCredential.client_id,
        app_name: revokedCredential.app_name,
        revoked_credential: revokedCredential
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: '凭据撤销成功'
    });
  } catch (error) {
    console.error('Revoke credential error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 重新生成客户端密钥
router.post('/:id/regenerate', authenticateToken, requireAdmin, sensitiveOperationRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const credential = mockCredentials.find(c => c.id === id);
    
    if (!credential) {
      return res.status(404).json({
        success: false,
        message: '凭据不存在'
      });
    }
    
    if (!credential.is_active) {
      return res.status(400).json({
        success: false,
        message: '无法为已撤销的凭据重新生成密钥'
      });
    }
    
    // 生成新的客户端密钥
    const newClientSecret = crypto.randomBytes(32).toString('hex');
    const oldSecret = credential.client_secret;
    
    // 更新凭据
    credential.client_secret = newClientSecret;
    credential.updated_at = new Date().toISOString();
    
    // 记录密钥重新生成事件
    logAuditEvent({
      user_id: req.user?.id,
      username: req.user?.username || 'unknown',
      action: 'credentials:regenerate_secret',
      resource_type: 'credentials',
      resource_id: credential.id,
      details: {
        client_id: credential.client_id,
        app_name: credential.app_name,
        old_secret_preview: oldSecret.substring(0, 8) + '***',
        new_secret_preview: newClientSecret.substring(0, 8) + '***'
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      status: 'success'
    });

    res.json({
      success: true,
      message: '客户端密钥重新生成成功',
      data: {
        client_id: credential.client_id,
        client_secret: newClientSecret,
        old_secret_preview: oldSecret.substring(0, 8) + '***',
        regenerated_at: credential.updated_at
      }
    });
  } catch (error) {
    console.error('Regenerate secret error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 批量生成客户端凭据
router.post('/batch-generate', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { count = 1, prefix = 'app' } = req.body;
    
    if (count < 1 || count > 10) {
      return res.status(400).json({
        success: false,
        message: '批量生成数量必须在1-10之间'
      });
    }
    
    const credentials = [];
    for (let i = 0; i < count; i++) {
      const { clientId, clientSecret } = generateClientCredentials();
      credentials.push({
        client_id: clientId,
        client_secret: clientSecret,
        generated_at: new Date().toISOString()
      });
    }
    
    // 记录安全日志
    console.log(`[SECURITY] Batch credentials generated by user ${req.user.id}: ${count} pairs`);
    
    res.json({
      success: true,
      data: {
        credentials,
        count: credentials.length
      },
      message: `成功生成 ${credentials.length} 对客户端凭据`
    });
  } catch (error) {
    console.error('Batch generate credentials error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 验证凭据格式
router.post('/validate-format', (req, res) => {
  try {
    const { client_id, client_secret } = req.body;
    
    if (!client_id || !client_secret) {
      return res.status(400).json({
        success: false,
        message: '客户端ID和密钥不能为空'
      });
    }
    
    const isValid = validateCredentialsFormat(client_id, client_secret);
    
    res.json({
      success: true,
      data: {
        is_valid: isValid,
        client_id_format: 'app_[12位十六进制字符]',
        client_secret_format: '[64位十六进制字符]'
      },
      message: isValid ? '凭据格式有效' : '凭据格式无效'
    });
  } catch (error) {
    console.error('Validate format error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取凭据安全策略
router.get('/security-policy', authenticateToken, (req, res) => {
  try {
    const policy = {
      client_id: {
        format: 'app_[12位十六进制字符]',
        example: 'app_1a2b3c4d5e6f',
        length: 16
      },
      client_secret: {
        format: '[64位十六进制字符]',
        length: 64,
        entropy: '256位'
      },
      security_requirements: {
        confirmation_code_required: true,
        confirmation_code_expires_in: 300, // 5分钟
        admin_permission_required: true,
        audit_logging: true
      },
      best_practices: [
        '客户端密钥应安全存储，不得明文保存',
        '定期轮换客户端密钥',
        '使用HTTPS传输凭据',
        '限制客户端密钥的访问权限',
        '监控异常的凭据使用行为'
      ]
    };
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Get security policy error:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 清理过期的确认码
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of confirmationCodes.entries()) {
    if (value.expires_at < now) {
      confirmationCodes.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

export default router;