import { createID } from '@domain/base'
import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import {
  SeoCompetitorData,
  SeoCompetitorDataProps,
  SeoCompetitorPayload,
} from '@domain/competitor-analysis/enterprise/entities/seo-competitor-data'
import {
  SeoRound,
  SeoRoundProps,
  SeoTool,
} from '@domain/competitor-analysis/enterprise/entities/seo-round'
import {
  SeoRoundDocument,
  SeoRoundDocumentProps,
} from '@domain/competitor-analysis/enterprise/entities/seo-round-document'

export function makeSeoRound(overrides: Partial<SeoRoundProps> = {}): SeoRound {
  return SeoRound.create({
    projectId: createID(),
    tool: some.valueBetween(...Object.values(SeoTool)),
    collectedAt: new Date('2026-11-18'),
    note: some.string(),
    market: some.string(),
    expectedCompetitors: [],
    searches: [],
    createdAt: new Date(),
    ...overrides,
  })
}

export function makeSeoCompetitorPayload(
  overrides: Partial<SeoCompetitorPayload> = {},
): SeoCompetitorPayload {
  return {
    profile: {
      numbers: {
        sitemapUrlsMainLanguage: 100,
        pagesComparison: 10,
        pagesIntegrations: 10,
        pagesLanding: 10,
        pagesOther: 10,
        pagesTemplates: 10,
        pagesTools: 10,
        blogPostsMainLanguage: 40,
      },
    },
    categories: [],
    clusters: [],
    comparisons: [],
    examples: [],
    folders: [],
    items: [{ url: some.string() }, { url: some.string() }],
    audiences: [{ numbers: { pct: 60 } }, { numbers: { pct: 40 } }],
    ...overrides,
  }
}

export function makeSeoCompetitorData(
  overrides: Partial<SeoCompetitorDataProps> = {},
): SeoCompetitorData {
  const name = overrides.name ?? some.name()

  return SeoCompetitorData.create({
    roundId: createID(),
    name,
    normalizedName: name.trim().toLowerCase(),
    data: makeSeoCompetitorPayload(),
    ...overrides,
  })
}

export function makeSeoRoundDocument(
  overrides: Partial<SeoRoundDocumentProps> = {},
): SeoRoundDocument {
  const body = overrides.body ?? some.string()

  return SeoRoundDocument.create({
    roundId: createID(),
    title: some.name(),
    fileName: `${some.string()}.md`,
    about: some.string(),
    body,
    size: new TextEncoder().encode(body).length,
    ...overrides,
  })
}
