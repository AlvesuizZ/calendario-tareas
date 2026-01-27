import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Check, Loader } from 'lucide-react'
import { 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTaskComplete,
  getTasksByDate,
  subscribeToTasks 
} from '../lib/tasks-supabase'
import '../styles/modal.css'

export default function TaskModal({
  date,
  currentUser,
  onClose
}) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [editingNotes, setEditingNotes] = useState('')
  const [editMode, setEditMode] = useState('title') // 'title' o 'notes'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const dateStr = date.toISOString().split('T')[0]

  // Cargar tareas de la fecha
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasksByDate(currentUser.id, dateStr)
        setTasks(data)
      } catch (err) {
        setError('Error cargando tareas')
        console.error(err)
      }
    }

    loadTasks()

    // Suscribirse a cambios en tiempo real
    const subscription = subscribeToTasks(currentUser.id, () => {
      loadTasks()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [dateStr, currentUser.id])

  // Manejo de tecla ESC para cancelar edición
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && editingId !== null) {
        setEditingId(null)
        setEditingText('')
        setEditingNotes('')
        setEditMode('title')
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [editingId])

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setError('Escribe un título')
      return
    }

    try {
      setLoading(true)
      setError('')
      await createTask(currentUser.id, newTask, newNote, dateStr)
      setNewTask('')
      setNewNote('')
      // Recargar tareas inmediatamente
      const updatedTasks = await getTasksByDate(currentUser.id, dateStr)
      setTasks(updatedTasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true)
      await deleteTask(taskId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (task) => {
    try {
      await toggleTaskComplete(task.id, task.completed)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditTask = async (taskId, task, fieldType = 'title') => {
    if (editingId === taskId && editMode === fieldType) {
      // Guardar cambios
      if (fieldType === 'title' && editingText.trim()) {
        try {
          setLoading(true)
          await updateTask(taskId, { title: editingText })
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      } else if (fieldType === 'notes') {
        try {
          setLoading(true)
          await updateTask(taskId, { notes: editingNotes })
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
      setEditingId(null)
      setEditingText('')
      setEditingNotes('')
      setEditMode('title')
    } else {
      // Entrar en modo edición
      setEditingId(taskId)
      setEditMode(fieldType)
      if (fieldType === 'title') {
        setEditingText(task.title)
      } else if (fieldType === 'notes') {
        setEditingNotes(task.notes || '')
      }
    }
  }

  const displayDate = date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{displayDate.charAt(0).toUpperCase() + displayDate.slice(1)}</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Sección de tareas existentes */}
          <div className="tasks-section">
            <h3>Tareas del día</h3>
            <div className="tasks-list">
              {tasks.length === 0 ? (
                <p className="empty-message">Sin tareas para este día</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-header">
                      <button
                        className="complete-button"
                        onClick={() => handleToggleComplete(task)}
                        disabled={loading}
                      >
                        {task.completed && <Check size={20} />}
                      </button>

                      {editingId === task.id && editMode === 'title' ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          className="edit-input"
                          autoFocus
                          disabled={loading}
                        />
                      ) : (
                        <span className="task-title">{task.title}</span>
                      )}

                      <div className="task-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEditTask(task.id, task, 'title')}
                          disabled={loading}
                          title={editingId === task.id && editMode === 'title' ? 'Guardar título' : 'Editar título'}
                        >
                          {editingId === task.id && editMode === 'title' ? <Check size={18} /> : <Edit2 size={18} />}
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={loading}
                        >
                          {loading ? <Loader size={18} className="spinning" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </div>

                    {editingId === task.id && editMode === 'notes' ? (
                      <div className="task-notes-edit">
                        <textarea
                          value={editingNotes}
                          onChange={e => setEditingNotes(e.target.value)}
                          className="edit-notes-input"
                          placeholder="Edita las notas..."
                          autoFocus
                          disabled={loading}
                        />
                        <button
                          className="save-notes-button"
                          onClick={() => handleEditTask(task.id, task, 'notes')}
                          disabled={loading}
                        >
                          {loading ? 'Guardando...' : 'Guardar notas'}
                        </button>
                      </div>
                    ) : task.notes ? (
                      <div className="task-notes" onClick={() => handleEditTask(task.id, task, 'notes')}>
                        <p>{task.notes}</p>
                        <small style={{ marginTop: '8px', display: 'block', color: 'var(--light-text)' }}>
                          Click para editar
                        </small>
                      </div>
                    ) : (
                      <div className="task-notes-empty" onClick={() => handleEditTask(task.id, task, 'notes')}>
                        <small style={{ color: 'var(--light-text)' }}>
                          Click para agregar notas
                        </small>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sección para agregar nueva tarea */}
          <div className="add-task-section">
            <h3>Agregar nueva tarea</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Título de la tarea..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddTask()}
                className="task-input"
                disabled={loading}
              />
              <textarea
                placeholder="Notas (opcional)..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="note-input"
                disabled={loading}
              />
              <button 
                onClick={handleAddTask} 
                className="add-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="spinning" /> Guardando...
                  </>
                ) : (
                  <>
                    <Plus size={20} /> Agregar tarea
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
