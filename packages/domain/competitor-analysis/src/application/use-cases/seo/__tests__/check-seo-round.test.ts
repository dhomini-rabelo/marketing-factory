import { describe, expect, it } from 'vitest'
import { makeSeoCompetitorPayload } from '@domain/competitor-analysis/application/__tests__/factories/seo-round'
import { checkSeoRound } from '@domain/competitor-analysis/application/use-cases/seo/get-seo-round/check-seo-round'

function makeProfile(numbers: Record<string, unknown>) {
  return {
    numbers: {
      sitemapUrlsMainLanguage: 100,
      pagesComparison: 10,
      pagesIntegrations: 10,
      pagesLanding: 10,
      pagesOther: 10,
      pagesTemplates: 10,
      pagesTools: 10,
      blogPostsMainLanguage: 40,
      ...numbers,
    },
  }
}

describe('checkSeoRound', () => {
  it('gives no warning when the page types add up and the audiences close at 100', () => {
    const warnings = checkSeoRound([{ name: 'Cally', data: makeSeoCompetitorPayload() }])

    expect(warnings).toEqual([])
  })

  it('warns when the page types do not add up to the sitemap total', () => {
    const data = makeSeoCompetitorPayload({
      profile: makeProfile({ sitemapUrlsMainLanguage: 1237, pagesOther: 1217 }),
    })

    const warnings = checkSeoRound([{ name: 'Fireflies.ai', data }])

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatchObject({ check: 'pageTypeSum', competitor: 'Fireflies.ai' })
    expect(warnings[0].message).toContain('1307')
    expect(warnings[0].message).toContain('1237')
  })

  it('compares the page types for equality, not for approximation', () => {
    const data = makeSeoCompetitorPayload({ profile: makeProfile({ sitemapUrlsMainLanguage: 101 }) })

    expect(checkSeoRound([{ name: 'Cally', data }])).toHaveLength(1)
  })

  it('skips the page check when any of the eight numbers is not a number', () => {
    const data = makeSeoCompetitorPayload({
      profile: makeProfile({ pagesTools: '10', sitemapUrlsMainLanguage: 1 }),
    })

    expect(checkSeoRound([{ name: 'Cally', data }])).toEqual([])
  })

  it('skips the page check when the profile has no numbers', () => {
    const data = makeSeoCompetitorPayload({ profile: {} })

    expect(checkSeoRound([{ name: 'Cally', data }])).toEqual([])
  })

  it.each([99, 99.9, 100.2, 101])('accepts audiences that add up to %s', (total) => {
    const data = makeSeoCompetitorPayload({
      audiences: [{ numbers: { pct: total - 40 } }, { numbers: { pct: 40 } }],
    })

    expect(checkSeoRound([{ name: 'Cally', data }])).toEqual([])
  })

  it.each([98.9, 101.1])('warns when audiences add up to %s', (total) => {
    const data = makeSeoCompetitorPayload({
      audiences: [{ numbers: { pct: total - 40 } }, { numbers: { pct: 40 } }],
    })

    const warnings = checkSeoRound([{ name: 'Cally', data }])

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toMatchObject({ check: 'audienceShare', competitor: 'Cally' })
  })

  it('skips the audience check for an empty list', () => {
    const data = makeSeoCompetitorPayload({ audiences: [] })

    expect(checkSeoRound([{ name: 'Cally', data }])).toEqual([])
  })

  it('skips the audience check when a share is missing', () => {
    const data = makeSeoCompetitorPayload({ audiences: [{ numbers: {} }, { numbers: { pct: 10 } }] })

    expect(checkSeoRound([{ name: 'Cally', data }])).toEqual([])
  })

  it('reports each competitor on its own and never changes the data', () => {
    const wrong = makeSeoCompetitorPayload({ audiences: [{ numbers: { pct: 10 } }] })
    const snapshot = structuredClone(wrong)

    const warnings = checkSeoRound([
      { name: 'Cally', data: makeSeoCompetitorPayload() },
      { name: 'Otter', data: wrong },
    ])

    expect(warnings.map((warning) => warning.competitor)).toEqual(['Otter'])
    expect(wrong).toEqual(snapshot)
  })
})
