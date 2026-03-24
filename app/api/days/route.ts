import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { weekId } = z.object({
      weekId: z.number(),
    }).parse(await request.json())

    // 1. Check if the week exists and count its days
    const week = await prisma.week.findUnique({
      where: { id: weekId },
      include: {
        _count: { select: { days: true } }
      }
    })

    if (!week) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 })
    }

    if (week._count.days >= 7) {
      return NextResponse.json({ error: 'Maximum of 7 days per week reached.' }, { status: 400 })
    }

    // 2. Find maximum order in this week
    const lastDay = await prisma.day.findFirst({
      where: { weekId },
      orderBy: { order: 'desc' },
    })

    const nextOrder = lastDay ? lastDay.order + 1 : 1

    // 3. Create the day
    const day = await prisma.day.create({
      data: {
        weekId,
        order: nextOrder,
        lessonTitle: 'New Lesson',
        isPublished: false,
      },
    })

    return NextResponse.json(day)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
