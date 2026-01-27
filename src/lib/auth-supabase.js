import { supabase } from './supabase'

/**
 * AUTENTICACIÓN CON SUPABASE
 * 
 * Supabase maneja:
 * - Hash seguro de contraseñas (bcrypt en servidores)
 * - Sesiones de usuario
 * - Recuperación de contraseña
 * - Todo automáticamente
 */

// Validaciones locales (antes de enviar a Supabase)
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePassword = (password) => {
  // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export const getPasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[@$!%*?&]/.test(password)) strength++
  
  if (strength <= 2) return 'débil'
  if (strength <= 4) return 'media'
  return 'fuerte'
}

/**
 * REGISTRAR USUARIO EN SUPABASE
 * 
 * Esto envía los datos a Supabase que:
 * 1. Valida el email
 * 2. Hashea la contraseña (bcrypt)
 * 3. Crea el usuario
 * 4. Envía email de confirmación (opcional)
 */
export const registerUser = async (email, password, username) => {
  if (!validateEmail(email)) {
    throw new Error('Email inválido')
  }

  if (!validatePassword(password)) {
    throw new Error('Contraseña debe tener: 8+ caracteres, mayúscula, minúscula, número')
  }

  if (!username || username.length < 3) {
    throw new Error('Usuario debe tener al menos 3 caracteres')
  }

  try {
    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username, // Datos adicionales del usuario
        },
      },
    })

    if (error) throw error

    return {
      user: data.user,
      message: 'Verifica tu email para confirmar la cuenta',
    }
  } catch (error) {
    throw new Error(error.message || 'Error al registrar')
  }
}

/**
 * INICIAR SESIÓN EN SUPABASE
 * 
 * Supabase:
 * 1. Verifica email y contraseña
 * 2. Crea una sesión
 * 3. Devuelve un token JWT (para futuras peticiones)
 */
export const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos')
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return {
      user: data.user,
      session: data.session,
    }
  } catch {
    throw new Error('Email o contraseña incorrectos')
  }
}

/**
 * OBTENER USUARIO ACTUAL
 * 
 * Supabase guarda la sesión automáticamente
 * Esta función obtiene el usuario si hay sesión activa
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) throw error
    
    return data.user
  } catch (err) {
    console.error('Error getting current user:', err)
    return null
  }
}

/**
 * CERRAR SESIÓN
 * 
 * Elimina la sesión del navegador y de Supabase
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user || null)
  })

  return data.subscription
}
