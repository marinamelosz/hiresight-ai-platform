import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const { isAuthenticated } = useAuth()

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Head of Talent Acquisition, TechCorp",
      content: "HireSight.ai reduziu nosso tempo de contratação em 60%. A IA identifica candidatos perfeitos que nunca encontraríamos manualmente.",
      avatar: "👩‍💼"
    },
    {
      name: "Marcus Chen",
      role: "CEO, StartupXYZ",
      content: "Desde que começamos a usar o HireSight.ai, nossa qualidade de contratação melhorou drasticamente. É como ter um especialista em recrutamento 24/7.",
      avatar: "👨‍💻"
    },
    {
      name: "Elena Rodriguez",
      role: "HR Director, GlobalTech",
      content: "A extensão Chrome é revolucionária! Extrair dados do LinkedIn nunca foi tão fácil. Economizamos horas todos os dias.",
      avatar: "👩‍🎓"
    }
  ]

  const features = [
    {
      icon: "🤖",
      title: "IA Avançada para Matching",
      description: "Algoritmos de machine learning analisam perfis e identificam os candidatos ideais com precisão de 95%"
    },
    {
      icon: "⚡",
      title: "Automação Completa",
      description: "Automatize todo o pipeline de recrutamento, desde a busca até o agendamento de entrevistas"
    },
    {
      icon: "🔍",
      title: "Busca Inteligente",
      description: "Encontre candidatos ocultos em toda a web com nossa tecnologia de busca avançada"
    },
    {
      icon: "📊",
      title: "Analytics Poderosos",
      description: "Dashboards em tempo real com métricas que importam: tempo de contratação, qualidade e ROI"
    },
    {
      icon: "🔗",
      title: "Integração Total",
      description: "Conecte com LinkedIn, ATS existentes e mais de 50 plataformas de recrutamento"
    },
    {
      icon: "🛡️",
      title: "Segurança Enterprise",
      description: "Criptografia de ponta a ponta e compliance com GDPR, SOC2 e ISO 27001"
    }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "49",
      period: "mês",
      description: "Perfeito para pequenas empresas e startups",
      features: [
        "Até 50 candidatos/mês",
        "Extensão Chrome",
        "Dashboard básico",
        "Suporte por email",
        "Integração LinkedIn"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Professional",
      price: "149",
      period: "mês",
      description: "Ideal para equipes de RH em crescimento",
      features: [
        "Até 500 candidatos/mês",
        "IA avançada de matching",
        "Analytics completos",
        "Suporte prioritário",
        "Integrações ilimitadas",
        "API personalizada"
      ],
      cta: "Teste 14 Dias Grátis",
      popular: true
    },
    {
      name: "Enterprise",
      price: "399",
      period: "mês",
      description: "Solução completa para grandes corporações",
      features: [
        "Candidatos ilimitados",
        "IA personalizada",
        "Relatórios avançados",
        "Suporte dedicado 24/7",
        "Onboarding personalizado",
        "SLA garantido"
      ],
      cta: "Falar com Vendas",
      popular: false
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">
            <Link to="/" className="logo">🎯 HireSight.ai</Link>
          </div>
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <a href="#features">Recursos</a>
            <a href="#pricing">Preços</a>
            <a href="#testimonials">Cases</a>
            <a href="#contact">Contato</a>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Teste Grátis</Link>
              </>
            )}
          </nav>
          <button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Revolucione Seu <span className="gradient-text">Recrutamento com IA</span>
              </h1>
              <p className="hero-subtitle">
                Encontre os candidatos perfeitos 10x mais rápido com nossa plataforma de recrutamento 
                alimentada por inteligência artificial. Reduza custos, aumente a qualidade e 
                transforme seu RH em uma máquina de resultados.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Precisão no Matching</span>
                </div>
                <div className="stat">
                  <span className="stat-number">60%</span>
                  <span className="stat-label">Redução no Tempo</span>
                </div>
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Empresas Confiam</span>
                </div>
              </div>
              <div className="hero-cta">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-large">
                    🚀 Ir para Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-large">
                      🚀 Começar Teste Grátis
                    </Link>
                    <button className="btn btn-outline btn-large">
                      📹 Ver Demo
                    </button>
                  </>
                )}
              </div>
              <p className="hero-note">
                ✅ Sem cartão de crédito • ✅ Setup em 5 minutos • ✅ Suporte em português
              </p>
            </div>
            <div className="hero-visual">
              <div className="dashboard-preview">
                <div className="dashboard-header">
                  <div className="dashboard-tabs">
                    <span className="tab active">Dashboard</span>
                    <span className="tab">Candidatos</span>
                    <span className="tab">Analytics</span>
                  </div>
                </div>
                <div className="dashboard-content">
                  <div className="metric-card">
                    <span className="metric-title">Candidatos Ativos</span>
                    <span className="metric-value">1,247</span>
                    <span className="metric-trend">↗️ +23%</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-title">Match Score Médio</span>
                    <span className="metric-value">94.2%</span>
                    <span className="metric-trend">↗️ +5.1%</span>
                  </div>
                  <div className="candidate-list">
                    <div className="candidate-item">
                      <div className="candidate-avatar">👨‍💻</div>
                      <div className="candidate-info">
                        <span className="candidate-name">João Silva</span>
                        <span className="candidate-role">Senior Developer</span>
                      </div>
                      <div className="match-score">98%</div>
                    </div>
                    <div className="candidate-item">
                      <div className="candidate-avatar">👩‍🎨</div>
                      <div className="candidate-info">
                        <span className="candidate-name">Maria Santos</span>
                        <span className="candidate-role">UX Designer</span>
                      </div>
                      <div className="match-score">95%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Por que Escolher o HireSight.ai?</h2>
            <p>Tecnologia de ponta que transforma recrutamento em vantagem competitiva</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>O que Nossos Clientes Dizem</h2>
            <p>Resultados reais de empresas que transformaram seu recrutamento</p>
          </div>
          <div className="testimonial-carousel">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"{testimonials[currentTestimonial].content}"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div className="author-info">
                  <span className="author-name">{testimonials[currentTestimonial].name}</span>
                  <span className="author-role">{testimonials[currentTestimonial].role}</span>
                </div>
              </div>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Planos que Cabem no Seu Orçamento</h2>
            <p>Comece grátis e escale conforme sua empresa cresce</p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">Mais Popular</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">R$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/{plan.period}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>✅ {feature}</li>
                  ))}
                </ul>
                <Link 
                  to="/register" 
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-large`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Pronto para Revolucionar Seu Recrutamento?</h2>
            <p>Junte-se a mais de 500 empresas que já transformaram seu RH com HireSight.ai</p>
            <div className="cta-buttons">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  🚀 Ir para Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    🚀 Começar Teste Grátis de 14 Dias
                  </Link>
                  <button className="btn btn-outline btn-large">
                    📞 Agendar Demo Personalizada
                  </button>
                </>
              )}
            </div>
            <p className="cta-note">
              💳 Sem compromisso • 🔒 Dados seguros • 🇧🇷 Suporte em português
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link to="/" className="logo">🎯 HireSight.ai</Link>
              <p>Revolucionando o recrutamento com inteligência artificial</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Produto</h4>
                <a href="#features">Recursos</a>
                <a href="#pricing">Preços</a>
                <a href="#integrations">Integrações</a>
                <a href="#api">API</a>
              </div>
              <div className="link-group">
                <h4>Empresa</h4>
                <a href="#about">Sobre</a>
                <a href="#careers">Carreiras</a>
                <a href="#blog">Blog</a>
                <a href="#press">Imprensa</a>
              </div>
              <div className="link-group">
                <h4>Suporte</h4>
                <a href="#help">Central de Ajuda</a>
                <a href="#contact">Contato</a>
                <a href="#status">Status</a>
                <a href="#security">Segurança</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 HireSight.ai. Todos os direitos reservados.</p>
            <div className="footer-legal">
              <a href="#privacy">Privacidade</a>
              <a href="#terms">Termos</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

