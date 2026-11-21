import { readProfileNumber } from '@/pages/seo/utils/seo-profile'

export const MAX_VISIBLE_COMPARISONS = 5

export type SeoComparison = {
  url: string
  slug: string
  rivals: string[]
  format: string
}

const FORMAT_LABELS: Record<string, string> = {
  vs: 'A contra B',
  alternatives: 'alternativas',
}

const OTHER_FORMAT_LABEL = 'outro'

const NO_MATCH_MESSAGE =
  'Nenhuma URL casou com a regra de comparação (/vs/, /comparison/, /compare/, /alternatives/, -vs-).'

const NO_COMPARISONS_MESSAGE = 'Sem comparações nesta rodada.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

export function readComparisons(comparisons: object[]): SeoComparison[] {
  return comparisons.filter(isRecord).map((comparison) => {
    const texts = isRecord(comparison.texts) ? comparison.texts : {}
    return {
      url: typeof comparison.url === 'string' ? comparison.url : '',
      slug: typeof texts.slug === 'string' ? texts.slug : '',
      rivals: readStrings(texts.rivals),
      format: typeof texts.format === 'string' ? texts.format : '',
    }
  })
}

export function formatComparisonFormat(format: string): string {
  return FORMAT_LABELS[format] ?? OTHER_FORMAT_LABEL
}

export function formatRivals(rivals: string[]): string {
  return rivals.join(', ')
}

export function buildNoComparisonsMessage(profile: unknown): string {
  return readProfileNumber(profile, 'pagesComparison') === 0 ? NO_MATCH_MESSAGE : NO_COMPARISONS_MESSAGE
}
