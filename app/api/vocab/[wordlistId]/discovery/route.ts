import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Wipe-and-Replace logic
    await prisma.$transaction(async (tx) => {
      // Delete existing DiscoveryTask for this wordlist
      await tx.discoveryTask.deleteMany({
        where: { wordlistId }
      })

      // Create new DiscoveryTask
      await tx.discoveryTask.create({
        data: {
          wordlistId,
          paragraphs: {
            create: paragraphs.map((p: any) => ({
              orderIndex: p.orderIndex,
              options: {
                create: p.options.map((o: any) => ({
                  content: o.content,
                  questions: {
                    create: o.questions.map((q: any) => ({
                      orderIndex: q.orderIndex,
                      questionText: q.text
                    }))
                  }
                }))
              }
            }))
          }
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving discovery task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
