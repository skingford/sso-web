# SSO单点登录系统技术架构文档

## 1. Architecture design

```mermaid
graph TD
    A[用户浏览器] --> B[Vue3前端应用]
    A --> C[客户端应用]
    B --> D[API网关 Kong/Nginx]
    C --> D
    D --> E[统一认证中心]
    D --> F[身份提供商网关]
    D --> G[应用管理平台]
    E --> H[Supabase数据库]
    E --> I[Redis缓存]
    F --> J[微信API]
    F --> K[钉钉API]
    F --> L[飞书API]
    F --> M[其他第三方身份源]
    G --> H
    D --> N[审计日志服务]
    N --> O[日志数据库 ClickHouse]

    subgraph "前端层"
        B
        subgraph "客户端应用"
            C
        end
    end

    subgraph "API网关层"
        D
    end

    subgraph "核心服务层"
        E
        F
        G
        N
    end

    subgraph "数据层"
        H
        I
        O
    end

    subgraph "外部身份源"
        J
        K
        L
        M
    end
```

## 2. Technology Description

### 2.1 前端技术栈
* Frontend: Vue@3 + TypeScript + Element Plus + Vite
* 状态管理: Pinia
* 路由管理: Vue Router 4
* HTTP客户端: Axios

### 2.2 核心服务技术栈
* **统一认证中心**: Express@4 + TypeScript + Passport.js + jsonwebtoken
* **身份提供商网关**: Express@4 + TypeScript + OAuth 2.0 SDK
* **应用管理平台**: Express@4 + TypeScript + RBAC权限模型
* **API网关**: Kong Gateway / Nginx + Lua
* **审计日志服务**: Express@4 + TypeScript + Winston

### 2.3 数据存储技术栈
* **主数据库**: Supabase (PostgreSQL)
* **缓存层**: Redis@7 (会话、令牌缓存)
* **日志数据库**: ClickHouse (审计日志、行为分析)
* **消息队列**: Redis Pub/Sub (服务间通信)

### 2.4 认证协议与安全
* **认证协议**: OAuth 2.0 + OpenID Connect + SAML 2.0
* **令牌标准**: JWT (Access Token) + Refresh Token
* **加密算法**: RS256 (JWT签名) + AES-256 (敏感数据加密)
* **安全防护**: CSRF防护 + XSS防护 + 请求限流

## 3. Route definitions

### 3.1 前端路由

| Route                    | Purpose                |
| ------------------------ | ---------------------- |
| /login                   | SSO统一登录页面              |
| /dashboard               | 用户控制台，显示可访问的应用列表       |
| /profile                 | 个人信息管理页面               |
| /admin                   | 系统管理后台入口               |
| /admin/users             | 用户管理页面                 |
| /admin/apps              | 应用管理页面                 |
| /admin/roles             | 权限角色管理页面               |
| /admin/providers         | 身份提供商管理页面              |
| /admin/logs              | 审计日志查看页面               |
| /admin/monitoring        | 系统监控和统计页面              |
| /admin/gateway           | API网关配置页面              |

### 3.2 API网关路由

