'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export type SidebarDay = {
  id: number
  order: number
  lessonTitle: string
  isPublished: boolean
  globalDayIndex: number
}

export type SidebarWeek = {
  id: number
  order: number
  themeTitle: string
  days: SidebarDay[]
}

export type SidebarVocabCategory = {
  id: string
  name: string
  orderIndex: number
}

export type SidebarProps = {
  weeks: SidebarWeek[]
  vocabCategories?: SidebarVocabCategory[]
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ weeks, vocabCategories = [], isOpen = false, onClose }: SidebarProps) {
  const params = useParams()
  const pathname = usePathname()
  const activeDayId = params.dayId ? parseInt(params.dayId as string, 10) : null
  const isVocab = pathname.startsWith('/vocab')

  const [openWeeks, setOpenWeeks] = useState<number[]>(() => {
    if (activeDayId) {
      const activeWeek = weeks.find((w) => w.days.some((d) => d.id === activeDayId))
      return activeWeek ? [activeWeek.id] : [weeks[0]?.id]
    }
    return [weeks[0]?.id]
  })

  const toggleWeek = (weekId: number) => {
    setOpenWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    )
  }

  useEffect(() => {
    onClose?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const [activeVocabId, setActiveVocabId] = useState<string | null>(null)
  useEffect(() => {
    if (!isVocab) return
    const handleScroll = () => {
      let currentId: string | null = null
      for (const cat of vocabCategories) {
        const el = document.getElementById(`category-${cat.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150) {
            currentId = cat.id
          }
        }
      }
      setActiveVocabId(currentId ?? (vocabCategories[0]?.id ?? null))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isVocab, vocabCategories])

  const grammarHref = weeks[0]?.days[0] ? `/day/${weeks[0].days[0].id}` : '#'
  
  const dualPillarContent = (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Global Header */}
      <div className="h-[4.5rem] flex items-center px-6 border-b border-gray-200 shrink-0">
        <h1 className="font-sans font-extrabold text-[#303e51] text-xl tracking-tight">Structua</h1>
      </div>
      
      {/* Dual Pillar Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Pillar 1 */}
        <div className="w-[72px] shrink-0 border-r border-gray-200 bg-white flex flex-col items-center py-4 gap-2">
          <Link href={grammarHref} className={`w-14 items-center justify-center p-2 rounded-xl flex flex-col gap-1 transition-colors ${!isVocab ? 'bg-[#EFF3FC] text-[#221B2F]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.27103 2.11151C5.46135 2.21816 5.03258 2.41324 4.72718 2.71244C4.42179 3.01165 4.22268 3.43172 4.11382 4.225C4.00176 5.04159 4 6.12387 4 7.67568V16.2442C4.38867 15.9781 4.82674 15.7756 5.29899 15.6517C5.82716 15.513 6.44305 15.5132 7.34563 15.5135L20 15.5135V7.67568C20 6.12387 19.9982 5.04159 19.8862 4.22499C19.7773 3.43172 19.5782 3.01165 19.2728 2.71244C18.9674 2.41324 18.5387 2.21816 17.729 2.11151C16.8955 2.00172 15.7908 2 14.2069 2H9.7931C8.2092 2 7.10452 2.00172 6.27103 2.11151ZM6.75862 6.59459C6.75862 6.1468 7.12914 5.78378 7.58621 5.78378H16.4138C16.8709 5.78378 17.2414 6.1468 17.2414 6.59459C17.2414 7.04239 16.8709 7.40541 16.4138 7.40541H7.58621C7.12914 7.40541 6.75862 7.04239 6.75862 6.59459ZM7.58621 9.56757C7.12914 9.56757 6.75862 9.93058 6.75862 10.3784C6.75862 10.8262 7.12914 11.1892 7.58621 11.1892H13.1034C13.5605 11.1892 13.931 10.8262 13.931 10.3784C13.931 9.93058 13.5605 9.56757 13.1034 9.56757H7.58621Z" fill="currentColor"/>
              <path d="M7.47341 17.1351H8.68965H13.1034H19.9991C19.9956 18.2657 19.9776 19.1088 19.8862 19.775C19.7773 20.5683 19.5782 20.9884 19.2728 21.2876C18.9674 21.5868 18.5387 21.7818 17.729 21.8885C16.8955 21.9983 15.7908 22 14.2069 22H9.7931C8.2092 22 7.10452 21.9983 6.27103 21.8885C5.46135 21.7818 5.03258 21.5868 4.72718 21.2876C4.42179 20.9884 4.22268 20.5683 4.11382 19.775C4.07259 19.4746 4.0463 19.1382 4.02952 18.7558C4.30088 18.0044 4.93365 17.4264 5.72738 17.218C6.01657 17.1421 6.39395 17.1351 7.47341 17.1351Z" fill="currentColor"/>
            </svg>
            <span className="text-[10px] font-bold">Grammar</span>
          </Link>
          <Link href="/vocab" className={`w-14 items-center justify-center p-2 rounded-xl flex flex-col gap-1 transition-colors ${isVocab ? 'bg-[#EFF3FC] text-[#221B2F]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.75458 14.716L3.27222 16.6479C3.87647 18.9029 4.17859 20.0305 4.86351 20.7618C5.40432 21.3392 6.10421 21.7433 6.87466 21.9229C7.85044 22.1504 8.97798 21.8483 11.2331 21.244C13.4881 20.6398 14.6157 20.3377 15.347 19.6528C15.4077 19.5959 15.4664 19.5373 15.5233 19.477C15.1891 19.449 14.852 19.3952 14.5094 19.3271C13.8133 19.1887 12.9862 18.967 12.008 18.7049L11.9012 18.6763L11.8764 18.6697C10.8121 18.3845 9.92281 18.1457 9.21277 17.8892C8.46607 17.6195 7.7876 17.287 7.21148 16.7474C6.41753 16.0038 5.86193 15.0414 5.61491 13.982C5.43567 13.2133 5.48691 12.4594 5.62666 11.6779C5.76058 10.929 6.00109 10.0315 6.28926 8.95613L6.28926 8.95611L6.82365 6.96174L6.84245 6.8916C4.9219 7.40896 3.91101 7.71505 3.23687 8.34646C2.65945 8.88726 2.25537 9.58715 2.07573 10.3576C1.84821 11.3334 2.15033 12.4609 2.75458 14.716Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M20.8293 10.7154L20.3116 12.6473C19.7074 14.9024 19.4052 16.0299 18.7203 16.7612C18.1795 17.3386 17.4796 17.7427 16.7092 17.9223C16.6129 17.9448 16.5152 17.9621 16.415 17.9744C15.4999 18.0873 14.3834 17.7881 12.3508 17.2435C10.0957 16.6392 8.96815 16.3371 8.23687 15.6522C7.65945 15.1114 7.25537 14.4115 7.07573 13.641C6.84821 12.6652 7.15033 11.5377 7.75458 9.28263L8.27222 7.35077C8.3591 7.02654 8.43979 6.7254 8.51621 6.44561C8.97128 4.77957 9.27709 3.86298 9.86351 3.23687C10.4043 2.65945 11.1042 2.25537 11.8747 2.07573C12.8504 1.84821 13.978 2.15033 16.2331 2.75458C18.4881 3.35883 19.6157 3.66095 20.347 4.34587C20.9244 4.88668 21.3285 5.58657 21.5081 6.35703C21.7356 7.3328 21.4335 8.46034 20.8293 10.7154ZM11.0524 9.80589C11.1596 9.40579 11.5709 9.16835 11.971 9.27556L16.8006 10.5697C17.2007 10.6769 17.4381 11.0881 17.3309 11.4882C17.2237 11.8883 16.8125 12.1257 16.4124 12.0185L11.5827 10.7244C11.1826 10.6172 10.9452 10.206 11.0524 9.80589ZM10.2756 12.7033C10.3828 12.3032 10.794 12.0658 11.1941 12.173L14.0919 12.9495C14.492 13.0567 14.7294 13.4679 14.6222 13.868C14.515 14.2681 14.1038 14.5056 13.7037 14.3984L10.8059 13.6219C10.4058 13.5147 10.1683 13.1034 10.2756 12.7033Z" fill="currentColor"/>
            </svg>
            <span className="text-[10px] font-bold">Vocab</span>
          </Link>
          
          <div className="mt-auto mb-4">
             {/* Mobile close button */}
            <button onClick={onClose} className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200">
             {isVocab ? (
               <div className="space-y-1 mt-2">
                 {vocabCategories.map(cat => {
                   const isActive = activeVocabId === cat.id || (!activeVocabId && vocabCategories[0]?.id === cat.id)
                   return (
                   <button
                     key={cat.id}
                     onClick={() => {
                       setActiveVocabId(cat.id)
                       document.getElementById(`category-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' })
                     }}
                     className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors font-sans ${
                         isActive
                         ? 'bg-[#EFF3FC] text-[#221B2F] font-bold'
                         : 'text-gray-700 hover:bg-blue-50/50 font-medium'
                     }`}
                   >
                     {cat.name}
                   </button>
                 )})}
               </div>
             ) : (
               <div className="space-y-6 mt-2"> {/* Generous vertical padding between blocks */}
                 {weeks.map((week) => {
                   const isOpen = openWeeks.includes(week.id)
                   return (
                     <div key={week.id} className="group/week">
                       <button
                         onClick={() => toggleWeek(week.id)}
                         className="flex w-full items-start justify-between px-2 py-1 text-left font-sans font-bold text-gray-900 transition-colors leading-tight text-[14px]"
                       >
                         <span className="whitespace-normal overflow-visible pr-4">Week {week.order}: {week.themeTitle}</span>
                         <svg className={`h-4 w-4 shrink-0 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                         </svg>
                       </button>
                       <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                         <ul className="overflow-hidden mt-2 space-y-0.5">
                           {week.days.map((day) => {
                             const isActive = day.id === activeDayId
                             return (
                               <li key={day.id}>
                                 {day.isPublished ? (
                                   <Link href={`/day/${day.id}`} onClick={() => onClose?.()} className={`flex items-center rounded-lg px-2 py-2 text-[13px] transition-all ${isActive ? 'bg-[#EFF3FC] font-medium text-[#221B2F]' : 'font-normal text-gray-500 hover:bg-blue-50/50'}`}>
                                     {isActive ? (
                                       <svg className="mr-3 h-4 w-4 shrink-0 text-[#221B2F]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                     ) : (
                                       <svg className="mr-3 h-3 w-3 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                     )}
                                     <span className="truncate flex-1 font-sans">Day {day.globalDayIndex}: {day.lessonTitle}</span>
                                   </Link>
                                 ) : (
                                   <div className="flex items-center rounded-lg px-3 py-2 text-[13px] font-normal text-gray-400 cursor-not-allowed">
                                     <svg className="mr-3 h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" strokeDasharray="4 4" /></svg>
                                     <span className="truncate flex-1 font-sans">Day {day.globalDayIndex}: {day.lessonTitle}</span>
                                   </div>
                                 )}
                               </li>
                             )
                           })}
                         </ul>
                       </div>
                     </div>
                   )
                 })}
               </div>
             )}
          </div>
          <div className="border-t border-gray-200/50 p-4 shrink-0 bg-white">
            <a href="https://forms.gle/3JwFx1221e9NZVPm7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-sans font-bold text-gray-600 hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#303e51]">
              <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Give Feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:w-80 lg:flex-row lg:border-r lg:border-gray-200 lg:bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        {dualPillarContent}
      </aside>

      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
        <aside className={`absolute left-0 top-0 bottom-0 w-80 flex flex-row bg-white shadow-xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {dualPillarContent}
        </aside>
      </div>
    </>
  )
}
