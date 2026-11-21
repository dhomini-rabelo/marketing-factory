export type SeoSearchResult = {
  position: number
  name: string
}

export type SeoSearch = {
  query: string
  market: string
  searchedAt: string
  searchTool: string
  results: SeoSearchResult[]
}

const DEFAULT_NO_SEARCH_REASON = 'O agente não conseguiu ver a posição dos resultados.'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(source: Record<string, unknown>, key: string): string {
  const value = source[key]
  return typeof value === 'string' ? value : ''
}

function readResults(value: unknown): SeoSearchResult[] {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map((result) => ({
    position: typeof result.position === 'number' ? result.position : 0,
    name: readText(result, 'competitor') || readText(result, 'domain'),
  }))
}

export function readSearches(searches: object[]): SeoSearch[] {
  return searches.filter(isRecord).map((search) => {
    const texts = isRecord(search.texts) ? search.texts : {}
    return {
      query: readText(texts, 'query'),
      market: readText(texts, 'market'),
      searchedAt: readText(texts, 'searchedAt'),
      searchTool: readText(texts, 'searchTool'),
      results: readResults(search.results),
    }
  })
}

export function findNoSearchReason(note: string): string {
  const sentences = note.split(/(?<=\.)\s+/)
  return sentences.find((sentence) => /busca/i.test(sentence)) ?? DEFAULT_NO_SEARCH_REASON
}

export function formatSearchDate(searchedAt: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(searchedAt)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : searchedAt
}

export function formatSearchResults(results: SeoSearchResult[]): string {
  return results.map((result) => `${result.position}. ${result.name}`).join(' · ')
}

export function findPositionOf(search: SeoSearch, names: string[]): number | null {
  const wanted = names.filter(Boolean).map((name) => name.toLowerCase())
  const result = search.results.find((entry) => wanted.includes(entry.name.toLowerCase()))
  return result ? result.position : null
}
