import Link from 'next/link'
import { Prisma } from '@prisma/client'

type WordlistWithDetails = Prisma.WordlistGetPayload<{
  include: { vocabularies: true }
}>

export function WordlistCard({
  wordlist,
  category,
}: {
  wordlist: WordlistWithDetails
  category: { id: string; name: string }
}) {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight">
             {category.name} <span className="text-gray-400 font-normal ml-1">—</span> {wordlist.title}
          </h3>
          {wordlist.level && (
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase shrink-0 ml-2">
              {wordlist.level}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6 flex-1">
          {wordlist.description || `${wordlist.vocabularies.length} vocabularies`}
        </p>

        <div className="space-y-2 mt-auto">
          <Link
            href={`/vocab/${wordlist.id}/discovery`}
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Discover Vocabularies
          </Link>
          <Link
            href={`/vocab/${wordlist.id}`}
            className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            See Vocabularies
          </Link>
        </div>
      </div>
    </div>
  )
}
