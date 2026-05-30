'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Papa from 'papaparse'

const generateId = () => Math.random().toString(36).substr(2, 9)

type EditParaphraseParagraph = {
  id: string
  orderIndex: number
  casualText: string
  vocabIds: string[]
}

export default function ParaphraseEditorClient({ wordlist, activeTab, onTabChange }: { wordlist: any, activeTab: string, onTabChange: (tab: string) => void }) {
  const router = useRouter()
  const [paragraphs, setParagraphs] = useState<EditParaphraseParagraph[]>([])
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [csvUploadModal, setCsvUploadModal] = useState(false)
  const vocabularies = wordlist.vocabularies || []

  // Load existing data
  useEffect(() => {
    fetch(`/api/vocab/${wordlist.id}/paraphrase`)
      .then(res => res.json())
      .then(data => {
        if (data.paragraphs && data.paragraphs.length > 0) {
          setParagraphs(data.paragraphs.sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((p: any) => ({
            id: p.id || generateId(),
            orderIndex: p.orderIndex,
            casualText: p.casualText || '',
            vocabIds: p.vocabularies ? p.vocabularies.map((v: any) => v.id) : []
          })))
        } else {
          setParagraphs([{
            id: generateId(),
            orderIndex: 0,
            casualText: '',
            vocabIds: []
          }])
        }
      })
  }, [wordlist.id])

  // Scroll spy
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
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [paragraphs])

  const handleSaveParagraph = async (pIdx: number) => {
    const p = paragraphs[pIdx]
    setSavingIndex(pIdx)
    try {
      const res = await fetch(`/api/vocab/${wordlist.id}/paraphrase/paragraph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paragraph: { ...p, orderIndex: pIdx } })
      })
      if (!res.ok) throw new Error('Failed to save paragraph')
      const savedP = await res.json()
      
      const newParagraphs = [...paragraphs]
      newParagraphs[pIdx].id = savedP.id
      setParagraphs(newParagraphs)
      
      setLastSaved(new Date().toLocaleString())
    } catch (err) {
      alert('Failed to save Paragraph ' + (pIdx + 1))
    } finally {
      setSavingIndex(null)
    }
  }

  const handleDeleteParagraph = async (pIdx: number) => {
    if (!confirm('Are you sure you want to delete this paragraph?')) return
    
    const p = paragraphs[pIdx]
    if (p.id && p.id.length > 15) {
      try {
        const res = await fetch(`/api/vocab/${wordlist.id}/paraphrase/paragraph?id=${p.id}`, {
          method: 'DELETE'
        })
        if (!res.ok) throw new Error('Failed to delete paragraph')
      } catch (err) {
        alert('Failed to delete paragraph from database')
        return
      }
    }
    
    const newParagraphs = [...paragraphs]
    newParagraphs.splice(pIdx, 1)
    setParagraphs(newParagraphs)
  }

  const handleGlobalCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[]
        const newParagraphs: EditParaphraseParagraph[] = data.slice(0, 10).map((row, i) => { // Enforce max 10
          // Parse related vocabularies
          const relatedVocabWords = (row.related_vocabularies || '').split(';').map((w: string) => w.trim().toLowerCase()).filter(Boolean)
          const matchedVocabIds = vocabularies
            .filter((v: any) => relatedVocabWords.includes(v.word.toLowerCase()))
            .map((v: any) => v.id)

          return {
            id: generateId(),
            orderIndex: i,
            casualText: row.casual_text || '',
            vocabIds: matchedVocabIds.slice(0, 5) // Enforce max 5
          }
        })

        try {
          const res = await fetch(`/api/vocab/${wordlist.id}/paraphrase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'BULK_UPLOAD_PARAGRAPHS', payload: { paragraphs: newParagraphs } })
          })
          if (!res.ok) throw new Error('Failed to bulk upload paragraphs')
          
          alert('Paragraphs successfully uploaded and replaced!')
          setCsvUploadModal(false)
          window.location.reload()
        } catch (err) {
          alert('Failed to upload paragraphs')
        }
      },
      error: (err) => alert('Failed to parse CSV: ' + err.message)
    })
  }

  const downloadTemplate = () => {
    const headers = 'casual_text,related_vocabularies\n'
    const example = '"Recent adjustments to monetary policy...",inflation;market;policy\n'
    const blob = new Blob([headers + example], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'structua_paraphrase_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const addVocab = (pIdx: number) => {
    const newParagraphs = [...paragraphs]
    if (newParagraphs[pIdx].vocabIds.length < 5) {
      newParagraphs[pIdx].vocabIds.push('')
      setParagraphs(newParagraphs)
    } else {
      alert('Maximum 5 vocabulary words allowed per paragraph.')
    }
  }

  const updateVocab = (pIdx: number, vIdx: number, val: string) => {
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].vocabIds[vIdx] = val
    setParagraphs(newParagraphs)
  }

  const deleteVocab = (pIdx: number, vIdx: number) => {
    const newParagraphs = [...paragraphs]
    newParagraphs[pIdx].vocabIds.splice(vIdx, 1)
    setParagraphs(newParagraphs)
  }

  const addParagraph = () => {
    if (paragraphs.length >= 10) {
      alert('Maximum 10 target paragraphs allowed per wordlist.')
      return
    }
    setParagraphs([...paragraphs, { id: generateId(), orderIndex: paragraphs.length, casualText: '', vocabIds: [] }])
  }

  return (
    <div className="flex h-full max-h-screen overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <Link href="/admin/vocab" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 inline-block">← Back to Dashboard</Link>
              <p className="text-sm text-gray-500 font-medium mb-1">{wordlist.category.name}</p>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Paraphrase – {wordlist.title}</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mt-2 mb-6">
             <button onClick={() => onTabChange('vocab')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'vocab' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Vocabularies list</button>
             <button onClick={() => onTabChange('discovery')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'discovery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Discovery</button>
             <button onClick={() => onTabChange('quiz')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Quiz</button>
             <button onClick={() => onTabChange('paraphrase')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'paraphrase' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Paraphrase</button>
          </div>

          {/* Paragraphs List */}
          <div className="space-y-6">
            {paragraphs.map((p, pIdx) => {
              const isSaving = savingIndex === pIdx
              return (
              <div key={p.id} id={`paragraph-${p.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24 p-6 relative">
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Target Paragraph {pIdx + 1}</h3>
                  <button 
                    onClick={() => handleDeleteParagraph(pIdx)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Delete Paragraph"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Paragraph Text */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-2">Paragraph</label>
                    <textarea 
                      value={p.casualText}
                      onChange={(e) => {
                        const newP = [...paragraphs]
                        newP[pIdx].casualText = e.target.value
                        setParagraphs(newP)
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none min-h-[140px] resize-y text-gray-700 bg-white leading-relaxed"
                      placeholder="Enter the casual paragraph here..."
                    />
                  </div>

                  {/* Vocabulary Hints */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {p.vocabIds.map((vId, vIdx) => (
                      <div key={vIdx} className="flex gap-2 items-end relative">
                        <div className="flex-1">
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Vocab</label>
                          <select 
                            value={vId}
                            onChange={(e) => updateVocab(pIdx, vIdx, e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 bg-white"
                          >
                            <option value="">Field text goes here</option>
                            {vocabularies.map((v: any) => (
                              <option key={v.id} value={v.id}>{v.word}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={() => deleteVocab(pIdx, vIdx)} 
                          className="p-2 text-gray-400 hover:text-red-500 mb-0.5"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex items-center justify-between pt-2">
                    <button 
                      onClick={() => addVocab(pIdx)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 bg-white text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add new vocab
                    </button>
                    <button 
                      onClick={() => handleSaveParagraph(pIdx)}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#0f172a] text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {isSaving ? 'Saving...' : 'Save Question'}
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>

          {/* Bottom Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center gap-4">
            <button 
              onClick={addParagraph}
              className="px-6 py-2.5 bg-[#0f172a] text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-[#1e293b] transition-colors"
            >
              Add new paragraph
            </button>
            <button 
              onClick={() => setCsvUploadModal(true)}
              className="px-6 py-2.5 bg-[#f1f5f9] text-[#334155] text-[13px] font-bold rounded-lg shadow-sm hover:bg-[#e2e8f0] transition-colors"
            >
              Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* Right Navigation Widget */}
      <div className="w-72 shrink-0 hidden lg:block px-6 py-8 overflow-y-auto">
         <div className="sticky top-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
           <div className="mb-4">
             <h3 className="text-[15px] font-bold text-gray-800">{paragraphs.length} Paragraphs</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 space-y-2.5">
             {paragraphs.map((p, i) => (
                <button 
                  key={p.id}
                  onClick={() => document.getElementById(`paragraph-${p.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className={`block w-full text-left text-[13px] transition-all truncate ${activeParagraphId === p.id ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-gray-600 font-semibold'}`}
                >
                  Paragraph {i + 1}
                </button>
             ))}
           </div>

           {lastSaved && (
             <div className="pt-4 mt-auto border-t border-gray-100 text-center">
               <p className="text-[10px] text-gray-400 font-medium">Latest update: {lastSaved}</p>
             </div>
           )}
         </div>
      </div>

      {/* CSV Upload Modal */}
      {csvUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Upload Bulk Paraphrase Data</h3>
               <button onClick={() => setCsvUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to automatically populate all target paragraphs. <br/>
                    <strong className="text-red-500">Warning:</strong> This will replace all existing paragraphs in this task.
                  </p>
                  <button 
                     onClick={downloadTemplate}
                     className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-100"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" /></svg>
                     Download CSV Template
                  </button>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 relative">
                     <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleGlobalCsvUpload} />
                     <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4-4v12" /></svg>
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
