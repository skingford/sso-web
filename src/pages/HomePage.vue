<template>
  <div class="home-container" ref="containerRef" @mousemove="handleMouseMove">
    <!-- 加载动画 -->
    <LoadingAnimation @finished="onLoadingFinished" />
    <!-- 粒子背景 -->
    <div class="particles-container" ref="particlesRef"></div>
    
    <!-- 滚动进度指示器 -->
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>
     
    <!-- 顶部导航 -->
    <header class="home-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32" color="#409EFF">
            <Lock />
          </el-icon>
          <span class="logo-text">SSO 单点登录系统</span>
        </div>
        <nav class="nav-menu">
          <el-button type="primary" @click="goToLogin" class="login-btn">
            登录
          </el-button>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="home-main">
      <section id="hero" class="hero-section" ref="heroRef">
        <div class="hero-background">
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
        </div>
        
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="typewriter-text">统一身份认证平台</span>
            <span class="cursor" :class="{ 'blink': showCursor }">|</span>
          </h1>
          <p class="hero-subtitle">
            安全、便捷的企业级单点登录解决方案<br>
            一次登录，畅享所有应用
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="goToLogin" class="cta-button primary">
              <span>立即登录</span>
              <div class="button-ripple"></div>
            </el-button>
            <el-button size="large" @click="scrollToFeatures" class="cta-button secondary">
              <span>了解更多</span>
              <div class="button-ripple"></div>
            </el-button>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="hero-graphic" ref="heroGraphicRef">
            <div class="graphic-inner">
              <el-icon :size="120" color="#409EFF">
                <Lock />
              </el-icon>
              <div class="pulse-rings">
                <div class="pulse-ring"></div>
                <div class="pulse-ring"></div>
                <div class="pulse-ring"></div>
              </div>
            </div>
          </div>
        </div>
          </section>

           <section id="features" class="features-section" ref="featuresRef">
        <div class="section-header">
          <h2 class="section-title">核心特性</h2>
          <p class="section-subtitle">为企业提供安全可靠的身份认证服务</p>
          <div class="title-decoration"></div>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-background">
                <el-icon :size="48" color="#67C23A">
                  <Lock />
                </el-icon>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3>安全可靠</h3>
            <p>采用业界标准的OAuth 2.0和OpenID Connect协议，确保身份认证的安全性</p>
            <div class="feature-details">
              <div class="detail-item">
                <span class="detail-icon">🔐</span>
                <span class="detail-text">多因子认证(MFA)</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🛡️</span>
                <span class="detail-text">零信任安全架构</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🔒</span>
                <span class="detail-text">端到端加密传输</span>
              </div>
            </div>
            <div class="feature-metrics">
              <div class="metric-item">
                <span class="metric-number">99.99%</span>
                <span class="metric-label">安全等级</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">256位</span>
                <span class="metric-label">AES加密</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-background">
                <el-icon :size="48" color="#E6A23C">
                  <Grid />
                </el-icon>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3>统一管理</h3>
            <p>集中管理所有应用的用户身份，简化用户账户管理和权限控制</p>
            <div class="feature-details">
              <div class="detail-item">
                <span class="detail-icon">👥</span>
                <span class="detail-text">用户生命周期管理</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🎯</span>
                <span class="detail-text">细粒度权限控制</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📊</span>
                <span class="detail-text">实时监控审计</span>
              </div>
            </div>
            <div class="feature-metrics">
              <div class="metric-item">
                <span class="metric-number">1000+</span>
                <span class="metric-label">应用集成</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">50万+</span>
                <span class="metric-label">用户管理</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-background">
                <el-icon :size="48" color="#F56C6C">
                  <Monitor />
                </el-icon>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3>便捷体验</h3>
            <p>一次登录即可访问所有授权应用，提升用户使用体验</p>
            <div class="feature-details">
              <div class="detail-item">
                <span class="detail-icon">⚡</span>
                <span class="detail-text">单点登录(SSO)</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🔄</span>
                <span class="detail-text">自动令牌刷新</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📱</span>
                <span class="detail-text">跨平台支持</span>
              </div>
            </div>
            <div class="feature-metrics">
              <div class="metric-item">
                <span class="metric-number">&lt;2s</span>
                <span class="metric-label">登录速度</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">95%</span>
                <span class="metric-label">用户满意度</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-background">
                <el-icon :size="48" color="#909399">
                  <Setting />
                </el-icon>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3>灵活配置</h3>
            <p>支持多种身份提供商集成，满足不同企业的个性化需求</p>
            <div class="feature-details">
              <div class="detail-item">
                <span class="detail-icon">🔧</span>
                <span class="detail-text">可视化配置界面</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🌐</span>
                <span class="detail-text">多协议支持</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🎨</span>
                <span class="detail-text">自定义主题样式</span>
              </div>
            </div>
            <div class="feature-metrics">
              <div class="metric-item">
                <span class="metric-number">15+</span>
                <span class="metric-label">身份提供商</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">5分钟</span>
                <span class="metric-label">快速部署</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-background">
                <el-icon :size="48" color="#409EFF">
                  <DataAnalysis />
                </el-icon>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3>智能分析</h3>
            <p>提供全面的用户行为分析和安全风险评估，助力企业决策</p>
            <div class="feature-details">
              <div class="detail-item">
                <span class="detail-icon">📈</span>
                <span class="detail-text">用户行为分析</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">⚠️</span>
                <span class="detail-text">异常登录检测</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📋</span>
                <span class="detail-text">合规性报告</span>
              </div>
            </div>
            <div class="feature-metrics">
              <div class="metric-item">
                <span class="metric-number">24/7</span>
                <span class="metric-label">实时监控</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">99.9%</span>
                <span class="metric-label">威胁检测率</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <div class="icon-background">
                <el-icon :size="48" color="#67C23A">
                  <Connection />
                </el-icon>
              </div>
              <div class="icon-glow"></div>
            </div>
            <h3>API集成</h3>
            <p>提供完整的RESTful API和SDK，支持快速集成和二次开发</p>
            <div class="feature-details">
              <div class="detail-item">
                <span class="detail-icon">🔗</span>
                <span class="detail-text">RESTful API</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📚</span>
                <span class="detail-text">完整SDK支持</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">🔔</span>
                <span class="detail-text">Webhook通知</span>
              </div>
            </div>
            <div class="feature-metrics">
              <div class="metric-item">
                <span class="metric-number">20+</span>
                <span class="metric-label">编程语言</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">99.9%</span>
                <span class="metric-label">API可用性</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
        </div>
          </section>

        <!-- 应用场景 -->
         <section id="scenarios" class="scenarios-section" ref="scenariosRef">
        <div class="section-header">
          <h2 class="section-title">应用场景</h2>
          <p class="section-subtitle">适用于各种企业级应用集成场景，已服务超过1000+企业客户</p>
          <div class="title-decoration"></div>
        </div>
        <div class="scenarios-grid">
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon">
                <el-icon :size="32">
                  <Monitor />
                </el-icon>
              </div>
              <div class="scenario-number">01</div>
            </div>
            <h3>企业内部系统</h3>
            <p class="scenario-description">为企业内部各类业务系统提供统一身份认证服务</p>
            <div class="scenario-features">
              <div class="feature-item">
                <span class="feature-icon">🏢</span>
                <span>OA办公系统</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">👥</span>
                <span>CRM客户管理</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>ERP企业资源规划</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💼</span>
                <span>HR人力资源</span>
              </div>
            </div>
            <div class="scenario-stats">
              <div class="stat-item">
                <span class="stat-number">500+</span>
                <span class="stat-label">企业用户</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">99.9%</span>
                <span class="stat-label">可用性</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon">
                <el-icon :size="32">
                  <Grid />
                </el-icon>
              </div>
              <div class="scenario-number">02</div>
            </div>
            <h3>第三方应用集成</h3>
            <p class="scenario-description">支持主流第三方平台登录，提供多样化认证方式</p>
            <div class="scenario-features">
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>微信登录</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🐧</span>
                <span>QQ登录</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🐙</span>
                <span>GitHub登录</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔗</span>
                <span>钉钉集成</span>
              </div>
            </div>
            <div class="scenario-stats">
              <div class="stat-item">
                <span class="stat-number">10+</span>
                <span class="stat-label">支持平台</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">2s</span>
                <span class="stat-label">登录速度</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
          <div class="scenario-card">
            <div class="scenario-header">
              <div class="scenario-icon">
                <el-icon :size="32">
                  <Setting />
                </el-icon>
              </div>
              <div class="scenario-number">03</div>
            </div>
            <h3>移动端应用</h3>
            <p class="scenario-description">全面支持移动端SSO集成，实现跨平台统一认证</p>
            <div class="scenario-features">
              <div class="feature-item">
                <span class="feature-icon">📱</span>
                <span>iOS应用</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🤖</span>
                <span>Android应用</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🌐</span>
                <span>H5页面</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span>小程序</span>
              </div>
            </div>
            <div class="scenario-stats">
              <div class="stat-item">
                <span class="stat-number">100万+</span>
                <span class="stat-label">日活用户</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0.5s</span>
                <span class="stat-label">响应时间</span>
              </div>
            </div>
            <div class="card-hover-effect"></div>
          </div>
        </div>
        
        <!-- 技术优势展示区域 -->
        <div class="tech-advantages">
          <div class="advantages-header">
            <h3>技术优势</h3>
            <p>基于现代化架构设计，提供企业级安全保障</p>
          </div>
          <div class="advantages-grid">
            <div class="advantage-item">
              <div class="advantage-icon">🔒</div>
              <h4>安全可靠</h4>
              <p>采用OAuth 2.0、SAML 2.0等国际标准协议，支持多因子认证</p>
              <div class="advantage-features">
                <span class="feature-tag">端到端加密</span>
                <span class="feature-tag">零信任架构</span>
                <span class="feature-tag">SOC2认证</span>
              </div>
              <div class="advantage-stats">
                <div class="stat-item">
                  <span class="stat-number">99.99%</span>
                  <span class="stat-label">安全性</span>
                </div>
              </div>
            </div>
            <div class="advantage-item">
              <div class="advantage-icon">⚡</div>
              <h4>高性能</h4>
              <p>分布式架构设计，支持高并发访问，响应时间小于100ms</p>
              <div class="advantage-features">
                <span class="feature-tag">微服务架构</span>
                <span class="feature-tag">Redis缓存</span>
                <span class="feature-tag">CDN加速</span>
              </div>
              <div class="advantage-stats">
                <div class="stat-item">
                  <span class="stat-number">&lt;50ms</span>
                  <span class="stat-label">响应时间</span>
                </div>
              </div>
            </div>
            <div class="advantage-item">
              <div class="advantage-icon">🔧</div>
              <h4>易集成</h4>
              <p>提供完整的SDK和API文档，支持多种编程语言和框架</p>
              <div class="advantage-features">
                <span class="feature-tag">RESTful API</span>
                <span class="feature-tag">GraphQL</span>
                <span class="feature-tag">Webhook</span>
              </div>
              <div class="advantage-stats">
                <div class="stat-item">
                  <span class="stat-number">15+</span>
                  <span class="stat-label">SDK语言</span>
                </div>
              </div>
            </div>
            <div class="advantage-item">
              <div class="advantage-icon">📊</div>
              <h4>可视化</h4>
              <p>实时监控面板，详细的访问日志和统计分析功能</p>
              <div class="advantage-features">
                <span class="feature-tag">实时监控</span>
                <span class="feature-tag">数据分析</span>
                <span class="feature-tag">告警通知</span>
              </div>
              <div class="advantage-stats">
                <div class="stat-item">
                  <span class="stat-number">24/7</span>
                  <span class="stat-label">监控服务</span>
                </div>
              </div>
            </div>
            <div class="advantage-item">
              <div class="advantage-icon">🌐</div>
              <h4>多协议支持</h4>
              <p>支持OIDC、SAML、CAS等多种认证协议，兼容性强</p>
              <div class="advantage-features">
                <span class="feature-tag">OIDC 1.0</span>
                <span class="feature-tag">SAML 2.0</span>
                <span class="feature-tag">CAS 3.0</span>
              </div>
              <div class="advantage-stats">
                <div class="stat-item">
                  <span class="stat-number">10+</span>
                  <span class="stat-label">协议支持</span>
                </div>
              </div>
            </div>
            <div class="advantage-item">
              <div class="advantage-icon">☁️</div>
              <h4>云原生</h4>
              <p>基于Kubernetes部署，支持弹性扩缩容和多云环境</p>
              <div class="advantage-features">
                <span class="feature-tag">Docker容器</span>
                <span class="feature-tag">K8s编排</span>
                <span class="feature-tag">多云部署</span>
              </div>
              <div class="advantage-stats">
                <div class="stat-item">
                  <span class="stat-number">99.9%</span>
                  <span class="stat-label">可用性</span>
                </div>
              </div>
            </div>
          </div>
        </div>
          </section>
      
        <!-- CTA区域 -->
       <section id="cta" class="cta-section">
        <div class="cta-content">
          <h2>准备开始了吗？</h2>
          <p>立即体验 EPOCH SSO，让身份认证变得简单而安全</p>
          <div class="flex gap-4 justify-center">
            <button class="cta-button primary" @click="handleButtonClick($event, goToLogin)">
              <span class="button-ripple"></span>
              立即开始
            </button>
            <button class="cta-button secondary" @click="handleButtonClick($event, () => {})">
              <span class="button-ripple"></span>
              了解更多
            </button>
          </div>
        </div>
          </section>
      
        <!-- 客户案例区域 -->
         <section id="testimonials" class="testimonials-section">
        <div class="section-header">
          <h2 class="section-title">客户案例</h2>
          <p class="section-subtitle">已为全球1000+企业提供可靠的身份认证服务</p>
          <div class="title-decoration"></div>
        </div>
        
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-header">
              <div class="company-logo">
                <div class="logo-placeholder">A</div>
              </div>
              <div class="company-info">
                <h4>阿里巴巴集团</h4>
                <p class="company-type">互联网科技</p>
              </div>
            </div>
            <div class="testimonial-content">
              <div class="quote-icon">"</div>
              <p class="testimonial-text">
                EPOCH SSO帮助我们实现了全集团统一身份认证，大大提升了员工工作效率和系统安全性。部署简单，运行稳定，是我们数字化转型的重要基础设施。
              </p>
              <div class="testimonial-author">
                <div class="author-info">
                  <span class="author-name">张伟</span>
                  <span class="author-title">技术总监</span>
                </div>
                <div class="testimonial-stats">
                  <div class="stat-item">
                    <span class="stat-number">50,000+</span>
                    <span class="stat-label">员工用户</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">200+</span>
                    <span class="stat-label">接入应用</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card" >
            <div class="testimonial-header">
              <div class="company-logo">
                <div class="logo-placeholder">T</div>
              </div>
              <div class="company-info">
                <h4>腾讯科技</h4>
                <p class="company-type">互联网服务</p>
              </div>
            </div>
            <div class="testimonial-content">
              <div class="quote-icon">"</div>
              <p class="testimonial-text">
                作为一家大型互联网公司，我们对安全性要求极高。EPOCH SSO的多重安全机制和完善的审计功能完全满足了我们的需求，值得信赖。
              </p>
              <div class="testimonial-author">
                <div class="author-info">
                  <span class="author-name">李明</span>
                  <span class="author-title">安全架构师</span>
                </div>
                <div class="testimonial-stats">
                  <div class="stat-item">
                    <span class="stat-number">99.99%</span>
                    <span class="stat-label">可用性</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">0</span>
                    <span class="stat-label">安全事故</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-header">
              <div class="company-logo">
                <div class="logo-placeholder">B</div>
              </div>
              <div class="company-info">
                <h4>字节跳动</h4>
                <p class="company-type">内容科技</p>
              </div>
            </div>
            <div class="testimonial-content">
              <div class="quote-icon">"</div>
              <p class="testimonial-text">
                EPOCH SSO的API设计非常优雅，文档详细，集成过程非常顺畅。技术支持团队响应迅速，帮助我们快速完成了系统对接。
              </p>
              <div class="testimonial-author">
                <div class="author-info">
                  <span class="author-name">王芳</span>
                  <span class="author-title">研发经理</span>
                </div>
                <div class="testimonial-stats">
                  <div class="stat-item">
                    <span class="stat-number">3天</span>
                    <span class="stat-label">集成时间</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">15+</span>
                    <span class="stat-label">业务系统</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 客户统计 -->
        <div class="customer-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🏢</div>
              <div class="stat-number">1000+</div>
              <div class="stat-label">企业客户</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-number">500万+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🔗</div>
              <div class="stat-number">10万+</div>
              <div class="stat-label">应用集成</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🌍</div>
              <div class="stat-number">50+</div>
              <div class="stat-label">国家地区</div>
            </div>
          </div>
        </div>
          </section>
    </main>

    <!-- 底部 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <el-icon :size="24" color="#409EFF">
              <Lock />
            </el-icon>
            <span>SSO 单点登录系统</span>
          </div>
          <p>企业级统一身份认证解决方案</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>产品</h4>
            <ul>
              <li><a href="#" @click.prevent>功能特性</a></li>
              <li><a href="#" @click.prevent>技术文档</a></li>
              <li><a href="#" @click.prevent>API接口</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>支持</h4>
            <ul>
              <li><a href="#" @click.prevent>帮助中心</a></li>
              <li><a href="#" @click.prevent>联系我们</a></li>
              <li><a href="#" @click.prevent>服务条款</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 SSO 单点登录系统. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>



