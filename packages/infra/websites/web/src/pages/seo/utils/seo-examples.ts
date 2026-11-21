import type { SeoCategory } from '@/pages/seo/utils/seo-categories'
import { isRecord, readProfileText } from '@/pages/seo/utils/seo-profile'

export const VISIBLE_EXAMPLES = 5
export const MAX_EXAMPLES_PER_TOPIC = 25

export type SeoExample = {
  url: string
  publishedAt: string
  title: string
  category: string
  cardSummary: string
  author: string
  audienceRole: string
}

export type TopicExamples = {
  topic: string
  examples: SeoExample[]
}

function readExamples(examples: object[]): SeoExample[] {
  return examples.filter(isRecord).map((example) => ({
    url: typeof example.url === 'string' ? example.url : '',
    publishedAt: typeof example.publishedAt === 'string' ? example.publishedAt : '',
    title: readProfileText(example, 'title'),
    category: readProfileText(example, 'category'),
    cardSummary: readProfileText(example, 'cardSummary'),
    author: readProfileText(example, 'author'),
    audienceRole: readProfileText(example, 'audienceRole'),
  }))
}

export function groupExamplesByTopic(categories: SeoCategory[], examples: object[]): TopicExamples[] {
  const parsedExamples = readExamples(examples)
  return categories.map((category) => ({
    topic: category.name,
    examples: parsedExamples.filter((example) => example.category === category.name).slice(0, MAX_EXAMPLES_PER_TOPIC),
  }))
}
