const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function formatTime(date: Date): string {
  return `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`
}

export function formatDate(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (isSameDay(date, now)) return `hoje, ${formatTime(date)}`
  if (isSameDay(date, yesterday)) return `ontem, ${formatTime(date)}`
  return `${padTwoDigits(date.getDate())} ${MONTH_LABELS[date.getMonth()]}`
}