<script setup lang="ts">
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import { Lock, Grid, Monitor, Setting, TrendCharts, Connection } from '@element-plus/icons-vue'


const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean
  return function executedFunction(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const router = useRouter()

// 响应式数据
const containerRef = ref<HTMLElement>()
const particlesRef = ref<HTMLElement>()
const heroRef = ref<HTMLElement>()
const heroGraphicRef = ref<HTMLElement>()
const featuresRef = ref<HTMLElement>()
const scenariosRef = ref<HTMLElement>()

const scrollProgress = ref(0)
const isScrolled = ref(false)
const showCursor = ref(true)

// 滚动监听
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  
  // 更新滚动进度
  scrollProgress.value = (scrollTop / scrollHeight) * 100
  
  // 更新导航栏状态
  isScrolled.value = scrollTop > 100
  
  // 视差效果
  if (heroGraphicRef.value) {
    const parallaxSpeed = 0.5
    heroGraphicRef.value.style.transform = `translateY(${scrollTop * parallaxSpeed}px)`
  }
}

// 鼠标跟随效果
const handleMouseMove = (e: MouseEvent) => {
  if (!heroRef.value) return
  
  const rect = heroRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  
  const shapes = heroRef.value.querySelectorAll('.shape')
  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.02
    const moveX = (x - 0.5) * speed * 100
    const moveY = (y - 0.5) * speed * 100
    ;(shape as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`
  })
}

// 响应式配置
const isMobile = ref(false)
const swiperDirection = ref<'vertical' | 'horizontal'>('vertical')

// 检测设备类型
const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
  swiperDirection.value = isMobile.value ? 'horizontal' : 'vertical'
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 按钮点击涟漪效果
const handleButtonClick = (event: MouseEvent, callback: () => void) => {
  const button = event.currentTarget as HTMLElement
  const ripple = button.querySelector('.button-ripple') as HTMLElement
  
  if (ripple) {
    // 重置涟漪
    ripple.style.transform = 'translate(-50%, -50%) scale(0)'
    ripple.style.opacity = '1'
    
    // 获取按钮尺寸和点击位置
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // 设置涟漪位置和大小
    ripple.style.width = size + 'px'
    ripple.style.height = size + 'px'
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    ripple.style.transform = 'translate(-50%, -50%) scale(0)'
    
    // 触发涟漪动画
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(1)'
      ripple.style.opacity = '0'
    })
  }
  
  // 延迟执行回调，让涟漪效果完成
  setTimeout(() => {
    callback()
  }, 150)
}

// 滚动到特性介绍区域
const scrollToFeatures = () => {
  const element = document.getElementById('features')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

</script>

<style lang="scss" scoped>
// 主容器样式
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  will-change: transform;
}



// 全屏滚动样式优化 - 移除可能导致双滚动条的设置
// html 和 body 的滚动行为由全局样式控制

/* 性能优化 - GPU加速 */
.hero-section,
.features-section .feature-card,
.scenarios-section .scenario-card,
.btn-primary,
.floating-shapes,
.particles-container,
.scroll-progress,
.fullscreen-nav {
  will-change: transform, opacity;
}

.hero-section .hero-title,
.hero-section .hero-subtitle {
  will-change: transform;
}

.feature-card:hover,
.scenario-card:hover,
.btn-primary:hover {
  will-change: transform, box-shadow;
}

/* 渲染优化 - 包含块 */
.hero-section,
.features-section,
.scenarios-section,
.cta-section {
  contain: layout style paint;
}

.feature-card,
.scenario-card {
  contain: layout style;
}

.particles-container,
.floating-shapes {
  contain: strict;
}

// 粒子背景
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: float-particle linear infinite;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      width: 8px;
      height: 8px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      border-radius: 50%;
    }
  }
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

// 滚动进度指示器
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  z-index: 1000;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

// 顶部导航样式
.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, background-color;
  
  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    
    .nav-menu {
      .nav-item {
        color: #333;
        
        &:hover {
          color: #409EFF;
        }
      }
    }
    
    .nav-actions {
      .login-btn {
        color: #409EFF;
        border-color: #409EFF;
        
        &:hover {
          background: #409EFF;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
        }
      }
    }
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 64px;
    max-width: 1200px;
    margin: 0 auto;
    
    @media (max-width: 1024px) {
      padding: 24px 48px;
    }
    
    @media (max-width: 768px) {
      padding: 16px 32px;
      flex-direction: column;
      gap: 24px;
    }
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      
      @media (max-width: 768px) {
        font-size: 24px;
      }
    }
  }
  
  .nav-menu {
    display: flex;
    align-items: center;
    gap: 32px;
    
    .nav-item {
      color: white;
      text-decoration: none;
      font-weight: 500;
      position: relative;
      padding: 0.5rem 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, #409EFF, #67C23A);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(-50%);
      }
      
      &:hover {
        color: #409EFF;
        transform: translateY(-2px);
        
        &::after {
          width: 100%;
        }
      }
    }
    
    .login-btn {
      padding: 0.75rem 2rem;
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
      }
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.8);
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        
        &::before {
          left: 100%;
        }
      }
      
      &:active {
        transform: translateY(-1px);
      }
    }
  }
}

// 主要内容区域
.home-main {
  position: relative;
  z-index: 5;
  color: #ffffff;
}

// Hero区域样式
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
  padding: 128px 64px 96px;
  position: relative;
  overflow: hidden;
  
  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    
    .floating-shapes {
      position: relative;
      width: 100%;
      height: 100%;
      
      .shape {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: transform 0.3s ease;
        
        &.shape-1 {
          width: 200px;
          height: 200px;
          top: 20%;
          left: 10%;
          animation: float 6s ease-in-out infinite;
        }
        
        &.shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 15%;
          animation: float 8s ease-in-out infinite reverse;
        }
        
        &.shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 20%;
          animation: float 7s ease-in-out infinite;
        }
      }
    }
  }
  
  @media (max-width: 1024px) {
    padding: 112px 48px 80px;
  }
  
  @media (max-width: 768px) {
    padding: 96px 32px 64px;
  }
  
  .hero-content {
    flex: 1;
    max-width: 600px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 100;
    
    @media (max-width: 1024px) {
      max-width: none;
      min-height: auto;
    }
    
    .hero-title {
      font-size: 4.5rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 32px;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #ffffff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;
      z-index: 20;
      // 优化文字渲染，移除可能导致模糊的阴影
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: "liga" 1, "kern" 1;
      
      .typewriter-text {
        display: inline-block;
        position: relative;
        // 修复文字不可见问题：为打字机文字提供独立的背景渐变
        background: linear-gradient(135deg, #ffffff, #e0e7ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        // 优化字体渲染，解决模糊问题
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-feature-settings: "liga" 1, "kern" 1;
        // 移除可能导致模糊的transform
        backface-visibility: visible;
        // 确保文字清晰
        image-rendering: -webkit-optimize-contrast;
        // 添加备用颜色方案，防止渐变失效时文字不可见
        color: #ffffff;
        
        // 为不支持background-clip的浏览器提供备用方案
        @supports not (-webkit-background-clip: text) {
          -webkit-text-fill-color: initial;
          background: none;
          color: #ffffff;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        &.typing-complete {
          // 打字完成后进一步优化渲染
          will-change: auto;
        }
      }
      
      .cursor {
        display: inline-block;
        width: 3px;
        height: 1em;
        background: #409EFF;
        margin-left: 2px;
        animation: blink 1s infinite;
        
        &.blink {
          animation: blink 1s infinite;
        }
      }
      
      @media (max-width: 1024px) {
        font-size: 3.5rem;
      }
      
      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }
    
    .hero-subtitle {
      font-size: 24px;
      margin-bottom: 48px;
      // 提高文字对比度，增强可见性
      color: rgba(255, 255, 255, 0.98);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      line-height: 1.6;
      font-weight: 400;
      // 优化字体渲染
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      
      @media (max-width: 768px) {
        font-size: 20px;
        margin-bottom: 40px;
      }
    }
    
    .hero-actions {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      justify-content: center;
      
      @media (max-width: 1024px) {
        justify-content: center;
      }
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
    }
  }
  
  .hero-visual {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10;
    
    .hero-graphic {
      position: relative;
      
      .graphic-inner {
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: float 6s ease-in-out infinite;
        
        @media (max-width: 1024px) {
          width: 250px;
          height: 250px;
        }
        
        @media (max-width: 768px) {
          width: 200px;
          height: 200px;
        }
      }
      
      .pulse-rings {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 300px;
          height: 300px;
          border: 2px solid rgba(64, 158, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-ring 4s ease-out infinite;
          z-index: 1;
          
          &:nth-child(2) {
            animation-delay: 1.3s;
          }
          
          &:nth-child(3) {
            animation-delay: 2.6s;
          }
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

// 特性介绍区域
.features-section {
  padding: 8rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 分屏动画效果
  &.section-entering {
    transform: scale(1.02);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &.in-viewport {
    .feature-card {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 20%, rgba(64, 158, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(103, 194, 58, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 5rem;
    position: relative;
    z-index: 10;
    
    .section-title {
      font-size: 3.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 1rem;
      position: relative;
      display: inline-block;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 4px;
        background: linear-gradient(90deg, #409EFF, #67C23A);
        border-radius: 2px;
      }
      
      @media (max-width: 768px) {
        font-size: 2.8rem;
      }
    }
    
    .section-subtitle {
      font-size: 1.3rem;
      // 提高文字对比度，增强可见性
      color: rgba(255, 255, 255, 0.92);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      margin: 2rem auto 0;
      line-height: 1.6;
      // 优化字体渲染
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .title-decoration {
      position: absolute;
      top: -20px;
      right: -20px;
      width: 40px;
      height: 40px;
      background: linear-gradient(45deg, #409EFF, #67C23A);
      border-radius: 50%;
      opacity: 0.3;
      animation: float 4s ease-in-out infinite;
    }
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2.5rem;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    
    .feature-card {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 3rem 2rem;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.15);
        position: relative;
        overflow: hidden;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform-style: preserve-3d;
        perspective: 1000px;
        // 初始状态：向下偏移并透明
        transform: translateY(50px);
        opacity: 0;
        
        // 动画进入状态
        &.animate-in {
          transform: translateY(0);
          opacity: 1;
        }
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.8s ease;
        }
        
        &::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        
        &:hover {
          transform: translateY(-15px) rotateX(5deg) rotateY(5deg) scale(1.02);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 35px 70px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          
          &::before {
            left: 100%;
          }
          
          &::after {
            opacity: 1;
          }
          
          .feature-icon {
            transform: scale(1.2) rotate(5deg) translateZ(20px);
            
            .icon-background {
              box-shadow: 0 0 40px rgba(64, 158, 255, 0.6);
            }
            
            .icon-glow {
              opacity: 1;
              transform: scale(1.6) translateZ(10px);
            }
          }
          
          h3 {
            color: #409EFF;
            // 移除可能导致文字模糊的translateZ
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          p {
            // 移除可能导致文字模糊的translateZ
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .card-hover-effect {
            opacity: 1;
            transform: scale(1);
          }
        }
      
      .feature-icon {
        position: relative;
        width: 100px;
        height: 100px;
        margin: 0 auto 2rem;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        
        .icon-background {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #409EFF, #67C23A);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          position: relative;
          z-index: 2;
        }
        
        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(64, 158, 255, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0;
          transition: all 0.4s ease;
        }
      }
      
      h3 {
        font-size: 1.8rem;
        font-weight: 700;
        color: white;
        margin-bottom: 1.5rem;
        position: relative;
      }
      
      p {
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.7;
        font-size: 1.1rem;
      }
      
      .feature-details {
        margin: 2rem 0;
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.8rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(64, 158, 255, 0.3);
            transform: translateX(5px);
          }
          
          .detail-icon {
            width: 20px;
            height: 20px;
            margin-right: 0.8rem;
            color: #409EFF;
            flex-shrink: 0;
          }
          
          .detail-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.95rem;
            line-height: 1.4;
          }
        }
      }
      
      .feature-metrics {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          
          .metric-item {
            text-align: center;
            padding: 1rem;
            background: rgba(64, 158, 255, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(64, 158, 255, 0.2);
            transition: all 0.3s ease;
            
            &:hover {
              background: rgba(64, 158, 255, 0.15);
              border-color: rgba(64, 158, 255, 0.4);
              transform: scale(1.05);
            }
            
            .metric-value {
              font-size: 1.4rem;
              font-weight: 700;
              color: #409EFF;
              margin-bottom: 0.3rem;
              display: block;
            }
            
            .metric-label {
              font-size: 0.85rem;
              color: rgba(255, 255, 255, 0.8);
              line-height: 1.3;
            }
          }
        }
      }
      
      .card-hover-effect {
        position: absolute;
        bottom: -50px;
        right: -50px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(64, 158, 255, 0.2) 0%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.4s ease;
        pointer-events: none;
      }
    }
  }
}

// 应用场景区域
.scenarios-section {
  padding: 8rem 2rem;
  background: rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 分屏动画效果
  &.section-entering {
    transform: scale(1.02);
    background: rgba(0, 0, 0, 0.15);
  }
  
  &.in-viewport {
    .scenario-card {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 70% 30%, rgba(103, 194, 58, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 20% 70%, rgba(64, 158, 255, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 5rem;
    position: relative;
    z-index: 10;
    
    .section-title {
      font-size: 3.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 1rem;
      position: relative;
      display: inline-block;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 4px;
        background: linear-gradient(90deg, #67C23A, #409EFF);
        border-radius: 2px;
      }
      
      @media (max-width: 768px) {
        font-size: 2.8rem;
      }
    }
    
    .section-subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.8);
      max-width: 600px;
      margin: 2rem auto 0;
      line-height: 1.6;
    }
  }
  
  .scenarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 2.5rem;
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    
    .scenario-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      border: 1px solid rgba(255, 255, 255, 0.15);
      position: relative;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      perspective: 1000px;
      // 初始状态：向右偏移并透明
      transform: translateX(50px);
      opacity: 0;
      
      // 动画进入状态
      &.animate-in {
        transform: translateX(0);
        opacity: 1;
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.8s ease;
      }
      
      &::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(103, 194, 58, 0.1) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      
      &:hover {
        transform: translateY(-12px) rotateX(3deg) rotateY(-3deg) scale(1.02);
        background: rgba(255, 255, 255, 0.12);
        box-shadow: 
          0 30px 60px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        
        &::before {
          left: 100%;
        }
        
        &::after {
          opacity: 1;
        }
        
        .scenario-number {
          transform: scale(1.2) rotate(10deg) translateZ(20px);
          background: linear-gradient(135deg, #67C23A, #409EFF);
          box-shadow: 0 0 30px rgba(64, 158, 255, 0.6);
        }
        
        h3 {
          color: #67C23A;
          // 移除可能导致文字模糊的translateZ
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        p {
          // 移除可能导致文字模糊的translateZ
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .card-hover-effect {
          opacity: 1;
          transform: scale(1) translateZ(15px);
        }
      }
      
      .scenario-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        
        .scenario-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(64, 158, 255, 0.2), rgba(103, 194, 58, 0.2));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #67C23A;
          transition: all 0.3s ease;
          
          &:hover {
            transform: scale(1.1) rotate(5deg);
            background: linear-gradient(135deg, rgba(64, 158, 255, 0.3), rgba(103, 194, 58, 0.3));
          }
        }
      }
      
      .scenario-number {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #409EFF, #67C23A);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        font-weight: 800;
        color: white;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 25px rgba(64, 158, 255, 0.3);
      }
      
      h3 {
        font-size: 1.8rem;
        font-weight: 700;
        color: white;
        margin-bottom: 1rem;
        position: relative;
      }
      
      .scenario-description {
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.7;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }
      
      .scenario-features {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.8rem;
        margin-bottom: 1.5rem;
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
          
          .feature-icon {
            font-size: 1.2rem;
          }
          
          span:last-child {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9rem;
          }
          
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
          }
        }
      }
      
      .scenario-stats {
        display: flex;
        justify-content: space-between;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        
        .stat-item {
          text-align: center;
          
          .stat-number {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: #67C23A;
            margin-bottom: 0.2rem;
          }
          
          .stat-label {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
      
      .card-hover-effect {
        position: absolute;
        bottom: -50px;
        left: -50px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(103, 194, 58, 0.2) 0%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
        transform: scale(0.5);
        transition: all 0.4s ease;
        pointer-events: none;
      }
    }
  }
}

// 底部样式
.home-footer {
  background: linear-gradient(135deg, #1f2937, #374151);
  color: #ffffff;
  padding: 128px 64px 40px;
  position: relative;
  z-index: 10;
  
  @media (max-width: 1024px) {
    padding: 96px 48px 32px;
  }
  
  @media (max-width: 768px) {
    padding: 112px 32px 32px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 100px;
    background: #f3f4f6;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
    z-index: 10;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 96px;
    position: relative;
    z-index: 20;
    margin-bottom: 48px;
    align-items: start;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 80px;
      text-align: center;
    }
    
    @media (max-width: 768px) {
      gap: 64px;
    }
  }
  
  .footer-info {
    display: flex;
    flex-direction: column;
    gap: 32px;
    
    .footer-logo {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      
      @media (max-width: 1024px) {
        justify-content: center;
      }
    }
    
    p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      line-height: 1.5;
      font-weight: 400;
    }
  }
  
  .footer-links {
    display: flex;
    gap: 96px;
    justify-content: flex-start;
    
    @media (max-width: 1024px) {
      justify-content: center;
      gap: 80px;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 48px;
      align-items: center;
    }
    
    .link-group {
      h4 {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 32px;
        color: #ffffff;
      }
      
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          margin-bottom: 12px;
          
          a {
            text-decoration: none;
            transition: color 0.3s ease;
            color: rgba(255, 255, 255, 0.85);
            font-size: 16px;
            font-weight: 400;
            
            &:hover {
              color: #ffffff;
            }
          }
        }
      }
    }
  }
  
  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 32px;
    text-align: center;
    position: relative;
    z-index: 20;
    
    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      margin: 0;
      font-weight: 400;
    }
  }
}

// 动画效果
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card,
.scenario-card {
  animation: fadeInUp 0.6s ease-out;
  
  &:nth-child(2) {
    animation-delay: 0.1s;
  }
  
  &:nth-child(3) {
    animation-delay: 0.2s;
  }
  
  &:nth-child(4) {
    animation-delay: 0.3s;
  }
}

// 客户案例区域样式
.testimonials-section {
  padding: 8rem 2rem;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(64, 158, 255, 0.1) 100%);
  position: relative;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 分屏动画效果
  &.section-entering {
    transform: scale(1.02);
    background: linear-gradient(135deg, rgba(103, 194, 58, 0.15) 0%, rgba(64, 158, 255, 0.15) 100%);
  }
  
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
    margin-bottom: 4rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  
  .testimonial-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 2rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.05) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-8px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      
      &::before {
        opacity: 1;
      }
    }
    
    .testimonial-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
      
      .company-logo {
        width: 60px;
        height: 60px;
        margin-right: 1rem;
        
        .logo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #409EFF, #67C23A);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
      }
      
      .company-info {
        h4 {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.3rem;
        }
        
        .company-type {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }
      }
    }
    
    .testimonial-content {
      position: relative;
      z-index: 1;
      
      .quote-icon {
        font-size: 3rem;
        color: rgba(64, 158, 255, 0.3);
        line-height: 1;
        margin-bottom: 1rem;
        font-family: serif;
      }
      
      .testimonial-text {
        font-size: 1rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 1.5rem;
        font-style: italic;
      }
      
      .testimonial-author {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        
        @media (max-width: 480px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .author-info {
          .author-name {
            display: block;
            font-size: 1rem;
            font-weight: 600;
            color: white;
            margin-bottom: 0.2rem;
          }
          
          .author-title {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
          }
        }
        
        .testimonial-stats {
          display: flex;
          gap: 1rem;
          
          .stat-item {
            text-align: center;
            
            .stat-number {
              display: block;
              font-size: 1rem;
              font-weight: 700;
              color: #67C23A;
              margin-bottom: 0.2rem;
            }
            
            .stat-label {
              font-size: 0.7rem;
              color: rgba(255, 255, 255, 0.5);
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }
        }
      }
    }
  }
  
  .customer-stats {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      
      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      
      .stat-card {
        text-align: center;
        padding: 2rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        
        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #409EFF;
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      }
    }
  }
}

// CTA区域样式
.cta-section {
  padding: 8rem 2rem;
  background: radial-gradient(ellipse at center, rgba(64, 158, 255, 0.15) 0%, transparent 70%);
  position: relative;
  overflow: hidden;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 分屏动画效果
  &.section-entering {
    transform: scale(1.02);
    background: radial-gradient(ellipse at center, rgba(64, 158, 255, 0.25) 0%, transparent 70%);
  }
  
  &.in-viewport {
    .cta-content {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(64, 158, 255, 0.1), transparent);
    animation: rotate 20s linear infinite;
  }
  
  .cta-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 10;
    // 初始状态：向下偏移并透明
    transform: translateY(50px);
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    
    h2 {
      font-size: 3.5rem;
      font-weight: 800;
      color: white;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      
      @media (max-width: 768px) {
        font-size: 2.8rem;
      }
    }
    
    p {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 3rem;
      line-height: 1.6;
    }
  }
}

// 按钮样式
.cta-button {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  
  &.primary {
    background: linear-gradient(135deg, #409EFF, #67C23A);
    color: white;
    padding: 1rem 2.5rem;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-3px) scale(1.05) rotateX(5deg);
      box-shadow: 
        0 15px 35px rgba(64, 158, 255, 0.4),
        0 5px 15px rgba(0, 0, 0, 0.1);
      
      &::before {
        opacity: 1;
      }
      
      .button-ripple {
        transform: scale(1);
        opacity: 0;
      }
    }
    
    &:active {
      transform: translateY(-1px) scale(0.98);
      transition: all 0.1s ease;
    }
  }
  
  &.secondary {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    padding: 0.875rem 2.5rem;
    backdrop-filter: blur(10px);
    
    &:hover {
      border-color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      
      .button-ripple {
        transform: scale(1);
        opacity: 0;
      }
    }
  }
  
  .button-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: all 0.6s ease;
    pointer-events: none;
  }
}

// 全屏滚动导航指示器
.fullscreen-nav {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999; // 提高z-index确保可点击
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: auto; // 确保可以接收点击事件
  
  .nav-dot {
    width: 16px; // 增大点击区域
    height: 16px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    // 增大点击区域
    padding: 4px;
    margin: -4px;
    // 确保可点击
    pointer-events: auto;
    user-select: none;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(64, 158, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.6);
      border-color: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
      
      &::before {
        width: 24px;
        height: 24px;
      }
    }
    
    &.active {
      background: #409EFF;
      border-color: #409EFF;
      box-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
      
      &::before {
        width: 20px;
        height: 20px;
        background: rgba(64, 158, 255, 0.2);
      }
    }
  }
  
  @media (max-width: 768px) {
    right: 1rem;
    
    .nav-dot {
      width: 10px;
      height: 10px;
    }
  }
}

// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计已通过mixins处理，无需额外的媒体查询
</style>
