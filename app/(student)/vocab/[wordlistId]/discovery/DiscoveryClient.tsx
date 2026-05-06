'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type ResultItem = {
  status: 'correct' | 'incorrect'
  vocabulary: string
  part_of_speech: string
  reason: string
  definition_eng: string
}

// Merge question + its result + the user's answer into one unified view
type QuestionWithResult = {
  id: string
  questionText: string
  userAnswer: string
  result: ResultItem | null
}

export default function DiscoveryClient({ wordlist }: { wordlist: any }) {
  const router = useRouter()
  const paragraphs = wordlist.discoveryTask.paragraphs
  const vocabularies: any[] = wordlist.vocabularies || []

  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const currentParagraph = paragraphs[currentParagraphIndex]

  const [activeOptionIndex, setActiveOptionIndex] = useState(0)
  const activeOption = currentParagraph.options[activeOptionIndex]

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResults, setEvaluationResults] = useState<ResultItem[] | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load dotlottie web component script once
  useEffect(() => {
    if (document.querySelector('script[data-dotlottie]')) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.10/dist/dotlottie-wc.js'
    script.type = 'module'
    script.setAttribute('data-dotlottie', '1')
    document.head.appendChild(script)
  }, [])

  const handleRegenerate = () => {
    if (currentParagraph.options.length <= 1) return
    let nextIndex = activeOptionIndex + 1
    if (nextIndex >= currentParagraph.options.length) nextIndex = 0
    setActiveOptionIndex(nextIndex)
    setAnswers({})
    setEvaluationResults(null)
  }

  const handleCheckAnswer = async () => {
    setIsEvaluating(true)
    try {
      const payload = {
        context: {
          paragraph: activeOption.content,
          wordlist_title: `${wordlist.category.name} — ${wordlist.title}`
        },
        tasks: activeOption.questions.map((q: any, index: number) => ({
          question_id: index + 1,
          question_text: q.questionText,
          user_answer: answers[q.id] || ''
        }))
      }

      const res = await fetch(`/api/vocab/${wordlist.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Evaluation failed')

      const data = await res.json()
      if (data.results) {
        setEvaluationResults(data.results)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        alert('Invalid response format from AI')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to evaluate answers. Please check the AI config.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleContinue = () => {
    setEvaluationResults(null)
    setAnswers({})
    setActiveOptionIndex(0)
    if (currentParagraphIndex < paragraphs.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1)
    } else {
      router.push(`/vocab/${wordlist.id}`)
    }
  }

  // Build unified question list — merge result if available
  const questionsWithResults: QuestionWithResult[] = activeOption.questions.map((q: any, i: number) => ({
    id: q.id,
    questionText: q.questionText,
    userAnswer: answers[q.id] || '',
    result: evaluationResults?.[i] ?? null
  }))

  // Extract <b>word</b> tokens from the paragraph in order
  const boldWords: string[] = Array.from(
    activeOption.content.matchAll(/<b>(.*?)<\/b>/gi),
    (m: RegExpMatchArray) => m[1]
  )

  // Find vocab from local wordlist by word string
  const findVocab = (word: string) => {
    if (!word) return null
    const lower = word.toLowerCase().trim()
    return vocabularies.find(v =>
      v.word?.toLowerCase().trim() === lower ||
      v.word?.toLowerCase().includes(lower) ||
      lower.includes(v.word?.toLowerCase().trim())
    ) || null
  }

  const hasResults = evaluationResults !== null

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 relative font-sans">

      {/* Evaluating overlay */}
      {isEvaluating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-bold text-slate-900">Evaluating your answers...</p>
          </div>
        </div>
      )}

      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none">
          {/* @ts-ignore */}
          <dotlottie-wc
            src="https://lottie.host/4531cf94-3fb1-4240-b4c8-7a95fadd34f7/JzBZyDY5re.lottie"
            style={{ width: '100vw', height: '100vh' }}
            autoplay
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 space-y-6">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">[{wordlist.category.name}]</p>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Discovery – {wordlist.title}
          </h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8">

          {/* Paragraph header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Paragraph {currentParagraphIndex + 1}</h2>
            {currentParagraph.options.length > 1 && !hasResults && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Regenerate
              </button>
            )}
          </div>

          {/* Paragraph text */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Read the paragraph, and get the meaning of bold vocabularies
            </p>
            <p
              className="text-[#334155] text-base leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: activeOption.content }}
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {hasResults ? 'Results' : 'Write the correct answer of each question'}
            </p>

            {questionsWithResults.map((q, i) => {
              const res = q.result
              const isCorrect = res?.status === 'correct'
              const matchedVocab = res ? findVocab(res.vocabulary) : null

              if (res) {
                // Result state — colored card
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border-2 p-5 space-y-3 ${isCorrect ? 'bg-green-50/60 border-green-200' : 'bg-red-50/60 border-red-200'}`}
                  >
                    {/* Question + status icon */}
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-semibold text-gray-700">{q.questionText}</p>
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isCorrect
                          ? <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          : <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        }
                      </div>
                    </div>

                    {/* User answer */}
                    <p className={`text-sm font-medium italic ${isCorrect ? 'text-green-800' : 'text-red-700'}`}>
                      "{q.userAnswer || '(no answer)'}"
                    </p>

                    <div className="pt-1 space-y-2">
                      {/* Reason */}
                      <div>
                        <p className={`text-xs font-bold mb-0.5 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>Reason</p>
                        <p className={`text-sm ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>{res.reason}</p>
                      </div>

                      {/* Word discovered chip */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        <span className="text-xs font-bold text-gray-500">Word Discovered</span>
                      </div>

                      {/* Matched vocab from wordlist */}
                      {matchedVocab && (
                        <div className="mt-2 p-3 rounded-lg bg-white/70 border border-gray-200 text-sm space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-slate-800">{matchedVocab.word}</span>
                            {matchedVocab.partOfSpeech && <span className="text-xs italic text-gray-400">{matchedVocab.partOfSpeech}</span>}
                          </div>
                          {matchedVocab.defEng && (
                            <p className="text-gray-600 text-xs leading-relaxed">{matchedVocab.defEng}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Input state
              return (
                <div key={q.id} className="rounded-xl border border-gray-200 p-5 space-y-2 bg-white">
                  <p className="text-sm font-bold text-slate-900">{q.questionText}</p>
                  <input
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-gray-50/50 placeholder:text-gray-400"
                    placeholder="Field text goes here"
                    disabled={isEvaluating}
                  />
                </div>
              )
            })}
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-2">
            {hasResults ? (
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow hover:bg-slate-800 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleCheckAnswer}
                disabled={isEvaluating}
                className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg shadow hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                Check My Answer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar nav */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="sticky top-10 bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {wordlist.category.name} <span className="text-gray-400 font-normal">—</span> {wordlist.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{vocabularies.length} vocabularies</p>
          </div>
          <div className="pt-2 space-y-2">
            {paragraphs.map((p: any, i: number) => (
              <div
                key={p.id}
                className={`text-sm font-semibold transition-colors ${i === currentParagraphIndex ? 'text-slate-900' : 'text-gray-400'}`}
              >
                Paragraph {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
