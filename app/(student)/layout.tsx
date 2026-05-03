import StudentShell from '@/components/StudentShell'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

import { calculateGlobalIndexes } from '@/lib/utils/indexing'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    <StudentShell weeks={weeks} vocabCategories={vocabCategories}>
      {children}
    </StudentShell>
  )
}
