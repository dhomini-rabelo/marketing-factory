const SEO_LOCALE = 'pt-BR'

export function formatNumber(value: number): string {
  return value.toLocaleString(SEO_LOCALE)
}

export function formatDecimal(value: number): string {
  return value.toLocaleString(SEO_LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatDayMonth(isoDate: string): string {
  return isoDate.split('-').reverse().slice(0, 2).join('/')
}

const BYTES_PER_KILOBYTE = 1024

export function formatKilobytes(bytes: number): string {
  return `${formatDecimal(bytes / BYTES_PER_KILOBYTE)} KB`
}
