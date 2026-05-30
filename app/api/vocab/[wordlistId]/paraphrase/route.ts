import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const task = await prisma.paraphraseTask.findUnique({
      where: { wordlistId: resolvedParams.wordlistId },
      include: {
        paragraphs: {
          include: {
            vocabularies: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    })

    return NextResponse.json(task || { paragraphs: [] })
  } catch (error) {
    console.error('Error fetching paraphrase task:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { action, payload } = body

    if (action === 'BULK_UPLOAD_PARAGRAPHS') {
      const { paragraphs } = payload

      // 1. Ensure ParaphraseTask exists
      let task = await prisma.paraphraseTask.findUnique({ where: { wordlistId: resolvedParams.wordlistId } })
      if (!task) {
        task = await prisma.paraphraseTask.create({ data: { wordlistId: resolvedParams.wordlistId } })
      }

      // 2. Wipe existing paragraphs for this task
      await prisma.paraphraseParagraph.deleteMany({ where: { taskId: task.id } })

      // 3. Create new paragraphs
      for (const p of paragraphs) {
        await prisma.paraphraseParagraph.create({
          data: {
            taskId: task.id,
            orderIndex: p.orderIndex,
            casualText: p.casualText,
            vocabularies: {
              connect: p.vocabIds.map((id: string) => ({ id }))
            }
          }
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error handling paraphrase task post:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
