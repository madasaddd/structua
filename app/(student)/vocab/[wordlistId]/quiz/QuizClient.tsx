'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const QUESTION_TYPES = [
  'Cloze test',
  'Collocation matching',
  'Word mapping (Morphology)',
  'Pushed Output'
]

const INSTRUCTIONS_AND_EXAMPLES: Record<string, { instruction: string, exampleQ: string, exampleA: string }> = {
  'Cloze test': {
    instruction: 'Complete the following sentence by filling in the blank with the appropriate IELTS vocabulary.',
    exampleQ: 'The lack of funding is a __________ issue that needs immediate attention. (Hint: very urgent or important)',
    exampleA: 'pressing'
  },
  'Collocation matching': {
    instruction: 'Provide 3 to 5 natural collocations (common word pairings) for the following word.',
    exampleQ: 'Role',
    exampleA: 'pivotal role, crucial role, active role.'
  },
  'Word mapping (Morphology)': {
    instruction: 'Change the base word in brackets to its correct grammatical form to fit the sentence structure.',
    exampleQ: 'The company’s rapid growth is due to its highly [innovate] marketing strategy.',
    exampleA: 'innovative'
  },
  'Pushed Output': {
    instruction: 'Write a complete English sentence using the following word to express the specified idea.',
    exampleQ: "Use the word 'Facilitate' to describe how a manager helps a meeting run smoothly.",
    exampleA: 'A good manager will facilitate the meeting by ensuring everyone has a chance to speak and keeping the discussion on track.'
  }
}

type ResultItem = {
  status: 'correct' | 'incorrect' | 'could_be_improved'
  reason: string
}

