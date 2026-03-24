import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ReorderSchema = z.object({
  // ordered array of block IDs — server will assign clean indexes
  ids: z.array(z.string().uuid()),
})

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const { ids } = ReorderSchema.parse(await request.json())

    // Re-assign clean stepped order_index values (1000, 2000, …)
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.block.update({
          where: { id },
          data: { orderIndex: (index + 1) * 1000 },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
