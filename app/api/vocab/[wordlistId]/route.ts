import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'asadalbalad29@gmail.com') return false
  return true
}

export async function POST(request: Request, { params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params;
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await request.json()
    const { action, payload } = data

    if (action === 'SAVE_VOCABULARIES') {
      const { vocabularies } = payload

      await prisma.$transaction(async (tx) => {
        // Wipe existing vocabularies for this wordlist
        // Collocations and WordFamilies will cascade delete
        await tx.vocabulary.deleteMany({ where: { wordlistId: resolvedParams.wordlistId } })
        
        // Insert new ones
        for (const vocab of vocabularies) {
          await tx.vocabulary.create({
            data: {
              wordlistId: resolvedParams.wordlistId,
              word: vocab.word,
              partOfSpeech: vocab.partOfSpeech || null,
              level: vocab.level || null,
              defIndo: vocab.defIndo,
              defEng: vocab.defEng,
              collocations: {
                create: vocab.collocations.map((c: any) => ({ text: c.text, url: c.url || null }))
              },
              wordFamilies: {
                create: vocab.wordFamilies.map((w: any) => ({ word: w.word, partOfSpeech: w.partOfSpeech || null, url: w.url || null }))
              }
            }
          })
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[SAVE_VOCABULARIES ERROR]', message)
    return NextResponse.json({ error: 'Failed', detail: message }, { status: 500 })
  }
}
