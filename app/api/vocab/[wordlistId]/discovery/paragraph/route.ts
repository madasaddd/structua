import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const { wordlistId } = await params
    const body = await request.json()
    const { paragraph } = body

    if (!paragraph) {
      return NextResponse.json({ error: 'Missing paragraph data' }, { status: 400 })
    }

    // 1. Ensure DiscoveryTask exists
    let task = await prisma.discoveryTask.findUnique({ where: { wordlistId } })
    if (!task) {
      task = await prisma.discoveryTask.create({ data: { wordlistId } })
    }

    // 2. Upsert the Paragraph
    let existingParagraph = null
    if (paragraph.id && paragraph.id.length > 20) {
      existingParagraph = await prisma.discoveryParagraph.findUnique({ where: { id: paragraph.id } })
    }

    const dbParagraph = existingParagraph
      ? await prisma.discoveryParagraph.update({
          where: { id: paragraph.id },
          data: { orderIndex: paragraph.orderIndex }
        })
      : await prisma.discoveryParagraph.create({
          data: { taskId: task.id, orderIndex: paragraph.orderIndex }
        })

    // 3. Wipe existing options (cascades to questions)
    await prisma.paragraphOption.deleteMany({ where: { paragraphId: dbParagraph.id } })

    // 4. Create new options and questions
    for (const o of paragraph.options) {
      const option = await prisma.paragraphOption.create({
        data: { paragraphId: dbParagraph.id, content: o.content }
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

    const result = dbParagraph

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving discovery paragraph:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing paragraph ID' }, { status: 400 })
    }

    await prisma.discoveryParagraph.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting discovery paragraph:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
