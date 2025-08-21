<template>
  <div class="home-container">
    <!-- 顶部导航 -->
    <header class="home-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32" color="#409EFF">
            <Lock />
          </el-icon>
          <span class="logo-text">SSO 单点登录系统</span>
        </div>
        <nav class="nav-menu">
          <el-button type="primary" @click="goToLogin">登录</el-button>
        </nav>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="home-main">
      <!-- Hero区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">统一身份认证平台</h1>
          <p class="hero-subtitle">
            安全、便捷的企业级单点登录解决方案<br>
            一次登录，畅享所有应用
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" @click="goToLogin">
              立即登录
            </el-button>
            <el-button size="large" @click="scrollToFeatures">
              了解更多
            </el-button>
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-graphic">
            <el-icon :size="200" color="#409EFF">
              <Lock />
            </el-icon>
          </div>
        </div>
      </section>

      <!-- 特性介绍 -->
      <section class="features-section" id="features">
        <div class="section-header">
          <h2>核心特性</h2>
          <p>为企业提供安全可靠的身份认证服务</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon :size="48" color="#67C23A">
                <Lock />
              </el-icon>
            </div>
            <h3>安全可靠</h3>
            <p>采用业界标准的OAuth 2.0和OpenID Connect协议，确保身份认证的安全性</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon :size="48" color="#E6A23C">
                <Grid />
              </el-icon>
            </div>
            <h3>统一管理</h3>
            <p>集中管理所有应用的用户身份，简化用户账户管理和权限控制</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon :size="48" color="#F56C6C">
                <Monitor />
              </el-icon>
            </div>
            <h3>便捷体验</h3>
            <p>一次登录即可访问所有授权应用，提升用户使用体验</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon :size="48" color="#909399">
                <Setting />
              </el-icon>
            </div>
            <h3>灵活配置</h3>
            <p>支持多种身份提供商集成，满足不同企业的个性化需求</p>
          </div>
        </div>
      </section>

      <!-- 应用场景 -->
      <section class="scenarios-section">
        <div class="section-header">
          <h2>应用场景</h2>
          <p>适用于各种企业级应用集成场景</p>
        </div>
        <div class="scenarios-grid">
          <div class="scenario-card">
            <h3>企业内部系统</h3>
            <p>OA办公、CRM客户管理、ERP企业资源规划等内部系统的统一登录</p>
          </div>
          <div class="scenario-card">
            <h3>第三方应用</h3>
            <p>集成微信、QQ、GitHub等第三方登录，提供多样化的认证方式</p>
          </div>
          <div class="scenario-card">
            <h3>移动应用</h3>
            <p>支持移动端应用的SSO集成，实现跨平台的统一身份认证</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <el-icon :size="24" color="#909399">
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
              <li><a href="#">功能特性</a></li>
              <li><a href="#">技术文档</a></li>
              <li><a href="#">API接口</a></li>
            </ul>
          </div>
          <div class="link-group">
            <h4>支持</h4>
            <ul>
              <li><a href="#">帮助中心</a></li>
              <li><a href="#">联系我们</a></li>
              <li><a href="#">服务条款</a></li>
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

import { Lock, Grid, Monitor, Setting } from '@element-plus/icons-vue'

const router = useRouter()

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  position: relative;
  overflow-x: hidden;
}

// 顶部导航样式
.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  
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
      color: rgba(255, 255, 255, 0.95);
      line-height: 1.6;
      font-weight: 400;
      
      @media (max-width: 768px) {
        font-size: 20px;
        margin-bottom: 40px;
      }
    }
    
    .hero-actions {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      
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
  
  .hero-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .hero-graphic {
      width: 100%;
      max-width: 500px;
      height: 400px;
      background: linear-gradient(135deg, #a855f7, #3b82f6);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 96px;
      color: #ffffff;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      opacity: 0.3;
      animation: float 6s ease-in-out infinite;
      
      @media (max-width: 1024px) {
        max-width: 400px;
        height: 300px;
        font-size: 80px;
      }
      
      @media (max-width: 768px) {
        max-width: 300px;
        height: 250px;
        font-size: 64px;
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

// 特性介绍区域
.features-section {
  padding: 128px 64px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  color: #ffffff;
  position: relative;
  
  @media (max-width: 1024px) {
    padding: 112px 48px;
  }
  
  @media (max-width: 768px) {
    padding: 96px 32px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 80px;
    position: relative;
    z-index: 5;
    
    @media (max-width: 768px) {
      margin-bottom: 64px;
    }
    
    h2 {
      font-size: 48px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 32px;
      color: #ffffff;
      
      @media (max-width: 1024px) {
        font-size: 3rem;
      }
      
      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }
    
    p {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
      
      @media (max-width: 768px) {
        font-size: 18px;
      }
    }
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 48px;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 5;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }
  
  .feature-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: center;
    padding: 48px 40px;
    border-radius: 24px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    @media (max-width: 768px) {
      padding: 40px 32px;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      
      &::before {
        transform: scaleX(1);
      }
    }
    
    .feature-icon {
      margin-bottom: 32px;
    }
    
    h3 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #ffffff;
      letter-spacing: -0.3px;
      
      @media (max-width: 768px) {
        font-size: 20px;
      }
    }
    
    p {
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      font-size: 16px;
    }
  }
}

// 应用场景区域
.scenarios-section {
  padding: 128px 64px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(5px);
  position: relative;
  
  @media (max-width: 1024px) {
    padding: 112px 48px;
  }
  
  @media (max-width: 768px) {
    padding: 96px 32px;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 80px;
    
    @media (max-width: 768px) {
      margin-bottom: 64px;
    }
    
    h2 {
      font-size: 48px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 32px;
      color: #ffffff;
      
      @media (max-width: 1024px) {
        font-size: 3rem;
      }
      
      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }
    
    p {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
      
      @media (max-width: 768px) {
        font-size: 18px;
      }
    }
  }
  
  .scenarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 48px;
    max-width: 1200px;
    margin: 0 auto;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }
  
  .scenario-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 48px;
    border-radius: 20px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    @media (max-width: 768px) {
      padding: 40px 32px;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      
      &::before {
        transform: scaleX(1);
      }
    }
    
    h3 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #ffffff;
      letter-spacing: -0.3px;
      
      @media (max-width: 768px) {
        font-size: 20px;
      }
    }
    
    p {
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      font-size: 16px;
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

// 响应式设计已通过mixins处理，无需额外的媒体查询
</style>
