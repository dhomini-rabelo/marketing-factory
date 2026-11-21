import { readProfileNumber } from '@/pages/seo/utils/seo-profile'

export const MAX_VISIBLE_TOPICS = 8

const FEW_POSTS_LIMIT = 20

export type SeoTopic = {
  theme: string
  term: string
  pages: number
  exampleUrl: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(source: Record<string, unknown>, key: string): string {
  const value = source[key]
  return typeof value === 'string' ? value : ''
}

export function readTopics(clusters: object[]): SeoTopic[] {
  return clusters
    .filter(isRecord)
    .map((cluster) => {
      const texts = isRecord(cluster.texts) ? cluster.texts : {}
      const numbers = isRecord(cluster.numbers) ? cluster.numbers : {}
      return {
        theme: readText(texts, 'theme'),
        term: readText(texts, 'term'),
        pages: typeof numbers.pages === 'number' ? numbers.pages : 0,
        exampleUrl: readText(texts, 'exampleUrl'),
      }
    })
    .sort((first, second) => second.pages - first.pages)
}

export function readBlogPosts(profile: unknown): number {
  return readProfileNumber(profile, 'blogPostsMainLanguage') ?? 0
}

export function calculateTopicShare(pages: number, blogPosts: number): number {
  if (blogPosts <= 0) return 0
  return Math.min((pages / blogPosts) * 100, 100)
}

export function buildNoTopicsMessage(blogPosts: number, formatPosts: (count: number) => string): string {
  if (blogPosts > 0 && blogPosts < FEW_POSTS_LIMIT) {
    return `Sem temas contados: o blog tem só ${formatPosts(blogPosts)}, poucos para repetir um termo.`
  }
  return 'Sem temas contados: nenhum termo se repetiu nos endereços do blog.'
}
