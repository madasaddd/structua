import StudentShell from '@/components/StudentShell'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { calculateGlobalIndexes } from '@/lib/utils/indexing'

// Cache sidebar data for 60 seconds — sidebar only changes when admin publishes content
const getSidebarData = unstable_cache(
  async () => {
    const [rawWeeks, vocabCategories, wordlists] = await Promise.all([
      prisma.week.findMany({
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
      }),
      prisma.vocabCategory.findMany({
        orderBy: { orderIndex: 'asc' }
      }),
      prisma.wordlist.findMany({
        select: { id: true, categoryId: true }
      }),
    ])
    return { rawWeeks, vocabCategories, wordlists }
  },
  ['student-sidebar'],
  { revalidate: 60, tags: ['sidebar'] }
)

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { rawWeeks, vocabCategories, wordlists } = await getSidebarData()

  const weeks = calculateGlobalIndexes(rawWeeks) as unknown as import('@/components/Sidebar').SidebarWeek[]

  const wordlistCategoryMap: Record<string, string> = {}
  for (const wl of wordlists) {
    wordlistCategoryMap[wl.id] = wl.categoryId
  }

  return (
    <StudentShell weeks={weeks} vocabCategories={vocabCategories} wordlistCategoryMap={wordlistCategoryMap}>
      {children}
    </StudentShell>
  )
}
