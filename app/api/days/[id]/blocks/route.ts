import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const dayId = parseInt(id)
  if (isNaN(dayId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const { blocks } = await request.json()
    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // 1. Get current blocks
      const existingBlocks = await tx.block.findMany({ where: { dayId } })
      const incomingIds = blocks.map(b => b.id).filter(id => !id.startsWith('temp-'))

      // 2. Delete blocks not in incoming payload
      const idsToDelete = existingBlocks.filter(b => !incomingIds.includes(b.id)).map(b => b.id)
      if (idsToDelete.length > 0) {
        await tx.block.deleteMany({
          where: { id: { in: idsToDelete } }
        })
      }

      // 3. Upsert blocks (Update existing, Create new)
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        const orderIndex = i * 1000

        if (block.id.startsWith('temp-')) {
          await tx.block.create({
            data: {
              dayId,
              type: block.type as any, // Cast to any to avoid complex TS enum resolving here
              orderIndex,
              contentData: block.contentData,
            }
          })
        } else {
          await tx.block.update({
            where: { id: block.id },
            data: {
              type: block.type as any,
              orderIndex,
              contentData: block.contentData,
            }
          })
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Batch save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
