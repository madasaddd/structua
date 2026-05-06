import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { VocabularyAccordion } from '@/components/vocab/VocabularyAccordion'

export default async function WordlistDetailPage({ params }: { params: Promise<{ wordlistId: string }> | { wordlistId: string } }) {
  const resolvedParams = await params;
  const wordlist = await prisma.wordlist.findUnique({
    where: { id: resolvedParams.wordlistId },
    include: {
      category: true,
      vocabularies: {
        include: {
          collocations: true,
          wordFamilies: true,
        }
      }
    }
  })

  if (!wordlist) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div>
           <Link href="/vocab" className="text-sm text-blue-600 hover:underline mb-3 inline-block">← Back to Category</Link>
           <p className="text-sm text-gray-500 font-medium mb-1">[{wordlist.category.name}]</p>
           <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
             {wordlist.title}
           </h1>
           {wordlist.description && (
             <p className="text-gray-500 mt-2">{wordlist.description}</p>
           )}
        </div>

        <div className="space-y-4">
          {wordlist.vocabularies.map(vocab => (
            <VocabularyAccordion key={vocab.id} vocab={vocab} />
          ))}
          {wordlist.vocabularies.length === 0 && (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 flex text-center justify-center text-gray-500">
              No words have been added to this list yet.
            </div>
          )}
        </div>
      </div>

      {/* Sticky Right Widget */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="sticky top-10 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
               {wordlist.title}
            </h3>
            {wordlist.level && (
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase mt-2 inline-block">
                {wordlist.level}
              </span>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {wordlist.description || `${wordlist.vocabularies.length} vocabularies`}
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Link href={`/vocab/${wordlist.id}/discovery`} className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
              Discover Vocabularies
            </Link>
            <button className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
              Flash Card
            </button>
            <button className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
              Practice 3
            </button>
            <button className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
