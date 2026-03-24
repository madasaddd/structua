import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' }, { status: 400 })
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`

    const supabase = await createClient()
    const { error } = await supabase.storage
      .from('structua-images')
      .upload(fileName, file, { contentType: file.type, upsert: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('structua-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
