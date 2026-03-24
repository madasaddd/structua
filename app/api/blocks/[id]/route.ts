import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BlockContentSchema } from '@/lib/validators/blocks'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params

  try {
    const body = await request.json()
    const { contentData, type } = z.object({
      type: z.enum(['text', 'callout', 'table', 'divider', 'image']).optional(),
      contentData: z.record(z.string(), z.unknown()).optional(),
    }).parse(body)

    // Validate contentData against the correct schema for this block type
    if (contentData && type) {
      const schema = BlockContentSchema[type]
      schema.parse(contentData)
    }

    const block = await prisma.block.update({
      where: { id },
      data: {
        ...(type && { type: type as any }),
        ...(contentData && { contentData: contentData as any }),
      },
    })

    return NextResponse.json(block)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params

  try {
    await prisma.block.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
