'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { SidebarWeek, SidebarVocabCategory } from '@/components/Sidebar'

export default function AdminSidebar({ weeks, vocabCategories = [] }: { weeks: SidebarWeek[], vocabCategories?: SidebarVocabCategory[] }) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const isVocab = pathname.startsWith('/admin/vocab')
  const isAi = pathname.startsWith('/admin/ai')
  const isGrammar = !isVocab && !isAi
  
  const activeDayId = params.id ? parseInt(params.id as string, 10) : null

  const [openWeeks, setOpenWeeks] = useState<number[]>(() => {
    if (activeDayId) {
      const activeWeek = weeks.find((w) => w.days.some((d) => d.id === activeDayId))
      return activeWeek ? [activeWeek.id] : [weeks[0]?.id]
    }
    return [weeks[0]?.id]
  })

  const [activeVocabId, setActiveVocabId] = useState<string | null>(null)
  
  const toggleWeek = (weekId: number) => {
    setOpenWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    )
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
      
      {/* Global Header */}
      <div className="h-[4.5rem] flex items-center px-6 border-b border-gray-200 shrink-0">
        <h1 className="font-sans font-extrabold text-[#303e51] text-xl tracking-tight">Structua</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Pillar 1 */}
        <div className="w-[72px] shrink-0 border-r border-gray-200 bg-white flex flex-col items-center py-4 gap-2">
          <Link href="/admin" className={`w-14 items-center justify-center p-2 rounded-xl flex flex-col gap-1 transition-colors ${isGrammar ? 'bg-[#EFF3FC] text-[#221B2F]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M6.27103 2.11151C5.46135 2.21816 5.03258 2.41324 4.72718 2.71244C4.42179 3.01165 4.22268 3.43172 4.11382 4.225C4.00176 5.04159 4 6.12387 4 7.67568V16.2442C4.38867 15.9781 4.82674 15.7756 5.29899 15.6517C5.82716 15.513 6.44305 15.5132 7.34563 15.5135L20 15.5135V7.67568C20 6.12387 19.9982 5.04159 19.8862 4.22499C19.7773 3.43172 19.5782 3.01165 19.2728 2.71244C18.9674 2.41324 18.5387 2.21816 17.729 2.11151C16.8955 2.00172 15.7908 2 14.2069 2H9.7931C8.2092 2 7.10452 2.00172 6.27103 2.11151ZM6.75862 6.59459C6.75862 6.1468 7.12914 5.78378 7.58621 5.78378H16.4138C16.8709 5.78378 17.2414 6.1468 17.2414 6.59459C17.2414 7.04239 16.8709 7.40541 16.4138 7.40541H7.58621C7.12914 7.40541 6.75862 7.04239 6.75862 6.59459ZM7.58621 9.56757C7.12914 9.56757 6.75862 9.93058 6.75862 10.3784C6.75862 10.8262 7.12914 11.1892 7.58621 11.1892H13.1034C13.5605 11.1892 13.931 10.8262 13.931 10.3784C13.931 9.93058 13.5605 9.56757 13.1034 9.56757H7.58621Z" fill="currentColor"/>
              <path d="M7.47341 17.1351H8.68965H13.1034H19.9991C19.9956 18.2657 19.9776 19.1088 19.8862 19.775C19.7773 20.5683 19.5782 20.9884 19.2728 21.2876C18.9674 21.5868 18.5387 21.7818 17.729 21.8885C16.8955 21.9983 15.7908 22 14.2069 22H9.7931C8.2092 22 7.10452 21.9983 6.27103 21.8885C5.46135 21.7818 5.03258 21.5868 4.72718 21.2876C4.42179 20.9884 4.22268 20.5683 4.11382 19.775C4.07259 19.4746 4.0463 19.1382 4.02952 18.7558C4.30088 18.0044 4.93365 17.4264 5.72738 17.218C6.01657 17.1421 6.39395 17.1351 7.47341 17.1351Z" fill="currentColor"/>
            </svg>
            <span className="text-[10px] font-bold">Grammar</span>
          </Link>
          <Link href="/admin/vocab" className={`w-14 items-center justify-center p-2 rounded-xl flex flex-col gap-1 transition-colors ${isVocab ? 'bg-[#EFF3FC] text-[#221B2F]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-6 h-6 mb-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.75458 14.716L3.27222 16.6479C3.87647 18.9029 4.17859 20.0305 4.86351 20.7618C5.40432 21.3392 6.10421 21.7433 6.87466 21.9229C7.85044 22.1504 8.97798 21.8483 11.2331 21.244C13.4881 20.6398 14.6157 20.3377 15.347 19.6528C15.4077 19.5959 15.4664 19.5373 15.5233 19.477C15.1891 19.449 14.852 19.3952 14.5094 19.3271C13.8133 19.1887 12.9862 18.967 12.008 18.7049L11.9012 18.6763L11.8764 18.6697C10.8121 18.3845 9.92281 18.1457 9.21277 17.8892C8.46607 17.6195 7.7876 17.287 7.21148 16.7474C6.41753 16.0038 5.86193 15.0414 5.61491 13.982C5.43567 13.2133 5.48691 12.4594 5.62666 11.6779C5.76058 10.929 6.00109 10.0315 6.28926 8.95613L6.28926 8.95611L6.82365 6.96174L6.84245 6.8916C4.9219 7.40896 3.91101 7.71505 3.23687 8.34646C2.65945 8.88726 2.25537 9.58715 2.07573 10.3576C1.84821 11.3334 2.15033 12.4609 2.75458 14.716Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M20.8293 10.7154L20.3116 12.6473C19.7074 14.9024 19.4052 16.0299 18.7203 16.7612C18.1795 17.3386 17.4796 17.7427 16.7092 17.9223C16.6129 17.9448 16.5152 17.9621 16.415 17.9744C15.4999 18.0873 14.3834 17.7881 12.3508 17.2435C10.0957 16.6392 8.96815 16.3371 8.23687 15.6522C7.65945 15.1114 7.25537 14.4115 7.07573 13.641C6.84821 12.6652 7.15033 11.5377 7.75458 9.28263L8.27222 7.35077C8.3591 7.02654 8.43979 6.7254 8.51621 6.44561C8.97128 4.77957 9.27709 3.86298 9.86351 3.23687C10.4043 2.65945 11.1042 2.25537 11.8747 2.07573C12.8504 1.84821 13.978 2.15033 16.2331 2.75458C18.4881 3.35883 19.6157 3.66095 20.347 4.34587C20.9244 4.88668 21.3285 5.58657 21.5081 6.35703C21.7356 7.3328 21.4335 8.46034 20.8293 10.7154ZM11.0524 9.80589C11.1596 9.40579 11.5709 9.16835 11.971 9.27556L16.8006 10.5697C17.2007 10.6769 17.4381 11.0881 17.3309 11.4882C17.2237 11.8883 16.8125 12.1257 16.4124 12.0185L11.5827 10.7244C11.1826 10.6172 10.9452 10.206 11.0524 9.80589ZM10.2756 12.7033C10.3828 12.3032 10.794 12.0658 11.1941 12.173L14.0919 12.9495C14.492 13.0567 14.7294 13.4679 14.6222 13.868C14.515 14.2681 14.1038 14.5056 13.7037 14.3984L10.8059 13.6219C10.4058 13.5147 10.1683 13.1034 10.2756 12.7033Z" fill="currentColor"/>
            </svg>
            <span className="text-[10px] font-bold">Vocab</span>
          </Link>
          <Link href="/admin/ai" className={`w-14 items-center justify-center p-2 rounded-xl flex flex-col gap-1 transition-colors ${isAi ? 'bg-[#EFF3FC] text-[#221B2F]' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-6 h-6 mb-0.5" viewBox="0 0 512 512" fill="currentColor">
              <g>
                <path d="M475.619,295.498l-41.406-87.766c0.109-2.625,0.203-5.266,0.203-7.906
                  c0-110.359-89.469-199.828-199.828-199.828S34.744,89.467,34.744,199.826c0,62.063,28.297,117.5,72.672,154.156v70.641
                  c0,6.891,4.125,13.125,10.453,15.797l165.516,70.219c5.281,2.25,11.359,1.688,16.172-1.484c4.797-3.188,7.688-8.563,7.688-14.313
                  v-59.844c0-9.484,7.688-17.172,17.172-17.172h84.75c9.484,0,17.156-7.703,17.156-17.172v-51.609c0-6.563,3.766-12.563,9.672-15.438
                  l31.594-15.344C476.041,314.154,479.619,303.998,475.619,295.498z M234.588,335.717c-75.047,0-135.891-60.828-135.891-135.891
                  c0-75.047,60.844-135.875,135.891-135.875s135.875,60.828,135.875,135.875C370.463,274.889,309.635,335.717,234.588,335.717z"/>
                <path d="M330.432,216.623c3.672-0.281,6.484-3.328,6.484-7.016v-16.766c0-3.688-2.813-6.734-6.484-7.031l-22.234-1.734
                  c-1.391-0.094-2.625-0.984-3.156-2.297l-7.328-17.656c-0.531-1.297-0.297-2.797,0.609-3.875l14.5-16.953
                  c2.391-2.781,2.234-6.938-0.375-9.531l-11.859-11.875c-2.609-2.594-6.766-2.75-9.547-0.375l-16.953,14.5
                  c-1.063,0.906-2.578,1.156-3.859,0.625l-17.656-7.328c-1.313-0.531-2.203-1.766-2.313-3.172l-1.719-22.219
                  c-0.297-3.688-3.359-6.5-7.031-6.5h-16.781c-3.672,0-6.734,2.813-7.016,6.5l-1.719,22.219c-0.109,1.406-1.016,2.641-2.328,3.172
                  l-17.641,7.328c-1.313,0.531-2.797,0.281-3.875-0.625l-16.953-14.5c-2.797-2.375-6.953-2.219-9.547,0.375l-11.859,11.875
                  c-2.594,2.594-2.766,6.75-0.375,9.531l14.5,16.953c0.906,1.078,1.156,2.578,0.609,3.875l-7.313,17.656
                  c-0.531,1.313-1.781,2.203-3.188,2.297l-22.234,1.734c-3.656,0.297-6.469,3.344-6.469,7.031v16.766
                  c0,3.688,2.813,6.734,6.469,7.016l22.234,1.734c1.406,0.109,2.656,1,3.188,2.313l7.313,17.656c0.547,1.281,0.297,2.797-0.609,3.859
                  l-14.5,16.969c-2.391,2.781-2.219,6.938,0.375,9.531l11.859,11.859c2.594,2.609,6.75,2.766,9.547,0.391l16.953-14.516
                  c1.078-0.891,2.563-1.141,3.875-0.594l17.641,7.313c1.313,0.531,2.219,1.766,2.328,3.156l1.719,22.25
                  c0.281,3.656,3.344,6.484,7.016,6.484h16.781c3.672,0,6.734-2.828,7.031-6.484l1.719-22.25c0.109-1.391,1-2.625,2.313-3.156
                  l17.656-7.313c1.281-0.547,2.797-0.297,3.859,0.594l16.953,14.516c2.781,2.375,6.938,2.219,9.547-0.391l11.859-11.859
                  c2.609-2.594,2.766-6.75,0.375-9.531l-14.5-16.969c-0.906-1.063-1.141-2.578-0.609-3.859l7.328-17.656
                  c0.531-1.313,1.766-2.203,3.156-2.313L330.432,216.623z M233.119,236.311c-9.375,0-18.188-3.656-24.813-10.281
                  s-10.266-15.438-10.266-24.797c0-9.375,3.641-18.188,10.266-24.813c6.625-6.641,15.438-10.281,24.813-10.281
                  s18.188,3.641,24.813,10.281c6.625,6.625,10.266,15.438,10.266,24.813c0,9.359-3.641,18.172-10.266,24.797
                  S242.494,236.311,233.119,236.311z"/>
              </g>
            </svg>
            <span className="text-[10px] font-bold">AI</span>
          </Link>
        </div>

        {/* Pillar 2 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-200">
            {isVocab ? (
               <div className="space-y-1 mt-2">
                 {vocabCategories.map(cat => (
                   <Link
                     key={cat.id}
                     href={`/admin/vocab#category-${cat.id}`}
                     onClick={() => setActiveVocabId(cat.id)}
                     className={`flex w-full items-center px-3 py-2 text-[13px] rounded-lg transition-colors font-sans ${activeVocabId === cat.id ? 'bg-[#EFF3FC] text-[#221B2F] font-bold' : 'text-gray-700 hover:bg-blue-50/50 font-medium'}`}
                   >
                     {cat.name}
                   </Link>
                 ))}
               </div>
            ) : isAi ? (
              <div className="space-y-1 mt-2">
                <Link
                  href="/admin/ai"
                  className={`flex w-full items-center px-3 py-2 text-[13px] rounded-lg transition-colors font-sans bg-[#EFF3FC] text-[#221B2F] font-bold`}
                >
                  AI Config
                </Link>
              </div>
            ) : (
              <div className="space-y-6 mt-2">
                {weeks.map((week) => {
                  const isOpen = openWeeks.includes(week.id)
                  return (
                    <div key={week.id}>
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
                                <Link
                                  href={`/admin/day/${day.id}`}
                                  className={`flex items-center rounded-lg px-2 py-2 text-[13px] transition-all ${isActive ? 'bg-[#EFF3FC] font-medium text-[#221B2F]' : 'font-normal text-gray-500 hover:bg-blue-50/50'}`}
                                >
                                  {isActive ? (
                                     <svg className="mr-3 h-4 w-4 shrink-0 text-[#221B2F]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                   ) : (
                                     <svg className="mr-3 h-3 w-3 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                                  )}
                                  <span className="truncate flex-1 font-sans">
                                    D{day.globalDayIndex}: {day.lessonTitle}
                                  </span>
                                  {day.isPublished && (
                                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                                  )}
                                </Link>
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
          </nav>

          {/* Logout pinned to bottom */}
          <div className="shrink-0 border-t border-gray-200/50 p-4 bg-white">
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-sans font-bold text-gray-600 hover:bg-slate-100 hover:text-red-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#303e51]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h6a1 1 0 100-2H4V5h5a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0L17 9.586V9a1 1 0 112 0v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
