import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Allow up to 60 seconds for this route on Vercel
export const maxDuration = 60

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const wordlistId = resolvedParams.wordlistId
    const body = await request.json()
    const { paragraphs } = body

    if (!Array.isArray(paragraphs)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Wipe-and-Replace with sequential queries (pgbouncer Transaction mode compatible)
    // 1. Wipe existing DiscoveryTask (cascades to paragraphs/options/questions)
    await prisma.discoveryTask.deleteMany({ where: { wordlistId } })

    // 2. Create the DiscoveryTask shell
    const task = await prisma.discoveryTask.create({ data: { wordlistId } })

    // 3. Create paragraphs sequentially, then their options and questions
    for (const [pIdx, p] of paragraphs.entries()) {
      const paragraph = await prisma.discoveryParagraph.create({
        data: { taskId: task.id, orderIndex: p.orderIndex ?? pIdx }
      })

      for (const o of p.options) {
        const option = await prisma.paragraphOption.create({
          data: { paragraphId: paragraph.id, content: o.content }
        })

        if (o.questions && o.questions.length > 0) {
          await prisma.discoveryQuestion.createMany({
            data: o.questions.map((q: any, qIdx: number) => ({
              optionId: option.id,
              orderIndex: q.orderIndex ?? qIdx,
              questionText: q.text
            }))
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving discovery task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
