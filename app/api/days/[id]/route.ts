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
    const parsed = z.object({
      isPublished: z.boolean().optional(),
      lessonTitle: z.string().min(1).optional(),
    }).parse(body)

    const day = await prisma.day.update({
      where: { id: parseInt(id) },
      data: parsed,
    })

    return NextResponse.json(day)
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
  const dayId = parseInt(id, 10)

  try {
    // 1. Fetch the day to know its weekId and order before deletion
    const dayToDelete = await prisma.day.findUnique({
      where: { id: dayId },
    })

    if (!dayToDelete) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // 2. Delete the day
    await prisma.day.delete({
      where: { id: dayId },
    })

    // 3. Shift the orders of subsequent days down by 1
    await prisma.day.updateMany({
      where: {
        weekId: dayToDelete.weekId,
        order: { gt: dayToDelete.order },
      },
      data: {
        order: { decrement: 1 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
