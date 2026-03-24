import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const lastWeek = await prisma.week.findFirst({
      orderBy: { order: 'desc' },
    })
    const nextOrder = lastWeek ? lastWeek.order + 1 : 1

    const week = await prisma.week.create({
      data: {
        themeTitle: 'New Theme',
        description: '',
        order: nextOrder,
      },
    })
    return NextResponse.json(week)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
