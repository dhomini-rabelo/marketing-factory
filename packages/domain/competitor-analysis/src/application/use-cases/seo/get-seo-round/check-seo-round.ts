import { SeoCompetitorPayload } from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'

export type SeoWarningCheck = 'pageTypeSum' | 'audienceShare'

export type SeoWarning = {
  check: SeoWarningCheck
  competitor: string
  message: string
}

const PAGE_TYPE_KEYS = [
  'pagesComparison',
  'pagesIntegrations',
  'pagesLanding',
  'pagesOther',
  'pagesTemplates',
  'pagesTools',
  'blogPostsMainLanguage',
]
const SITEMAP_TOTAL_KEY = 'sitemapUrlsMainLanguage'
const MINIMUM_AUDIENCE_SHARE = 99
const MAXIMUM_AUDIENCE_SHARE = 101
const SUM_DECIMAL_PLACES = 2

export function checkSeoRound(
  competitors: { name: string; data: SeoCompetitorPayload }[],
): SeoWarning[] {
  return competitors.flatMap((competitor) => [
    ...checkPageTypeSum(competitor),
    ...checkAudienceShare(competitor),
  ])
}

function checkPageTypeSum(competitor: { name: string; data: SeoCompetitorPayload }): SeoWarning[] {
  const numbers = readRecord(competitor.data.profile.numbers)
  const counters = PAGE_TYPE_KEYS.map((key) => numbers?.[key])
  const total = numbers?.[SITEMAP_TOTAL_KEY]

  if (!numbers || !isNumber(total) || !counters.every(isNumber)) {
    return []
  }

  const sum = counters.reduce((accumulated, counter) => accumulated + counter, 0)

  if (sum === total) {
    return []
  }

  return [
    {
      check: 'pageTypeSum',
      competitor: competitor.name,
      message: `A soma dos tipos de página (${sum}) difere do total de URLs do sitemap (${total}).`,
    },
  ]
}

function checkAudienceShare(competitor: {
  name: string
  data: SeoCompetitorPayload
}): SeoWarning[] {
  const shares = competitor.data.audiences.map(
    (audience) => readRecord(readRecord(audience)?.numbers)?.pct,
  )

  if (shares.length === 0 || !shares.every(isNumber)) {
    return []
  }

  const sum = shares.reduce((accumulated, share) => accumulated + share, 0)

  if (sum >= MINIMUM_AUDIENCE_SHARE && sum <= MAXIMUM_AUDIENCE_SHARE) {
    return []
  }

  return [
    {
      check: 'audienceShare',
      competitor: competitor.name,
      message: `A soma dos públicos (${Number(sum.toFixed(SUM_DECIMAL_PLACES))}%) está fora de ${MINIMUM_AUDIENCE_SHARE}% a ${MAXIMUM_AUDIENCE_SHARE}%.`,
    },
  ]
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
