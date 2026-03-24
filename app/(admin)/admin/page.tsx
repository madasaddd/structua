import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
