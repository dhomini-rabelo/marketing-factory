const COMPETITOR_LISTS = [
  'categories',
  'clusters',
  'comparisons',
  'examples',
  'folders',
  'items',
  'audiences',
] as const

type SeoFixtureItem = Record<string, unknown> & { competitor?: string }

export type SeoFixture = {
  profiles: SeoFixtureItem[]
  documents: { title: string; fileName: string; about: string }[]
} & Record<string, unknown>

export type SeoCompetitorBody = {
  profile: Record<string, unknown>
  categories: object[]
  clusters: object[]
  comparisons: object[]
  examples: object[]
  folders: object[]
  items: object[]
  audiences: object[]
}

function withoutCompetitor(item: SeoFixtureItem): Record<string, unknown> {
  const { competitor: _competitor, ...rest } = item

  return rest
}

export function sliceSeoFixture(json: SeoFixture, name: string): SeoCompetitorBody {
  const profile = json.profiles.find((item) => item.competitor === name)

  if (!profile) {
    throw new Error(`SEO fixture has no profile for ${name}`)
  }

  const lists = Object.fromEntries(
    COMPETITOR_LISTS.map((key) => [
      key,
      (json[key] as SeoFixtureItem[])
        .filter((item) => item.competitor === name)
        .map((item) => withoutCompetitor(item)),
    ]),
  ) as Pick<SeoCompetitorBody, (typeof COMPETITOR_LISTS)[number]>

  return { profile: withoutCompetitor(profile), ...lists }
}
