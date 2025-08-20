/**
 * JWT 工具类
 * 处理JWT令牌的解析、验证、刷新等功能
 */

export interface JWTPayload {
  sub: string // 用户ID
  username?: string
  email: string
  display_name?: string
  name: string
  avatar?: string
  roles: string[]
  permissions?: string[]
  status?: string
  created_at?: string
  updated_at?: string
  last_login?: string
  iat: number // 签发时间
  exp: number // 过期时间
  iss: string // 签发者
  aud: string // 受众
}

/**
 * 解析JWT令牌
 * @param token JWT令牌
 * @returns 解析后的payload或null
 */
export function parseJWT(token: string): JWTPayload | null {
  try {
    // JWT由三部分组成：header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // 解码payload部分（Base64URL编码）
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JWTPayload
  } catch (error) {
    console.error('JWT解析失败:', error)
    return null
  }
}

/**
 * 检查JWT令牌是否过期
 * @param token JWT令牌
 * @returns 是否过期
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token)
  if (!payload) {
    return true
  }

  // 检查过期时间（exp是秒级时间戳）
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * 检查JWT令牌是否即将过期（5分钟内）
 * @param token JWT令牌
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(token: string): boolean {
  const payload = parseJWT(token)
  if (!payload) {
    return true
  }

  // 检查是否在5分钟内过期
  const currentTime = Math.floor(Date.now() / 1000)
  const fiveMinutes = 5 * 60
  return payload.exp - currentTime < fiveMinutes
}

/**
 * 获取令牌剩余有效时间（秒）
 * @param token JWT令牌
 * @returns 剩余秒数，-1表示已过期或无效
 */
export function getTokenRemainingTime(token: string): number {
  const payload = parseJWT(token)
  if (!payload) {
    return -1
  }

  const currentTime = Math.floor(Date.now() / 1000)
  const remainingTime = payload.exp - currentTime
  return remainingTime > 0 ? remainingTime : -1
}

/**
 * 验证JWT令牌格式
 * @param token 待验证的令牌
 * @returns 是否为有效格式
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  // JWT应该有三个部分，用点分隔
  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  // 每个部分都应该是Base64URL编码的字符串
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/
  return parts.every(part => base64UrlRegex.test(part))
}

/**
 * 从令牌中提取用户信息
 * @param token JWT令牌
 * @returns 用户信息或null
 */
export function extractUserFromToken(token: string): {
  id: string
  username: string
  email: string
  display_name: string
  name: string
  avatar?: string
  roles: string[]
  permissions?: string[]
  status?: string
  created_at?: string
  updated_at?: string
  last_login?: string
} | null {
  const payload = parseJWT(token)
  if (!payload) {
    return null
  }

  return {
    id: payload.sub,
    username: payload.username || payload.name || payload.email,
    email: payload.email,
    display_name: payload.display_name || payload.name || payload.username || payload.email,
    name: payload.name,
    avatar: payload.avatar,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
    status: payload.status || 'active',
    created_at: payload.created_at,
    updated_at: payload.updated_at,
    last_login: payload.last_login
  }
}

/**
 * 检查用户是否具有指定角色
 * @param token JWT令牌
 * @param role 角色名称
 * @returns 是否具有该角色
 */
export function hasRole(token: string, role: string): boolean {
  const payload = parseJWT(token)
  if (!payload || !payload.roles) {
    return false
  }

  return payload.roles.includes(role)
}

/**
 * 检查用户是否具有任一指定角色
 * @param token JWT令牌
 * @param roles 角色名称数组
 * @returns 是否具有任一角色
 */
export function hasAnyRole(token: string, roles: string[]): boolean {
  const payload = parseJWT(token)
  if (!payload || !payload.roles) {
    return false
  }

  return roles.some(role => payload.roles.includes(role))
}

/**
 * 检查用户是否具有所有指定角色
 * @param token JWT令牌
 * @param roles 角色名称数组
 * @returns 是否具有所有角色
 */
export function hasAllRoles(token: string, roles: string[]): boolean {
  const payload = parseJWT(token)
  if (!payload || !payload.roles) {
    return false
  }

  return roles.every(role => payload.roles.includes(role))
}

/**
 * 格式化令牌过期时间
 * @param token JWT令牌
 * @returns 格式化的过期时间字符串
 */
export function formatTokenExpiration(token: string): string {
  const payload = parseJWT(token)
  if (!payload) {
    return '无效令牌'
  }

  const expDate = new Date(payload.exp * 1000)
  return expDate.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 令牌自动刷新管理器
 */
export class TokenRefreshManager {
  private refreshTimer: number | null = null
  private refreshCallback: (() => Promise<void>) | null = null

  /**
   * 设置自动刷新
   * @param token 当前令牌
   * @param refreshCallback 刷新回调函数
   */
  setAutoRefresh(token: string, refreshCallback: () => Promise<void>) {
    this.clearAutoRefresh()
    this.refreshCallback = refreshCallback

    const remainingTime = getTokenRemainingTime(token)
    if (remainingTime > 0) {
      // 在令牌过期前5分钟刷新
      const refreshTime = Math.max(remainingTime - 300, 60) * 1000 // 至少1分钟后刷新
      
      this.refreshTimer = window.setTimeout(async () => {
        try {
          await this.refreshCallback!()
        } catch (error) {
          console.error('自动刷新令牌失败:', error)
        }
      }, refreshTime)
    }
  }

  /**
   * 清除自动刷新
   */
  clearAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    this.refreshCallback = null
  }

  /**
   * 立即刷新令牌
   */
  async refreshNow() {
    if (this.refreshCallback) {
      try {
        await this.refreshCallback()
      } catch (error) {
        console.error('手动刷新令牌失败:', error)
        throw error
      }
    }
  }
}

// 全局令牌刷新管理器实例
export const tokenRefreshManager = new TokenRefreshManager()