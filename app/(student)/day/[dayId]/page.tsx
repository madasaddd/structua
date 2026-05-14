import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import BlockErrorBoundary from '@/components/blocks/BlockErrorBoundary'
import DayNav, { type DayNavItem } from '@/components/DayNav'
import { getDayWithGlobalIndex } from '@/lib/utils/indexing'
import { NoContentFeature } from '@/components/NoContentFeature'

/* ───────────────── SEO Metadata ───────────────── */
type PageProps = { params: Promise<{ dayId: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { dayId } = await params
  const id = parseInt(dayId, 10)
  if (isNaN(id)) return { title: 'Not Found — Structua' }

  // Lightweight metadata query — only fetches what SEO needs
  const day = await prisma.day.findUnique({
    where: { id },
    select: { lessonTitle: true, week: { select: { order: true, themeTitle: true } } },
  })

  if (!day) return { title: 'Not Found — Structua' }

  // getDayWithGlobalIndex is 2 queries but runs separately from the page body
  const globalIndex = await getDayWithGlobalIndex(id)

  return {
    title: `Day ${globalIndex}: ${day.lessonTitle} — Structua`,
    description: `Week ${day.week.order}: ${day.week.themeTitle} · ${day.lessonTitle}. Learn English grammar step-by-step with Structua's 40-day curriculum.`,
  }
}

/* ───────────────── Page Component ───────────────── */
export default async function DayPage({ params }: PageProps) {
  const { dayId: dayIdParam } = await params
  const dayId = parseInt(dayIdParam, 10)

  if (isNaN(dayId)) notFound()

  // Single parallel batch — fetch everything the page needs at once
  const [day, globalIndex, publishedDays] = await Promise.all([
    prisma.day.findUnique({
      where: { id: dayId },
      include: {
        week: true,
        blocks: { orderBy: { orderIndex: 'asc' } },
      },
    }),
    getDayWithGlobalIndex(dayId),
    // Include lessonTitle here so buildNavItem needs NO extra queries
    prisma.day.findMany({
      where: { isPublished: true },
      select: { id: true, order: true, weekId: true, lessonTitle: true },
      orderBy: [{ week: { order: 'asc' } }, { order: 'asc' }],
    }),
  ])

  if (!day) notFound()
  if (!day.isPublished) return <NoContentFeature backHref="/day/1" />

  const currentIndex = publishedDays.findIndex((d) => d.id === dayId)
  const prevRaw = currentIndex > 0 ? publishedDays[currentIndex - 1] : undefined
  const nextRaw = currentIndex !== -1 && currentIndex < publishedDays.length - 1
    ? publishedDays[currentIndex + 1]
    : undefined

  // Compute global indexes for prev/next in parallel — no extra DB fetches for titles
  const [prevGlobal, nextGlobal] = await Promise.all([
    prevRaw ? getDayWithGlobalIndex(prevRaw.id) : Promise.resolve(null),
    nextRaw ? getDayWithGlobalIndex(nextRaw.id) : Promise.resolve(null),
  ])

  const prevDay: DayNavItem | null = prevRaw && prevGlobal !== null
    ? { id: prevRaw.id, globalDayIndex: prevGlobal, lessonTitle: prevRaw.lessonTitle }
    : null
  const nextDay: DayNavItem | null = nextRaw && nextGlobal !== null
    ? { id: nextRaw.id, globalDayIndex: nextGlobal, lessonTitle: nextRaw.lessonTitle }
    : null

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
