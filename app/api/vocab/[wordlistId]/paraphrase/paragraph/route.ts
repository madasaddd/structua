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

    // 1. Ensure Task exists
    let task = await prisma.paraphraseTask.findUnique({ where: { wordlistId } })
    if (!task) {
      task = await prisma.paraphraseTask.create({ data: { wordlistId } })
    }

    // 2. Upsert the Paragraph
    let dbParagraph
    if (paragraph.id && paragraph.id.length > 20) {
      // Update existing
      dbParagraph = await prisma.paraphraseParagraph.update({
        where: { id: paragraph.id },
        data: { 
          orderIndex: paragraph.orderIndex,
          casualText: paragraph.casualText,
          vocabularies: {
            set: paragraph.vocabIds.map((id: string) => ({ id }))
          }
        },
        include: { vocabularies: true }
      })
    } else {
      // Create new
      dbParagraph = await prisma.paraphraseParagraph.create({
        data: { 
          taskId: task.id, 
          orderIndex: paragraph.orderIndex,
          casualText: paragraph.casualText,
          vocabularies: {
            connect: paragraph.vocabIds.map((id: string) => ({ id }))
          }
        },
        include: { vocabularies: true }
      })
    }

    return NextResponse.json(dbParagraph)
  } catch (error) {
    console.error('Error saving paraphrase paragraph:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ wordlistId: string }> } // unused but needed for next.js signature
) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing paragraph ID' }, { status: 400 })
    }

    await prisma.paraphraseParagraph.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting paraphrase paragraph:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
