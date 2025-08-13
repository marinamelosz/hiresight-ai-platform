import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
    agreeTerms: false
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }
    
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
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Nome da empresa é obrigatório'
    }
    
    if (!formData.role) {
      newErrors.role = 'Cargo é obrigatório'
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Você deve aceitar os termos de uso'
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
      const userData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
        company: formData.company.trim(),
        role: formData.role
      }
      
      const result = await register(userData)
      
      if (result.success) {
        setMessage('Conta criada com sucesso! Redirecionando para o dashboard...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container register-container">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            🎯 HireSight.ai
          </Link>
          <p className="auth-subtitle">Crie sua conta grátis</p>
          <p className="auth-description">
            Comece seu teste gratuito de 14 dias. Sem cartão de crédito necessário.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Seu nome completo"
                disabled={loading}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email profissional
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="seu@empresa.com"
                disabled={loading}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Empresa
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`form-input ${errors.company ? 'error' : ''}`}
                placeholder="Nome da sua empresa"
                disabled={loading}
              />
              {errors.company && <span className="form-error">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Cargo
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`form-input ${errors.role ? 'error' : ''}`}
                disabled={loading}
              >
                <option value="">Selecione seu cargo</option>
                <option value="hr_manager">Gerente de RH</option>
                <option value="recruiter">Recrutador</option>
                <option value="talent_acquisition">Talent Acquisition</option>
                <option value="hr_director">Diretor de RH</option>
                <option value="ceo">CEO/Fundador</option>
                <option value="other">Outro</option>
              </select>
              {errors.role && <span className="form-error">{errors.role}</span>}
            </div>
          </div>

          <div className="form-row">
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
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirme sua senha"
                disabled={loading}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <span>
                Eu concordo com os{' '}
                <Link to="/terms" target="_blank" className="auth-link">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy" target="_blank" className="auth-link">
                  Política de Privacidade
                </Link>
              </span>
            </label>
            {errors.agreeTerms && <span className="form-error">{errors.agreeTerms}</span>}
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
                Criando conta...
              </>
            ) : (
              '🚀 Criar Conta Grátis'
            )}
          </button>

          <div className="register-benefits">
            <h4>O que você ganha:</h4>
            <ul>
              <li>✅ 14 dias de teste grátis</li>
              <li>✅ Acesso completo a todas as funcionalidades</li>
              <li>✅ Extensão Chrome incluída</li>
              <li>✅ Suporte em português</li>
              <li>✅ Sem compromisso, cancele quando quiser</li>
            </ul>
          </div>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" className="auth-link">
              Fazer login
            </Link>
          </p>
          <p className="auth-note">
            🔒 Seus dados estão seguros • 🇧🇷 Empresa brasileira
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

export default Register

