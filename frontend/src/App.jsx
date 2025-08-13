import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './App.css'

// Componente para proteger rotas que precisam de autenticação
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando HireSight.ai...</p>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Componente para redirecionar usuários autenticados
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Carregando HireSight.ai...</p>
      </div>
    )
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Página inicial - Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Rotas públicas - redirecionam para dashboard se já logado */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Rotas protegidas - precisam de autenticação */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota catch-all - redireciona para home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

