'use client'

import { useState } from 'react'
import Link from 'next/link'

type WordlistType = {
  id: string
  title: string
  description: string | null
  categoryId: string
  orderIndex: number
  vocabularies: { id: string }[]
}

type CategoryType = {
  id: string
  name: string
  orderIndex: number
  wordlists: WordlistType[]
}

export default function AdminVocabDashboardClient({ initialCategories }: { initialCategories: CategoryType[] }) {
  const [categories, setCategories] = useState<CategoryType[]>(initialCategories)

  // Modal states
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)
  const [isWordlistModalOpen, setWordlistModalOpen] = useState(false)
  
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null)
  const [activeCategoryIdForWordlist, setActiveCategoryIdForWordlist] = useState<string | null>(null)
  
  // Form states
  const [categoryName, setCategoryName] = useState('')
  const [wordlistTitle, setWordlistTitle] = useState('')
  const [wordlistDesc, setWordlistDesc] = useState('')

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return
    
    if (editingCategory) {
      const res = await fetch('/api/vocab', {
        method: 'PUT',
        body: JSON.stringify({ action: 'UPDATE_CATEGORY', payload: { id: editingCategory.id, name: categoryName } })
      })
      if (res.ok) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: categoryName } : c))
      }
    } else {
      const res = await fetch('/api/vocab', {
        method: 'POST',
        body: JSON.stringify({ action: 'CREATE_CATEGORY', payload: { name: categoryName } })
      })
      if (res.ok) {
        const newCat = await res.json()
        setCategories([...categories, { ...newCat, wordlists: [] }])
      }
    }
    
    setCategoryModalOpen(false)
    setCategoryName('')
    setEditingCategory(null)
  }

  const handleSaveWordlist = async () => {
    if (!wordlistTitle.trim() || !activeCategoryIdForWordlist) return
    
    const res = await fetch('/api/vocab', {
      method: 'POST',
      body: JSON.stringify({ action: 'CREATE_WORDLIST', payload: { categoryId: activeCategoryIdForWordlist, title: wordlistTitle, description: wordlistDesc } })
    })
    
    if (res.ok) {
      const newWl = await res.json()
      setCategories(categories.map(c => {
        if (c.id === activeCategoryIdForWordlist) {
          return { ...c, wordlists: [...c.wordlists, { ...newWl, vocabularies: [] }] }
        }
        return c
      }))
    }
    
    setWordlistModalOpen(false)
    setWordlistTitle('')
    setWordlistDesc('')
    setActiveCategoryIdForWordlist(null)
  }

  const handleDeleteWordlist = async (wordlistId: string, categoryId: string) => {
    if (!confirm('Are you sure you want to delete this wordlist?')) return
    
    const res = await fetch(`/api/vocab?action=DELETE_WORDLIST&id=${wordlistId}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories(categories.map(c => {
        if (c.id === categoryId) {
          return { ...c, wordlists: c.wordlists.filter(w => w.id !== wordlistId) }
        }
        return c
      }))
    }
  }

  return (
    <div className="space-y-16">
      {categories.map(cat => (
        <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-12">
          <div className="flex items-center justify-between mb-6 border-b pb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800">{cat.name}</h2>
              <p className="text-sm text-gray-400">Description</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setCategoryModalOpen(true); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors bg-white shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cat.wordlists.map(wl => (
              <div key={wl.id} className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-5 flex-1 flex flex-col relative">
                  <button onClick={() => handleDeleteWordlist(wl.id, cat.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                  <h3 className="font-bold text-gray-900 text-base mb-1 pr-6 truncate">{cat.name} — {wl.title}</h3>
                  <p className="text-xs text-gray-400 mb-6">{wl.vocabularies.length} vocabularies</p>
                  
                  <div className="mt-auto">
                    <Link
                      href={`/admin/vocab/${wl.id}`}
                      className="flex w-full items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Edit Vocabularies
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex flex-col bg-white rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors overflow-hidden">
              <button 
                onClick={() => { setActiveCategoryIdForWordlist(cat.id); setWordlistTitle(''); setWordlistDesc(''); setWordlistModalOpen(true); }}
                className="w-full h-full flex flex-col items-center justify-center p-5 min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-3">
                  <span className="text-xl leading-none">+</span>
                </div>
                <span className="text-sm font-bold text-slate-800">Add New Wordlist</span>
              </button>
            </div>
          </div>
        </section>
      ))}

      <div className="flex flex-col bg-white rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors overflow-hidden mt-8">
        <button 
          onClick={() => { setEditingCategory(null); setCategoryName(''); setCategoryModalOpen(true); }}
          className="w-full h-full flex flex-col items-center justify-center p-8"
        >
          <span className="text-sm font-bold text-slate-800 mb-2 mt-4">That's All</span>
          <div className="bg-slate-900 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            Add new category
          </div>
        </button>
      </div>

      {/* MODALS */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">{editingCategory ? 'Edit existing category' : 'Create a new category'}</h3>
                <button onClick={() => setCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category name</label>
                  <input 
                    type="text" 
                    value={categoryName} 
                    onChange={e => setCategoryName(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" 
                    placeholder="e.g. Economy" 
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <button onClick={() => setCategoryModalOpen(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveCategory} className="flex-1 py-2 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isWordlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Create a new wordlist</h3>
                <button onClick={() => setWordlistModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">Category: {categories.find(c => c.id === activeCategoryIdForWordlist)?.name}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                  <input 
                    type="text" 
                    value={wordlistTitle} 
                    onChange={e => setWordlistTitle(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" 
                    placeholder="e.g. Economy Part 1" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                  <input 
                    type="text" 
                    value={wordlistDesc} 
                    onChange={e => setWordlistDesc(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" 
                    placeholder="Optional details" 
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <button onClick={() => setWordlistModalOpen(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveWordlist} className="flex-1 py-2 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
