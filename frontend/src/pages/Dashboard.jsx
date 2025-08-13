import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalCandidates: 1247,
    activeJobs: 23,
    matchScore: 94.2,
    newCandidates: 156
  })

  const [recentCandidates] = useState([
    {
      id: 1,
      name: "João Silva",
      role: "Senior Developer",
      avatar: "👨‍💻",
      matchScore: 98,
      status: "new",
      addedDate: "2025-01-12"
    },
    {
      id: 2,
      name: "Maria Santos",
      role: "UX Designer",
      avatar: "👩‍🎨",
      matchScore: 95,
      status: "reviewed",
      addedDate: "2025-01-12"
    },
    {
      id: 3,
      name: "Pedro Costa",
      role: "Product Manager",
      avatar: "👨‍💼",
      matchScore: 92,
      status: "contacted",
      addedDate: "2025-01-11"
    },
    {
      id: 4,
      name: "Ana Oliveira",
      role: "Data Scientist",
      avatar: "👩‍🔬",
      matchScore: 89,
      status: "interview",
      addedDate: "2025-01-11"
    }
  ])

  const getStatusColor = (status) => {
    const colors = {
      new: '#10b981',
      reviewed: '#f59e0b',
      contacted: '#3b82f6',
      interview: '#8b5cf6'
    }
    return colors[status] || '#6b7280'
  }

  const getStatusText = (status) => {
    const texts = {
      new: 'Novo',
      reviewed: 'Analisado',
      contacted: 'Contatado',
      interview: 'Entrevista'
    }
    return texts[status] || 'Desconhecido'
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>🎯 HireSight.ai</h1>
              <p>Bem-vindo de volta, {user?.name || 'Usuário'}!</p>
            </div>
            <div className="header-right">
              <button className="btn btn-outline" onClick={logout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-content">
                <h2>🚀 Dashboard do HireSight.ai</h2>
                <p>
                  Sua plataforma de recrutamento inteligente está funcionando! 
                  Aqui você pode gerenciar candidatos, visualizar métricas e otimizar seu processo de contratação.
                </p>
                <div className="welcome-actions">
                  <button className="btn btn-primary">
                    📥 Adicionar Candidato
                  </button>
                  <button className="btn btn-outline">
                    🔗 Usar Extensão Chrome
                  </button>
                </div>
              </div>
              <div className="welcome-visual">
                <div className="success-badge">
                  ✅ Sistema Ativo
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.totalCandidates.toLocaleString()}</h3>
                  <p>Total de Candidatos</p>
                  <span className="stat-trend positive">↗️ +23% este mês</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-content">
                  <h3>{stats.activeJobs}</h3>
                  <p>Vagas Ativas</p>
                  <span className="stat-trend positive">↗️ +3 novas</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>{stats.matchScore}%</h3>
                  <p>Score Médio de Match</p>
                  <span className="stat-trend positive">↗️ +5.1%</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h3>{stats.newCandidates}</h3>
                  <p>Novos esta Semana</p>
                  <span className="stat-trend positive">↗️ +12%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Candidates */}
          <section className="candidates-section">
            <div className="section-header">
              <h2>📋 Candidatos Recentes</h2>
              <button className="btn btn-outline">Ver Todos</button>
            </div>
            
            <div className="candidates-table">
              <div className="table-header">
                <div className="col-candidate">Candidato</div>
                <div className="col-role">Cargo</div>
                <div className="col-match">Match</div>
                <div className="col-status">Status</div>
                <div className="col-date">Data</div>
                <div className="col-actions">Ações</div>
              </div>
              
              {recentCandidates.map(candidate => (
                <div key={candidate.id} className="table-row">
                  <div className="col-candidate">
                    <div className="candidate-info">
                      <div className="candidate-avatar">{candidate.avatar}</div>
                      <span className="candidate-name">{candidate.name}</span>
                    </div>
                  </div>
                  <div className="col-role">{candidate.role}</div>
                  <div className="col-match">
                    <div className="match-score">{candidate.matchScore}%</div>
                  </div>
                  <div className="col-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(candidate.status) }}
                    >
                      {getStatusText(candidate.status)}
                    </span>
                  </div>
                  <div className="col-date">{candidate.addedDate}</div>
                  <div className="col-actions">
                    <button className="btn-icon" title="Ver perfil">👁️</button>
                    <button className="btn-icon" title="Editar">✏️</button>
                    <button className="btn-icon" title="Contatar">📧</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="actions-section">
            <div className="section-header">
              <h2>⚡ Ações Rápidas</h2>
            </div>
            
            <div className="actions-grid">
              <div className="action-card">
                <div className="action-icon">🔍</div>
                <h3>Buscar Candidatos</h3>
                <p>Use nossa IA para encontrar candidatos perfeitos</p>
                <button className="btn btn-primary">Iniciar Busca</button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">📊</div>
                <h3>Relatórios</h3>
                <p>Visualize métricas detalhadas do seu recrutamento</p>
                <button className="btn btn-outline">Ver Relatórios</button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">🔗</div>
                <h3>Integrações</h3>
                <p>Conecte com LinkedIn, ATS e outras ferramentas</p>
                <button className="btn btn-outline">Configurar</button>
              </div>
              
              <div className="action-card">
                <div className="action-icon">🎓</div>
                <h3>Treinamento</h3>
                <p>Aprenda a usar todas as funcionalidades</p>
                <button className="btn btn-outline">Começar</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

