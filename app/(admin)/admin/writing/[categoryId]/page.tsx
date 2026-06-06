import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import WritingConfigClient from './WritingConfigClient'
import { EssayType } from '@prisma/client'

export default async function AdminWritingCategoryPage(props: { params: Promise<{ categoryId: string }> }) {
  const params = await props.params;
  const category = await prisma.vocabCategory.findUnique({
    where: { id: params.categoryId },
    include: {
      writingPromptGroups: {
        orderBy: { orderIndex: 'asc' }
      },
      wordlists: {
        include: {
          vocabularies: {
            select: { word: true }
          }
        }
      }
    }
  })

  if (!category) {
    notFound()
  }

  const vocabularies = Array.from(new Set(
    category.wordlists.flatMap(w => w.vocabularies.map(v => v.word)).filter(Boolean)
  )).sort()

  // Typecast or map JSON fields if needed, but we can just pass them directly
  // since they are valid JSON. Prisma returns them as JsonValue.
  
  return (
    <div className="h-[calc(100vh-4.5rem)]">
      <WritingConfigClient 
        category={category} 
        prompts={category.writingPromptGroups}
        vocabularies={vocabularies}
      />
    </div>
  )
}
