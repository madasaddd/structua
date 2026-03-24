'use client'

import { useRef, useEffect, useState } from 'react'
import { TableBlockContent } from '@/lib/validators/blocks'

export default function TableBlock({ data }: { data: TableBlockContent }) {
  const { caption, headers, rows } = data
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const checkScroll = () => {
      setIsScrollable(el.scrollWidth > el.clientWidth)
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)

    // Also listen for scroll to hide the hint when scrolled to the end
    const handleScroll = () => {
      if (!el) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      setIsScrollable(!atEnd && el.scrollWidth > el.clientWidth)
    }
    el.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('resize', checkScroll)
      el?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="my-10 overflow-hidden rounded-xl border border-gray-100 shadow-sm ring-1 ring-black ring-opacity-5">
      <div
        ref={scrollRef}
        className="overflow-x-auto table-scroll-hint"
        data-scrollable={isScrollable}
      >
        <table className="min-w-full divide-y divide-gray-200">
          {caption && (
            <caption className="bg-gray-50/50 backdrop-blur-sm px-5 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-100">
              {caption}
            </caption>
          )}
          <thead className="bg-white">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className={`px-5 py-4 text-[15px] text-gray-700 ${
                      cellIdx === 0 ? 'font-semibold text-accent' : 'font-medium'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
