/**
 * Attaches a dynamic `globalDayIndex` to each Day inside an array of Weeks.
 * 
 * The `globalDayIndex` is a calculated integer representing the absolute position
 * of the Day relative to the entire curriculum (Sum of all previous days + current day order).
 * 
 * Requires that `weeks` are sorted by `order ASC` and `days` are sorted by `order ASC`.
 */
export function calculateGlobalIndexes<
  D extends { order: number; [key: string]: any },
  W extends { days: D[]; [key: string]: any }
>(weeks: W[]): (W & { days: (D & { globalDayIndex: number })[] })[] {
  let globalIndex = 1

  return weeks.map((week) => {
    const indexedDays = week.days.map((day) => ({
      ...day,
      globalDayIndex: globalIndex++,
    }))

    return {
      ...week,
      days: indexedDays,
    }
  })
}

import { prisma } from '@/lib/prisma'

/**
 * Fetches all days, calculates global indexes, and returns a specific day's global index.
 * Useful for single-day queries (like metadata or DayNav).
 */
export async function getDayWithGlobalIndex(dayId: number) {
  const rawWeeks = await prisma.week.findMany({
    include: {
      days: {
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })

  const weeks = calculateGlobalIndexes(rawWeeks)
  const allDays = weeks.flatMap((w) => w.days)
  const targetDay = allDays.find((d) => d.id === dayId)

  return targetDay?.globalDayIndex ?? 1
}
