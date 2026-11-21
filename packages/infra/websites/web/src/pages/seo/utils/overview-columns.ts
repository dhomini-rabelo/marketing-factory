import { formatCount } from '@/pages/seo/utils/format-count'
import { formatDayMonth, formatDecimal, formatNumber } from '@/pages/seo/utils/format-number'
import type { ConfidenceLevel } from '@/pages/seo/utils/overview-confidence'
import { readProfileNumber, readProfileText } from '@/pages/seo/utils/seo-profile'

export type CellContent = {
  main: string
  detail: string | null
  hint: string | null
  badge: string | null
  siteShare: number | null
}

export type OverviewColumn = {
  id: string
  label: string
  legendName: string
  metricKey: string
  confidence: ConfidenceLevel
  best: 'max' | 'min'
  rule: string
  hasSeparator: boolean
  describe: (profile: unknown, value: number) => CellContent
}

const PORTUGUESE_BRAZIL_PATTERN = /pt-br/i

const NOT_MEASURED_RULES = {
  blog: 'sem sitemap ou sem pasta de blog identificável',
  pageType: 'sem sitemap',
  postsPerWeek: 'menos de 10 datas reais na amostra, ou datas não confiáveis',
  daysSinceLastPost: 'sem data real de post',
  languages: 'home não abriu ou sem hreflang',
  words: 'nenhum post com article ou main',
}

function describeValue(main: string, extras: Partial<CellContent> = {}): CellContent {
  return { main, detail: null, hint: null, badge: null, siteShare: null, ...extras }
}

function buildPageTypeColumn(metricKey: string, label: string, typeName: string): OverviewColumn {
  return {
    id: metricKey,
    label,
    legendName: label.toLowerCase(),
    metricKey,
    confidence: 'medium',
    best: 'max',
    rule: NOT_MEASURED_RULES.pageType,
    hasSeparator: false,
    describe: (profile, value) => {
      const siteUrls = readProfileNumber(profile, 'sitemapUrlsMainLanguage') ?? 0
      const share = siteUrls > 0 ? (value / siteUrls) * 100 : 0
      const hint = `${formatNumber(value)} de ${formatNumber(siteUrls)} URLs do site (${formatDecimal(share)}%) · tipo: ${typeName}`
      return describeValue(formatNumber(value), { hint, siteShare: share })
    },
  }
}

export const EFFORT_COLUMNS: OverviewColumn[] = [
  {
    id: 'blog',
    label: 'Posts no blog',
    legendName: 'posts no blog',
    metricKey: 'blogPostsMainLanguage',
    confidence: 'high',
    best: 'max',
    rule: NOT_MEASURED_RULES.blog,
    hasSeparator: false,
    describe: (profile, value) => {
      const siteUrls = readProfileNumber(profile, 'sitemapUrlsMainLanguage')
      const detail = siteUrls === null ? null : `de ${formatNumber(siteUrls)} URLs`
      return describeValue(formatNumber(value), { detail })
    },
  },
  {
    id: 'postsPerWeek',
    label: 'Posts por semana',
    legendName: 'posts/semana',
    metricKey: 'postsPerWeek',
    confidence: 'high',
    best: 'max',
    rule: NOT_MEASURED_RULES.postsPerWeek,
    hasSeparator: false,
    describe: (profile, value) => {
      const sampleSize = readProfileNumber(profile, 'cadenceSampleSize')
      return describeValue(formatDecimal(value), {
        detail: sampleSize === null ? null : `${formatNumber(sampleSize)} datas`,
        hint: `fonte das datas: ${readProfileText(profile, 'cadenceSource')}`,
      })
    },
  },
  {
    id: 'daysSinceLastPost',
    label: 'Dias desde o último post',
    legendName: 'dias desde o último post',
    metricKey: 'daysSinceLastPost',
    confidence: 'high',
    best: 'min',
    rule: NOT_MEASURED_RULES.daysSinceLastPost,
    hasSeparator: false,
    describe: (profile, value) => {
      const newestPostDate = readProfileText(profile, 'newestPostDate')
      const detail = newestPostDate === '' ? null : `em ${formatDayMonth(newestPostDate)}`
      return describeValue(formatCount(value, 'dia', 'dias'), { detail })
    },
  },
  {
    id: 'wordsMedian',
    label: 'Palavras por post',
    legendName: 'palavras/post',
    metricKey: 'wordsMedian',
    confidence: 'medium',
    best: 'max',
    rule: NOT_MEASURED_RULES.words,
    hasSeparator: false,
    describe: (profile, value) => {
      const sampleSize = readProfileNumber(profile, 'wordsSampleSize')
      const detail = sampleSize === null ? null : `mediana de ${formatNumber(sampleSize)}`
      return describeValue(formatNumber(value), { detail })
    },
  },
]

export const PAGE_TYPE_COLUMNS: OverviewColumn[] = [
  buildPageTypeColumn('pagesComparison', 'Comparação', 'comparação'),
  buildPageTypeColumn('pagesIntegrations', 'Integrações', 'integrações'),
  buildPageTypeColumn('pagesTools', 'Ferramentas', 'ferramentas'),
  buildPageTypeColumn('pagesTemplates', 'Templates', 'templates'),
  buildPageTypeColumn('pagesLanding', 'Landing', 'landing'),
  {
    id: 'languagesCount',
    label: 'Idiomas',
    legendName: 'idiomas',
    metricKey: 'languagesCount',
    confidence: 'high',
    best: 'max',
    rule: NOT_MEASURED_RULES.languages,
    hasSeparator: true,
    describe: (profile, value) => {
      const languages = readProfileText(profile, 'languages')
      const badge = PORTUGUESE_BRAZIL_PATTERN.test(languages) ? 'pt-BR' : null
      return describeValue(formatNumber(value), { hint: languages, badge })
    },
  },
]
