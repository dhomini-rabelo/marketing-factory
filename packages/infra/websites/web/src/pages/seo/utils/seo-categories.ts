import { isRecord, readProfileNumber, readProfileText } from '@/pages/seo/utils/seo-profile'

export type SegmentCount = {
  id: string
  label: string
  count: number
}

export type CategorySubtopic = {
  label: string
  count: number
}

export type SeoCategory = {
  name: string
  url: string
  source: string
  term: string
  newestPostDate: string
  isMinimumRate: boolean
  posts30d: number | null
  posts90d: number | null
  postsPerWeek: number | null
  postsPerMonth: number | null
  postsListed: number
  formats: SegmentCount[]
  funnel: SegmentCount[]
  subtopics: CategorySubtopic[]
}

type SegmentDefinition = { key: string; id: string; label: string }

const FORMAT_SEGMENTS: SegmentDefinition[] = [
  { key: 'formatGuide', id: 'guide', label: 'guia' },
  { key: 'formatList', id: 'list', label: 'lista' },
  { key: 'formatTemplate', id: 'template', label: 'template' },
  { key: 'formatComparison', id: 'comparison', label: 'comparação' },
  { key: 'formatReview', id: 'review', label: 'review' },
  { key: 'formatOther', id: 'other', label: 'outro' },
]

const FUNNEL_SEGMENTS: SegmentDefinition[] = [
  { key: 'funnelTop', id: 'top', label: 'topo' },
  { key: 'funnelMiddle', id: 'middle', label: 'meio' },
  { key: 'funnelBottom', id: 'bottom', label: 'fundo' },
  { key: 'funnelNone', id: 'none', label: 'sem etapa' },
]

export const SEGMENT_COLORS: Record<string, string> = {
  guide: '#5b6cf2',
  list: '#8f9bf7',
  template: '#2f8f6b',
  comparison: '#e0a02a',
  review: '#d46a4a',
  other: '#b9bac4',
  top: '#5b6cf2',
  middle: '#8f9bf7',
  bottom: '#d46a4a',
  none: '#b9bac4',
}

const SOURCE_LABELS: Record<string, string> = {
  category_page: 'página de categoria do site',
  index_label: 'rótulo no índice do blog',
  tag_page: 'página de tag do site',
  slug_term: 'tema tirado das URLs',
}

export function describeCategorySource(source: string): string {
  return SOURCE_LABELS[source] ?? source
}

function readSegments(category: unknown, definitions: SegmentDefinition[]): SegmentCount[] {
  return definitions.map(({ key, id, label }) => ({ id, label, count: readProfileNumber(category, key) ?? 0 }))
}

function readSubtopics(category: Record<string, unknown>): CategorySubtopic[] {
  if (!Array.isArray(category.subtopics)) return []
  return category.subtopics
    .filter(isRecord)
    .map((subtopic) => ({
      label: typeof subtopic.label === 'string' ? subtopic.label : '',
      count: typeof subtopic.count === 'number' ? subtopic.count : 0,
    }))
}

export function readCategories(categories: object[]): SeoCategory[] {
  return categories.filter(isRecord).map((category) => ({
    name: readProfileText(category, 'category'),
    url: readProfileText(category, 'url'),
    source: readProfileText(category, 'source'),
    term: readProfileText(category, 'term'),
    newestPostDate: readProfileText(category, 'newestPostDate'),
    isMinimumRate: readProfileText(category, 'rateBasis') === 'minimum',
    posts30d: readProfileNumber(category, 'posts30d'),
    posts90d: readProfileNumber(category, 'posts90d'),
    postsPerWeek: readProfileNumber(category, 'postsPerWeek'),
    postsPerMonth: readProfileNumber(category, 'postsPerMonth'),
    postsListed: readProfileNumber(category, 'postsListed') ?? 0,
    formats: readSegments(category, FORMAT_SEGMENTS),
    funnel: readSegments(category, FUNNEL_SEGMENTS),
    subtopics: readSubtopics(category),
  }))
}

export function describeCategoriesOrigin(categories: SeoCategory[]): string {
  if (categories.length === 0) return ''
  if (categories.every((category) => category.source === 'slug_term')) {
    return 'o site não mostra categoria: temas tirados das URLs'
  }
  const sources = [...new Set(categories.map((category) => describeCategorySource(category.source)))]
  return `categorias que o site mostra (${sources.join(', ')})`
}
