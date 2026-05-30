import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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

  return (
    <div className="relative min-h-screen bg-gray-50/50">
      {/* Background Gradient */}
      <div 
        className="absolute top-0 left-0 w-full h-[400px] pointer-events-none" 
        style={{ background: 'linear-gradient(180deg, #D8EAFD 0%, #FFFFFF 100%)' }} 
      />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href={`/vocab/${wordlist.id}`} className="absolute text-slate-800 hover:bg-white/50 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-full text-center">
            <h1 className="text-xl font-extrabold text-[#1f2937] tracking-tight">Quick Quiz</h1>
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wide">{wordlist.title}</p>
          </div>
        </div>

        {/* Client Interactive Component */}
        <QuizClient wordlist={wordlist} />
      </div>
    </div>
  )
}