| Route                    | Target Service         | Purpose                |
| ------------------------ | ---------------------- | ---------------------- |
| /api/auth/*              | 统一认证中心               | 认证相关API              |
| /api/oauth/*             | 统一认证中心               | OAuth 2.0协议端点        |
| /api/providers/*         | 身份提供商网关              | 第三方身份源集成API         |
| /api/apps/*              | 应用管理平台               | 应用管理API              |
| /api/users/*             | 应用管理平台               | 用户管理API              |
| /api/roles/*             | 应用管理平台               | 权限管理API              |
| /api/audit/*             | 审计日志服务               | 日志查询和分析API           |

## 4. API definitions

### 4.1 统一认证中心 API

#### 4.1.1 核心认证接口

**用户登录认证**

```
POST /api/auth/login
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| username   | string     | true       | 用户名或邮箱      |
| password   | string     | true       | 用户密码        |
| remember   | boolean    | false      | 是否记住登录状态    |
| mfa_code   | string     | false      | 多因素认证码      |
| client_id  | string     | false      | 客户端应用ID     |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| success    | boolean    | 登录是否成功      |
| access_token | string   | JWT访问令牌     |
| refresh_token | string  | 刷新令牌        |
| expires_in | number     | 令牌过期时间(秒)   |
| user       | object     | 用户基本信息      |
| requires_mfa | boolean  | 是否需要多因素认证  |

**令牌验证**

```
POST /api/auth/verify
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| token      | string     | true       | JWT访问令牌     |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| valid      | boolean    | 令牌是否有效      |
| user       | object     | 用户信息        |
| expires_at | timestamp  | 令牌过期时间      |

**令牌刷新**

```
POST /api/auth/refresh
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| refresh_token | string  | true       | 刷新令牌        |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| access_token | string   | 新的访问令牌      |
| expires_in | number     | 令牌过期时间(秒)   |

**用户登出**

```
POST /api/auth/logout
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| token      | string     | true       | 访问令牌        |
| all_devices | boolean   | false      | 是否登出所有设备    |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| success    | boolean    | 登出是否成功      |

#### 4.1.2 OAuth 2.0/OIDC 协议接口

**授权端点**

```
GET /api/oauth/authorize
```

Request:

| Param Name     | Param Type | isRequired | Description |
| -------------- | ---------- | ---------- | ----------- |
| client_id      | string     | true       | 客户端应用ID     |
| redirect_uri   | string     | true       | 回调地址        |
| response_type  | string     | true       | 响应类型(code/token) |
| scope          | string     | false      | 授权范围        |
| state          | string     | false      | 状态参数        |
| nonce          | string     | false      | OIDC随机数     |
| prompt         | string     | false      | 交互提示(none/login/consent) |

**令牌端点**

```
POST /api/oauth/token
```

Request:

| Param Name     | Param Type | isRequired | Description |
| -------------- | ---------- | ---------- | ----------- |
| grant_type     | string     | true       | 授权类型        |
| code           | string     | true       | 授权码         |
| redirect_uri   | string     | true       | 回调地址        |
| client_id      | string     | true       | 客户端ID       |
| client_secret  | string     | true       | 客户端密钥       |

Response:

| Param Name     | Param Type | Description |
| -------------- | ---------- | ----------- |
| access_token   | string     | 访问令牌        |
| token_type     | string     | 令牌类型(Bearer) |
| expires_in     | number     | 过期时间(秒)     |
| refresh_token  | string     | 刷新令牌        |
| id_token       | string     | OIDC身份令牌    |
| scope          | string     | 授权范围        |

**用户信息端点**

```
GET /api/oauth/userinfo
```

Headers:

| Header Name   | Value |
| ------------- | ----- |
| Authorization | Bearer {access_token} |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| sub        | string     | 用户唯一标识      |
| name       | string     | 用户姓名        |
| email      | string     | 用户邮箱        |
| picture    | string     | 用户头像URL     |
| preferred_username | string | 用户名    |

### 4.2 身份提供商网关 API

#### 4.2.1 第三方身份源管理

**获取支持的身份提供商**

```
GET /api/providers
```

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| providers  | array      | 身份提供商列表     |

Example:
```json
{
  "providers": [
    {
      "key": "wechat",
      "name": "微信登录",
      "type": "oauth2",
      "isActive": true,
      "icon": "wechat-icon.svg"
    },
    {
      "key": "dingtalk",
      "name": "钉钉登录",
      "type": "oauth2",
      "isActive": true,
      "icon": "dingtalk-icon.svg"
    }
  ]
}
```

**配置身份提供商**

```
POST /api/providers/{provider_key}/config
```

Request:

| Param Name    | Param Type | isRequired | Description |
| ------------- | ---------- | ---------- | ----------- |
| client_id     | string     | true       | 第三方应用ID     |
| client_secret | string     | true       | 第三方应用密钥     |
| scope         | string     | false      | 授权范围        |
| is_active     | boolean    | false      | 是否启用        |

**第三方登录授权**

```
GET /api/providers/{provider_key}/authorize
```

Request:

| Param Name    | Param Type | isRequired | Description |
| ------------- | ---------- | ---------- | ----------- |
| redirect_uri  | string     | false      | 登录成功后重定向地址  |
| state         | string     | false      | 状态参数        |
| client_id     | string     | false      | SSO客户端ID    |

Response:

| Param Name    | Param Type | Description |
| ------------- | ---------- | ----------- |
| authorize_url | string     | 第三方授权页面URL |
| state         | string     | 状态参数        |

**第三方登录回调**

```
POST /api/providers/{provider_key}/callback
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| code       | string     | true       | 第三方授权码      |
| state      | string     | true       | 状态参数        |

Response:

| Param Name   | Param Type | Description |
| ------------ | ---------- | ----------- |
| success      | boolean    | 登录是否成功      |
| access_token | string     | SSO访问令牌     |
| user         | object     | 用户信息        |
| is_new_user  | boolean    | 是否为新用户      |
| redirect_url | string     | 重定向地址       |

#### 4.2.2 LDAP/AD 集成

**LDAP连接测试**

```
POST /api/providers/ldap/test
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| server_url | string     | true       | LDAP服务器地址   |
| bind_dn    | string     | true       | 绑定DN        |
| bind_password | string  | true       | 绑定密码        |
| base_dn    | string     | true       | 搜索基础DN      |

**LDAP用户同步**

```
POST /api/providers/ldap/sync
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| full_sync  | boolean    | false      | 是否全量同步      |
| ou_filter  | string     | false      | 组织单位过滤器     |

### 4.3 应用管理平台 API

#### 4.3.1 应用管理

**创建应用**

```
POST /api/apps
```

Request:

| Param Name     | Param Type | isRequired | Description |
| -------------- | ---------- | ---------- | ----------- |
| name           | string     | true       | 应用名称        |
| description    | string     | false      | 应用描述        |
| homepage_url   | string     | false      | 应用主页URL     |
| logo_url       | string     | false      | 应用图标URL     |
| redirect_uris  | array      | true       | 回调地址列表      |
| scopes         | array      | false      | 支持的授权范围     |
| grant_types    | array      | false      | 支持的授权类型     |

Response:

| Param Name    | Param Type | Description |
| ------------- | ---------- | ----------- |
| id            | string     | 应用ID        |
| client_id     | string     | 客户端ID      |
| client_secret | string     | 客户端密钥       |

**获取应用列表**

```
GET /api/apps
```

Query Parameters:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| page       | number     | false      | 页码(默认1)     |
| limit      | number     | false      | 每页数量(默认20)  |
| search     | string     | false      | 搜索关键词       |
| is_active  | boolean    | false      | 是否启用        |

#### 4.3.2 用户管理

**创建用户**

```
POST /api/users
```

Request:

| Param Name   | Param Type | isRequired | Description |
| ------------ | ---------- | ---------- | ----------- |
| username     | string     | true       | 用户名         |
| email        | string     | true       | 邮箱地址        |
| password     | string     | true       | 初始密码        |
| display_name | string     | false      | 显示名称        |
| phone        | string     | false      | 手机号码        |
| roles        | array      | false      | 用户角色列表      |

**批量导入用户**

```
POST /api/users/import
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| users      | array      | true       | 用户数据列表      |
| notify     | boolean    | false      | 是否发送通知邮件    |

#### 4.3.3 权限管理

**创建角色**

```
POST /api/roles
```

Request:

| Param Name  | Param Type | isRequired | Description |
| ----------- | ---------- | ---------- | ----------- |
| name        | string     | true       | 角色名称        |
| description | string     | false      | 角色描述        |
| permissions | array      | false      | 权限列表        |

**分配用户权限**

```
POST /api/users/{user_id}/roles
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| role_ids   | array      | true       | 角色ID列表      |

### 4.4 API网关管理 API

#### 4.4.1 路由管理

**创建API路由**

```
POST /api/gateway/routes
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| name       | string     | true       | 路由名称        |
| path       | string     | true       | 路由路径        |
| methods    | array      | true       | HTTP方法列表    |
| service_url | string    | true       | 后端服务地址      |
| auth_required | boolean | false      | 是否需要认证      |
| rate_limit | object     | false      | 限流配置        |

**配置限流策略**

```
POST /api/gateway/rate-limits
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| name       | string     | true       | 策略名称        |
| requests   | number     | true       | 请求次数限制      |
| window     | number     | true       | 时间窗口(秒)     |
| scope      | string     | true       | 限流范围(ip/user/global) |

#### 4.4.2 服务发现

**注册服务**

```
POST /api/gateway/services
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| name       | string     | true       | 服务名称        |
| url        | string     | true       | 服务地址        |
| health_check | object   | false      | 健康检查配置      |
| weight     | number     | false      | 负载均衡权重      |

### 4.5 审计日志服务 API

#### 4.5.1 日志查询

**查询登录日志**

```
GET /api/audit/login-logs
```

Query Parameters:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| user_id    | string     | false      | 用户ID        |
| start_time | timestamp  | false      | 开始时间        |
| end_time   | timestamp  | false      | 结束时间        |
| success    | boolean    | false      | 是否成功        |
| ip_address | string     | false      | IP地址        |
| page       | number     | false      | 页码          |
| limit      | number     | false      | 每页数量        |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| logs       | array      | 日志记录列表      |
| total      | number     | 总记录数        |
| page       | number     | 当前页码        |
| limit      | number     | 每页数量        |

**查询操作日志**

```
GET /api/audit/operation-logs
```

Query Parameters:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| user_id    | string     | false      | 操作用户ID      |
| resource   | string     | false      | 资源类型        |
| action     | string     | false      | 操作类型        |
| start_time | timestamp  | false      | 开始时间        |
| end_time   | timestamp  | false      | 结束时间        |

#### 4.5.2 统计分析

**登录统计**

```
GET /api/audit/stats/login
```

Query Parameters:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| period     | string     | false      | 统计周期(day/week/month) |
| start_date | date       | false      | 开始日期        |
| end_date   | date       | false      | 结束日期        |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| total_logins | number   | 总登录次数       |
| success_rate | number   | 成功率         |
| unique_users | number   | 独立用户数       |
| daily_stats | array     | 每日统计数据      |

**安全事件统计**

```
GET /api/audit/stats/security
```

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| failed_logins | number  | 失败登录次数      |
| suspicious_ips | array   | 可疑IP列表      |
| blocked_attempts | number | 被阻止的尝试次数   |

#### 4.5.3 告警管理

**创建告警规则**

```
POST /api/audit/alerts
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| name       | string     | true       | 告警规则名称      |
| condition  | object     | true       | 告警条件        |
| threshold  | number     | true       | 阈值          |
| notification | object   | true       | 通知配置        |

Example:
```json
{
  "name": "异常登录告警",
  "condition": {
    "metric": "failed_login_rate",
    "operator": ">",
    "window": "5m"
  },
  "threshold": 10,
  "notification": {
    "email": ["admin@example.com"],
    "webhook": "https://hooks.slack.com/..."
  }
}
```

```
GET /api/auth/{provider}/authorize
```

Request:

| Param Name    | Param Type | isRequired | Description |
| ------------- | ---------- | ---------- | ----------- |
| provider      | string     | true       | 第三方登录提供商标识  |
| redirect\_uri | string     | false      | 登录成功后的自定义重定向地址  |
| state         | string     | false      | 防CSRF攻击的状态参数        |
| client_id     | string     | false      | 客户端应用ID（用于应用间跳转） |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| authorize_url | string  | 第三方授权页面URL |
| state      | string     | 状态参数（用于回调验证） |

```
POST /api/auth/{provider}/callback
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| code       | string     | true       | 第三方授权码      |
| state      | string     | true       | 状态参数（防CSRF）        |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| success    | boolean    | 登录是否成功      |
| token      | string     | JWT访问令牌     |
| user       | object     | 用户基本信息      |
| isNewUser  | boolean    | 是否为新注册用户    |
| redirect_url | string   | 自定义重定向URL |

```
POST /api/auth/redirect/validate
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| redirect_uri | string   | true       | 待验证的重定向URL |
| client_id  | string     | false      | 客户端应用ID |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| valid      | boolean    | URL是否有效 |
| message    | string     | 验证结果说明 |

```
GET /api/auth/session/status
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| session_id | string     | true       | 会话ID |

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| status     | string     | 会话状态(active/expired/invalid) |
| user       | object     | 用户信息（如果已登录） |
| expires_at | timestamp  | 会话过期时间 |

```
POST /api/auth/sms/send
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| phone      | string     | true       | 手机号码        |

```
POST /api/auth/sms/verify
```

Request:

| Param Name | Param Type | isRequired | Description |
| ---------- | ---------- | ---------- | ----------- |
| phone      | string     | true       | 手机号码        |
| code       | string     | true       | 短信验证码       |

```
GET /api/auth/qrcode/generate
```

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| qrcode     | string     | 二维码内容       |
| token      | string     | 二维码令牌       |
| expires    | number     | 过期时间戳       |

```
GET /api/auth/qrcode/status/{token}
```

Response:

| Param Name | Param Type | Description |
| ---------- | ---------- | ----------- |
| status     | string     | 扫码状态(pending/scanned/confirmed/expired) |
| user       | object     | 用户信息(确认后返回) |

## 5. Server architecture diagram

### 5.1 整体微服务架构

```mermaid
graph TD
    A[客户端请求] --> B[API网关 Kong]
    B --> C[统一认证中心]
    B --> D[身份提供商网关]
    B --> E[应用管理平台]
    B --> F[审计日志服务]
    
    C --> G[认证服务层]
    C --> H[令牌服务层]
    C --> I[会话管理层]
    
    D --> J[OAuth适配器]
    D --> K[SAML适配器]
    D --> L[LDAP适配器]
    D --> M[自定义协议适配器]
    
    E --> N[用户管理服务]
    E --> O[应用管理服务]
    E --> P[权限管理服务]
    
    F --> Q[日志收集器]
    F --> R[日志分析器]
    F --> S[告警服务]
    
    G --> T[(Supabase数据库)]
    H --> U[Redis缓存]
    I --> U
    N --> T
    O --> T
    P --> T
    Q --> V[(ClickHouse日志库)]
    R --> V
    
    subgraph "API网关层"
        B
    end
    
    subgraph "统一认证中心"
        C
        G
        H
        I
    end
    
    subgraph "身份提供商网关"
        D
        J
        K
        L
        M
    end
    
    subgraph "应用管理平台"
        E
        N
        O
        P
    end
    
    subgraph "审计日志服务"
        F
        Q
        R
        S
    end
    
    subgraph "数据存储层"
        T
        U
        V
    end
```

### 5.2 统一认证中心内部架构

```mermaid
graph TD
    A[认证请求] --> B[路由层]
    B --> C[认证中间件]
    C --> D[控制器层]
    D --> E[认证服务]
    D --> F[令牌服务]
    D --> G[会话服务]
    
    E --> H[密码验证器]
    E --> I[MFA验证器]
    E --> J[生物识别验证器]
    
    F --> K[JWT生成器]
    F --> L[令牌验证器]
    F --> M[令牌刷新器]
    
    G --> N[会话创建器]
    G --> O[会话验证器]
    G --> P[会话销毁器]
    
    E --> Q[用户仓储]
    F --> R[令牌仓储]
    G --> S[会话仓储]
    
    Q --> T[(用户数据库)]
    R --> U[Redis缓存]
    S --> U
    
    subgraph "统一认证中心"
        B
        C
        D
        E
        F
        G
        H
        I
        J
        K
        L
        M
        N
        O
        P
        Q
        R
        S
    end
```

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    USERS ||--o{ USER_THIRD_PARTY_ACCOUNTS : binds
    USERS ||--o{ AUTH_SESSIONS : creates
    USERS ||--o{ AUTHORIZATION_CODES : owns
    THIRD_PARTY_PROVIDERS ||--o{ USER_THIRD_PARTY_ACCOUNTS : provides
    THIRD_PARTY_PROVIDERS ||--o{ PROVIDER_CONFIGS : configures
    ROLES ||--o{ USER_ROLES : assigned_to
    ROLES ||--o{ ROLE_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : granted_to
    APPLICATIONS ||--o{ USER_APP_ACCESS : accessed_by
    APPLICATIONS ||--o{ REDIRECT_URLS : allows
    USERS ||--o{ USER_APP_ACCESS : accesses
    APPLICATIONS ||--o{ OAUTH_CLIENTS : has
    USERS ||--o{ LOGIN_LOGS : generates
    OAUTH_CLIENTS ||--o{ OAUTH_TOKENS : issues
    OAUTH_CLIENTS ||--o{ AUTHORIZATION_CODES : issues
    USERS ||--o{ OAUTH_TOKENS : owns
    USERS ||--o{ OPERATION_LOGS : performs
    USERS ||--o{ SECURITY_EVENTS : triggers
    API_ROUTES ||--o{ RATE_LIMIT_POLICIES : applies
    ALERT_RULES ||--o{ ALERT_LOGS : generates

    USERS {
        uuid id PK
        string username UK
        string email UK
        string password_hash
        string display_name
        string phone
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login_at
    }
    
    ROLES {
        uuid id PK
        string name UK
        string description
        boolean is_system
        timestamp created_at
    }
    
    PERMISSIONS {
        uuid id PK
        string name UK
        string resource
        string action
        string description
    }
    
    USER_ROLES {
        uuid user_id FK
        uuid role_id FK
        timestamp assigned_at
    }
    
    ROLE_PERMISSIONS {
        uuid role_id FK
        uuid permission_id FK
        timestamp granted_at
    }
    
    APPLICATIONS {
        uuid id PK
        string name UK
        string description
        string homepage_url
        string logo_url
        boolean is_active
        timestamp created_at
    }
    
    OAUTH_CLIENTS {
        uuid id PK
        string client_id UK
        string client_secret
        uuid application_id FK
        json redirect_uris
        json scopes
        string grant_types
        boolean is_active
    }
    
    OAUTH_TOKENS {
        uuid id PK
        string access_token UK
        string refresh_token UK
        uuid user_id FK
        uuid client_id FK
        json scopes
        timestamp expires_at
        timestamp created_at
    }
    
    USER_APP_ACCESS {
        uuid user_id FK
        uuid application_id FK
        timestamp granted_at
        timestamp last_access_at
    }
    
    LOGIN_LOGS {
        uuid id PK
        uuid user_id FK
        string ip_address
        string user_agent
        string login_method
        boolean success
        timestamp created_at
    }
    
    THIRD_PARTY_PROVIDERS {
        uuid id PK
        string provider_key UK
        string provider_name
        string provider_type
        boolean is_active
        timestamp created_at
    }
    
    PROVIDER_CONFIGS {
        uuid id PK
        uuid provider_id FK
        string config_key
        string config_value
        boolean is_encrypted
        timestamp updated_at
    }
    
    USER_THIRD_PARTY_ACCOUNTS {
        uuid id PK
        uuid user_id FK
        uuid provider_id FK
        string third_party_user_id
        string third_party_username
        json user_info
        timestamp bound_at
        timestamp last_login_at
    }
    
    REDIRECT_URLS {
        uuid id PK
        uuid application_id FK
        string url
        boolean is_active
        timestamp created_at
    }
    
    AUTH_SESSIONS {
        uuid id PK
        string session_id UK
        uuid user_id FK
        string provider_key
        string state_token
        string redirect_url
        string status
        timestamp expires_at
        timestamp created_at
    }
    
    AUTHORIZATION_CODES {
        uuid id PK
        string code UK
        uuid user_id FK
        uuid client_id FK
        string redirect_uri
        json scopes
        boolean is_used
        timestamp expires_at
        timestamp created_at
    }
    
    API_ROUTES {
        uuid id PK
        string name UK
        string path
        json methods
        string service_url
        boolean auth_required
        json rate_limit_config
        boolean is_active
        timestamp created_at
    }
    
    RATE_LIMIT_POLICIES {
        uuid id PK
        string name UK
        integer requests_limit
        integer window_seconds
        string scope
        boolean is_active
        timestamp created_at
    }
    
    GATEWAY_SERVICES {
        uuid id PK
        string name UK
        string url
        json health_check_config
        integer weight
        string status
        timestamp last_health_check
        timestamp created_at
    }
    
    OPERATION_LOGS {
        uuid id PK
        uuid user_id FK
        string resource_type
        string resource_id
        string action
        json old_data
        json new_data
        string ip_address
        string user_agent
        timestamp created_at
    }
    
    SECURITY_EVENTS {
        uuid id PK
        string event_type
        string severity
        uuid user_id FK
        string ip_address
        json event_data
        string status
        timestamp created_at
    }
    
    ALERT_RULES {
        uuid id PK
        string name UK
        json condition
        number threshold
        json notification_config
        boolean is_active
        timestamp last_triggered
        timestamp created_at
    }
    
    ALERT_LOGS {
        uuid id PK
        uuid rule_id FK
        string status
        json trigger_data
        json notification_result
        timestamp created_at
    }
```

### 6.2 Data Definition Language

用户表 (users)

```sql
-- 创建用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 创建角色表
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建权限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT
);

-- 创建用户角色关联表
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- 创建角色权限关联表
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 创建应用表
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    homepage_url VARCHAR(500),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建OAuth客户端表
CREATE TABLE oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR(100) UNIQUE NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    redirect_uris JSONB NOT NULL,
    scopes JSONB DEFAULT '[]',
    grant_types VARCHAR(100) DEFAULT 'authorization_code',
    is_active BOOLEAN DEFAULT true
);

-- 创建OAuth令牌表
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    access_token VARCHAR(500) UNIQUE NOT NULL,
    refresh_token VARCHAR(500) UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES oauth_clients(id) ON DELETE CASCADE,
    scopes JSONB DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户应用访问表
CREATE TABLE user_app_access (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_access_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, application_id)
);

-- 创建登录日志表
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    login_method VARCHAR(50) DEFAULT 'password',
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建第三方登录提供商表
CREATE TABLE third_party_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_key VARCHAR(50) UNIQUE NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    provider_type VARCHAR(50) NOT NULL, -- oauth, sms, qrcode, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建第三方登录提供商配置表
CREATE TABLE provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES third_party_providers(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, config_key)
);

-- 创建用户第三方账号绑定表
CREATE TABLE user_third_party_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES third_party_providers(id) ON DELETE CASCADE,
    third_party_user_id VARCHAR(255) NOT NULL,
    third_party_username VARCHAR(255),
    user_info JSONB DEFAULT '{}',
    bound_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(provider_id, third_party_user_id)
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_oauth_tokens_access_token ON oauth_tokens(access_token);
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_created_at ON login_logs(created_at DESC);
CREATE INDEX idx_third_party_providers_key ON third_party_providers(provider_key);
CREATE INDEX idx_provider_configs_provider_id ON provider_configs(provider_id);
CREATE INDEX idx_user_third_party_accounts_user_id ON user_third_party_accounts(user_id);
CREATE INDEX idx_user_third_party_accounts_provider_user ON user_third_party_accounts(provider_id, third_party_user_id);

-- 设置权限
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON roles TO authenticated;
GRANT ALL PRIVILEGES ON permissions TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON role_permissions TO authenticated;
GRANT ALL PRIVILEGES ON applications TO authenticated;
GRANT ALL PRIVILEGES ON oauth_clients TO authenticated;
GRANT ALL PRIVILEGES ON oauth_tokens TO authenticated;
GRANT ALL PRIVILEGES ON user_app_access TO authenticated;
GRANT ALL PRIVILEGES ON login_logs TO authenticated;
GRANT ALL PRIVILEGES ON third_party_providers TO authenticated;
GRANT ALL PRIVILEGES ON provider_configs TO authenticated;
GRANT ALL PRIVILEGES ON user_third_party_accounts TO authenticated;

-- 初始化数据
INSERT INTO roles (name, description, is_system) VALUES
('系统管理员', '拥有系统所有权限', true),
('应用管理员', '管理特定应用的权限', false),
('普通用户', '基础用户权限', false);

INSERT INTO permissions (name, resource, action, description) VALUES
('用户管理', 'users', 'manage', '创建、编辑、删除用户'),
('应用管理', 'applications', 'manage', '管理应用注册和配置'),
('权限管理', 'permissions', 'manage', '分配和管理用户权限'),
('系统监控', 'system', 'monitor', '查看系统日志和监控数据'),
('个人信息', 'profile', 'manage', '管理个人资料和设置'),
('第三方登录管理', 'third_party_providers', 'manage', '管理第三方登录提供商配置');

-- 重定向URL配置表
CREATE TABLE redirect_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 认证会话表
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(128) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_key VARCHAR(50),
    state_token VARCHAR(128) NOT NULL,
    redirect_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 授权码表
CREATE TABLE authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(128) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES oauth_clients(id) ON DELETE CASCADE,
    redirect_uri VARCHAR(500) NOT NULL,
    scopes JSONB DEFAULT '[]',
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API网关路由表
CREATE TABLE api_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    path VARCHAR(500) NOT NULL,
    methods JSONB NOT NULL, -- ["GET", "POST"]
    service_url VARCHAR(500) NOT NULL,
    auth_required BOOLEAN DEFAULT true,
    rate_limit_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 限流策略表
CREATE TABLE rate_limit_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    requests_limit INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('ip', 'user', 'global')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 网关服务表
CREATE TABLE gateway_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    url VARCHAR(500) NOT NULL,
    health_check_config JSONB DEFAULT '{}',
    weight INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'healthy',
    last_health_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 操作日志表
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 安全事件表
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    event_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 告警规则表
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    condition JSONB NOT NULL,
    threshold NUMERIC NOT NULL,
    notification_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 告警日志表
CREATE TABLE alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    trigger_data JSONB DEFAULT '{}',
    notification_result JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_session_id ON auth_sessions(session_id);
CREATE INDEX idx_authorization_codes_code ON authorization_codes(code);
CREATE INDEX idx_authorization_codes_user_id ON authorization_codes(user_id);
CREATE INDEX idx_api_routes_path ON api_routes(path);
CREATE INDEX idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at DESC);
CREATE INDEX idx_operation_logs_resource ON operation_logs(resource_type, resource_id);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_alert_rules_name ON alert_rules(name);
CREATE INDEX idx_alert_logs_rule_id ON alert_logs(rule_id);
CREATE INDEX idx_alert_logs_created_at ON alert_logs(created_at DESC);

-- 设置权限
GRANT ALL PRIVILEGES ON auth_sessions TO authenticated;
GRANT ALL PRIVILEGES ON authorization_codes TO authenticated;
GRANT ALL PRIVILEGES ON api_routes TO authenticated;
GRANT ALL PRIVILEGES ON rate_limit_policies TO authenticated;
GRANT ALL PRIVILEGES ON gateway_services TO authenticated;
GRANT ALL PRIVILEGES ON operation_logs TO authenticated;
GRANT ALL PRIVILEGES ON security_events TO authenticated;
GRANT ALL PRIVILEGES ON alert_rules TO authenticated;
GRANT ALL PRIVILEGES ON alert_logs TO authenticated;

-- 初始化API网关路由数据
INSERT INTO api_routes (name, path, methods, service_url, auth_required) VALUES
('认证服务路由', '/api/auth/*', '["GET", "POST"]', 'http://auth-service:3001', false),
('OAuth服务路由', '/api/oauth/*', '["GET", "POST"]', 'http://auth-service:3001', false),
('身份提供商路由', '/api/providers/*', '["GET", "POST", "PUT", "DELETE"]', 'http://provider-gateway:3002', true),
('应用管理路由', '/api/apps/*', '["GET", "POST", "PUT", "DELETE"]', 'http://app-management:3003', true),
('用户管理路由', '/api/users/*', '["GET", "POST", "PUT", "DELETE"]', 'http://app-management:3003', true),
('权限管理路由', '/api/roles/*', '["GET", "POST", "PUT", "DELETE"]', 'http://app-management:3003', true),
('审计日志路由', '/api/audit/*', '["GET", "POST"]', 'http://audit-service:3004', true),
('网关管理路由', '/api/gateway/*', '["GET", "POST", "PUT", "DELETE"]', 'http://gateway-admin:3005', true);

-- 初始化限流策略
INSERT INTO rate_limit_policies (name, requests_limit, window_seconds, scope) VALUES
('登录限流', 5, 60, 'ip'),
('API通用限流', 100, 60, 'user'),
('管理接口限流', 20, 60, 'user'),
('全局限流', 10000, 60, 'global');

-- 初始化告警规则
INSERT INTO alert_rules (name, condition, threshold, notification_config) VALUES
('登录失败率告警', '{"metric": "failed_login_rate", "operator": ">", "window": "5m"}', 0.1, '{"email": ["admin@example.com"], "webhook": ""}'),
('异常IP告警', '{"metric": "suspicious_ip_count", "operator": ">", "window": "1h"}', 5, '{"email": ["security@example.com"], "webhook": ""}'),
('服务健康检查告警', '{"metric": "service_down_count", "operator": ">", "window": "1m"}', 0, '{"email": ["ops@example.com"], "webhook": ""}');

-- 初始化网关服务
INSERT INTO gateway_services (name, url, health_check_config, weight) VALUES
('统一认证中心', 'http://auth-service:3001', '{"path": "/health", "interval": 30, "timeout": 5}', 100),
('身份提供商网关', 'http://provider-gateway:3002', '{"path": "/health", "interval": 30, "timeout": 5}', 100),
('应用管理平台', 'http://app-management:3003', '{"path": "/health", "interval": 30, "timeout": 5}', 100),
('审计日志服务', 'http://audit-service:3004', '{"path": "/health", "interval": 30, "timeout": 5}', 100);

-- 重定向URL配置表（已存在，补充完整定义）
CREATE TABLE IF NOT EXISTS redirect_urls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

## 7. 部署架构

### 7.1 容器化部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  # API网关
  api-gateway:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - auth-service
      - provider-gateway
      - app-management
      - audit-service
    networks:
      - sso-network

  # 统一认证中心
  auth-service:
    build: ./services/auth-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    networks:
      - sso-network

  # 身份提供商网关
  provider-gateway:
    build: ./services/provider-gateway
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis
    networks:
      - sso-network

  # 应用管理平台
  app-management:
    build: ./services/app-management
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "3003:3003"
    depends_on:
      - postgres
      - redis
    networks:
      - sso-network

  # 审计日志服务
  audit-service:
    build: ./services/audit-service
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - ELASTICSEARCH_URL=${ELASTICSEARCH_URL}
    ports:
      - "3004:3004"
    depends_on:
      - postgres
      - elasticsearch
    networks:
      - sso-network

  # 前端应用
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    networks:
      - sso-network

  # 数据库
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=sso_db
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - sso-network

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sso-network

  # Elasticsearch（日志存储）
  elasticsearch:
    image: elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
    networks:
      - sso-network

  # Kibana（日志分析）
  kibana:
    image: kibana:8.8.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - sso-network

  # Prometheus（监控）
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - sso-network

  # Grafana（监控面板）
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - sso-network

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  prometheus_data:
  grafana_data:

networks:
  sso-network:
    driver: bridge
```

### 7.2 Kubernetes部署

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sso-auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sso-auth-service
  template:
    metadata:
      labels:
        app: sso-auth-service
    spec:
      containers:
      - name: auth-service
        image: sso/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sso-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: sso-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sso-auth-service
spec:
  selector:
    app: sso-auth-service
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

### 7.3 监控和运维

#### 7.3.1 健康检查

```javascript
// 服务健康检查端点
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION,
    checks: {
      database: 'healthy',
      redis: 'healthy',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
  res.json(health);
});
```

#### 7.3.2 日志配置

```javascript
// Winston日志配置
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_URL },
      index: 'sso-logs'
    })
  ]
});
```

#### 7.3.3 性能监控

```javascript
// Prometheus指标收集
const prometheus = require('prom-client');

// 创建指标
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const loginAttempts = new prometheus.Counter({
  name: 'login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['status', 'provider']
});

// 中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});
```

### 7.4 安全配置

#### 7.4.1 SSL/TLS配置

```nginx
# nginx SSL配置
server {
    listen 443 ssl http2;
    server_name sso.example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    location / {
        proxy_pass http://api-gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 7.4.2 环境变量配置

```bash
# .env.production
NODE_ENV=production
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://user:password@postgres:5432/sso_db
REDIS_URL=redis://redis:6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# OAuth配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
DINGTALK_APP_ID=your-dingtalk-app-id
DINGTALK_APP_SECRET=your-dingtalk-app-secret

# 邮件配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=your-smtp-password

# 监控配置
ELASTICSEARCH_URL=http://elasticsearch:9200
PROMETHEUS_URL=http://prometheus:9090

# 安全配置
CORS_ORIGIN=https://app.example.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 7.5 备份和恢复

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="sso_db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
pg_dump -h postgres -U $DB_USER -d $DB_NAME > $BACKUP_DIR/sso_db_$DATE.sql

# Redis备份
redis-cli -h redis --rdb $BACKUP_DIR/redis_$DATE.rdb

# 清理7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "Backup completed: $DATE"
```
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 授权码表
CREATE TABLE authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(128) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
    redirect_uri VARCHAR(500) NOT NULL,
    scopes JSON,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_redirect_urls_application_id ON redirect_urls(application_id);
CREATE INDEX idx_redirect_urls_active ON redirect_urls(is_active);
CREATE INDEX idx_auth_sessions_session_id ON auth_sessions(session_id);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX idx_authorization_codes_code ON authorization_codes(code);
CREATE INDEX idx_authorization_codes_user_id ON authorization_codes(user_id);
CREATE INDEX idx_authorization_codes_client_id ON authorization_codes(client_id);
CREATE INDEX idx_authorization_codes_expires_at ON authorization_codes(expires_at);

-- 初始化第三方登录提供商
INSERT INTO third_party_providers (provider_key, provider_name, provider_type, is_active) VALUES
('wechat', '微信登录', 'oauth', true),
('wechat_work', '企业微信', 'oauth', false),
('alipay', '支付宝登录', 'oauth', true),
('sms', '手机号登录', 'sms', false),
('qrcode', '二维码登录', 'qrcode', false),
('dingtalk', '钉钉登录', 'oauth', true),
('feishu', '飞书登录', 'oauth', true),
('google', '谷歌登录', 'oauth', true),
('douyin', '抖音登录', 'oauth', true);

-- 初始化重定向URL示例
INSERT INTO redirect_urls (application_id, url) 
SELECT id, 'https://example.com/callback' FROM applications LIMIT 1;

-- 为系统管理员角色分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = '系统管理员';

-- 为普通用户分配基础权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = '普通用户' AND p.name = '个人信息';
```

