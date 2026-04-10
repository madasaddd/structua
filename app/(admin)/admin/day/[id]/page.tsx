import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DayEditorClient from '@/components/admin/DayEditorClient'
import { getDayWithGlobalIndex } from '@/lib/utils/indexing'

type Props = { params: Promise<{ id: string }> }

export default async function AdminDayPage({ params }: Props) {
  const { id } = await params
  const dayId = parseInt(id, 10)

  const [day, globalIndex] = await Promise.all([
    prisma.day.findUnique({
      where: { id: dayId },
      include: {
        blocks: { orderBy: { orderIndex: 'asc' } },
        week: { select: { order: true, themeTitle: true } },
      },
    }),
    getDayWithGlobalIndex(dayId),
  ])

  if (!day) notFound()

  return (
    <DayEditorClient
      day={{
        id: day.id,
        lessonTitle: day.lessonTitle,
        order: day.order,
        globalDayIndex: globalIndex,
        isPublished: day.isPublished,
        week: day.week,
        blocks: day.blocks,
      }}
    />
  )
}
