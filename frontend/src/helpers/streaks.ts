import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"

dayjs.extend(isoWeek)

export function weeklyStreak(dates: Date[]) {
  if (dates.length === 0) {
    return 0
  }

  const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime())
  const currentDate = new Date()
  const newest = sortedDates[0]

  // Streaks can either start this week or last week
  if (!isInWeekBefore(newest, currentDate) && !isSameWeek(currentDate, newest)) {
    return 0
  }

  const newestIsThisWeek = isSameWeek(currentDate, newest)

  let streak = newestIsThisWeek ? 1 : 0
  let lastDate = newestIsThisWeek ? newest : currentDate

  for (const date of sortedDates) {
    if (isSameWeek(date, lastDate)) {
      continue
    }

    if (isInWeekBefore(date, lastDate)) {
      streak++
      lastDate = date

      continue
    }

    break
  }

  return streak
}

function isInWeekBefore(a: Date, b: Date) {
  const A = dayjs(a)
  const B = dayjs(b)

  return A.startOf("isoWeek").isSame(B.startOf("isoWeek").subtract(1, "week"))
}

function isSameWeek(a: Date, b: Date) {
  return dayjs(a).startOf("isoWeek").isSame(dayjs(b).startOf("isoWeek"), "day")
}
