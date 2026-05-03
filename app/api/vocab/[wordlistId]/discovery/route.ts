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

    // Wipe-and-Replace: flatten nested creates into sequential batches
    // to avoid deep-nested transaction timeouts on large payloads.
    await prisma.$transaction(
      async (tx) => {
        // 1. Wipe existing DiscoveryTask (cascades to paragraphs/options/questions)
        await tx.discoveryTask.deleteMany({ where: { wordlistId } })

        // 2. Create the DiscoveryTask shell
        const task = await tx.discoveryTask.create({ data: { wordlistId } })

        // 3. Create paragraphs sequentially, then their options and questions
        for (const [pIdx, p] of paragraphs.entries()) {
          const paragraph = await tx.discoveryParagraph.create({
            data: { taskId: task.id, orderIndex: p.orderIndex ?? pIdx }
          })

          // 4. Create all options for this paragraph
          for (const o of p.options) {
            const option = await tx.paragraphOption.create({
              data: { paragraphId: paragraph.id, content: o.content }
            })

            // 5. Batch-create all questions for this option
            if (o.questions && o.questions.length > 0) {
              await tx.discoveryQuestion.createMany({
                data: o.questions.map((q: any, qIdx: number) => ({
                  optionId: option.id,
                  orderIndex: q.orderIndex ?? qIdx,
                  questionText: q.text
                }))
              })
            }
          }
        }
      },
      { timeout: 30000, maxWait: 10000 }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving discovery task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
