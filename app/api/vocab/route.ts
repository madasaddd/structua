import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// Middleware check for admin authentication
async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'asadalbalad29@gmail.com') return false
  return true
}

// POST for Category and Wordlist Creation
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()
    const { action, payload } = data

    if (action === 'CREATE_CATEGORY') {
      const orderCount = await prisma.vocabCategory.count()
      const newCategory = await prisma.vocabCategory.create({
        data: {
          name: payload.name,
          orderIndex: orderCount + 1
        }
      })
      revalidatePath('/vocab')
      return NextResponse.json(newCategory)
    }

    if (action === 'CREATE_WORDLIST') {
      const orderCount = await prisma.wordlist.count({ where: { categoryId: payload.categoryId } })
      const newWordlist = await prisma.wordlist.create({
        data: {
          title: payload.title,
          description: payload.description,
          categoryId: payload.categoryId,
          orderIndex: orderCount + 1,
        }
      })
      revalidatePath('/vocab')
      return NextResponse.json(newWordlist)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const data = await request.json()
    const { action, payload } = data

    if (action === 'UPDATE_CATEGORY') {
      const updated = await prisma.vocabCategory.update({
        where: { id: payload.id },
        data: { name: payload.name }
      })
      revalidatePath('/vocab')
      return NextResponse.json(updated)
    }

    if (action === 'UPDATE_WORDLIST') {
      const updated = await prisma.wordlist.update({
        where: { id: payload.id },
        data: { 
          title: payload.title,
          description: payload.description
        }
      })
      revalidatePath('/vocab')
      return NextResponse.json(updated)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    if (action === 'DELETE_WORDLIST') {
      await prisma.wordlist.delete({ where: { id } })
      revalidatePath('/vocab')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
