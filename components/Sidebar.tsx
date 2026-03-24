'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export type SidebarDay = {
  id: number
  order: number
  lessonTitle: string
  isPublished: boolean
  globalDayIndex: number
}

export type SidebarWeek = {
  id: number
  order: number
  themeTitle: string
  days: SidebarDay[]
}

type SidebarProps = {
  weeks: SidebarWeek[]
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ weeks, isOpen = false, onClose }: SidebarProps) {
  const params = useParams()
  const pathname = usePathname()
  const activeDayId = params.dayId ? parseInt(params.dayId as string, 10) : null

  // By default, open the week containing the active day, or Week 1 if none
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

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    onClose?.()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // --- Progress tracking hidden in Sprint 3 ---
  // const [completedCount, setCompletedCount] = useState(0)
  // const totalDays = weeks.flatMap((w) => w.days).length
  // useEffect(() => { ... }, [])
  // const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0
  // --- End hidden progress tracking ---

  const sidebarContent = (
    <>
      {/* Title Area */}
      <div className="flex h-[4.5rem] shrink-0 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <svg className="h-6 w-6 text-gray-900" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5V4.5C4 4.08579 4.33579 3.75 4.75 3.75H17.25C18.4926 3.75 19.5 4.75736 19.5 6V18.75C19.5 19.5784 18.8284 20.25 18 20.25H4.75C4.33579 20.25 4 19.9142 4 19.5ZM4 19.5V20.25H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 8.25H15.5M8 12.25H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-lg font-bold tracking-tight text-gray-900">Structua</span>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Accordion List */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="space-y-4">
          {weeks.map((week) => {
            const isOpen = openWeeks.includes(week.id)
            return (
              <div key={week.id} className="group/week">
                <button
                  onClick={() => toggleWeek(week.id)}
                  className="flex w-full items-center justify-between px-2 py-2 text-[13px] font-bold text-gray-900 hover:text-accent transition-colors"
                >
                  <span>Week {week.order}: {week.themeTitle}</span>
                  <svg 
                    className={`h-3 w-3 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <ul className="overflow-hidden mt-1 space-y-0.5">
                    {week.days.map((day) => {
                      const isActive = day.id === activeDayId
                      return (
                        <li key={day.id}>
                          {day.isPublished ? (
                            <Link
                              href={`/day/${day.id}`}
                              onClick={() => onClose?.()}
                              className={`flex items-center rounded-lg px-3 py-2 text-[13px] transition-all ${
                                isActive
                                  ? 'bg-gray-100 font-medium text-gray-900'
                                  : 'font-normal text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {isActive ? (
                                <svg className="mr-3 h-4 w-4 shrink-0 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="mr-3 h-3 w-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </svg>
                              )}
                              <span className="truncate">
                                Day {day.globalDayIndex}: {day.lessonTitle}
                              </span>
                            </Link>
                          ) : (
                            <div className="flex items-center rounded-lg px-3 py-2 text-[13px] font-normal text-gray-400 cursor-not-allowed">
                              <svg className="mr-3 h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" strokeDasharray="4 4" />
                              </svg>
                              <span className="truncate">
                                Day {day.globalDayIndex}: {day.lessonTitle}
                              </span>
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Give Feedback Area */}
      <div className="border-t border-gray-100 p-4 shrink-0">
        <a
          href="https://forms.gle/3JwFx1221e9NZVPm7"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Give Feedback
        </a>
      </div>

    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Drawer */}
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 flex flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  )
}
