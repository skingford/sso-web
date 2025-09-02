import crypto from 'crypto';

/**
 * 生成安全的客户端凭据
 * @returns {object} 包含clientId和clientSecret的对象
 */
export const generateClientCredentials = () => {
  // 生成客户端ID：app_ + 12位随机字符
  const clientId = 'app_' + crypto.randomBytes(6).toString('hex');
  
  // 生成客户端密钥：64位随机字符
  const clientSecret = crypto.randomBytes(32).toString('hex');
  
  return { clientId, clientSecret };
};

/**
 * 生成API密钥
 * @param {string} prefix - 密钥前缀
 * @returns {string} API密钥
 */
export const generateApiKey = (prefix: string = 'sk') => {
  const randomPart = crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');
  return `${prefix}_${randomPart}`;
};

/**
 * 生成访问令牌
 * @param {number} length - 令牌长度（字节数）
 * @returns {string} 访问令牌
 */
export const generateAccessToken = (length: number = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * 生成刷新令牌
 * @param {number} length - 令牌长度（字节数）
 * @returns {string} 刷新令牌
 */
export const generateRefreshToken = (length: number = 48) => {
  return crypto.randomBytes(length).toString('base64url');
};

/**
 * 生成授权码
 * @returns {string} 授权码
 */
export const generateAuthorizationCode = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * 生成状态参数（用于CSRF保护）
 * @returns {string} 状态参数
 */
export const generateState = () => {
  return crypto.randomBytes(16).toString('base64url');
};

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @param {string} charset - 字符集
 * @returns {string} 随机字符串
 */
export const generateRandomString = (length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  const bytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  
  return result;
};

/**
 * 验证客户端凭据格式
 * @param {string} clientId - 客户端ID
 * @param {string} clientSecret - 客户端密钥
 * @returns {boolean} 是否有效
 */
export const validateCredentialsFormat = (clientId: string, clientSecret: string) => {
  // 客户端ID格式：app_开头，后跟12位十六进制字符
  const clientIdPattern = /^app_[a-f0-9]{12}$/;
  
  // 客户端密钥格式：64位十六进制字符
  const clientSecretPattern = /^[a-f0-9]{64}$/;
  
  return clientIdPattern.test(clientId) && clientSecretPattern.test(clientSecret);
};

/**
 * 生成确认码（用于敏感操作）
 * @param {number} length - 确认码长度
 * @returns {string} 确认码
 */
export const generateConfirmationCode = (length: number = 6) => {
  const digits = '0123456789';
  return generateRandomString(length, digits);
};

/**
 * 哈希密钥（用于存储）
 * @param {string} secret - 原始密钥
 * @returns {string} 哈希后的密钥
 */
export const hashSecret = (secret: string) => {
  return crypto.createHash('sha256').update(secret).digest('hex');
};

/**
 * 验证密钥
 * @param {string} secret - 原始密钥
 * @param {string} hash - 哈希值
 * @returns {boolean} 是否匹配
 */
export const verifySecret = (secret: string, hash: string) => {
  return hashSecret(secret) === hash;
};