'use client'

import { useState } from 'react'
import Sidebar, { SidebarWeek } from '@/components/Sidebar'

export default function StudentShell({
  weeks,
  vocabCategories = [],
  children,
}: {
  weeks: SidebarWeek[]
  vocabCategories?: { id: string; name: string; orderIndex: number }[]
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar weeks={weeks} vocabCategories={vocabCategories} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open menu"
            id="mobile-menu-toggle"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-bold tracking-tight text-gray-900">Structua</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
