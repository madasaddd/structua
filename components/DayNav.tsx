import Link from 'next/link'

export type DayNavItem = {
  id: number
  globalDayIndex: number
  lessonTitle: string
}

type DayNavProps = {
  prevDay: DayNavItem | null
  nextDay: DayNavItem | null
}

/**
 * Navigation footer shown at the bottom of each student day page.
 * Receives prev/next day data as props from the parent Server Component
 * — does NOT make its own database call.
 */
export default function DayNav({ prevDay, nextDay }: DayNavProps) {
  return (
    <nav className="my-20 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-12">
      <div className="w-full sm:w-auto flex-1">
        {prevDay ? (
          <Link
            href={`/day/${prevDay.id}`}
            className="group block p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-accent/10 transition-all text-left"
          >
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 group-hover:text-accent transition-colors underline decoration-accent/20">Previous Lesson</span>
            <span className="block text-lg font-bold text-gray-900 group-hover:text-accent transition-colors">
              Day {prevDay.globalDayIndex}: {prevDay.lessonTitle}
            </span>
          </Link>
        ) : (
          <div className="block p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-left opacity-60">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 italic">You're at the beginning</span>
            <span className="block text-lg font-bold text-gray-300 italic">No previous lessons</span>
          </div>
        )}
      </div>

      <div className="w-full sm:w-auto flex-1 text-right">
        {nextDay ? (
          <Link
            href={`/day/${nextDay.id}`}
            className="group block p-6 rounded-2xl border border-accent/20 bg-accent/[0.02] shadow-sm hover:shadow-md hover:border-accent transition-all animate-pulse-subtle"
          >
            <span className="block text-[10px] font-black uppercase tracking-widest text-accent mb-2">Up Next</span>
            <span className="block text-lg font-bold text-gray-900 group-hover:text-accent transition-colors">
              Day {nextDay.globalDayIndex}: {nextDay.lessonTitle}
            </span>
          </Link>
        ) : (
          <div className="block p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-right opacity-60">
            <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Final Step</span>
            <span className="block text-lg font-bold text-gray-300 italic">Curriculum Completed</span>
          </div>
        )}
      </div>
    </nav>
  )
}
