import bcryptjs from 'bcryptjs'

// Funciones de autenticación segura

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validatePassword = (password) => {
  // Al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
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

export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(10)
  return await bcryptjs.hash(password, salt)
}

export const verifyPassword = async (password, hash) => {
  return await bcryptjs.compare(password, hash)
}

// Gestión de usuarios
export const getUsersFromStorage = () => {
  const users = localStorage.getItem('users')
  return users ? JSON.parse(users) : {}
}

export const saveUsersToStorage = (users) => {
  localStorage.setItem('users', JSON.stringify(users))
}

export const userExists = (username) => {
  const users = getUsersFromStorage()
  return username in users
}

export const registerUser = async (username, email, password) => {
  const users = getUsersFromStorage()
  
  if (userExists(username)) {
    throw new Error('El usuario ya existe')
  }
  
  if (!validateEmail(email)) {
    throw new Error('Email inválido')
  }
  
  if (!validatePassword(password)) {
    throw new Error('Contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula y 1 número')
  }
  
  const hashedPassword = await hashPassword(password)
  
  users[username] = {
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  }
  
  saveUsersToStorage(users)
  return { username, email }
}

export const loginUser = async (username, password) => {
  const users = getUsersFromStorage()
  
  if (!userExists(username)) {
    throw new Error('Usuario o contraseña incorrectos')
  }
  
  const user = users[username]
  const isPasswordValid = await verifyPassword(password, user.password)
  
  if (!isPasswordValid) {
    throw new Error('Usuario o contraseña incorrectos')
  }
  
  return { username, email: user.email }
}

// Gestión de sesión
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser')
  return user ? JSON.parse(user) : null
}

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

export const logoutUser = () => {
  setCurrentUser(null)
}
