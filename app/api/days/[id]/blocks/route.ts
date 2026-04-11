import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z, ZodSafeParseSuccess } from 'zod'

type Params = { params: Promise<{ id: string }> }

// Zod schema that validates each block in the incoming payload
const BLOCK_TYPES = ['text', 'callout', 'table', 'divider', 'image'] as const
const BlockPayloadSchema = z.object({
  id: z.string(),
  type: z.enum(BLOCK_TYPES),
  orderIndex: z.number().optional(),
  // contentData must be a non-null object (JSON)
  contentData: z.record(z.string(), z.unknown()).nullable().transform((val) => val ?? {}),
})
type ValidatedBlock = z.infer<typeof BlockPayloadSchema>

export async function PUT(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { id } = await params
  const dayId = parseInt(id)
  if (isNaN(dayId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  try {
    const body = await request.json()
    if (!body || !Array.isArray(body.blocks)) {
      return NextResponse.json({ error: 'Invalid payload: expected { blocks: [] }' }, { status: 400 })
    }

    const parseResults: ReturnType<typeof BlockPayloadSchema.safeParse>[] =
      body.blocks.map((b: unknown, i: number) => {
        const result = BlockPayloadSchema.safeParse(b)
        if (!result.success) {
          console.error(`[blocks/PUT] Block[${i}] validation failed:`, result.error.flatten())
        }
        return result
      })

    const firstFailure = parseResults.find((r: ReturnType<typeof BlockPayloadSchema.safeParse>) => !r.success)
    if (firstFailure && !firstFailure.success) {
      return NextResponse.json(
        { error: 'Block validation failed', details: firstFailure.error.flatten() },
        { status: 400 }
      )
    }

    const blocks: ValidatedBlock[] = parseResults.map(
      (r: ZodSafeParseSuccess<ValidatedBlock> | ReturnType<typeof BlockPayloadSchema.safeParse>) =>
        (r as ZodSafeParseSuccess<ValidatedBlock>).data
    )

    const idMapping = await prisma.$transaction(async (tx) => {
      // 1. Get current blocks for this day
      const existingBlocks = await tx.block.findMany({ where: { dayId } })
      const incomingIds: string[] = blocks
        .map((b: ValidatedBlock) => b.id)
        .filter((bid: string) => !bid.startsWith('temp-'))

      // 2. Delete blocks that are no longer in the payload
      const idsToDelete: string[] = existingBlocks
        .filter((b) => !incomingIds.includes(b.id))
        .map((b) => b.id)
      if (idsToDelete.length > 0) {
        await tx.block.deleteMany({ where: { id: { in: idsToDelete } } })
      }

      // 3. Upsert — create temp blocks, update persisted ones
      const mapping: Record<string, string> = {}

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        const orderIndex = i * 1000

        const exists = existingBlocks.find((b) => b.id === block.id)

        if (!exists || block.id.startsWith('temp-')) {
          // New block — create without the temp ID (DB generates a real UUID)
          const newBlock = await tx.block.create({
            data: {
              dayId,
              type: block.type,
              orderIndex,
              contentData: (block.contentData ?? {}) as Prisma.InputJsonObject,
            },
          })
          if (block.id.startsWith('temp-')) {
            mapping[block.id] = newBlock.id
          }
        } else {
          // Existing block — update in place
          await tx.block.update({
            where: { id: block.id },
            data: {
              type: block.type,
              orderIndex,
              contentData: (block.contentData ?? {}) as Prisma.InputJsonObject,
            },
          })
        }
      }

      return mapping
    })

    return NextResponse.json({ success: true, idMapping })
  } catch (error) {
    // Log the full error so it appears in Vercel / Next.js server logs
    console.error('[blocks/PUT] Batch save error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
