import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params

  try {
    const body = await request.json()
    const { themeTitle } = z.object({
      themeTitle: z.string().min(1),
    }).parse(body)

    const week = await prisma.week.update({
      where: { id: parseInt(id) },
      data: { themeTitle },
    })

    return NextResponse.json(week)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const weekId = parseInt(id, 10)

  try {
    const week = await prisma.week.findUnique({
      where: { id: weekId },
      include: { _count: { select: { days: true } } }
    })

    if (!week) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (week._count.days > 0) {
      return NextResponse.json({ error: 'Cannot delete a week that contains days.' }, { status: 400 })
    }

    await prisma.week.delete({
      where: { id: weekId },
    })

    // Shift orders of subsequent weeks down
    await prisma.week.updateMany({
      where: { order: { gt: week.order } },
      data: { order: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
