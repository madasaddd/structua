'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Papa from 'papaparse'

const generateId = () => Math.random().toString(36).substr(2, 9)

const QUESTION_TYPES = [
  'Cloze test',
  'Collocation matching',
  'Word mapping (Morphology)',
  'Pushed Output'
]

type EditQuizQuestion = { id: string, orderIndex: number, questionType: string, questionText: string, targetVocabId: string }
type EditQuizGroup = { id: string, orderIndex: number, questions: EditQuizQuestion[] }
type EditQuizInstruction = { id: string, questionType: string, instruction: string }

export default function QuizEditorClient({ wordlist, activeTab, onTabChange }: { wordlist: any, activeTab: string, onTabChange: (tab: string) => void }) {
  const router = useRouter()
  const [savingGroupId, setSavingGroupId] = useState<string | null>(null)
  const [isSavingInstructions, setIsSavingInstructions] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  
  const [csvUploadGlobal, setCsvUploadGlobal] = useState(false)
  const [csvUploadInstructions, setCsvUploadInstructions] = useState(false)
  const [csvUploadGroupId, setCsvUploadGroupId] = useState<number | null>(null)
  
  const [instructions, setInstructions] = useState<EditQuizInstruction[]>([])
  const [groups, setGroups] = useState<EditQuizGroup[]>([])
  const vocabularies = wordlist.vocabularies || []

  // Load existing data
  useEffect(() => {
    fetch(`/api/vocab/${wordlist.id}/quiz`)
      .then(res => res.json())
      .then(data => {
        // Merge fetched instructions with default QUESTION_TYPES to ensure all 4 types always appear
        const mergedInstructions = QUESTION_TYPES.map(type => {
          const existing = data.instructions?.find((ins: any) => ins.questionType === type)
          return {
            id: existing?.id || generateId(),
            questionType: type,
            instruction: existing?.instruction || ''
          }
        })
        setInstructions(mergedInstructions)
        
        if (data.groups && data.groups.length > 0) {
          setGroups(data.groups.sort((a: any, b: any) => a.orderIndex - b.orderIndex).map((g: any) => ({
            ...g,
            id: g.id || generateId(),
            questions: g.questions.sort((qa: any, qb: any) => qa.orderIndex - qb.orderIndex).map((q: any) => ({
              ...q, id: q.id || generateId()
            }))
          })))
        } else {
          setGroups([])
        }
      })
  }, [wordlist.id])

  // Scroll spy
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  useEffect(() => {
    const handleScroll = () => {
      let currentId = null
      for (const g of groups) {
        const el = document.getElementById(`group-${g.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200) currentId = g.id
        }
      }
      if (currentId) setActiveGroupId(currentId)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [groups])

  const handleSaveInstructions = async () => {
    setIsSavingInstructions(true)
    try {
      const res = await fetch(`/api/vocab/${wordlist.id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_INSTRUCTIONS', payload: { instructions } })
      })
      if (!res.ok) throw new Error('Failed to save instructions')
      setLastSaved(new Date().toLocaleString())
      alert('Instructions saved successfully!')
      router.refresh()
    } catch (err) {
      alert('Failed to save Instructions')
    } finally {
      setIsSavingInstructions(false)
    }
  }

  const handleSaveGroup = async (gIdx: number) => {
    const group = groups[gIdx]
    setSavingGroupId(group.id)
    try {
      const res = await fetch(`/api/vocab/${wordlist.id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_GROUP', payload: { group: { ...group, orderIndex: gIdx } } })
      })
      if (!res.ok) throw new Error('Failed to save group')
      const savedGroup = await res.json()
      
      const newGroups = [...groups]
      newGroups[gIdx].id = savedGroup.id
      setGroups(newGroups)
      
      setLastSaved(new Date().toLocaleString())
      alert(`Group ${gIdx + 1} saved successfully!`)
    } catch (err) {
      alert('Failed to save Group ' + (gIdx + 1))
    } finally {
      setSavingGroupId(null)
    }
  }

  const handleDeleteGroup = async (gIdx: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return
    
    const group = groups[gIdx]
    if (group.id && group.id.length > 15) {
      try {
        const res = await fetch(`/api/vocab/${wordlist.id}/quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'DELETE_GROUP', payload: { id: group.id } })
        })
        if (!res.ok) throw new Error('Failed to delete group')
      } catch (err) {
        alert('Failed to delete Group from database')
        return
      }
    }
    
    const newGroups = [...groups]
    newGroups.splice(gIdx, 1)
    setGroups(newGroups)
  }

  const handleGlobalCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[]
        const groupedData: Record<string, EditQuizQuestion[]> = {}
        
        data.forEach(row => {
          const gn = row.group_number || '1'
          if (!groupedData[gn]) groupedData[gn] = []
          
          const targetVocab = vocabularies.find((v: any) => v.word.toLowerCase() === (row.target_vocab || '').toLowerCase().trim())
          const matchedType = QUESTION_TYPES.find(t => t.toLowerCase() === (row.question_type || '').toLowerCase().trim())
          groupedData[gn].push({
            id: generateId(),
            orderIndex: groupedData[gn].length,
            questionType: matchedType || QUESTION_TYPES[0],
            questionText: row.question_text || '',
            targetVocabId: targetVocab ? targetVocab.id : ''
          })
        })
        
        const newGroups = Object.keys(groupedData).map((gn, i) => ({
          id: generateId(),
          orderIndex: i,
          questions: groupedData[gn]
        }))

        try {
          const res = await fetch(`/api/vocab/${wordlist.id}/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'BULK_UPLOAD_GROUPS', payload: { groups: newGroups } })
          })
          if (!res.ok) throw new Error('Failed to bulk save groups')
          
          alert('All groups successfully uploaded and saved!')
          setCsvUploadGlobal(false)
          window.location.reload()
        } catch (err) {
          alert('Failed to upload all groups')
        }
      },
      error: (err) => alert('Failed to parse CSV: ' + err.message)
    })
  }

  const handleInstructionsCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        const newInsts = QUESTION_TYPES.map(type => {
          // Case-insensitive matching for CSV upload
          const row = data.find(r => (r.question_type || '').toLowerCase().trim() === type.toLowerCase().trim())
          const existing = instructions.find(ins => ins.questionType === type)
          return {
            id: existing?.id || generateId(),
            questionType: type,
            instruction: row ? row.instruction : (existing?.instruction || '')
          }
        })
        setInstructions(newInsts)
        setCsvUploadInstructions(false)
        alert('Instructions uploaded! Please click "Save Instructions".')
      },
      error: (err) => alert('Failed to parse CSV: ' + err.message)
    })
  }

  const handleCsvUpload = (gIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        const newQuestions: EditQuizQuestion[] = data.map((row, i) => {
          const targetVocab = vocabularies.find((v: any) => v.word.toLowerCase() === (row.target_vocab || '').toLowerCase().trim())
          const matchedType = QUESTION_TYPES.find(t => t.toLowerCase() === (row.question_type || '').toLowerCase().trim())
          return {
            id: generateId(),
            orderIndex: i,
            questionType: matchedType || QUESTION_TYPES[0],
            questionText: row.question_text || '',
            targetVocabId: targetVocab ? targetVocab.id : ''
          }
        })
        const newGroups = [...groups]
        newGroups[gIdx].questions = newQuestions
        setGroups(newGroups)
        setCsvUploadGroupId(null)
        alert(`CSV processed for Group ${gIdx + 1}. Please click Save Group.`)
      },
      error: (err) => alert('Failed to parse CSV: ' + err.message)
    })
  }

  const updateInstruction = (idx: number, text: string) => {
    const newInst = [...instructions]
    newInst[idx].instruction = text
    setInstructions(newInst)
  }

  const addQuestion = (gIdx: number) => {
    const newGroups = [...groups]
    newGroups[gIdx].questions.push({
      id: generateId(),
      orderIndex: newGroups[gIdx].questions.length,
      questionType: QUESTION_TYPES[0],
      questionText: '',
      targetVocabId: ''
    })
    setGroups(newGroups)
  }

  const updateQuestion = (gIdx: number, qIdx: number, updates: Partial<EditQuizQuestion>) => {
    const newGroups = [...groups]
    newGroups[gIdx].questions[qIdx] = { ...newGroups[gIdx].questions[qIdx], ...updates }
    setGroups(newGroups)
  }

  const deleteQuestion = (gIdx: number, qIdx: number) => {
    const newGroups = [...groups]
    newGroups[gIdx].questions.splice(qIdx, 1)
    setGroups(newGroups)
  }

  const downloadGroupTemplate = () => {
    const headers = 'target_vocab,question_type,question_text\n'
    const blob = new Blob([headers], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'structua_quiz_group_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadGlobalTemplate = () => {
    const headers = 'group_number,target_vocab,question_type,question_text\n'
    const blob = new Blob([headers], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'structua_quiz_global_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadInstructionsTemplate = () => {
    const headers = 'question_type,instruction\n'
    const blob = new Blob([headers], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'structua_quiz_instructions_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full max-h-screen overflow-hidden bg-gray-50/50">
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <Link href="/admin/vocab" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 inline-block">← Back to Dashboard</Link>
              <p className="text-sm text-gray-500 font-medium mb-1">[{wordlist.category.name}]</p>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quiz – {wordlist.title}</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mt-2 mb-6">
             <button onClick={() => onTabChange('vocab')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'vocab' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Vocabularies list</button>
             <button onClick={() => onTabChange('discovery')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'discovery' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Discovery</button>
             <button onClick={() => onTabChange('quiz')} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'quiz' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Quiz</button>
             <button className="pb-3 text-sm font-semibold border-b-2 border-transparent text-gray-400 cursor-not-allowed">Tab 1</button>
             <button className="pb-3 text-sm font-semibold border-b-2 border-transparent text-gray-400 cursor-not-allowed">Tab 2</button>
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Instructions</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCsvUploadInstructions(true)}
                  className="text-xs font-semibold text-gray-700 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                  Upload CSV
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {instructions.map((inst, idx) => (
                <div key={inst.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                    <div className="text-sm font-semibold text-slate-800 py-2">{inst.questionType}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instruction</label>
                    <input 
                      value={inst.instruction}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                      placeholder="E.g., Fill in the blank with the appropriate word"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
              <button 
                onClick={handleSaveInstructions}
                disabled={isSavingInstructions}
                className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {isSavingInstructions ? 'Saving...' : 'Save Instructions'}
              </button>
            </div>
          </div>

          {/* Groups List */}
          <div className="space-y-8">
            {groups.map((group, gIdx) => {
              const isSaving = savingGroupId === group.id
              return (
              <div key={group.id} id={`group-${group.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden scroll-mt-24 p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-lg">Group {gIdx + 1}</h3>
                  <div className="flex gap-2 items-center">
                     <button 
                       onClick={() => setCsvUploadGroupId(gIdx)}
                       className="text-xs text-gray-700 font-semibold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                        Upload CSV
                     </button>
                     <button 
                       onClick={() => handleDeleteGroup(gIdx)}
                       className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg ml-2"
                       title="Delete Group"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {group.questions.map((q, qIdx) => (
                    <div key={q.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-4 rounded-lg relative pr-10 border border-gray-100">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Word</label>
                        <select 
                          value={q.targetVocabId || ''}
                          onChange={(e) => updateQuestion(gIdx, qIdx, { targetVocabId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 bg-white"
                        >
                          <option value="">Select word...</option>
                          {vocabularies.map((v: any) => (
                            <option key={v.id} value={v.id}>{v.word}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Type</label>
                        <select 
                          value={q.questionType}
                          onChange={(e) => updateQuestion(gIdx, qIdx, { questionType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 bg-white"
                        >
                          {QUESTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Question Text</label>
                        <textarea 
                          value={q.questionText}
                          onChange={(e) => updateQuestion(gIdx, qIdx, { questionText: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 bg-white min-h-[40px]"
                          placeholder="Enter question text here..."
                        />
                      </div>
                      <button 
                        onClick={() => deleteQuestion(gIdx, qIdx)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => addQuestion(gIdx)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add new question
                  </button>
                </div>

                <div className="flex justify-end pt-5 mt-5 border-t border-gray-100">
                  <button 
                    onClick={() => handleSaveGroup(gIdx)}
                    disabled={isSaving}
                    className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Saving...
                      </>
                    ) : (
                      'Save Group'
                    )}
                  </button>
                </div>
              </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <button 
              onClick={() => setGroups([...groups, { id: generateId(), orderIndex: groups.length, questions: [] }])}
              className="px-6 py-3 bg-white text-slate-900 border border-slate-200 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add new group manually
            </button>
            <button 
              onClick={() => setCsvUploadGlobal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
              Global Upload CSV
            </button>
          </div>
        </div>
      </div>

      {/* Right Navigation Widget */}
      <div className="w-72 shrink-0 hidden lg:block px-6 py-8 overflow-y-auto">
         <div className="sticky top-0 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
           <div className="mb-6 flex items-center justify-between">
             <h3 className="text-sm font-bold text-gray-800">{groups.length} Groups</h3>
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-semibold">Quiz</span>
           </div>
           
           <div className="flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 space-y-3">
             {groups.map((g, i) => (
                <button 
                  key={g.id}
                  onClick={() => document.getElementById(`group-${g.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className={`block w-full text-left text-[13px] transition-all truncate ${activeGroupId === g.id ? 'text-slate-900 font-bold' : 'text-gray-400 hover:text-gray-600 font-medium'}`}
                >
                  Group {i + 1} ({g.questions.length} Qs)
                </button>
             ))}
           </div>

           <div className="pt-4 mt-auto border-t border-gray-100 text-center">
             {lastSaved ? (
               <p className="text-[10px] text-gray-500 font-medium">Latest update: {lastSaved}</p>
             ) : (
               <p className="text-[10px] text-gray-400 italic">No unsaved changes globally</p>
             )}
           </div>
         </div>
      </div>

      {/* CSV Upload Modal for Instructions */}
      {csvUploadInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Upload CSV for Instructions</h3>
               <button onClick={() => setCsvUploadInstructions(false)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to automatically populate instructions.
                  </p>
                  <button 
                     onClick={downloadInstructionsTemplate}
                     className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-100"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" /></svg>
                     Download CSV Template
                  </button>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 relative">
                     <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleInstructionsCsvUpload} />
                     <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                     <span className="text-sm font-semibold text-slate-900 pointer-events-none">Click or drag CSV here</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal for Single Group */}
      {csvUploadGroupId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Upload CSV for Group {csvUploadGroupId + 1}</h3>
               <button onClick={() => setCsvUploadGroupId(null)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to automatically populate questions for this group.
                  </p>
                  <button 
                     onClick={downloadGroupTemplate}
                     className="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-100"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4-4m4 4V4" /></svg>
                     Download CSV Template
                  </button>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50/50 relative">
                     <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleCsvUpload(csvUploadGroupId, e)} />
                     <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
                     <span className="text-sm font-semibold text-slate-900 pointer-events-none">Click or drag CSV here</span>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal for Global */}
      {csvUploadGlobal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-lg">Global Upload CSV</h3>
               <button onClick={() => setCsvUploadGlobal(false)} className="text-gray-400 hover:text-gray-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file to automatically populate all groups and questions.
                  </p>
                  <button 
                     onClick={downloadGlobalTemplate}
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
