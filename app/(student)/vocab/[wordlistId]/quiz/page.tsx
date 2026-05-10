import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import QuizClient from './QuizClient'

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
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Quiz Not Found</h1>
        <p className="text-gray-500">There are no quiz tasks available for this wordlist yet.</p>
      </div>
    )
  }

  return <QuizClient wordlist={wordlist} />
}
