'use client'

import { useState, useRef, useEffect } from 'react'

export default function ParaphraseStudentClient({ paragraphs, wordlist }: { paragraphs: any[], wordlist: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [aiResult, setAiResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const loadingCanvasRef = useRef<HTMLCanvasElement>(null)

  // Loading animation logic
  useEffect(() => {
    let loadingLottie: any = null
    if (isChecking && loadingCanvasRef.current) {
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
  }, [isChecking])

  // Randomize initially
  useEffect(() => {
    if (paragraphs.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * paragraphs.length))
    }
  }, [paragraphs])

  const p = paragraphs[currentIndex]

  const handleRegenerate = () => {
    if (paragraphs.length <= 1) return
    let newIdx
    do {
      newIdx = Math.floor(Math.random() * paragraphs.length)
    } while (newIdx === currentIndex)
    setCurrentIndex(newIdx)
    setAnswer('')
    setIsChecked(false)
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value)
  }

  // Auto-resize textarea to fit content (container hugging)
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    adjustHeight()
    window.addEventListener('resize', adjustHeight)
    return () => {
      window.removeEventListener('resize', adjustHeight)
    }
  }, [answer, isChecked])

  const handleCheck = async () => {
    if (!answer.trim()) return
    setIsChecking(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/vocab/${wordlist.id}/paraphrase/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original_paragraph: p.casualText,
          user_answer: answer,
          hint_vocabularies: p.vocabularies.map((v: any) => ({
            word: v.word,
            part_of_speech: v.partOfSpeech
          }))
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Evaluation failed')
      }
      setAiResult(data)
      setIsChecked(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsChecking(false)
    }
  }

  if (!p) return null

  return (
    <div className="space-y-6">
      {/* Evaluating overlay */}
      {isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-6">
            <canvas ref={loadingCanvasRef} style={{ width: '250px', height: '250px' }} />
            <p className="text-xl font-bold text-slate-900">Evaluating your answers...</p>
          </div>
        </div>
      )}

      {/* Prompt Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-gray-800">The paragraph</h2>
          <button 
            onClick={handleRegenerate}
            disabled={isChecked || isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 bg-white text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Regenerate
          </button>
        </div>

        <p className="text-[#334155] text-sm leading-relaxed mb-6 font-medium">
          {p.casualText}
        </p>

        <div className={`relative rounded-xl border transition-colors ${isChecked ? 'border-gray-200 bg-gray-50' : 'border-[#93c5fd] bg-white'}`}>
          {!isChecked && (
            <div className="absolute top-3 left-4 text-[11px] font-bold text-gray-400 uppercase tracking-wide pointer-events-none">Your Answer</div>
          )}
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={handleInput}
            disabled={isChecked || isChecking}
            placeholder={isChecked ? '' : '\n'}
            className={`w-full p-4 pb-16 rounded-xl text-sm focus:outline-none resize-none min-h-[120px] leading-relaxed transition-colors overflow-hidden ${
              isChecked ? 'bg-transparent text-gray-600 border-none pb-4' : 'focus:ring-2 focus:ring-blue-100 bg-transparent text-gray-800 pt-8'
            }`}
          />
          {!isChecked && (
            <div className="absolute bottom-3 right-3">
              <button 
                onClick={handleCheck}
                disabled={isChecking || !answer.trim()}
                className="px-5 py-2 bg-[#0f172a] text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isChecking ? 'Checking...' : 'Check my answer'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-[12px] font-bold text-gray-800 mb-3 tracking-tight">These words are from your wordlist — a good starting point. Try to go further where you can.</p>
          <div className="flex flex-wrap gap-2">
            {p.vocabularies.map((v: any) => (
              <div key={v.id} className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-semibold text-gray-600 shadow-sm">
                {v.word} <span className="text-gray-400 font-normal">[{v.partOfSpeech || 'N/A'}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Result Container */}
      {isChecked && aiResult && (
        <div className="bg-[#f0fdf4] rounded-xl border border-[#dcfce7] p-8 shadow-sm">
          {/* Top Badge */}
          {aiResult.top_badge && (
            <div className="inline-block px-3 py-1 bg-[#22c55e] text-white text-[10px] font-black rounded-full uppercase tracking-wider mb-8">
              {aiResult.top_badge}
            </div>
          )}

          {/* Lexical Resources */}
          {aiResult.lexical_resources && aiResult.lexical_resources.length > 0 && (
            <div className="mb-10">
              <h3 className="font-black text-sm tracking-tight mb-1 text-[#333333]">LEXICAL RESOURCES</h3>
              <p className="text-xs mb-4 font-medium text-[#4E5669]">word choice and register:</p>
              
              <div className="w-full text-xs">
                <div className="grid grid-cols-[1fr_1fr_2fr] gap-4 mb-2 font-bold uppercase tracking-wider text-[10px] text-[#4E5669]">
                  <div>You wrote</div>
                  <div>Wordlist Base</div>
                  <div>Upgrade Options</div>
                </div>
                <div className="space-y-4">
                  {aiResult.lexical_resources.map((item: any, i: number) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_2fr] gap-4 items-start border-t border-[#dcfce7] pt-4">
                      <div className="font-medium text-[#333333]">{item.user_wrote}</div>
                      <div>
                        {item.wordlist_base && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{item.wordlist_base}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-start">
                        {item.upgrade_options?.map((upgrade: string, j: number) => (
                          <span key={j} className="bg-[#dcfce7] text-[#166534] px-2 py-1 rounded font-bold">{upgrade}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grammatical Range Accuracy */}
          {aiResult.grammatical_range_accuracy && (
            <div className="mb-10">
              <h3 className="font-black text-sm tracking-tight mb-1 text-[#333333]">GRAMMATICAL RANGE ACCURACY</h3>
              <p className="text-xs mb-4 font-medium text-[#4E5669]">Grammatical Error</p>
              
              <div className="bg-white p-5 rounded-xl border border-[#dcfce7] text-[13px] leading-relaxed text-[#333333] font-medium shadow-sm mb-4">
                {aiResult.grammatical_range_accuracy.text_segments?.map((seg: any, i: number) => {
                  if (seg.type === 'correction') {
                    return (
                      <span key={i}>
                        <span className="line-through text-[#D30000] font-bold mr-1">{seg.original}</span>
                        <span className="text-[#3F6425] font-bold">{seg.correction}</span>
                      </span>
                    )
                  }
                  return <span key={i}>{seg.value}</span>
                })}
              </div>

              {aiResult.grammatical_range_accuracy.error_topics && aiResult.grammatical_range_accuracy.error_topics.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium mb-2 text-[#4E5669]">Topic to review</p>
                  <div className="flex gap-2 flex-wrap">
                    {aiResult.grammatical_range_accuracy.error_topics.map((topic: any) => (
                      <div key={topic.id} className="px-3 py-1.5 bg-white border border-[#dcfce7] rounded-full text-[11px] font-bold text-[#064e3b] shadow-sm">
                        {topic.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cohesive Devices */}
          {aiResult.cohesive_devices && (
            <div className="mb-10">
              <h3 className="font-black text-sm tracking-tight mb-1 text-[#333333]">COHESIVE DEVICES</h3>
              <p className="text-xs mb-4 font-medium text-[#4E5669]">{aiResult.cohesive_devices.judgment}</p>
              
              <ul className="space-y-3">
                {aiResult.cohesive_devices.suggestions?.map((sugg: any, i: number) => (
                  <li key={i} className="text-xs font-medium text-[#333333] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-lg before:-top-1">
                    {sugg.note}
                    {sugg.examples && sugg.examples.length > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {sugg.examples.map((ex: string, j: number) => (
                          <span key={j} className="bg-[#dcfce7] text-[#166534] px-2 py-1 rounded font-bold">{ex}</span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Band Model Answer */}
          {aiResult.model_answer && (
            <div className="bg-white p-6 rounded-xl border border-[#dcfce7] shadow-sm mb-4">
              <h3 className="font-black text-sm tracking-tight mb-1 text-[#333333]">BAND 7.0-8.0 MODEL ANSWER</h3>
              <p className="text-xs mb-4 font-medium text-[#4E5669]">Your answer rewritten with all feedback applied.</p>
              
              <div className="border-l-4 border-[#22c55e] pl-4 text-[13px] leading-relaxed font-medium text-[#333333]">
                {aiResult.model_answer.text_segments?.map((seg: any, i: number) => {
                  if (seg.type === 'wordlist' || seg.type === 'upgrade') {
                    return <span key={i} className="text-[#3F6425] font-bold">{seg.value}</span>
                  }
                  return <span key={i}>{seg.value}</span>
                })}
              </div>
            </div>
          )}

          {aiResult.model_answer?.grammar_topics && aiResult.model_answer.grammar_topics.length > 0 && (
            <div>
              <p className="text-[11px] font-medium mb-2 text-[#4E5669]">Additional Grammar Topic to Review</p>
              <div className="flex gap-2 flex-wrap">
                {aiResult.model_answer.grammar_topics.map((topic: any) => (
                  <div key={topic.id} className="px-3 py-1.5 bg-white border border-[#dcfce7] rounded-full text-[11px] font-bold text-[#064e3b] shadow-sm">
                    {topic.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Bar */}
      {isChecked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between z-50">
          <p className="text-sm font-bold text-gray-500">Uhh! Nice result...</p>
          <div className="flex items-center gap-4">
            <button className="text-[13px] font-bold text-gray-600 hover:text-gray-900">Give feedback</button>
            <button 
              onClick={() => {
                setAnswer('')
                setIsChecked(false)
                handleRegenerate()
              }}
              className="px-6 py-2.5 bg-[#0f172a] text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-[#1e293b]"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
