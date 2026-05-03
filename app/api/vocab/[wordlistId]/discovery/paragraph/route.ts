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

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure DiscoveryTask exists
      let task = await tx.discoveryTask.findUnique({
        where: { wordlistId }
      })

      if (!task) {
        task = await tx.discoveryTask.create({
          data: { wordlistId }
        })
      }

      // 2. Upsert the Paragraph
      // If paragraph.id is a temporary random string from frontend, we treat it as new
      // unless we can find it by id.
      let existingParagraph = null
      if (paragraph.id && paragraph.id.length > 20) { // Basic check for UUID vs random string
         existingParagraph = await tx.discoveryParagraph.findUnique({
            where: { id: paragraph.id }
         })
      }

      const dbParagraph = existingParagraph 
        ? await tx.discoveryParagraph.update({
            where: { id: paragraph.id },
            data: { orderIndex: paragraph.orderIndex }
          })
        : await tx.discoveryParagraph.create({
            data: { 
              taskId: task.id, 
              orderIndex: paragraph.orderIndex 
            }
          })

      // 3. Wipe existing options for this paragraph (cascades to questions)
      await tx.paragraphOption.deleteMany({
        where: { paragraphId: dbParagraph.id }
      })

      // 4. Create new options and questions
      for (const o of paragraph.options) {
        const option = await tx.paragraphOption.create({
          data: {
            paragraphId: dbParagraph.id,
            content: o.content
          }
        })

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

      return dbParagraph
    })

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
