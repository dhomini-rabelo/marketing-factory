import { isRecord, readProfileText } from '@/pages/seo/utils/seo-profile'

const PAGE_TYPE_LABELS: Record<string, string> = {
  blog: 'blog',
  comparison: 'comparação',
  integrations: 'integração',
  tools: 'ferramenta',
  templates: 'template',
  landing: 'landing',
  other: 'outro',
}

const ROLE_LABELS: Record<string, string> = {
  recent: 'recente',
  comparison: 'comparação',
  other_type: 'outro tipo',
  old: 'antigo',
}

const MILLISECONDS_PER_DAY = 86_400_000
const DAYS_PER_MONTH = 30
const MIN_DAYS_IN_MONTHS = 60

export type SeoSampleItem = {
  record: Record<string, unknown>
  url: string
  title: string
  pageTypeLabel: string
  roleLabel: string
  role: string
  publishedAt: string
  modifiedAt: string
}

export type SeoFolder = {
  folder: string
  pages: number
}

function readIsoDate(record: Record<string, unknown>, key: string): string {
  return typeof record[key] === 'string' ? record[key] : ''
}

export function readSampleItems(items: object[]): SeoSampleItem[] {
  return items.filter(isRecord).map((record) => {
    const url = readIsoDate(record, 'url')
    const pageType = readIsoDate(record, 'pageType')
    const role = readProfileText(record, 'sampleRole')
    return {
      record,
      url,
      title: readProfileText(record, 'h1') || readProfileText(record, 'title') || url,
      pageTypeLabel: PAGE_TYPE_LABELS[pageType] ?? pageType,
      roleLabel: ROLE_LABELS[role] ?? role,
      role,
      publishedAt: readIsoDate(record, 'publishedAt'),
      modifiedAt: readProfileText(record, 'modifiedAt'),
    }
  })
}

export function readFolders(folders: object[]): SeoFolder[] {
  return folders.filter(isRecord).map((record) => {
    const numbers = isRecord(record.numbers) ? record.numbers : {}
    return { folder: readProfileText(record, 'folder'), pages: typeof numbers.pages === 'number' ? numbers.pages : 0 }
  })
}

export function describeAge(publishedAt: string, collectedAt: string): string {
  const days = Math.round((Date.parse(collectedAt) - Date.parse(publishedAt)) / MILLISECONDS_PER_DAY)
  return days >= MIN_DAYS_IN_MONTHS ? `${Math.round(days / DAYS_PER_MONTH)} meses` : `${days} dias`
}

export function describeRefresh(item: SeoSampleItem): string | null {
  if (!item.modifiedAt || !item.publishedAt) return null
  return Date.parse(item.modifiedAt) > Date.parse(item.publishedAt) ? 'atualizado' : 'sem atualização'
}
