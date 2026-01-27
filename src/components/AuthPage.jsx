import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { 
  registerUser, 
  loginUser, 
  validatePassword, 
  getPasswordStrength,
  validateEmail 
} from '../lib/auth'
import '../styles/auth.css'

export default function AuthPage({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordStrength = password ? getPasswordStrength(password) : null

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) {
      setError('El usuario es requerido')
      return
    }

    if (username.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres')
      return
    }

    if (!validateEmail(email)) {
      setError('Email inválido')
      return
    }

    if (!validatePassword(password)) {
      setError('Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)
      await registerUser(username, email, password)
      setSuccess('¡Cuenta creada! Ahora inicia sesión')
      setTimeout(() => {
        setIsRegistering(false)
        setUsername('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Usuario y contraseña son requeridos')
      return
    }

    try {
      setLoading(true)
      const user = await loginUser(username, password)
      onLogin(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📅 Mi Calendario</h1>
          <p>Tus tareas, tu espacio</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Tu usuario"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="form-input"
              disabled={loading}
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isRegistering && password && (
              <div className={`password-strength ${passwordStrength}`}>
                Fuerza: <strong>{passwordStrength}</strong>
              </div>
            )}
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError('')
                setSuccess('')
              }}
              className="toggle-button"
            >
              {isRegistering ? 'Inicia sesión' : 'Registrate'}
            </button>
          </p>
        </div>

        {isRegistering && (
          <div className="password-requirements">
            <p>La contraseña debe contener:</p>
            <ul>
              <li className={password.length >= 8 ? 'valid' : ''}>
                ✓ Mínimo 8 caracteres
              </li>
              <li className={/[A-Z]/.test(password) ? 'valid' : ''}>
                ✓ Al menos 1 mayúscula
              </li>
              <li className={/[a-z]/.test(password) ? 'valid' : ''}>
                ✓ Al menos 1 minúscula
              </li>
              <li className={/\d/.test(password) ? 'valid' : ''}>
                ✓ Al menos 1 número
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
