export function formatSeoDate(collectedAt: string): string {
  const [year, month, day] = collectedAt.split('-')
  return `${day}/${month}/${year}`
}
