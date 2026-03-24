import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function StudentIndexPage() {
  const firstDay = await prisma.day.findFirst({
    where: { isPublished: true },
    orderBy: [
      { week: { order: 'asc' } },
      { order: 'asc' }
    ]
  })

  if (firstDay) {
    redirect(`/day/${firstDay.id}`)
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Structua!</h2>
        <p className="mt-2 text-gray-500">No content has been published yet. Please check back later.</p>
      </div>
    </div>
  )
}
