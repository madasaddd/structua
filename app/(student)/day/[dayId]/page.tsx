import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import BlockErrorBoundary from '@/components/blocks/BlockErrorBoundary'
import DayNav, { type DayNavItem } from '@/components/DayNav'
import { getDayWithGlobalIndex } from '@/lib/utils/indexing'

/* ───────────────── SEO Metadata ───────────────── */
type PageProps = { params: Promise<{ dayId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { dayId } = await params
  const id = parseInt(dayId, 10)
  if (isNaN(id)) return { title: 'Not Found — Structua' }

  const [day, globalIndex] = await Promise.all([
    prisma.day.findUnique({
      where: { id },
      include: { week: true },
    }),
    getDayWithGlobalIndex(id),
  ])

  if (!day) return { title: 'Not Found — Structua' }

  return {
    title: `Day ${globalIndex}: ${day.lessonTitle} — Structua`,
    description: `Week ${day.week.order}: ${day.week.themeTitle} · ${day.lessonTitle}. Learn English grammar step-by-step with Structua's 40-day curriculum.`,
  }
}

/* ───────────────── Page Component ───────────────── */
export default async function DayPage({ params }: PageProps) {
  const { dayId: dayIdParam } = await params
  const dayId = parseInt(dayIdParam, 10)

  if (isNaN(dayId)) {
    notFound()
  }

  // Fetch the day (with blocks) and published neighbour days in parallel
  const [day, globalIndex, publishedDays] = await Promise.all([
    prisma.day.findUnique({
      where: { id: dayId },
      include: {
        week: true,
        blocks: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    }),
    getDayWithGlobalIndex(dayId),
    // Fetch only the minimal columns needed for prev/next navigation
    prisma.day.findMany({
      where: { isPublished: true },
      select: { id: true, order: true, weekId: true },
      orderBy: [{ week: { order: 'asc' } }, { order: 'asc' }],
    }),
  ])

  // Only allow viewing published days
  if (!day || !day.isPublished) {
    notFound()
  }

  // Compute prev/next published days from the flat ordered list
  const currentIndex = publishedDays.findIndex((d) => d.id === dayId)

  // Build lightweight DayNavItem objects for prev/next
  async function buildNavItem(d: { id: number; order: number; weekId: number } | undefined): Promise<DayNavItem | null> {
    if (!d) return null
    const [navGlobal, navDay] = await Promise.all([
      getDayWithGlobalIndex(d.id),
      prisma.day.findUnique({ where: { id: d.id }, select: { lessonTitle: true } }),
    ])
    return navDay ? { id: d.id, globalDayIndex: navGlobal, lessonTitle: navDay.lessonTitle } : null
  }

  const [prevDay, nextDay] = await Promise.all([
    buildNavItem(currentIndex > 0 ? publishedDays[currentIndex - 1] : undefined),
    buildNavItem(currentIndex !== -1 && currentIndex < publishedDays.length - 1 ? publishedDays[currentIndex + 1] : undefined),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8 flex animate-fadeIn" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>Week {day.week.order}: {day.week.themeTitle}</li>
          <li>
            <svg
              className="h-5 w-5 flex-shrink-0 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
          </li>
          <li className="font-medium text-gray-500">Day {globalIndex}</li>
        </ol>
      </nav>

      {/* Main Content Area */}
      <article className="pb-12 sm:pb-16">
        <header className="mb-8 sm:mb-10 animate-fadeIn">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {day.lessonTitle}
          </h1>
        </header>

        <div className="prose prose-blue max-w-none">
          {day.blocks.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
              <div className="mb-4 text-5xl">📖</div>
              <h2 className="text-xl font-bold text-gray-400">No content yet</h2>
              <p className="mt-2 text-sm text-gray-400 max-w-sm">
                This lesson is still being prepared. Check back soon for new content!
              </p>
            </div>
          ) : (
            day.blocks.map((block, index) => (
              <div
                key={block.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <BlockErrorBoundary>
                  <BlockRenderer type={block.type} contentData={block.contentData} />
                </BlockErrorBoundary>
              </div>
            ))
          )}
        </div>
      </article>

      {/* Day Navigation Footer */}
      <DayNav prevDay={prevDay} nextDay={nextDay} />
    </div>
  )
}
