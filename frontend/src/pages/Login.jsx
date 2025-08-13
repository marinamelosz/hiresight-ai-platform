import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        setMessage('Login realizado com sucesso! Redirecionando...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const result = await login('admin@hiresight.ai', 'admin123')
      
      if (result.success) {
        setMessage('Login demo realizado com sucesso! Redirecionando...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      } else {
        setMessage('Erro no login demo. Tente novamente.')
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            🎯 HireSight.ai
          </Link>
          <p className="auth-subtitle">Entre na sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="seu@email.com"
              disabled={loading}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Sua senha"
              disabled={loading}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Lembrar de mim</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Esqueceu a senha?
            </Link>
          </div>

          {message && (
            <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-large btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Entrando...
              </>
            ) : (
              '🚀 Entrar'
            )}
          </button>

          <div className="divider">
            <span>ou</span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-outline btn-large btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Carregando...
              </>
            ) : (
              '🎯 Testar com Conta Demo'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Não tem uma conta?{' '}
            <Link to="/register" className="auth-link">
              Criar conta grátis
            </Link>
          </p>
          <p className="auth-note">
            ✅ Teste grátis por 14 dias • ✅ Sem cartão de crédito
          </p>
        </div>
      </div>

      {/* Background decorativo */}
      <div className="auth-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
    </div>
  )
}

export default Login

