'use client'

import { useRef, useEffect, useState } from 'react'
import { TableBlockContent } from '@/lib/validators/blocks'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function TableBlock({ data }: { data: TableBlockContent }) {
  const { caption, headers, rows } = data
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const checkScroll = () => setIsScrollable(el.scrollWidth > el.clientWidth)
    checkScroll()
    window.addEventListener('resize', checkScroll)

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
    <div className="my-10 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        ref={scrollRef}
        className="overflow-x-auto table-scroll-hint"
        data-scrollable={isScrollable}
      >
        <Table>
          {caption && (
            <TableCaption className="mt-0 mb-0 border-t border-border bg-muted/30 px-4 py-3 text-left text-xs font-medium text-muted-foreground caption-bottom">
              {caption}
            </TableCaption>
          )}
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {headers.map((header, idx) => (
                <TableHead
                  key={idx}
                  className="px-5 py-3.5 text-left text-xs font-semibold text-foreground whitespace-nowrap"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                className="hover:bg-muted/50 transition-colors border-border"
              >
                {row.map((cell, cellIdx) => (
                  <TableCell
                    key={cellIdx}
                    className={`px-5 py-4 text-sm ${
                      cellIdx === 0
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
