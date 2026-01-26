import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TaskModal from './TaskModal'
import '../styles/calendar.css'

const getInitialTasks = () => {
  const savedTasks = localStorage.getItem('tasks')
  return savedTasks ? JSON.parse(savedTasks) : {}
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState(getInitialTasks())

  // Guardar tareas en localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDayClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)
    setShowModal(true)
  }

  const handleAddTask = (taskData) => {
    const dateKey = formatDate(selectedDate)
    const newTask = {
      id: Date.now(),
      ...taskData
    }

    setTasks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask]
    }))
  }

  const handleDeleteTask = (taskId) => {
    const dateKey = formatDate(selectedDate)
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(task => task.id !== taskId)
    }))
  }

  const handleEditTask = (taskId, updatedData) => {
    const dateKey = formatDate(selectedDate)
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(task =>
        task.id === taskId ? { ...task, ...updatedData } : task
      )
    }))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // Agregar días vacíos del mes anterior
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Agregar días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <div className="calendar-container">
      <div className="calendar-card">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="nav-button">
            <ChevronLeft size={24} />
          </button>
          <h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h2>
          <button onClick={handleNextMonth} className="nav-button">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="days-grid">
          {days.map((day, index) => {
            const dateKey = day ? formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) : null
            const dayTasks = dateKey ? (tasks[dateKey] || []) : []

            return (
              <div
                key={index}
                className={`day ${day ? 'active' : 'empty'}`}
                onClick={() => day && handleDayClick(day)}
              >
                {day && (
                  <>
                    <span className="day-number">{day}</span>
                    {dayTasks.length > 0 && (
                      <div className="task-indicator">
                        <span className="task-count">{dayTasks.length}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showModal && selectedDate && (
        <TaskModal
          date={selectedDate}
          tasks={tasks[formatDate(selectedDate)] || []}
          onClose={() => setShowModal(false)}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
        />
      )}
    </div>
  )
}
