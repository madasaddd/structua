'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Papa from 'papaparse'

const PART_OF_SPEECH_OPTIONS = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Preposition', 'Conjunction', 'Pronoun', 'Interjection', 'Phrase', 'PhrasalVerb']
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

type EditCollocation = { id: string, text: string, url: string }
type EditWordFamily = { id: string, word: string, partOfSpeech: string, url: string }
type EditVocab = { 
  id: string, 
  word: string, 
  partOfSpeech: string, 
  level: string, 
  defIndo: string, 
  defEng: string, 
  collocations: EditCollocation[], 
  wordFamilies: EditWordFamily[] 
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export default function WordlistEditorClient({ wordlist, activeTab = 'vocab', onTabChange }: { wordlist: any, activeTab?: string, onTabChange?: (tab: string) => void }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [editTitle, setEditTitle] = useState(wordlist.title)
  const [editDesc, setEditDesc] = useState(wordlist.description || '')
  const [isUploadCsvModalOpen, setIsUploadCsvModalOpen] = useState(false)
  
  const [vocabs, setVocabs] = useState<EditVocab[]>(() => {
    if (wordlist.vocabularies.length === 0) return [createEmptyVocab()]
    return wordlist.vocabularies.map((v: any) => ({
      id: v.id || generateId(),
      word: v.word,
      partOfSpeech: v.partOfSpeech || '',
      level: v.level || '',
      defIndo: v.defIndo,
      defEng: v.defEng,
      collocations: v.collocations.map((c: any) => ({ id: c.id || generateId(), text: c.text, url: c.url || '' })),
      wordFamilies: v.wordFamilies.map((w: any) => ({ id: w.id || generateId(), word: w.word, partOfSpeech: w.partOfSpeech || '', url: w.url || '' })),
    }))
  })

  // intersection observer for active word
  const [activeWordId, setActiveWordId] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      let currentId = null
      for (const v of vocabs) {
        const el = document.getElementById(`vocab-${v.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) currentId = v.id
        }
      }
      if (currentId) setActiveWordId(currentId)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [vocabs])

  function createEmptyVocab(): EditVocab {
    return { id: generateId(), word: '', partOfSpeech: '', level: '', defIndo: '', defEng: '', collocations: [], wordFamilies: [] }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const validVocabs = vocabs.filter(v => v.word.trim() !== '') // optional: basic validation
    
    const res = await fetch(`/api/vocab/${wordlist.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_VOCABULARIES', payload: { vocabularies: validVocabs } })
    })

    if (res.ok) {
      alert('Saved successfully!')
      router.refresh()
    } else {
      const errorData = await res.json().catch(() => ({}))
      alert(`Failed to save. Error: ${errorData.detail || 'Unknown error'}`)
    }
    setIsSaving(false)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    const res = await fetch(`/api/vocab`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_WORDLIST',
        payload: { id: wordlist.id, title: editTitle, description: editDesc }
      })
    })
    setIsSaving(false)
    if (res.ok) {
      setIsEditingSettings(false)
      router.refresh()
    } else {
      alert('Failed to update wordlist settings.')
    }
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        if (data.length > 10) {
          alert('A wordlist cannot have more than 10 vocabularies.')
          return
        }
        
        const newVocabs: EditVocab[] = data.map((row) => ({
          id: generateId(),
          word: row.word || '',
          partOfSpeech: row.part_of_speech || '',
          level: row.level || '',
          defIndo: row.def_indo || '',
          defEng: row.def_eng || '',
          collocations: Array.from({ length: 3 }).map((_, i) => ({
            id: generateId(),
            text: row[`col_${i + 1}`] || '',
            url: row[`col_${i + 1}_url`] || ''
          })).filter(c => c.text !== ''),
          wordFamilies: Array.from({ length: 3 }).map((_, i) => ({
            id: generateId(),
            word: row[`wf_${i + 1}`] || '',
            partOfSpeech: row[`wf_${i + 1}_pos`] || '',
            url: row[`wf_${i + 1}_url`] || ''
          })).filter(wf => wf.word !== '')
        }))

        setVocabs(newVocabs)
        setIsUploadCsvModalOpen(false)
        alert('CSV successfully processed! Please click "Save Changes" to commit these vocabularies.')
      },
      error: (err) => {
        alert('Failed to parse CSV: ' + err.message)
      }
    })
  }

  const downloadTemplate = () => {
    const headers = 'word,part_of_speech,level,def_indo,def_eng,col_1,col_1_url,col_2,col_2_url,col_3,col_3_url,wf_1,wf_1_pos,wf_1_url,wf_2,wf_2_pos,wf_2_url,wf_3,wf_3_pos,wf_3_url\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structua_wordlist_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleDeleteWordlist = async () => {
    if (!confirm('Delete wordlist entirely?')) return
    await fetch(`/api/vocab?action=DELETE_WORDLIST&id=${wordlist.id}`, { method: 'DELETE' })
    router.push('/admin/vocab')
  }

  const updateVocab = (vocabId: string, updates: Partial<EditVocab>) => {
    setVocabs(vocabs.map(v => v.id === vocabId ? { ...v, ...updates } : v))
  }

  const removeVocab = (vocabId: string) => {
    setVocabs(vocabs.filter(v => v.id !== vocabId))
  }

  return (
    <div className="flex h-full max-h-screen overflow-hidden bg-gray-50/50">
      
      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <Link href="/admin/vocab" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 inline-block">← Back to Dashboard</Link>
              <p className="text-sm text-gray-500 font-medium mb-1">[{wordlist.category.name}]</p>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{wordlist.title}</h1>
            </div>
            <div className="flex items-center gap-3">

              <button 
                onClick={() => setIsEditingSettings(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50"
              >
                Edit Info
              </button>

              <button 
                onClick={handleDeleteWordlist}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-red-600 bg-white text-sm font-semibold rounded-lg shadow-sm hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mt-2 mb-6">
             <button onClick={() => onTabChange?.('vocab')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'vocab' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Vocabularies list</button>
             <button onClick={() => onTabChange?.('discovery')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'discovery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Discovery</button>
             <button className="pb-3 text-sm font-semibold border-b-2 border-transparent text-gray-400 cursor-not-allowed">Flashcard</button>
          </div>

          {/* Form List */}
          <div className="space-y-6">
            {vocabs.map((vocab, index) => (
              <div key={vocab.id} id={`vocab-${vocab.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 text-sm">Word {index + 1}</h3>
                  <button onClick={() => removeVocab(vocab.id)} className="text-gray-400 hover:text-red-500 text-sm font-semibold">Remove</button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Row 1: Word, POS, Level */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vocabulary</label>
                       <input 
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none" 
                         value={vocab.word} onChange={e => updateVocab(vocab.id, { word: e.target.value })} 
                         placeholder="Enter word here"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Part of Speech</label>
                       <select 
                         className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                         value={vocab.partOfSpeech} onChange={e => updateVocab(vocab.id, { partOfSpeech: e.target.value })}
                       >
                         <option value="">Select...</option>
                         {PART_OF_SPEECH_OPTIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                       </select>
                    </div>
                    <div className="md:col-span-1">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Level</label>
                       <select 
                         className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                         value={vocab.level} onChange={e => updateVocab(vocab.id, { level: e.target.value })}
                       >
                         <option value="">Select...</option>
                         {LEVEL_OPTIONS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                       </select>
                    </div>
                  </div>

                  {/* Row 2: Def Indo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Definisi Bahasa Indonesia</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none" 
                      value={vocab.defIndo} onChange={e => updateVocab(vocab.id, { defIndo: e.target.value })} 
                      placeholder="Enter definition in Indonesian"
                    />
                  </div>

                  {/* Row 3: Def Eng */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Definisi Bahasa Inggris</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none min-h-[80px]" 
                      value={vocab.defEng} onChange={e => updateVocab(vocab.id, { defEng: e.target.value })} 
                      placeholder="Enter definition in English"
                    />
                  </div>

                  {/* Collocation Area */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
                    <h4 className="text-sm font-bold text-gray-700">Collocation</h4>
                    {vocab.collocations.map((col, cIdx) => (
                      <div key={col.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 relative pr-8">
                         <div>
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Collocation {cIdx + 1}</label>
                           <input 
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" 
                             value={col.text} onChange={e => {
                               const newCols = [...vocab.collocations]; 
                               newCols[cIdx].text = e.target.value; 
                               updateVocab(vocab.id, { collocations: newCols })
                             }}
                             placeholder="Ex: make a decision"
                           />
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Collocation URL {cIdx + 1}</label>
                           <input 
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" 
                             value={col.url} onChange={e => {
                               const newCols = [...vocab.collocations]; 
                               newCols[cIdx].url = e.target.value; 
                               updateVocab(vocab.id, { collocations: newCols })
                             }}
                             placeholder="https://youglish.com/..."
                           />
                         </div>
                         <button 
                           onClick={() => updateVocab(vocab.id, { collocations: vocab.collocations.filter((_, i) => i !== cIdx) })}
                           className="absolute right-0 top-6 text-gray-400 hover:text-red-500"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                    ))}
                    <div>
                      <button 
                        onClick={() => updateVocab(vocab.id, { collocations: [...vocab.collocations, { id: generateId(), text: '', url: '' }] })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add new collocation
                      </button>
                    </div>
                  </div>

                  {/* Word Family Area */}
                  <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-4 space-y-4">
                    <h4 className="text-sm font-bold text-blue-800">Word Family</h4>
                    {vocab.wordFamilies.map((wf, wIdx) => (
                      <div key={wf.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 relative pr-8">
                         <div>
                           <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">Word Family {wIdx + 1}</label>
                           <input 
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" 
                             value={wf.word} onChange={e => {
                               const newWFs = [...vocab.wordFamilies]; 
                               newWFs[wIdx].word = e.target.value; 
                               updateVocab(vocab.id, { wordFamilies: newWFs })
                             }}
                             placeholder="Ex: decision"
                           />
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">Part of speech</label>
                           <select 
                             className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm"
                             value={wf.partOfSpeech} onChange={e => {
                               const newWFs = [...vocab.wordFamilies]; 
                               newWFs[wIdx].partOfSpeech = e.target.value; 
                               updateVocab(vocab.id, { wordFamilies: newWFs })
                             }}
                           >
                             <option value="">Select...</option>
                             {PART_OF_SPEECH_OPTIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                           </select>
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">URL</label>
                           <input 
                             className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm" 
                             value={wf.url} onChange={e => {
                               const newWFs = [...vocab.wordFamilies]; 
                               newWFs[wIdx].url = e.target.value; 
                               updateVocab(vocab.id, { wordFamilies: newWFs })
                             }}
                             placeholder="https://..."
                           />
                         </div>
                         <button 
                           onClick={() => updateVocab(vocab.id, { wordFamilies: vocab.wordFamilies.filter((_, i) => i !== wIdx) })}
                           className="absolute right-0 top-6 text-gray-400 hover:text-red-500"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                    ))}
                    <div>
                      <button 
                        onClick={() => updateVocab(vocab.id, { wordFamilies: [...vocab.wordFamilies, { id: generateId(), word: '', partOfSpeech: '', url: '' }] })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add new word family
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Add new word / Upload CSV buttons */}
          <div className="flex justify-center gap-4 pt-8 border-t border-gray-200 mt-8">
            <button 
              onClick={() => setVocabs([...vocabs, createEmptyVocab()])}
              className="px-6 py-2 bg-slate-900 text-white font-semibold rounded-lg shadow hover:bg-slate-800 text-sm"
            >
              Add new word
            </button>
            <button 
              onClick={() => setIsUploadCsvModalOpen(true)}
              className="px-6 py-2 bg-gray-100 text-slate-900 font-semibold rounded-lg shadow-sm hover:bg-gray-200 text-sm"
            >
              Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* Right Navigation Widget */}
      <div className="w-72 shrink-0 hidden lg:block px-6 py-8 overflow-y-auto">
         <div className="sticky top-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
           <div className="mb-6">
             <h3 className="text-sm font-bold text-gray-800">{wordlist.category.name} — {wordlist.title}</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 space-y-3">
             {vocabs.map((v, i) => (
                <button 
                  key={v.id}
                  onClick={() => document.getElementById(`vocab-${v.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className={`block w-full text-left text-[13px] transition-all truncate ${activeWordId === v.id ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
                >
                  {v.word || `Word ${i + 1}`}
                </button>
             ))}
           </div>

           <div className="pt-4 mt-auto">
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-50"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
               {isSaving ? 'Saving...' : 'Save Changes'}
             </button>
           </div>
         </div>
      </div>

      {isEditingSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Edit Wordlist Info</h3>
              <button onClick={() => setIsEditingSettings(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                  placeholder="e.g., Economy 1"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm min-h-[100px]"
                  placeholder="Write a short description..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsEditingSettings(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
              <button onClick={handleSaveSettings} disabled={!editTitle.trim() || isSaving} className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isUploadCsvModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Upload CSV</h3>
               <button onClick={() => setIsUploadCsvModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to wipe and replace this wordlist. Maximum 10 vocabularies allowed.
                  </p>
                  <button 
                     onClick={downloadTemplate}
                     className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-100"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Download CSV Template
                  </button>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 relative">
                     <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleCsvUpload} />
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
