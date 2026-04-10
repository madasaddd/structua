import { prisma } from '@/lib/prisma'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminHomePage() {

  const weeks = await prisma.week.findMany({
    include: {
      days: {
        select: { id: true, order: true, lessonTitle: true, isPublished: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  return <AdminDashboardClient initialWeeks={weeks} />
}
