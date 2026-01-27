import { useState, useEffect } from 'react'
import Calendar from './components/Calendar'
import AuthPage from './components/AuthPage'
import { getCurrentUser, logoutUser, onAuthStateChange } from './lib/auth-supabase'
import './styles/global.css'
import './App.css'

function App() {
  const [currentUser, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay usuario logueado al cargar la app
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const subscription = onAuthStateChange((event, user) => {
      setUser(user)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleLogin = (user) => {
    setUser(user)
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
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
