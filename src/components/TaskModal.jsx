import React, { useState } from 'react'
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react'
import '../styles/modal.css'

export default function TaskModal({
  date,
  tasks,
  onClose,
  onAddTask,
  onDeleteTask,
  onEditTask
}) {
  const [newTask, setNewTask] = useState('')
  const [newNote, setNewNote] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask({
        title: newTask,
        notes: newNote,
        completed: false,
        createdAt: new Date().toISOString()
      })
      setNewTask('')
      setNewNote('')
    }
  }

  const handleEditTask = (taskId, currentTitle) => {
    if (editingId === taskId) {
      if (editingText.trim()) {
        onEditTask(taskId, { title: editingText })
      }
      setEditingId(null)
      setEditingText('')
    } else {
      setEditingId(taskId)
      setEditingText(currentTitle)
    }
  }

  const handleToggleComplete = (taskId, currentStatus) => {
    onEditTask(taskId, { completed: !currentStatus })
  }

  const dateStr = date.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
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
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                      >
                        {task.completed && <Check size={20} />}
                      </button>

                      {editingId === task.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          className="edit-input"
                          autoFocus
                        />
                      ) : (
                        <span className="task-title">{task.title}</span>
                      )}

                      <div className="task-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEditTask(task.id, task.title)}
                          title={editingId === task.id ? 'Guardar' : 'Editar'}
                        >
                          {editingId === task.id ? <Check size={18} /> : <Edit2 size={18} />}
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="task-notes">
                        <p>{task.notes}</p>
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
              />
              <textarea
                placeholder="Notas (opcional)..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="note-input"
              />
              <button onClick={handleAddTask} className="add-button">
                <Plus size={20} /> Agregar tarea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
