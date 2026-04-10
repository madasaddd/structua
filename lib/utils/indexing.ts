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
 * Calculates a specific day's global index efficiently using two lean queries:
 * 1. Fetch the target day's week order and the day's own order within that week.
 * 2. Count how many days exist in all weeks whose order is less than the target week.
 *
 * This replaces the previous approach that loaded the entire curriculum (all weeks + all days)
 * just to compute a single integer. Now it's O(2 small queries) regardless of curriculum size.
 */
export async function getDayWithGlobalIndex(dayId: number): Promise<number> {
  // Step 1: get the target day and its week order
  const day = await prisma.day.findUnique({
    where: { id: dayId },
    select: {
      order: true,
      week: { select: { order: true } },
    },
  })

  if (!day) return 1

  // Step 2: count all days that belong to weeks with a lower order number
  const daysInPreviousWeeks = await prisma.day.count({
    where: {
      week: { order: { lt: day.week.order } },
    },
  })

  // Global index = days before this week + this day's position within its week
  return daysInPreviousWeeks + day.order
}
