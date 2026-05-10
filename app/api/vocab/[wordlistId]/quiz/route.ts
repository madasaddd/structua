import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'asadalbalad29@gmail.com') return false
  return true
}

export async function GET(request: Request, { params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const quizTask = await prisma.quizTask.findUnique({
      where: { wordlistId: resolvedParams.wordlistId },
      include: {
        instructions: true,
        groups: {
          include: {
            questions: true
          }
        }
      }
    })

    return NextResponse.json(quizTask || { instructions: [], groups: [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()
    const { action, payload } = data

    // Upsert QuizTask to ensure it exists
    const task = await prisma.quizTask.upsert({
      where: { wordlistId: resolvedParams.wordlistId },
      update: {},
      create: { wordlistId: resolvedParams.wordlistId }
    })

    if (action === 'SAVE_INSTRUCTIONS') {
      const { instructions } = payload
      await prisma.quizInstruction.deleteMany({ where: { taskId: task.id } })
      if (instructions && instructions.length > 0) {
        await prisma.quizInstruction.createMany({
          data: instructions.map((ins: any) => ({
            taskId: task.id,
            questionType: ins.questionType,
            instruction: ins.instruction
          }))
        })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'SAVE_GROUP') {
      const { group } = payload
      
      // Delete existing group if it has an id (updating)
      // Actually, Prisma makes it easier if we just delete by ID, or delete and recreate
      if (group.id && group.id.length > 15) { // If it's a real DB UUID
        await prisma.quizGroup.deleteMany({ where: { id: group.id } })
      }

      const savedGroup = await prisma.quizGroup.create({
        data: {
          taskId: task.id,
          orderIndex: group.orderIndex,
          questions: {
            create: group.questions.map((q: any) => ({
              orderIndex: q.orderIndex,
              questionType: q.questionType,
              questionText: q.questionText,
              targetVocabId: q.targetVocabId || null
            }))
          }
        },
        include: { questions: true }
      })
      return NextResponse.json(savedGroup)
    }

    if (action === 'DELETE_GROUP') {
      const { id } = payload
      if (id && id.length > 15) {
        await prisma.quizGroup.deleteMany({ where: { id } })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'BULK_UPLOAD_GROUPS') {
      const { groups } = payload
      await prisma.quizGroup.deleteMany({ where: { taskId: task.id } })
      
      for (const group of groups) {
        await prisma.quizGroup.create({
          data: {
            taskId: task.id,
            orderIndex: group.orderIndex,
            questions: {
              create: group.questions.map((q: any) => ({
                orderIndex: q.orderIndex,
                questionType: q.questionType,
                questionText: q.questionText,
                targetVocabId: q.targetVocabId || null
              }))
            }
          }
        })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[QUIZ_SAVE_ERROR]', error.message)
    return NextResponse.json({ error: 'Failed', detail: error.message }, { status: 500 })
  }
}
