import StudentShell from '@/components/StudentShell'
import { prisma } from '@/lib/prisma'

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

  return (
    <StudentShell weeks={weeks}>
      {children}
    </StudentShell>
  )
}
