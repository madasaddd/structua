'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { EssayType } from '@prisma/client'
import { ESSAY_TYPES } from './constants'
import Link from 'next/link'
import Papa from 'papaparse'

type WritingPromptGroup = {
  id: string
  categoryId: string
  essayType: EssayType
  orderIndex: number
  question: string
  introductionJson: any
  body1Json: any
  body2Json: any
}

export default function WritingConfigClient({ 
  category, 
  prompts,
  vocabularies
}: { 
  category: { id: string, name: string },
  prompts: WritingPromptGroup[],
  vocabularies: string[]
}) {
  const router = useRouter()
  
  // Active Tab State
  const [activeTab, setActiveTab] = useState<EssayType>('advantage_disadvantage')
  
  // Local state for prompts to allow adding new ones before saving
  const [localPrompts, setLocalPrompts] = useState<WritingPromptGroup[]>(prompts)
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({})
  const [dirtyPrompts, setDirtyPrompts] = useState<Record<string, boolean>>({})
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false)

  // Filter prompts by active tab
  const activePrompts = useMemo(() => {
    return localPrompts.filter(p => p.essayType === activeTab).sort((a, b) => a.orderIndex - b.orderIndex)
  }, [localPrompts, activeTab])

  // Handle adding a new prompt
  const handleAddPrompt = () => {
    const newPrompt: WritingPromptGroup = {
      id: `new-${Date.now()}`, // Temporary ID
      categoryId: category.id,
      essayType: activeTab,
      orderIndex: activePrompts.length,
      question: '',
      introductionJson: {},
      body1Json: {},
      body2Json: {}
    }
    setLocalPrompts([...localPrompts, newPrompt])
  }

  // Handle field change
  const handleFieldChange = (promptId: string, section: 'question' | 'introductionJson' | 'body1Json' | 'body2Json', key: string | null, value: string) => {
    setDirtyPrompts(prev => ({ ...prev, [promptId]: true }))
    setLocalPrompts(prev => prev.map(p => {
      if (p.id !== promptId) return p;
      if (section === 'question') {
        return { ...p, question: value }
      }
      return {
        ...p,
        [section]: {
          ...(p[section] as Record<string, string>),
          [key!]: value
        }
      }
    }))
  }

  // Handle save single prompt
  const handleSavePrompt = async (promptId: string) => {
    const prompt = localPrompts.find(p => p.id === promptId)
    if (!prompt) return

    setIsSaving(prev => ({ ...prev, [promptId]: true }))
    try {
      const isNew = prompt.id.startsWith('new-')
      const payload = {
        action: isNew ? 'CREATE' : 'UPDATE',
        id: isNew ? undefined : prompt.id,
        categoryId: prompt.categoryId,
        essayType: prompt.essayType,
        orderIndex: prompt.orderIndex,
        question: prompt.question,
        introductionJson: prompt.introductionJson,
        body1Json: prompt.body1Json,
        body2Json: prompt.body2Json
      }

      const res = await fetch('/api/writing', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const savedPrompt = await res.json()
        setLocalPrompts(prev => prev.map(p => p.id === promptId ? savedPrompt : p))
        setDirtyPrompts(prev => { const next = { ...prev }; delete next[promptId]; return next; })
        router.refresh()
      } else {
        alert('Failed to save prompt')
      }
    } catch (e) {
      console.error(e)
      alert('Error saving prompt')
    } finally {
      setIsSaving(prev => ({ ...prev, [promptId]: false }))
    }
  }

  // Handle delete single prompt
  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    const isNew = promptId.startsWith('new-')
    if (isNew) {
      setLocalPrompts(prev => prev.filter(p => p.id !== promptId))
      return
    }

    try {
      const res = await fetch(`/api/writing?id=${promptId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setLocalPrompts(prev => prev.filter(p => p.id !== promptId))
        router.refresh()
      } else {
        alert('Failed to delete prompt')
      }
    } catch (e) {
      console.error(e)
      alert('Error deleting prompt')
    }
  }

  const handleUploadCSV = () => {
    setIsUploadModalOpen(true)
  }

  const downloadTemplate = () => {
    const config = ESSAY_TYPES[activeTab].structure
    const introKeys = config.intro.map(f => `intro_${f.key}`)
    const body1Keys = config.body1.map(f => `body1_${f.key}`)
    const body2Keys = config.body2.map(f => `body2_${f.key}`)
    
    const vocabKeys = [1, 2, 3, 4, 5].map(n => `vocabHint${n}`)
    const introVocabKeys = vocabKeys.map(k => `intro_${k}`)
    const body1VocabKeys = vocabKeys.map(k => `body1_${k}`)
    const body2VocabKeys = vocabKeys.map(k => `body2_${k}`)
    
    const headers = ['question', ...introKeys, ...introVocabKeys, ...body1Keys, ...body1VocabKeys, ...body2Keys, ...body2VocabKeys].join(',') + '\n'
    const blob = new Blob([headers], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `structua_${activeTab}_template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        const data = results.data as any[]
        const newPrompts = data.map((row, idx) => {
          const introJson: any = {}
          const body1Json: any = {}
          const body2Json: any = {}
          
          Object.keys(row).forEach(key => {
            const val = row[key] ? String(row[key]).replace(/\\n/g, '\n') : ''
            if (key.startsWith('intro_')) introJson[key.replace('intro_', '')] = val
            else if (key.startsWith('body1_')) body1Json[key.replace('body1_', '')] = val
            else if (key.startsWith('body2_')) body2Json[key.replace('body2_', '')] = val
          })

          return {
            id: `new-${Date.now()}-${idx}`,
            categoryId: category.id,
            essayType: activeTab,
            orderIndex: activePrompts.length + idx,
            question: row.question ? row.question.replace(/\\n/g, '\n') : '',
            introductionJson: introJson,
            body1Json: body1Json,
            body2Json: body2Json
          }
        })
        
        if (newPrompts.length > 0) {
          setLocalPrompts(prev => [...prev, ...newPrompts])
          alert('File loaded! Please click "Save Group Prompt" on each new prompt to save to database.')
        } else {
          alert('No valid rows found in file.')
        }
        setIsUploadModalOpen(false)
      },
      error: (err) => {
        alert('Failed to parse file: ' + err.message)
      }
    })
  }

  const renderVocabHints = (promptId: string, section: 'introductionJson' | 'body1Json' | 'body2Json', jsonValue: any) => {
    return (
      <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
        <h5 className="text-xs font-bold text-blue-800 mb-3">Vocabulary Hints (Optional)</h5>
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(num => {
            const key = `vocabHint${num}`
            return (
              <div key={num}>
                <select
                  className="w-full p-2 border border-blue-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  value={jsonValue[key] || ''}
                  onChange={(e) => handleFieldChange(promptId, section, key, e.target.value)}
                >
                  <option value="">- Select -</option>
                  {vocabularies.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-5xl mx-auto pb-32">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-2">
              <Link href="/admin/writing" className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to Dashboard</Link>
              <h1 className="text-3xl font-bold text-[#475569]">{category.name}</h1>
            </div>
            <button 
              onClick={() => setIsVocabModalOpen(true)}
              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg text-sm transition-colors border border-blue-200"
            >
              View Vocabularies
            </button>
          </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto bg-white rounded-lg p-2 shadow-sm border border-gray-100 mb-6 no-scrollbar">
        {(Object.keys(ESSAY_TYPES) as EssayType[]).map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`whitespace-nowrap px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${activeTab === type ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            {ESSAY_TYPES[type].label}
          </button>
        ))}
      </div>

      {/* Prompts List */}
      <div className="space-y-8">
        {activePrompts.map((prompt, index) => {
          const config = ESSAY_TYPES[activeTab].structure
          return (
            <div key={prompt.id} id={`prompt-${prompt.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-800">Prompt {index + 1}</h3>
                  {prompt.id.startsWith('new-') || dirtyPrompts[prompt.id] ? (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200">Unsaved</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Saved
                    </span>
                  )}
                </div>
                <button onClick={() => handleDeletePrompt(prompt.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Question</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow min-h-[80px]"
                    placeholder="Field text goes here"
                    value={prompt.question}
                    onChange={(e) => handleFieldChange(prompt.id, 'question', null, e.target.value)}
                  />
                </div>

                {/* Introduction */}
                <div className="border-t border-dashed border-gray-200 pt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-4">Paragraph type: Introduction</h4>
                  <div className="space-y-4">
                    {config.intro.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">{field.label}</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          placeholder="Field text goes here"
                          value={prompt.introductionJson[field.key] || ''}
                          onChange={(e) => handleFieldChange(prompt.id, 'introductionJson', field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  {renderVocabHints(prompt.id, 'introductionJson', prompt.introductionJson)}
                </div>

                {/* Body 1 */}
                <div className="border-t border-dashed border-gray-200 pt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-4">Paragraph type: Supporting Paragraph 1</h4>
                  <div className="space-y-4">
                    {config.body1.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">{field.label}</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          placeholder="Field text goes here"
                          value={prompt.body1Json[field.key] || ''}
                          onChange={(e) => handleFieldChange(prompt.id, 'body1Json', field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  {renderVocabHints(prompt.id, 'body1Json', prompt.body1Json)}
                </div>

                {/* Body 2 */}
                <div className="border-t border-dashed border-gray-200 pt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-4">Paragraph type: Supporting Paragraph 2</h4>
                  <div className="space-y-4">
                    {config.body2.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-gray-500 mb-2">{field.label}</label>
                        <input
                          type="text"
                          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                          placeholder="Field text goes here"
                          value={prompt.body2Json[field.key] || ''}
                          onChange={(e) => handleFieldChange(prompt.id, 'body2Json', field.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  {renderVocabHints(prompt.id, 'body2Json', prompt.body2Json)}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleSavePrompt(prompt.id)}
                    disabled={isSaving[prompt.id]}
                    className="px-6 py-2 bg-[#1E293B] text-white text-sm font-medium rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50"
                  >
                    {isSaving[prompt.id] ? 'Saving...' : 'Save Group Prompt'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {activePrompts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 mb-4">No prompts found for this essay type.</p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <button onClick={handleAddPrompt} className="px-6 py-2 bg-[#1E293B] text-white text-sm font-medium rounded-lg hover:bg-[#334155] transition-colors">
          Add a New Group Prompt
        </button>
        <button onClick={handleUploadCSV} className="px-6 py-2 bg-[#F1F5F9] text-[#475569] text-sm font-medium rounded-lg hover:bg-[#E2E8F0] transition-colors">
          Upload CSV / TXT
        </button>
      </div>

        </div>
      </div>

      {/* Right Navigation Widget */}
      <div className="w-72 shrink-0 hidden lg:block px-6 py-8 overflow-y-auto">
        <div className="sticky top-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
          <h4 className="font-bold text-gray-800 text-sm mb-1">{category.name}</h4>
          <p className="text-xs text-gray-500 mb-4">{activePrompts.length} group prompts</p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            {activePrompts.map((p, i) => {
              const isUnsaved = p.id.startsWith('new-') || dirtyPrompts[p.id];
              return (
                <a key={p.id} href={`#prompt-${p.id}`} className="flex items-center justify-between text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors">
                  <span className="truncate">Group prompt {i + 1}</span>
                  {isUnsaved ? (
                    <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" title="Unsaved changes" />
                  ) : (
                    <span title="Saved" className="shrink-0">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Upload CSV or TXT for {ESSAY_TYPES[activeTab].label}</h3>
               <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a CSV or TXT file to automatically populate multiple group prompts for this essay type.
                  </p>
                  <p className="text-xs text-blue-600 bg-blue-50 p-3 rounded-md mb-4 border border-blue-100">
                    <strong>Tip:</strong> To insert a line break ("enter") in your question or fields, type <code>\n</code> in your CSV/TXT cell (e.g. <code>Line 1\nLine 2</code>).
                  </p>
                  <button 
                     onClick={downloadTemplate}
                     className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-100 transition-colors"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" /></svg>
                     Download CSV Template
                  </button>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 relative">
                     <input type="file" accept=".csv,.txt" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleCsvUpload} />
                     <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                     <span className="text-sm font-semibold text-slate-900 pointer-events-none">Click or drag CSV / TXT here</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Vocab Modal */}
      {isVocabModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[80vh]">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
               <h3 className="font-bold text-gray-900 text-lg">{category.name} Vocabularies</h3>
               <button onClick={() => setIsVocabModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 overflow-y-auto flex-1">
               {vocabularies.length > 0 ? (
                 <div className="flex flex-wrap gap-2">
                   {vocabularies.map(v => (
                     <span key={v} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200">
                       {v}
                     </span>
                   ))}
                 </div>
               ) : (
                 <p className="text-gray-500 text-center py-8">No vocabularies found for this category.</p>
               )}
             </div>
             <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end">
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(vocabularies.join(', '))
                   alert('Vocabularies copied to clipboard!')
                 }}
                 className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg text-sm transition-colors"
                 disabled={vocabularies.length === 0}
               >
                 Copy All Words
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
