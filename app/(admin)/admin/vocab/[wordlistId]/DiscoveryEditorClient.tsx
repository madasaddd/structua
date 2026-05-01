'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Papa from 'papaparse'
import RichTextEditor from './RichTextEditor'

const generateId = () => Math.random().toString(36).substr(2, 9)

type EditQuestion = { id: string, text: string }
type EditOption = { id: string, content: string, questions: EditQuestion[] }
type EditParagraph = { id: string, options: EditOption[], activeOptionIndex: number }

export default function DiscoveryEditorClient({ wordlist, activeTab, onTabChange }: { wordlist: any, activeTab: string, onTabChange: (tab: string) => void }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [csvUploadPIdx, setCsvUploadPIdx] = useState<number | null>(null)

  // Initialize state from wordlist.discoveryTask
  const [paragraphs, setParagraphs] = useState<EditParagraph[]>(() => {
    const task = wordlist.discoveryTask
    if (!task || !task.paragraphs || task.paragraphs.length === 0) {
      return [{
        id: generateId(),
        activeOptionIndex: 0,
        options: [{ id: generateId(), content: '', questions: [{ id: generateId(), text: '' }] }]
      }]
    }

    return task.paragraphs.sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((p: any) => ({
      id: p.id,
      activeOptionIndex: 0,
      options: p.options.length > 0 ? p.options.map((o: any) => ({
        id: o.id,
        content: o.content,
        questions: o.questions.sort((qa: any, qb: any) => qa.orderIndex - qb.orderIndex).map((q: any) => ({
          id: q.id,
          text: q.questionText
        }))
      })) : [{ id: generateId(), content: '', questions: [{ id: generateId(), text: '' }] }]
    }))
  })

  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      let currentId = null
      for (const p of paragraphs) {
        const el = document.getElementById(`paragraph-${p.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) currentId = p.id
        }
      }
      if (currentId) setActiveParagraphId(currentId)
    }
    // Only add listener if there are elements to observe
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [paragraphs])

  const handleSave = async () => {
    setIsSaving(true)
    const payload = {
      wordlistId: wordlist.id,
      paragraphs: paragraphs.map((p, pIdx) => ({
        id: p.id,
        orderIndex: pIdx,
        options: p.options.map(o => ({
          id: o.id,
          content: o.content,
          questions: o.questions.map((q, qIdx) => ({
            id: q.id,
            orderIndex: qIdx,
            text: q.text
          }))
        }))
      }))
    }

    try {
      const res = await fetch(`/api/vocab/${wordlist.id}/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to save')
      
      setLastSaved(new Date().toLocaleString())
      router.refresh()
    } catch (err) {
      alert('Failed to save Discovery Task')
    } finally {
      setIsSaving(false)
    }
  }

  const updateParagraphOption = (pIdx: number, oIdx: number, updates: Partial<EditOption>) => {
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].options[oIdx] = { ...newParagraphs[pIdx].options[oIdx], ...updates }
    setParagraphs(newParagraphs)
  }

  const addOption = (pIdx: number) => {
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].options.push({ id: generateId(), content: '', questions: [{ id: generateId(), text: '' }] })
    newParagraphs[pIdx].activeOptionIndex = newParagraphs[pIdx].options.length - 1
    setParagraphs(newParagraphs)
  }

  const deleteParagraph = (pIdx: number) => {
    if (paragraphs.length <= 1) return alert('Must have at least one paragraph')
    if (!confirm('Are you sure you want to delete this paragraph? This action cannot be undone.')) return
    const newParagraphs = [...paragraphs]
    newParagraphs.splice(pIdx, 1)
    setParagraphs(newParagraphs)
  }

  const downloadTemplate = () => {
    const headers = 'paragraph_text,question_1,question_2,question_3\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structua_discovery_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleCsvUpload = (pIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        const newOptions = data.map(row => ({
          id: generateId(),
          content: row.paragraph_text || row.option_content || '',
          questions: Object.keys(row)
            .filter(key => key.startsWith('question_'))
            .map(key => ({ id: generateId(), text: row[key] }))
            .filter(q => q.text && q.text.trim() !== '')
        }))
        
        if (newOptions.length > 0) {
          const newParagraphs = [...paragraphs]
          newParagraphs[pIdx].options = newOptions
          newParagraphs[pIdx].activeOptionIndex = 0
          setParagraphs(newParagraphs)
          alert('CSV successfully processed! Please click "Save Discovery" to commit these changes.')
          setCsvUploadPIdx(null)
        } else {
          alert('No valid options found in CSV. Ensure you have a "paragraph_text" column.')
        }
      },
      error: (err) => {
        alert('Failed to parse CSV: ' + err.message)
      }
    })
  }

  const deleteOption = (pIdx: number, oIdx: number) => {
    if (paragraphs[pIdx].options.length <= 1) return alert('Must have at least one option')
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].options.splice(oIdx, 1)
    newParagraphs[pIdx].activeOptionIndex = 0
    setParagraphs(newParagraphs)
  }

  const addQuestion = (pIdx: number, oIdx: number) => {
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].options[oIdx].questions.push({ id: generateId(), text: '' })
    setParagraphs(newParagraphs)
  }

  const deleteQuestion = (pIdx: number, oIdx: number, qIdx: number) => {
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].options[oIdx].questions.splice(qIdx, 1)
    setParagraphs(newParagraphs)
  }

  return (
    <div className="flex h-full max-h-screen overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <Link href="/admin/vocab" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-2 inline-block">← Back to Dashboard</Link>
              <h1 className="text-2xl font-bold text-gray-900">{wordlist.category.name} — {wordlist.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{wordlist.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mt-2 mb-6">
             <button onClick={() => onTabChange('vocab')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'vocab' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Vocabularies list</button>
             <button onClick={() => onTabChange('discovery')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'discovery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Discovery</button>
             <button className="pb-3 text-sm font-semibold border-b-2 border-transparent text-gray-400 cursor-not-allowed">Flashcard</button>
          </div>

          {/* Form List */}
          <div className="space-y-8">
            {paragraphs.map((p, pIdx) => {
              const activeOption = p.options[p.activeOptionIndex]
              return (
                <div key={p.id} id={`paragraph-${p.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Paragraph {pIdx + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCsvUploadPIdx(pIdx)}
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                        title="Upload CSV for this paragraph"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                        CSV
                      </button>
                      <button 
                        onClick={() => deleteParagraph(pIdx)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Delete Paragraph"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {p.options.map((o, oIdx) => (
                      <div key={o.id} className="flex items-center border rounded-full overflow-hidden shrink-0">
                        <button 
                          onClick={() => { const newP = [...paragraphs]; newP[pIdx].activeOptionIndex = oIdx; setParagraphs(newP) }}
                          className={`px-4 py-1.5 text-sm font-medium transition-colors ${p.activeOptionIndex === oIdx ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                          Option {oIdx + 1}
                        </button>
                        {p.options.length > 1 && (
                          <button onClick={() => deleteOption(pIdx, oIdx)} className={`px-2 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ${p.activeOptionIndex === oIdx ? 'bg-blue-50' : 'bg-white'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addOption(pIdx)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-dashed border-gray-300 rounded-full hover:bg-gray-50 shrink-0">
                      Add an option <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Paragraph Text</label>
                      <RichTextEditor 
                        value={activeOption.content}
                        onChange={(val) => updateParagraphOption(pIdx, p.activeOptionIndex, { content: val })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Hint: Highlight text and press Ctrl+B / Cmd+B to bold vocabulary words.</p>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-800 mb-4">All Questions</h4>
                      <div className="space-y-4">
                        {activeOption.questions.map((q, qIdx) => (
                          <div key={q.id} className="relative">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Question {qIdx + 1}</label>
                            <div className="flex gap-2">
                              <input 
                                value={q.text}
                                onChange={(e) => {
                                  const newP = [...paragraphs];
                                  newP[pIdx].options[p.activeOptionIndex].questions[qIdx].text = e.target.value;
                                  setParagraphs(newP);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                placeholder="Field text goes here"
                              />
                              <button onClick={() => deleteQuestion(pIdx, p.activeOptionIndex, qIdx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => addQuestion(pIdx, p.activeOptionIndex)}
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Add a new question
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setParagraphs([...paragraphs, { id: generateId(), activeOptionIndex: 0, options: [{ id: generateId(), content: '', questions: [{ id: generateId(), text: '' }] }] }])}
              className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg shadow hover:bg-slate-800 text-sm"
            >
              Add new paragraph
            </button>
          </div>
        </div>
      </div>

      {/* Right Navigation Widget */}
      <div className="w-72 shrink-0 hidden lg:block px-6 py-8 overflow-y-auto">
         <div className="sticky top-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
           <div className="mb-6">
             <h3 className="text-sm font-bold text-gray-800">{paragraphs.length} Paragraphs</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 space-y-3">
             {paragraphs.map((p, i) => (
                <button 
                  key={p.id}
                  onClick={() => document.getElementById(`paragraph-${p.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className={`block w-full text-left text-[13px] transition-all truncate ${activeParagraphId === p.id ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
                >
                  Paragraph {i + 1}
                </button>
             ))}
           </div>

           <div className="pt-4 mt-auto space-y-2">
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-50"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
               {isSaving ? 'Saving...' : 'Save Discovery'}
             </button>
             {lastSaved && (
               <p className="text-[10px] text-gray-400 text-center">Last saved: {lastSaved}</p>
             )}
           </div>
         </div>
      </div>

      {csvUploadPIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Upload CSV for Paragraph {csvUploadPIdx + 1}</h3>
               <button onClick={() => setCsvUploadPIdx(null)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to automatically populate options and questions for this paragraph.
                  </p>
                  <button 
                     onClick={downloadTemplate}
                     className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-100"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" /></svg>
                     Download CSV Template
                  </button>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 relative">
                     <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleCsvUpload(csvUploadPIdx, e)} />
                     <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                     <span className="text-sm font-semibold text-slate-900 pointer-events-none">Click or drag CSV here</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

    </div>
  )
}
