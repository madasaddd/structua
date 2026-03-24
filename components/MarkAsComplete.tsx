'use client'

import { useState, useEffect } from 'react'

export default function MarkAsComplete({ dayId }: { dayId: number }) {
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedDays') || '[]')
    setIsCompleted(completed.includes(dayId))
  }, [dayId])

  const toggleComplete = () => {
    const completed = JSON.parse(localStorage.getItem('completedDays') || '[]')
    let newCompleted
    if (completed.includes(dayId)) {
      newCompleted = completed.filter((id: number) => id !== dayId)
    } else {
      newCompleted = [...completed, dayId]
    }
    localStorage.setItem('completedDays', JSON.stringify(newCompleted))
    setIsCompleted(!isCompleted)
    // Dispatch custom event to update sidebar progress
    window.dispatchEvent(new Event('progress-update'))
  }

  return (
    <div className="mt-12 flex items-center justify-center border-t border-gray-100 pt-12">
      <button
        onClick={toggleComplete}
        className={`group relative flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold transition-all ${
          isCompleted
            ? 'bg-green-50 text-green-600 ring-2 ring-green-100'
            : 'bg-accent text-white shadow-xl shadow-accent/20 hover:scale-105 active:scale-95'
        }`}
      >
        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
          isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-white/30'
        }`}>
          {isCompleted && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        {isCompleted ? 'Lesson Completed' : 'Mark as Complete'}
        
        {!isCompleted && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </div>
        )}
      </button>
    </div>
  )
}
