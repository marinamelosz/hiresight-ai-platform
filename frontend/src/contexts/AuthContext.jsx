import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('hiresight_token'))

  // API base URL
  const API_BASE = 'http://localhost:5000'

  // Verificar se há token salvo e validar
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('hiresight_token')
      
      if (savedToken) {
        try {
          const response = await fetch(`${API_BASE}/api/profile`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setIsAuthenticated(true)
            setToken(savedToken)
          } else {
            // Token inválido, remover
            localStorage.removeItem('hiresight_token')
            setToken(null)
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error)
          localStorage.removeItem('hiresight_token')
          setToken(null)
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        // Login bem-sucedido
        setUser(data.user)
        setIsAuthenticated(true)
        setToken(data.access_token)
        localStorage.setItem('hiresight_token', data.access_token)
        
        return { success: true, message: data.message }
      } else {
        // Erro no login
        return { success: false, message: data.error || 'Erro no login' }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  // Função de registro
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        // Registro bem-sucedido, fazer login automático
        const loginResult = await login(userData.email, userData.password)
        return { 
          success: true, 
          message: 'Conta criada com sucesso! Bem-vindo ao HireSight.ai!' 
        }
      } else {
        // Erro no registro
        return { success: false, message: data.error || 'Erro no registro' }
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, message: 'Erro de conexão. Tente novamente.' }
    }
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setToken(null)
    localStorage.removeItem('hiresight_token')
  }

  // Função para fazer requisições autenticadas
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      if (response.status === 401) {
        // Token expirado ou inválido
        logout()
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    token,
    login,
    register,
    logout,
    apiCall
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

