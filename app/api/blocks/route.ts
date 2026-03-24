import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type AllowedBlockType = 'text' | 'callout' | 'table' | 'divider' | 'image'

const DEFAULT_CONTENT: Record<AllowedBlockType, object> = {
  text: { variant: 'body-md', content: '' },
  callout: { emoji: '💡', color: 'blue', title: '', content: '' },
  table: { caption: '', headers: ['Column 1', 'Column 2'], rows: [['', '']] },
  divider: {},
  image: { url: '', caption: '' },
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const body = await request.json()
    const { dayId, type } = z.object({
      dayId: z.number().int(),
      type: z.enum(['text', 'callout', 'table', 'divider', 'image']),
    }).parse(body)

    // Determine next order_index
    const last = await prisma.block.findFirst({
      where: { dayId },
      orderBy: { orderIndex: 'desc' },
    })
    const orderIndex = last ? last.orderIndex + 1000 : 1000

    const block = await prisma.block.create({
      data: {
        dayId,
        type: type as any,
        orderIndex,
        contentData: DEFAULT_CONTENT[type] as any,
      },
    })

    return NextResponse.json(block, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
