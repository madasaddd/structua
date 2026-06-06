import ParagraphPracticeClient from './ParagraphPracticeClient'
import { prisma } from '@/lib/prisma'
import { ESSAY_TYPES } from '@/app/(admin)/admin/writing/[categoryId]/constants'

export default async function WritingParagraphPage() {
  const categories = await prisma.vocabCategory.findMany({
    orderBy: { orderIndex: 'asc' }
  })

  const prompts = await prisma.writingPromptGroup.findMany({
    include: { category: true }
  })

  // Fetch all vocabulary data to enable linking any word returned by AI
  const dbVocabs = await prisma.vocabulary.findMany({
    select: { word: true, partOfSpeech: true, wordlistId: true }
  })

  // Deduplicate by word (choose the first one if exists in multiple, case insensitive)
  const vocabMap: Record<string, { partOfSpeech: string | null, wordlistId: string }> = {}
  dbVocabs.forEach(v => {
    const key = v.word.toLowerCase()
    if (!vocabMap[key]) {
      vocabMap[key] = { partOfSpeech: v.partOfSpeech, wordlistId: v.wordlistId }
    }
  })

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
      <div className="flex-1 w-full max-w-[800px] mx-auto px-8 py-10 pb-32">
        <div className="mb-8">
          <h1 className="text-xl font-extrabold text-[#1f2937] tracking-tight text-center">Write a paragraph practice</h1>
        </div>
        <ParagraphPracticeClient 
          categories={categories} 
          prompts={prompts} 
          vocabMap={vocabMap}
          essayTypes={ESSAY_TYPES}
        />
      </div>
    </div>
  )
}
