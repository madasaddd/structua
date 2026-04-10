'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Day = { id: number; order: number; lessonTitle: string; isPublished: boolean }
type Week = { id: number; order: number; themeTitle: string; days: Day[] }
type IndexedDay = Day & { globalDayIndex: number }
type IndexedWeek = Omit<Week, 'days'> & { days: IndexedDay[] }

function calcIndexes(weeks: Week[]): IndexedWeek[] {
  let g = 1
  return weeks.map((w) => ({
    ...w,
    days: w.days.map((d) => ({ ...d, globalDayIndex: g++ })),
  }))
}

export default function AdminDashboardClient({ initialWeeks }: { initialWeeks: Week[] }) {
  const [weeks, setWeeks] = useState<Week[]>(initialWeeks)
  const [processing, setProcessing] = useState(false)

  const indexedWeeks = useMemo(() => calcIndexes(weeks), [weeks])
  const totalDays = indexedWeeks.reduce((sum, w) => sum + w.days.length, 0)
  const publishedDays = indexedWeeks.reduce((sum, w) => sum + w.days.filter((d) => d.isPublished).length, 0)

  const handleAddWeek = async () => {
    setProcessing(true)
    const res = await fetch('/api/weeks', { method: 'POST' })
    if (res.ok) {
      const newWeek = await res.json()
      setWeeks((prev) => [...prev, { ...newWeek, days: [] }])
    }
    setProcessing(false)
  }

  const handleDeleteWeek = async (weekId: number) => {
    setProcessing(true)
    const res = await fetch(`/api/weeks/${weekId}`, { method: 'DELETE' })
    if (res.ok) {
      setWeeks((prev) => prev.filter((w) => w.id !== weekId))
    }
    setProcessing(false)
  }

  const handleUpdateWeekTitle = async (weekId: number, themeTitle: string) => {
    setWeeks((prev) => prev.map((w) => (w.id === weekId ? { ...w, themeTitle } : w))) // Optimistic UI update
    await fetch(`/api/weeks/${weekId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeTitle }),
    })
  }

  const handleAddDay = async (weekId: number) => {
    setProcessing(true)
    const res = await fetch('/api/days', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekId }),
    })
    if (res.ok) {
      const newDay = await res.json()
      setWeeks((prev) =>
        prev.map((w) => (w.id === weekId ? { ...w, days: [...w.days, newDay] } : w))
      )
    } else {
      const errorData = await res.json()
      alert(errorData.error || 'Failed to add day')
    }
    setProcessing(false)
  }

  const handleDeleteDay = async (dayId: number, weekId: number) => {
    if (!confirm('Are you sure you want to delete this day?')) return
    setProcessing(true)
    const res = await fetch(`/api/days/${dayId}`, { method: 'DELETE' })
    if (res.ok) {
      setWeeks((prev) =>
        prev.map((w) =>
          w.id === weekId
            ? { ...w, days: w.days.filter((d) => d.id !== dayId) }
            : w
        )
      )
    }
    setProcessing(false)
  }

  const handleUpdateDayTitle = async (dayId: number, weekId: number, lessonTitle: string) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? {
              ...w,
              days: w.days.map((d) => (d.id === dayId ? { ...d, lessonTitle } : d)),
            }
          : w
      )
    )
    await fetch(`/api/days/${dayId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonTitle }),
    })
  }

  return (
    <div className="mx-auto max-w-4xl p-8 pb-24">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {publishedDays} of {totalDays} days published
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {indexedWeeks.map((week) => (
          <div key={week.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between group">
              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold text-sm text-gray-500">
                  Week {week.order}:
                </span>
                <input
                  type="text"
                  className="font-semibold text-sm text-gray-900 bg-transparent border-none focus:ring-0 p-0 w-full hover:bg-white focus:bg-white rounded px-1 transition-colors outline-none"
                  value={week.themeTitle}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setWeeks((prev) =>
                      prev.map((w) => (w.id === week.id ? { ...w, themeTitle: newValue } : w))
                    )
                  }}
                  onBlur={(e) => handleUpdateWeekTitle(week.id, e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAddDay(week.id)}
                  disabled={processing || week.days.length >= 7}
                  className="text-xs font-medium px-2 py-1 bg-white border border-gray-200 rounded text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  + Add Day
                </button>

                <div className="relative group/tooltip">
                  <button
                    onClick={() => handleDeleteWeek(week.id)}
                    disabled={processing || week.days.length > 0}
                    className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1"
                    title={week.days.length > 0 ? "Cannot delete a week that contains days." : "Delete week"}
                  >
                    Delete
                  </button>
                  {week.days.length > 0 && (
                     <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block w-48 bg-gray-900 text-white text-[10px] rounded py-1 px-2 text-center pointer-events-none z-10">
                       Cannot delete empty week first
                     </div>
                  )}
                </div>
              </div>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {week.days.map((day) => (
                <li key={day.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 group/day">
                  <div className="flex items-center gap-2 flex-1 relative">
                    <span className="text-sm font-medium text-gray-500 w-12 shrink-0 border border-gray-100 bg-white rounded px-1.5 py-0.5 text-center shadow-sm">
                      D{day.globalDayIndex}
                    </span>
                    <input
                      type="text"
                      className="text-sm text-gray-900 font-medium bg-transparent border-none focus:ring-0 p-0 w-full hover:bg-white focus:bg-white rounded px-2 py-1 transition-colors outline-none border border-transparent focus:border-gray-200 hover:border-gray-200"
                      value={day.lessonTitle}
                      onChange={(e) => {
                        const newValue = e.target.value
                        setWeeks((prev) =>
                          prev.map((w) =>
                            w.id === week.id
                              ? {
                                  ...w,
                                  days: w.days.map((d) => (d.id === day.id ? { ...d, lessonTitle: newValue } : d)),
                                }
                              : w
                          )
                        )
                      }}
                      onBlur={(e) => handleUpdateDayTitle(day.id, week.id, e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pl-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        day.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {day.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                      <Link
                        href={`/admin/day/${day.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md"
                      >
                        Edit →
                      </Link>
                      <button
                        onClick={() => handleDeleteDay(day.id, week.id)}
                        disabled={processing}
                        className="text-xs font-medium text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover/day:opacity-100 p-1.5"
                        title="Delete day"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {week.days.length === 0 && (
                <li className="px-5 py-8 text-center text-gray-400 text-sm">
                  This week is empty. Click "+ Add Day" to get started.
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
         <button
            onClick={handleAddWeek}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-6 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 focus:outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span className="text-xl leading-none">+</span> Add a New Week
          </button>
      </div>
    </div>
  )
}
