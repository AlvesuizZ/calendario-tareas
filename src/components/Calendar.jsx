import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import TaskModal from './TaskModal'
import { getTasksByMonth } from '../lib/tasks-supabase'
import '../styles/calendar.css'

export default function Calendar({ currentUser, onLogout }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState({})

  // Cargar tareas del mes actual
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const monthTasks = await getTasksByMonth(
          currentUser.id,
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        )
        
        // Organizar tareas por fecha
        const tasksByDate = {}
        monthTasks.forEach(task => {
          if (!tasksByDate[task.task_date]) {
            tasksByDate[task.task_date] = []
          }
          tasksByDate[task.task_date].push(task)
        })
        setTasks(tasksByDate)
      } catch (error) {
        console.error('Error loading tasks:', error)
      }
    }

    loadTasks()
  }, [currentDate, currentUser.id])

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
        <div className="calendar-header-top">
          <div className="user-info">
            <span className="username">👤 {currentUser.username}</span>
          </div>
          <button onClick={onLogout} className="logout-button" title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>

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
          currentUser={currentUser}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
