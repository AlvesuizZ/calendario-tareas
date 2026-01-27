import { supabase } from './supabase'

/**
 * GESTIÓN DE TAREAS EN SUPABASE
 * 
 * Todas las tareas se guardan en la tabla 'tasks'
 * Cada tarea está vinculada a un usuario (user_id)
 * Por eso nadie puede ver tareas de otros usuarios
 */

/**
 * OBTENER TODAS LAS TAREAS DEL USUARIO
 * 
 * SELECT * FROM tasks WHERE user_id = ? AND task_date = ?
 * 
 * Params:
 * - userId: ID del usuario (viene de Supabase Auth)
 * - date: Fecha en formato YYYY-MM-DD
 */
export const getTasksByDate = async (userId, date) => {
  if (!userId) {
    throw new Error('Usuario no autenticado')
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_date', date)
      .order('created_at', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting tasks:', error)
    throw error
  }
}

/**
 * OBTENER TODAS LAS TAREAS DE UN MES
 * 
 * Útil para ver qué días tienen tareas
 */
export const getTasksByMonth = async (userId, year, month) => {
  if (!userId) {
    throw new Error('Usuario no autenticado')
  }

  try {
    // Generar rango de fechas
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0)
    const endDateStr = endDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('task_date', startDate)
      .lte('task_date', endDateStr)
      .order('task_date', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting monthly tasks:', error)
    throw error
  }
}

/**
 * CREAR UNA NUEVA TAREA
 * 
 * INSERT INTO tasks (user_id, title, notes, task_date, completed)
 * 
 * Params:
 * - userId: ID del usuario
 * - title: Título de la tarea
 * - notes: Notas (opcional)
 * - taskDate: Fecha en YYYY-MM-DD
 */
export const createTask = async (userId, title, notes, taskDate) => {
  if (!userId) {
    throw new Error('Usuario no autenticado')
  }

  if (!title || !title.trim()) {
    throw new Error('El título es requerido')
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: userId,
          title: title.trim(),
          notes: notes?.trim() || null,
          task_date: taskDate,
          completed: false,
        },
      ])
      .select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

/**
 * ACTUALIZAR UNA TAREA
 * 
 * UPDATE tasks SET title=?, notes=?, completed=? WHERE id=?
 */
export const updateTask = async (taskId, updates) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()

    if (error) throw error

    return data[0]
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

/**
 * MARCAR TAREA COMO COMPLETADA
 */
export const toggleTaskComplete = async (taskId, currentStatus) => {
  return updateTask(taskId, { completed: !currentStatus })
}

/**
 * ELIMINAR UNA TAREA
 * 
 * DELETE FROM tasks WHERE id=?
 */
export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

/**
 * ESCUCHAR CAMBIOS EN TIEMPO REAL
 * 
 * Supabase notifica automáticamente cuando:
 * - Se crea una tarea
 * - Se actualiza una tarea
 * - Se elimina una tarea
 * 
 * Esto actualiza la UI automáticamente sin recargar
 */
export const subscribeToTasks = (userId, callback) => {
  const subscription = supabase
    .channel(`tasks:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return subscription
}
