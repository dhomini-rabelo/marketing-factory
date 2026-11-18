import { FindingKind, type Finding, type FindingAspect } from '@/api/models/channel-analysis'
import { CompetitorRole, type Competitor } from '@/api/models/competitor'
import { ASPECT_KEYS } from '@/layout/utils/competitor-analysis/keys'
import { normalizeCompetitorName } from '@/layout/utils/competitor-analysis/normalize-competitor-name'

export type GroupedFinding = {
  finding: Finding
  competitorName: string
  role: CompetitorRole | null
}

export type AspectBlock = {
  aspect: FindingAspect
  label: string
  findings: GroupedFinding[]
}

export type FindingsByAspect = {
  blocks: AspectBlock[]
  findingsCount: number
  factsCount: number
  hypothesesCount: number
  competitorsWithFinding: number
  activeCompetitorsCount: number
}

const ROLE_ORDER = [CompetitorRole.MAIN, CompetitorRole.SECONDARY]

function getRolePosition(role: CompetitorRole | null): number {
  return role === null ? ROLE_ORDER.length : ROLE_ORDER.indexOf(role)
}

export function groupFindingsByAspect(findings: Finding[], competitors: Competitor[]): FindingsByAspect {
  const competitorsByKey = new Map(
    competitors.map((competitor) => [normalizeCompetitorName(competitor.name), competitor]),
  )
  const firstSpellingByKey = new Map<string, string>()
  const firstAppearanceByKey = new Map<string, number>()

  findings.forEach((finding, index) => {
    const key = normalizeCompetitorName(finding.competitor)
    if (!firstSpellingByKey.has(key)) firstSpellingByKey.set(key, finding.competitor)
    if (!firstAppearanceByKey.has(key)) firstAppearanceByKey.set(key, index)
  })

  const listPositionByKey = new Map(
    competitors.map((competitor, index) => [normalizeCompetitorName(competitor.name), index]),
  )

  function toGroupedFinding(finding: Finding): GroupedFinding | null {
    const key = normalizeCompetitorName(finding.competitor)
    const competitor = competitorsByKey.get(key)
    if (competitor?.incorrect) return null
    return {
      finding,
      competitorName: competitor?.name ?? firstSpellingByKey.get(key) ?? finding.competitor,
      role: competitor?.role ?? null,
    }
  }

  function getCompetitorPosition(grouped: GroupedFinding): number {
    const key = normalizeCompetitorName(grouped.finding.competitor)
    const listPosition = listPositionByKey.get(key)
    if (listPosition !== undefined) return listPosition
    return competitors.length + (firstAppearanceByKey.get(key) ?? 0)
  }

  function sortByCompetitor(first: GroupedFinding, second: GroupedFinding): number {
    const roleDifference = getRolePosition(first.role) - getRolePosition(second.role)
    if (roleDifference !== 0) return roleDifference
    return getCompetitorPosition(first) - getCompetitorPosition(second)
  }

  const visibleFindings = findings.map(toGroupedFinding).filter((grouped) => grouped !== null)

  const blocks = ASPECT_KEYS.map(({ key, label }) => ({
    aspect: key,
    label,
    findings: visibleFindings.filter((grouped) => grouped.finding.aspect === key).sort(sortByCompetitor),
  })).filter((block) => block.findings.length > 0)

  const activeCompetitors = competitors.filter((competitor) => !competitor.incorrect)
  const keysWithFinding = new Set(
    visibleFindings.map((grouped) => normalizeCompetitorName(grouped.finding.competitor)),
  )

  return {
    blocks,
    findingsCount: visibleFindings.length,
    factsCount: visibleFindings.filter((grouped) => grouped.finding.kind === FindingKind.FACT).length,
    hypothesesCount: visibleFindings.filter((grouped) => grouped.finding.kind === FindingKind.HYPOTHESIS).length,
    competitorsWithFinding: activeCompetitors.filter((competitor) =>
      keysWithFinding.has(normalizeCompetitorName(competitor.name)),
    ).length,
    activeCompetitorsCount: activeCompetitors.length,
  }
}
