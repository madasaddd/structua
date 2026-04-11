'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { SidebarWeek } from '@/components/Sidebar'

export default function AdminSidebar({ weeks }: { weeks: SidebarWeek[] }) {
  const params = useParams()
  const router = useRouter()
  const activeDayId = params.id ? parseInt(params.id as string, 10) : null

  const [openWeeks, setOpenWeeks] = useState<number[]>(() => {
    if (activeDayId) {
      const activeWeek = weeks.find((w) => w.days.some((d) => d.id === activeDayId))
      return activeWeek ? [activeWeek.id] : [weeks[0]?.id]
    }
    return [weeks[0]?.id]
  })

  const toggleWeek = (weekId: number) => {
    setOpenWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    )
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
      <div className="flex h-14 shrink-0 items-center px-4 border-b border-gray-200">
        <Link href="/admin" className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
          ← Dashboard
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {weeks.map((week) => {
          const isOpen = openWeeks.includes(week.id)
          return (
            <div key={week.id}>
              <button
                onClick={() => toggleWeek(week.id)}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50"
              >
                <span>Wk {week.order}: {week.themeTitle}</span>
                <span>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <ul className="mt-1 space-y-0.5">
                  {week.days.map((day) => {
                    const isActive = day.id === activeDayId
                    return (
                      <li key={day.id}>
                        <Link
                          href={`/admin/day/${day.id}`}
                          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="truncate">
                            D{day.globalDayIndex}: {day.lessonTitle}
                          </span>
                          {day.isPublished && (
                            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout button pinned to the bottom */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0L17 9.586V9a1 1 0 112 0v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  )
}
