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

    // Prepare the list of blocks to create and the ID mapping
    const idMapping: Record<string, string> = {}
    const blocksToCreate = blocks.map((block: ValidatedBlock, i: number) => {
      const isTemp = block.id.startsWith('temp-')
      const finalId = isTemp ? crypto.randomUUID() : block.id
      if (isTemp) {
        idMapping[block.id] = finalId
      }
      return {
        id: finalId,
        dayId,
        type: block.type,
        orderIndex: i * 1000,
        contentData: (block.contentData ?? {}) as Prisma.InputJsonObject,
      }
    })

    await prisma.$transaction(async (tx) => {
      // Wipe: Delete all blocks belonging to this day
      await tx.block.deleteMany({ where: { dayId } })
      
      // Replace: Insert the newly ordered/updated batch atomically
      if (blocksToCreate.length > 0) {
        await tx.block.createMany({ data: blocksToCreate })
      }
    }, { maxWait: 5000, timeout: 20000 })

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
