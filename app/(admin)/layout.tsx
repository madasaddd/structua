import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'

import { calculateGlobalIndexes } from '@/lib/utils/indexing'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Check designated admin email
  if (user.email !== 'asadalbalad29@gmail.com') redirect('/')

  const rawWeeks = await prisma.week.findMany({
    select: {
      id: true,
      order: true,
      themeTitle: true,
      days: {
        select: { id: true, order: true, lessonTitle: true, isPublished: true },
        orderBy: { order: 'asc' as const },
      },
    },
    orderBy: { order: 'asc' as const },
  })

  const weeks = calculateGlobalIndexes(rawWeeks) as unknown as import('@/components/Sidebar').SidebarWeek[]

  const vocabCategories = await prisma.vocabCategory.findMany({
    orderBy: { orderIndex: 'asc' }
  })

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar weeks={weeks} vocabCategories={vocabCategories} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Admin Topbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-sm font-semibold text-gray-900">Structua Admin</span>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
            ← Student View
          </a>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
