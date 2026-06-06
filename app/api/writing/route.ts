import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (data.action === 'CREATE') {
      const created = await prisma.writingPromptGroup.create({
        data: {
          categoryId: data.categoryId,
          essayType: data.essayType,
          orderIndex: data.orderIndex,
          question: data.question,
          introductionJson: data.introductionJson,
          body1Json: data.body1Json,
          body2Json: data.body2Json
        }
      })
      return NextResponse.json(created)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Writing POST error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    if (data.action === 'UPDATE') {
      const updated = await prisma.writingPromptGroup.update({
        where: { id: data.id },
        data: {
          question: data.question,
          introductionJson: data.introductionJson,
          body1Json: data.body1Json,
          body2Json: data.body2Json
        }
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Writing PUT error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.writingPromptGroup.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Writing DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
