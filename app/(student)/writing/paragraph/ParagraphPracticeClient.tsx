'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'

export default function ParagraphPracticeClient({
  categories,
  prompts,
  vocabMap,
  essayTypes
}: {
  categories: any[]
  prompts: any[]
  vocabMap: Record<string, { partOfSpeech: string | null, wordlistId: string }>
  essayTypes: Record<string, { label: string; structure: any }>
}) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedEssayTypes, setSelectedEssayTypes] = useState<string[]>([])
  const [selectedParagraphTypes, setSelectedParagraphTypes] = useState<string[]>(['intro'])
  
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  
  const [pendingTopics, setPendingTopics] = useState<string[]>([])
  const [pendingEssayTypes, setPendingEssayTypes] = useState<string[]>([])
  const [pendingParagraphTypes, setPendingParagraphTypes] = useState<string[]>([])

  const [currentPrompt, setCurrentPrompt] = useState<any>(null)
  const [currentParagraphType, setCurrentParagraphType] = useState<string>('intro')

  const [answer, setAnswer] = useState('')
  const [aiResult, setAiResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [isStructureOpen, setIsStructureOpen] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState<number>(0)
  const [isClosing, setIsClosing] = useState(false)
  const [isAdjustModalClosing, setIsAdjustModalClosing] = useState(false)
  
  const closeAdjustModal = () => {
    setIsAdjustModalClosing(true)
    setTimeout(() => {
      setIsAdjustModalOpen(false)
      setIsAdjustModalClosing(false)
    }, 300)
  }
  
  const handleCloseOnboarding = () => {
    setIsClosing(true)
    setTimeout(() => {
      setOnboardingStep(0)
      setIsClosing(false)
    }, 300)
  }

  useEffect(() => {
    // If the user arrived with the onboarding query param, we can clean it up for a cleaner URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('onboarding') === 'true') {
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }

      const todayUTC = new Date().toISOString().split('T')[0]
      const lastSeen = localStorage.getItem('structua_onboarding_last_seen')
      
      if (lastSeen !== todayUTC) {
        setOnboardingStep(1)
        localStorage.setItem('structua_onboarding_last_seen', todayUTC)
      }
    }
  }, [])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const loadingCanvasRef = useRef<HTMLCanvasElement>(null)

  const filteredCategories = useMemo(() => categories.filter(c => c.name !== 'Writing Task 1'), [categories])

  // Initialize randomized state
  useEffect(() => {
    if (prompts.length > 0 && !currentPrompt) {
      const validPrompts = prompts.filter(p => filteredCategories.some(c => c.id === p.categoryId))
      const randomPrompt = validPrompts.length > 0 ? validPrompts[Math.floor(Math.random() * validPrompts.length)] : prompts[Math.floor(Math.random() * prompts.length)]
      setSelectedTopics(filteredCategories.map(c => c.id)) // Default all topics
      setSelectedEssayTypes(Object.keys(essayTypes)) // Default all essay types
      setSelectedParagraphTypes(['intro'])
      setCurrentPrompt(randomPrompt)
      setCurrentParagraphType('intro')
    }
  }, [prompts, currentPrompt, filteredCategories, essayTypes])

  // Lottie logic
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

  const availablePrompts = useMemo(() => {
    return prompts.filter(p => 
      selectedTopics.includes(p.categoryId) && 
      selectedEssayTypes.includes(p.essayType)
    )
  }, [prompts, selectedTopics, selectedEssayTypes])

  const handleRegenerate = () => {
    if (availablePrompts.length === 0 || selectedParagraphTypes.length === 0 || isRegenerating) return
    
    setIsRegenerating(true)
    
    setTimeout(() => {
      let newPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
      let newParaType = selectedParagraphTypes[Math.floor(Math.random() * selectedParagraphTypes.length)]
      
      // Always try to pick a different prompt question if possible
      if (availablePrompts.length > 1) {
        let attempts = 0
        while (newPrompt.id === currentPrompt?.id && attempts < 10) {
          newPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
          attempts++
        }
      }

      setCurrentPrompt(newPrompt)
      setCurrentParagraphType(newParaType)
      setAnswer('')
      setIsChecked(false)
      setAiResult(null)
      setError(null)
      setIsStructureOpen(false)
      setIsRegenerating(false)
    }, 600)
  }

  const openModal = () => {
    setPendingTopics(selectedTopics)
    setPendingEssayTypes(selectedEssayTypes)
    setPendingParagraphTypes(selectedParagraphTypes)
    setFilterError(null)
    setIsAdjustModalOpen(true)
  }

  const saveAdjustment = () => {
    const validPrompts = prompts.filter(p => 
      pendingTopics.includes(p.categoryId) && 
      pendingEssayTypes.includes(p.essayType)
    )
    
    if (validPrompts.length === 0) {
      setFilterError("No practice questions found for these filters. Please adjust your selection.")
      return
    }

    setSelectedTopics(pendingTopics)
    setSelectedEssayTypes(pendingEssayTypes)
    setSelectedParagraphTypes(pendingParagraphTypes)
    closeAdjustModal()
    
    let newPrompt = validPrompts[Math.floor(Math.random() * validPrompts.length)]
    let newParaType = pendingParagraphTypes[Math.floor(Math.random() * pendingParagraphTypes.length)]
    
    // Always try to pick a different prompt question if possible
    if (validPrompts.length > 1) {
      let attempts = 0
      while (newPrompt.id === currentPrompt?.id && attempts < 10) {
        newPrompt = validPrompts[Math.floor(Math.random() * validPrompts.length)]
        attempts++
      }
    }

    setCurrentPrompt(newPrompt)
    setCurrentParagraphType(newParaType)
    setAnswer('')
    setIsChecked(false)
    setAiResult(null)
    setError(null)
    setIsStructureOpen(false)
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value)
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
    adjustHeight()
    window.addEventListener('resize', adjustHeight)
    return () => window.removeEventListener('resize', adjustHeight)
  }, [answer, isChecked])

  const currentVocabHints = useMemo(() => {
    if (!currentPrompt) return []
    const section = currentParagraphType === 'intro' ? 'introductionJson' : 
                    currentParagraphType === 'body1' ? 'body1Json' : 'body2Json'
    const json = currentPrompt[section] as Record<string, any>
    const hints: {word: string, partOfSpeech: string | null, wordlistId: string}[] = []
    if (json) {
      for (let i = 1; i <= 5; i++) {
        const word = json[`vocabHint${i}`]
        const key = word ? word.toLowerCase() : ''
        if (word && vocabMap[key]) {
          hints.push({ word, partOfSpeech: vocabMap[key].partOfSpeech, wordlistId: vocabMap[key].wordlistId })
        }
      }
    }
    return hints
  }, [currentPrompt, currentParagraphType, vocabMap])

  const paragraphLabels: Record<string, string> = {
    intro: 'Introduction',
    body1: 'Supporting Paragraph 1',
    body2: 'Supporting Paragraph 2'
  }

  const handleCheck = async () => {
    if (!answer.trim() || !currentPrompt) return
    setIsChecking(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/writing/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_prompt: currentPrompt.question,
          paragraph_type: paragraphLabels[currentParagraphType],
          user_answer: answer,
          hint_vocabularies: currentVocabHints.map(v => ({
            word: v.word,
            part_of_speech: v.partOfSpeech
          }))
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Evaluation failed')
      setAiResult(data)
      setIsChecked(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsChecking(false)
    }
  }

  const formatFilterString = () => {
    const topicStr = selectedTopics.length === 1 ? filteredCategories.find(c => c.id === selectedTopics[0])?.name : `${selectedTopics.length} Selected`
    const essayStr = selectedEssayTypes.length === 1 ? essayTypes[selectedEssayTypes[0]]?.label : `${selectedEssayTypes.length} Selected`
    const paraStr = selectedParagraphTypes.length === 1 ? paragraphLabels[selectedParagraphTypes[0]] : `${selectedParagraphTypes.length} Selected`
    return `Adjust Practice (Topic: ${topicStr}; Essay: ${essayStr}; Paragraph: ${paraStr})`
  }

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  if (!currentPrompt) return <div className="p-8 text-center text-gray-500">Loading practice...</div>

  const isSaveDisabled = pendingTopics.length === 0 || pendingEssayTypes.length === 0 || pendingParagraphTypes.length === 0

  const onboardingContent = [
    {
      title: "5 Essay Types, 5 Strategies",
      subtitle: "Every IELTS Writing Task 2 essay has a different objective. Structua helps you master the strategy for each one."
    },
    {
      title: "The 4-Paragraph Formula",
      subtitle: "Break down your essay into a proven 4-paragraph structure. Learn exactly what to write in each section to keep your ideas organized."
    },
    {
      title: "Chunk Your Practice, Fix Errors Faster",
      subtitle: "Don't waste time on full essays. Structua guides you to write paragraph by paragraph, instantly pinpointing gaps in your Grammar, Vocabulary, and Coherence."
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        <button onClick={openModal} className="text-sm text-gray-500 hover:text-gray-700 hover:underline font-medium transition-all">
          {formatFilterString()}
        </button>
      </div>

      {isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-6">
            <canvas ref={loadingCanvasRef} style={{ width: '250px', height: '250px' }} />
            <p className="text-xl font-bold text-slate-900">Evaluating your answers...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isRegenerating ? (
              <>
                <div className="h-6 w-[160px] bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-[180px] bg-gray-200 rounded-full animate-pulse"></div>
              </>
            ) : (
              <>
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {essayTypes[currentPrompt.essayType]?.label}
                </span>
                <a 
                  href="https://drive.google.com/file/d/1riuqD89cVtfogHUBln69B_4_X6bZd0_p/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 hover:bg-blue-200 transition-colors"
                >
                  {paragraphLabels[currentParagraphType]}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </>
            )}
          </div>
          <button 
            onClick={handleRegenerate}
            disabled={isChecked || isChecking || isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 bg-white text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Regenerate
          </button>
        </div>

        <h3 className="font-bold text-gray-800 text-sm mb-2">Task Prompt</h3>
        {isRegenerating ? (
          <div className="space-y-2.5 mb-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ) : (
          <p className="text-[#334155] text-sm leading-relaxed mb-6 font-medium whitespace-pre-wrap">
            {currentPrompt.question}
          </p>
        )}

        {isRegenerating ? (
          <div className="bg-gray-50 rounded-xl mb-6 border border-gray-100 p-4 flex items-center justify-between animate-pulse">
            <div className="h-5 w-56 bg-gray-200 rounded"></div>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        ) : (
            <div className="bg-gray-50 rounded-xl mb-6 overflow-hidden border border-gray-100">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100/50 transition-colors relative z-10"
                onClick={() => setIsStructureOpen(!isStructureOpen)}
              >
                <span className="text-sm font-bold text-gray-700">Structure: {paragraphLabels[currentParagraphType]}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isStructureOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <div className={`grid transition-all duration-300 ease-in-out ${isStructureOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="p-5 border-t border-gray-100 bg-[#f8f9fa] space-y-5">
                    {essayTypes[currentPrompt.essayType]?.structure[currentParagraphType]?.map((item: any) => {
                      const sectionKey = currentParagraphType === 'intro' ? 'introductionJson' : currentParagraphType === 'body1' ? 'body1Json' : 'body2Json'
                      const sectionData = currentPrompt[sectionKey] || {}
                      
                      let colorClass = 'text-[#ea580c]'
                      if (item.key === 'paraphrase') colorClass = 'text-[#059669]'
                      else if (item.key.endsWith('1') || item.key === 'advantages' || item.key === 'problems') colorClass = 'text-[#ea580c]'
                      else if (item.key.endsWith('2') || item.key === 'disadvantages' || item.key === 'solutions') colorClass = 'text-[#2563eb]'
                      else if (currentParagraphType === 'body1') colorClass = 'text-[#ea580c]'
                      else if (currentParagraphType === 'body2') colorClass = 'text-[#2563eb]'

                      return (
                        <div key={item.key} className="grid grid-cols-[1.5fr_3fr] gap-6 text-[13px]">
                          <div className={`font-bold ${colorClass}`}>{item.label}</div>
                          <div className="text-gray-700 leading-relaxed">{sectionData[item.key] || '-'}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
        )}

        <div className={`relative rounded-xl border transition-all duration-300 ${isChecked ? 'border-gray-200 bg-gray-50' : 'border-[#93c5fd] bg-white focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'}`}>
              {!isChecked && (
                <div className="absolute top-3 left-4">
                  {isRegenerating ? (
                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mt-0.5"></div>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide pointer-events-none">
                      Your {paragraphLabels[currentParagraphType]}
                    </span>
                  )}
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={handleInput}
                disabled={isChecked || isChecking}
                placeholder={isChecked ? '' : '\n'}
                className={`w-full p-4 pb-16 rounded-xl text-sm focus:outline-none resize-none min-h-[120px] leading-relaxed transition-colors overflow-hidden ${
                  isChecked ? 'bg-transparent text-gray-600 border-none pb-4' : 'bg-transparent text-gray-800 pt-8'
                }`}
              />
              {!isChecked && (
                <div className="absolute bottom-3 right-3">
              <button 
                onClick={handleCheck}
                disabled={isChecking || !answer.trim() || isRegenerating}
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
            {isRegenerating ? (
              <>
                <div className="h-[28px] w-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-[28px] w-28 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-[28px] w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </>
            ) : (
              currentVocabHints.map((v, i) => (
                <a 
                  key={i} 
                  href={`/vocab/${v.wordlistId}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-semibold text-gray-600 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {v.word} <span className="text-gray-400 ml-0.5 font-normal">[{v.partOfSpeech || 'N/A'}]</span>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {isChecked && aiResult && (
        <div className="bg-[#f0fdf4] rounded-xl border border-[#dcfce7] p-8">
          {aiResult.top_badge && (
            <div className="inline-block px-3 py-1 bg-[#22c55e] text-white text-[10px] font-black rounded-full uppercase tracking-wider mb-8">
              {aiResult.top_badge}
            </div>
          )}

          {aiResult.grammatical_range_accuracy && (
            <div className="mb-10">
              <h3 className="font-black text-sm tracking-tight mb-1 text-[#333333]">GRAMMATICAL RANGE ACCURACY</h3>
              <p className="text-xs mb-4 font-medium text-[#4E5669]">Grammatical Error</p>
              
              <div className="bg-white p-5 rounded-xl border border-[#dcfce7] text-[13px] leading-relaxed text-[#333333] font-medium mb-4">
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
                  <p className="text-[11px] font-medium mb-2 text-[#4E5669]">Grammar material to review</p>
                  <div className="flex gap-2 flex-wrap">
                    {aiResult.grammatical_range_accuracy.error_topics.map((topic: any) => (
                      <a href={`/day/${topic.id}`} target="_blank" rel="noreferrer" key={topic.id} className="px-3 py-1.5 bg-white border border-[#dcfce7] rounded-full text-[11px] font-bold text-[#064e3b] shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors">
                        {topic.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {aiResult.lexical_resources && aiResult.lexical_resources.length > 0 && (
            <div className="mb-10">
              <h3 className="font-black text-sm tracking-tight mb-1 text-[#333333]">LEXICAL RESOURCES</h3>
              <p className="text-xs mb-4 font-medium text-[#4E5669]">word choice and register:</p>
              
              <div className="w-full text-xs">
                <div className="grid grid-cols-[1fr_1fr_2fr] gap-4 mb-2 font-bold uppercase tracking-wider text-[10px] text-[#4E5669]">
                  <div>You wrote</div>
                  <div>Vocab Base</div>
                  <div>Upgrade Options</div>
                </div>
                <div className="space-y-4">
                  {aiResult.lexical_resources.map((item: any, i: number) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_2fr] gap-4 items-start border-t border-[#dcfce7] pt-4">
                      <div className="font-medium text-[#333333]">{item.user_wrote}</div>
                      <div>
                        {item.wordlist_base && (
                          vocabMap[item.wordlist_base.toLowerCase()] ? (
                            <a href={`/vocab/${vocabMap[item.wordlist_base.toLowerCase()].wordlistId}`} target="_blank" rel="noreferrer" className="inline-block bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-2 py-1 rounded font-bold">
                              {item.wordlist_base}
                            </a>
                          ) : (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{item.wordlist_base}</span>
                          )
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

          {aiResult.model_answer && (
            <div className="bg-white p-6 rounded-xl border border-[#dcfce7] mb-4">
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
                  <a href={`/day/${topic.id}`} target="_blank" rel="noreferrer" key={topic.id} className="px-3 py-1.5 bg-white border border-[#dcfce7] rounded-full text-[11px] font-bold text-[#064e3b] shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors">
                    {topic.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {isAdjustModalOpen && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${isAdjustModalClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeAdjustModal} />
          <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 animate-in fade-in zoom-in-95 duration-200 ${isAdjustModalClosing ? 'scale-95 transition-transform duration-300' : ''}`}>
            <button onClick={closeAdjustModal} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <h2 className="text-xl font-extrabold text-gray-900 mb-8">Adjust Practice</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Topic</h3>
                <div className="flex flex-wrap gap-2">
                  {filteredCategories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggleSelection(setPendingTopics, c.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        pendingTopics.includes(c.id) ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Essay type</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(essayTypes).map(key => (
                    <button
                      key={key}
                      onClick={() => toggleSelection(setPendingEssayTypes, key)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        pendingEssayTypes.includes(key) ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {essayTypes[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-3">Paragraph</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(paragraphLabels).map(key => (
                    <button
                      key={key}
                      onClick={() => toggleSelection(setPendingParagraphTypes, key)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        pendingParagraphTypes.includes(key) ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {paragraphLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filterError && (
              <div className="mt-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                {filterError}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button 
                onClick={saveAdjustment}
                disabled={isSaveDisabled}
                className="px-6 py-2.5 bg-[#1f2937] text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {onboardingStep > 0 && (
        <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseOnboarding} />
          <div className={`relative w-full max-w-[440px] bg-white rounded-[12px] shadow-2xl flex flex-col p-[8px] gap-[20px] animate-in fade-in zoom-in-95 duration-300 overflow-hidden ${isClosing ? 'scale-95 transition-transform duration-300' : ''}`}>
            
            {/* Slider Container */}
            <div className="overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{ transform: `translateX(-${(onboardingStep - 1) * 100}%)` }}
              >
                {[1, 2, 3].map((step) => (
                  <div key={step} className="w-full flex-shrink-0 flex flex-col gap-[20px]">
                    {/* Image Container */}
                    <div className="w-full relative bg-[#F8FAFC] rounded-[6px] overflow-hidden">
                      <img 
                        src={`/icons/Pop up ${step}.png`}
                        alt={`Onboarding Step ${step}`}
                        className="w-full h-auto object-cover block"
                      />
                    </div>

                    {/* Text Container */}
                    <div className="w-full px-[12px] text-left">
                      <h2 className="text-[20px] font-bold text-[#111827] mb-2 leading-tight tracking-[-0.5px]">
                        {onboardingContent[step - 1]?.title}
                      </h2>
                      <p className="text-[14px] leading-relaxed text-[#4b5563] tracking-[-0.2px]">
                        {onboardingContent[step - 1]?.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Container */}
            <div className="w-full px-[12px] pt-0 pb-[8px] flex flex-col">
              {/* Button Container */}
              <div className="flex items-center gap-3 w-full">
                {onboardingStep < 3 ? (
                  <>
                    <button 
                      onClick={handleCloseOnboarding}
                      className="px-[8px] py-2.5 bg-transparent text-gray-800 text-[13px] font-bold hover:text-gray-900 transition-colors"
                    >
                      Skip
                    </button>
                    <button 
                      onClick={() => setOnboardingStep(s => s + 1)}
                      className="flex-1 px-6 py-2.5 bg-[#1c222b] text-white text-[13px] font-bold rounded-[8px] shadow-sm hover:bg-[#111827] transition-colors"
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        window.open("https://drive.google.com/file/d/1riuqD89cVtfogHUBln69B_4_X6bZd0_p/view?usp=sharing", "_blank");
                      }}
                      className="flex-1 px-[8px] py-2.5 bg-transparent text-[#111827] text-[13px] font-bold hover:text-gray-600 transition-colors"
                    >
                      Learn Structure First
                    </button>
                    <button 
                      onClick={handleCloseOnboarding}
                      className="flex-1 px-6 py-2.5 bg-[#1c222b] text-white text-[13px] font-bold rounded-[8px] shadow-sm hover:bg-[#111827] transition-colors"
                    >
                      Start Practicing
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
