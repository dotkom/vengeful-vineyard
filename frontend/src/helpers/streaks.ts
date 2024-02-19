export function weeklyStreak(date: number, listDates: number[]) {
  let streak = [date]
  for (let i = 1; i <= listDates.length; i++) {
    for (let j = 0; j < listDates.length; j++) {
      const compareDate = streak[i - 1]
      const prewDate = listDates[0]
      if (compareDate <= 604800000 + prewDate && prewDate <= compareDate) {
        streak[i] = prewDate
        listDates.shift()
      } else {
        if (prewDate! <= compareDate) {
          break
        }
      }
    }
    if (streak[i] === undefined) {
      break
    }
  }
  return streak.length - 1
}
