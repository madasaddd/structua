'use client'

import { useState } from 'react'
import { Prisma } from '@prisma/client'

type VocabWithDetails = Prisma.VocabularyGetPayload<{
  include: { collocations: true; wordFamilies: true }
}>

export function VocabularyAccordion({ vocab }: { vocab: VocabWithDetails }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 focus:outline-none"
      >
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
             <span className="text-lg font-bold text-gray-900">{vocab.word}</span>
             {vocab.partOfSpeech && (
               <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                 [{vocab.partOfSpeech.toLowerCase()}]
               </span>
             )}
             {vocab.level && (
               <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase ml-1">
                 {vocab.level}
               </span>
             )}
           </div>
           <span className="text-sm text-gray-600 font-medium">{vocab.defIndo}</span>
        </div>
        <div className="shrink-0 text-gray-400">
          <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-5 pt-0 space-y-4">
          
          <div className="text-sm text-gray-700">
             <p>{vocab.defEng}</p>
          </div>

          {vocab.collocations.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Collocation</span>
              <div className="flex flex-wrap gap-2">
                {vocab.collocations.map(col => {
                  const className = `inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-800 shadow-sm transition-colors ${col.url ? 'hover:bg-gray-50 cursor-pointer hover:border-gray-300' : ''}`
                  return col.url ? (
                    <a key={col.id} href={col.url} target="_blank" rel="noopener noreferrer" className={className}>
                      {col.text}
                    </a>
                  ) : (
                    <span key={col.id} className={className}>
                      {col.text}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {vocab.wordFamilies.length > 0 && (
            <div className="bg-blue-50/50 rounded-lg p-4">
              <span className="text-xs font-bold text-blue-600 uppercase block mb-2">Word Family</span>
              <div className="flex flex-wrap gap-2">
                {vocab.wordFamilies.map(wf => {
                  const className = `inline-flex items-center px-3 py-1 bg-white border border-blue-100 rounded-full text-sm font-medium text-blue-900 shadow-sm transition-colors ${wf.url ? 'hover:bg-blue-50 cursor-pointer hover:border-blue-200' : ''}`
                  return wf.url ? (
                    <a key={wf.id} href={wf.url} target="_blank" rel="noopener noreferrer" className={className}>
                      {wf.word} {wf.partOfSpeech && <span className="text-gray-400 ml-1 font-normal">[{wf.partOfSpeech.toLowerCase()}]</span>}
                    </a>
                  ) : (
                    <span key={wf.id} className={className}>
                      {wf.word} {wf.partOfSpeech && <span className="text-gray-400 ml-1 font-normal">[{wf.partOfSpeech.toLowerCase()}]</span>}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}
