import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuizClient from './QuizClient'
import { NoContentFeature } from '@/components/NoContentFeature'

export default async function QuizPage({ params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params
  
  const wordlist = await prisma.wordlist.findUnique({
    where: { id: resolvedParams.wordlistId },
    include: {
      category: true,
      vocabularies: { orderBy: { word: 'asc' } },
      quizTask: {
        include: {
          instructions: true,
          groups: {
            include: {
              questions: { orderBy: { orderIndex: 'asc' } }
            }
          }
        }
      }
    }
  })

  if (!wordlist || !wordlist.quizTask || wordlist.quizTask.groups.length === 0) {
    return <NoContentFeature backHref={`/vocab/${resolvedParams.wordlistId}`} />
  }

  return <QuizClient wordlist={wordlist} />
}
