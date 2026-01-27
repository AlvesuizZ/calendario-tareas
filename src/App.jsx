import { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import AuthPage from './components/AuthPage'
import { getCurrentUser, setCurrentUser, logoutUser } from './lib/auth'
import './styles/global.css'
import './App.css'

function App() {
  const [currentUser, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay usuario logueado al cargar la app
    const user = getCurrentUser()
    setUser(user)
    setLoading(false)
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setUser(user)
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="app">
      {currentUser ? (
        <Calendar currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