export default function QuizClient({ wordlist }: { wordlist: any }) {
  const router = useRouter()
  const quizTask = wordlist.quizTask
  const groups = quizTask.groups || []
  const vocabularies = wordlist.vocabularies || []

  const [pages, setPages] = useState<any[][]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResults, setEvaluationResults] = useState<Record<string, ResultItem>>({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  // Initialization: Randomize and select questions
  useEffect(() => {
    // We need 4 pages, each corresponding to a QUESTION_TYPE.
    // Each page needs 5 questions.
    // To ensure each group appears exactly 2 times, we split groups into two halves twice.
    
    // We only consider groups that actually have questions
    const validGroups = groups.filter((g: any) => g.questions && g.questions.length > 0)
    
    if (validGroups.length < 10) {
      // Fallback if less than 10 groups: just pick up to 5 questions per type randomly
      const generatedPages = QUESTION_TYPES.map(type => {
        const qs = validGroups.flatMap((g: any) => g.questions.filter((q: any) => q.questionType === type))
        return qs.sort(() => 0.5 - Math.random()).slice(0, 5)
      })
      setPages(generatedPages)
      return
    }

    // 10 or more groups:
    const shuffledGroups = [...validGroups].sort(() => 0.5 - Math.random())
    const half1 = shuffledGroups.slice(0, 5)
    const half2 = shuffledGroups.slice(5, 10)
    
    // Shuffle again for the second set of types
    const shuffledGroups2 = [...validGroups].sort(() => 0.5 - Math.random())
    const half3 = shuffledGroups2.slice(0, 5)
    const half4 = shuffledGroups2.slice(5, 10)

    const buckets = [half1, half2, half3, half4]
    
    const generatedPages = QUESTION_TYPES.map((type, i) => {
      const bucket = buckets[i]
      // For each group in the bucket, find a question of this type
      const pageQs = []
      for (const g of bucket) {
        const qsOfType = g.questions.filter((q: any) => q.questionType === type)
        if (qsOfType.length > 0) {
          // Pick a random question of this type from the group
          pageQs.push(qsOfType[Math.floor(Math.random() * qsOfType.length)])
        }
      }
      return pageQs
    })

    setPages(generatedPages)
  }, [groups])

  // Lottie logic for loading and confetti
  const loadingCanvasRef = useRef<HTMLCanvasElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let loadingLottie: any = null
    if (isEvaluating && loadingCanvasRef.current) {
      import('@lottiefiles/dotlottie-web').then(({ DotLottie }) => {
        loadingLottie = new DotLottie({
          autoplay: true,
          loop: true,
          canvas: loadingCanvasRef.current!,
          src: "/cat Mark loading.lottie",
        })
      })
    }
    return () => {
      if (loadingLottie) loadingLottie.destroy()
    }
  }, [isEvaluating])

  useEffect(() => {
    let confettiLottie: any = null
    if (showConfetti && confettiCanvasRef.current) {
      import('@lottiefiles/dotlottie-web').then(({ DotLottie }) => {
        confettiLottie = new DotLottie({
          autoplay: true,
          loop: false,
          canvas: confettiCanvasRef.current!,
          src: "https://lottie.host/4531cf94-3fb1-4240-b4c8-7a95fadd34f7/JzBZyDY5re.lottie",
        })
      })
    }
    return () => {
      if (confettiLottie) confettiLottie.destroy()
    }
  }, [showConfetti])

  const handleCheckAnswer = async () => {
    setIsEvaluating(true)
    try {
      const currentQuestions = pages[currentPageIndex]
      const questionType = QUESTION_TYPES[currentPageIndex]
      const instructionObj = INSTRUCTIONS_AND_EXAMPLES[questionType]
      
      const payload = {
        student_submission: currentQuestions.map((q: any) => {
          const matchedVocab = vocabularies.find((v: any) => v.id === q.targetVocabId)
          return {
            question_id: q.id,
            type: q.questionType,
            target_vocabulary: matchedVocab ? matchedVocab.word : '',
            instruction: instructionObj ? instructionObj.instruction : '',
            question_text: q.questionText,
            user_input: answers[q.id] || ''
          }
        })
      }

      const res = await fetch(`/api/vocab/${wordlist.id}/evaluate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Evaluation failed')

      const data = await res.json()
      console.log('AI Evaluation Data:', data)
      
      const resultsArray = data.results || (Array.isArray(data) ? data : null)

      if (resultsArray) {
        const newResults = { ...evaluationResults }
        let newCorrectCount = 0
        
        resultsArray.forEach((r: any) => {
          newResults[r.question_id] = { status: r.status, reason: r.reason }
          if (r.status === 'correct') newCorrectCount++
        })
        
        setEvaluationResults(newResults)
        setTotalCorrect(prev => prev + newCorrectCount)

        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        alert('Invalid response format from AI. Check the browser console for details.')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to evaluate answers. Please check the AI config.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleContinue = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setShowCompletionModal(true)
    }
  }

  if (pages.length === 0) return null

  const currentQuestions = pages[currentPageIndex] || []
  const currentType = QUESTION_TYPES[currentPageIndex]
  const instructionObj = INSTRUCTIONS_AND_EXAMPLES[currentType]
  const instructionText = instructionObj?.instruction || 'Answer the questions below.'

  // Check if current page is already evaluated
  const isPageEvaluated = currentQuestions.every((q: any) => evaluationResults[q.id])

  return (
    <div className="relative font-sans">
      {/* Evaluating overlay */}
      {isEvaluating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <canvas ref={loadingCanvasRef} style={{ width: '250px', height: '250px' }} />
            <p className="text-xl font-bold text-slate-900">Evaluating your answers...</p>
          </div>
        </div>
      )}

      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
          <canvas ref={confettiCanvasRef} style={{ width: '100vw', height: '100vh' }} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-500">
              Question {currentPageIndex * 5 + 1}–{currentPageIndex * 5 + currentQuestions.length} of {pages.length * 5}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-slate-800 text-base font-semibold leading-relaxed">{instructionText}</p>
              </div>
              
              {currentType.toLowerCase().includes('cloze') && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from(new Set(vocabularies.map((v: any) => v.word).filter(Boolean))).sort().map((word: any, idx: number) => (
                    <div key={idx} className="text-sm font-medium text-slate-700">
                      {word}
                    </div>
                  ))}
                </div>
              )}

              {instructionObj && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-2">
                  <p className="text-sm font-medium text-slate-900">Example!</p>
                  <p className="text-sm font-medium text-slate-800">Q: {instructionObj.exampleQ}</p>
                  <p className="text-sm font-medium text-slate-800">A: {instructionObj.exampleA}</p>
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            <p className="text-base font-semibold text-slate-800">Answer the questions below.</p>
            {isPageEvaluated && (
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Results
              </p>
            )}

            {currentQuestions.map((q: any, i: number) => {
              const res = evaluationResults[q.id]
              const isCorrect = res?.status === 'correct'
              const isImproved = res?.status === 'could_be_improved'
              
              // Find matched vocab for extra context if correct/incorrect
              const matchedVocab = vocabularies.find((v: any) => v.id === q.targetVocabId)

              if (res) {
                // Result state
                let boxClass = 'bg-red-50/60 border-red-200'
                let iconClass = 'bg-red-500'
                let textClass = 'text-red-700'
                let reasonTitleClass = 'text-red-700'
                let reasonTextClass = 'text-red-900'
                let icon = <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>

                if (isCorrect) {
                  boxClass = 'bg-green-50/60 border-green-200'
                  iconClass = 'bg-green-500'
                  textClass = 'text-green-800'
                  reasonTitleClass = 'text-green-700'
                  reasonTextClass = 'text-green-900'
                  icon = <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                } else if (isImproved) {
                  boxClass = 'bg-yellow-50/60 border-yellow-200'
                  iconClass = 'bg-yellow-500'
                  textClass = 'text-yellow-800'
                  reasonTitleClass = 'text-yellow-700'
                  reasonTextClass = 'text-yellow-900'
                  icon = <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                }

                return (
                  <div key={q.id} className={`rounded-xl border-2 p-5 space-y-3 ${boxClass}`}>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">{currentPageIndex * 5 + i + 1}. {q.questionText}</p>
                      <div className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${iconClass}`}>
                        {icon}
                      </div>
                    </div>
                    
                    <p className={`text-sm font-medium italic ${textClass}`}>
                      "{answers[q.id] || '(no answer)'}"
                    </p>

                    <div className="pt-1 space-y-2">
                      <div>
                        <p className={`text-xs font-bold mb-0.5 ${reasonTitleClass}`}>Reason</p>
                        <p className={`text-sm ${reasonTextClass}`}>{res.reason}</p>
                      </div>

                      {matchedVocab && (
                        <div className="mt-3">
                          <div className="flex items-center gap-1.5 pt-1">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <span className="text-xs font-bold text-gray-500">Word Reviewed</span>
                          </div>
                          <div className="mt-2 p-3 rounded-lg bg-white/70 border border-gray-200 text-sm space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-slate-800">{matchedVocab.word}</span>
                              {matchedVocab.partOfSpeech && <span className="text-xs italic text-gray-400">{matchedVocab.partOfSpeech}</span>}
                            </div>
                            {matchedVocab.defEng && (
                              <p className="text-gray-600 text-xs leading-relaxed">{matchedVocab.defEng}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              // Input state
              return (
                <div key={q.id} className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">{currentPageIndex * 5 + i + 1}. {q.questionText}</p>
                  </div>
                  <input
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-gray-50/50 placeholder:text-gray-400"
                    placeholder={`Answer ${currentPageIndex * 5 + i + 1}`}
                    disabled={isEvaluating}
                  />
                </div>
              )
            })}
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4">
            {isPageEvaluated ? (
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow hover:bg-slate-800 transition-colors"
              >
                {currentPageIndex < pages.length - 1 ? 'Continue' : 'Finish'}
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

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-500 text-lg mb-10">
              You answered <span className="font-bold text-slate-900">{totalCorrect}</span> questions correctly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                onClick={() => router.push(`/vocab/${wordlist.id}`)}
                className="flex-1 px-6 py-3 bg-[#111827] text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Back to Wordlist
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
