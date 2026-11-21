import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FindingAspect, FindingKind, type Finding } from '@/api/models/channel-analysis'
import { CompetitorRole, type Competitor } from '@/api/models/competitor'
import { renderWithProviders } from '@/__tests__/utils/render-with-providers'
import { ChannelHeader } from '@/pages/channel/components/channel-header'
import { FindingsByAspect } from '@/pages/channel/components/findings-by-aspect'
import { groupFindingsByAspect } from '@/pages/channel/utils/group-findings-by-aspect'

function buildCompetitor(name: string, role: CompetitorRole, incorrect = false): Competitor {
  return {
    id: name.trim().toLowerCase(),
    name,
    role,
    marketFocus: 'Foco',
    services: 'Serviços',
    features: 'Funções',
    audience: 'Público',
    rationale: 'Motivo',
    url: null,
    incorrect,
    qualifiedAt: '2026-03-01T12:00:00.000Z',
  }
}

function buildFinding(competitor: string, aspect: FindingAspect, statement: string): Finding {
  return { competitor, aspect, kind: FindingKind.FACT, statement, url: null, excerpt: null, tool: null }
}

const promob = buildCompetitor('Promob', CompetitorRole.MAIN)
const mobilplan = buildCompetitor('Mobilplan', CompetitorRole.MAIN)
const planilha = buildCompetitor('Planilha de Excel', CompetitorRole.SECONDARY)
const hidden = buildCompetitor('Marcenaria Fácil', CompetitorRole.SECONDARY, true)

function readStatements(findings: Finding[], competitors: Competitor[], aspect: FindingAspect) {
  const block = groupFindingsByAspect(findings, competitors).blocks.find((item) => item.aspect === aspect)
  return block?.findings.map((grouped) => grouped.finding.statement)
}

describe('groupFindingsByAspect', () => {
  it('orders the blocks by the fixed aspect order even when the findings come out of order', () => {
    const findings = [
      buildFinding('Promob', FindingAspect.CTA, 'a'),
      buildFinding('Promob', FindingAspect.FORMAT, 'b'),
      buildFinding('Promob', FindingAspect.PERFORMANCE, 'c'),
      buildFinding('Promob', FindingAspect.TOPIC, 'd'),
      buildFinding('Promob', FindingAspect.FREQUENCY, 'e'),
    ]

    const { blocks } = groupFindingsByAspect(findings, [promob])

    expect(blocks.map((block) => block.label)).toEqual([
      'Formato',
      'Assunto',
      'Frequência',
      'Desempenho',
      'Chamada para ação',
    ])
  })

  it('keeps only the blocks that have at least one finding and keeps the fixed order of the rest', () => {
    const findings = [
      buildFinding('Promob', FindingAspect.PERFORMANCE, 'a'),
      buildFinding('Promob', FindingAspect.FORMAT, 'b'),
    ]

    const { blocks } = groupFindingsByAspect(findings, [promob])

    expect(blocks.map((block) => block.aspect)).toEqual([FindingAspect.FORMAT, FindingAspect.PERFORMANCE])
  })

  it('returns no block when there are no findings', () => {
    const result = groupFindingsByAspect([], [promob])

    expect(result.blocks).toEqual([])
    expect(result.findingsCount).toBe(0)
  })

  it('puts main competitors first, then secondary, then competitors outside the list', () => {
    const findings = [
      buildFinding('Desconhecido', FindingAspect.FORMAT, 'fora'),
      buildFinding('Planilha de Excel', FindingAspect.FORMAT, 'secundário'),
      buildFinding('Mobilplan', FindingAspect.FORMAT, 'principal 2'),
      buildFinding('Promob', FindingAspect.FORMAT, 'principal 1'),
    ]

    const statements = readStatements(findings, [promob, mobilplan, planilha], FindingAspect.FORMAT)

    expect(statements).toEqual(['principal 1', 'principal 2', 'secundário', 'fora'])
  })

  it('orders the competitors outside the list by first appearance', () => {
    const findings = [
      buildFinding('Beta', FindingAspect.FORMAT, 'beta'),
      buildFinding('Alfa', FindingAspect.FORMAT, 'alfa'),
      buildFinding('Beta', FindingAspect.TOPIC, 'beta assunto'),
    ]

    expect(readStatements(findings, [promob], FindingAspect.FORMAT)).toEqual(['beta', 'alfa'])
  })

  it('keeps the recorded order for findings of the same competitor and aspect', () => {
    const findings = [
      buildFinding('Promob', FindingAspect.FORMAT, 'primeiro'),
      buildFinding('Mobilplan', FindingAspect.FORMAT, 'outro'),
      buildFinding('Promob', FindingAspect.FORMAT, 'segundo'),
      buildFinding('Promob', FindingAspect.FORMAT, 'terceiro'),
    ]

    expect(readStatements(findings, [promob, mobilplan], FindingAspect.FORMAT)).toEqual([
      'primeiro',
      'segundo',
      'terceiro',
      'outro',
    ])
  })

  it('hides the findings of a competitor marked as not a competitor', () => {
    const findings = [
      buildFinding('Marcenaria Fácil', FindingAspect.FORMAT, 'oculto'),
      buildFinding('Promob', FindingAspect.FORMAT, 'visível'),
      buildFinding('Marcenaria Fácil', FindingAspect.CTA, 'oculto também'),
    ]

    const result = groupFindingsByAspect(findings, [promob, hidden])

    expect(result.blocks.map((block) => block.aspect)).toEqual([FindingAspect.FORMAT])
    expect(readStatements(findings, [promob, hidden], FindingAspect.FORMAT)).toEqual(['visível'])
    expect(result.findingsCount).toBe(1)
  })

  it('treats names that differ only by case or edge spaces as the same competitor from the list', () => {
    const findings = [
      buildFinding('  PROMOB ', FindingAspect.FORMAT, 'a'),
      buildFinding('promob', FindingAspect.FORMAT, 'b'),
      buildFinding('Mobilplan', FindingAspect.FORMAT, 'c'),
    ]

    const block = groupFindingsByAspect(findings, [mobilplan, promob]).blocks[0]

    expect(block.findings.map((grouped) => grouped.competitorName)).toEqual(['Mobilplan', 'Promob', 'Promob'])
    expect(block.findings.map((grouped) => grouped.finding.statement)).toEqual(['c', 'a', 'b'])
    expect(block.findings.every((grouped) => grouped.role === CompetitorRole.MAIN)).toBe(true)
  })

  it('uses the first spelling for a competitor outside the list that appears with different case', () => {
    const findings = [
      buildFinding('Acme', FindingAspect.FORMAT, 'a'),
      buildFinding(' ACME', FindingAspect.TOPIC, 'b'),
    ]

    const { blocks } = groupFindingsByAspect(findings, [])

    expect(blocks.flatMap((block) => block.findings.map((grouped) => grouped.competitorName))).toEqual([
      'Acme',
      'Acme',
    ])
    expect(blocks[0].findings[0].role).toBeNull()
  })

  it('treats a different spelling beyond case and edge spaces as another competitor', () => {
    const findings = [buildFinding('Promob Inc', FindingAspect.FORMAT, 'a')]

    const block = groupFindingsByAspect(findings, [promob]).blocks[0]

    expect(block.findings[0].role).toBeNull()
    expect(block.findings[0].competitorName).toBe('Promob Inc')
  })

  it('counts the active competitors that have a finding, without the hidden one or the ones outside the list', () => {
    const findings = [
      buildFinding('Promob', FindingAspect.FORMAT, 'a'),
      buildFinding('Marcenaria Fácil', FindingAspect.FORMAT, 'b'),
      buildFinding('Desconhecido', FindingAspect.FORMAT, 'c'),
    ]

    const result = groupFindingsByAspect(findings, [promob, mobilplan, planilha, hidden])

    expect(result.competitorsWithFinding).toBe(1)
    expect(result.activeCompetitorsCount).toBe(3)
  })

  it('counts zero of the active competitors when the channel has no findings', () => {
    const result = groupFindingsByAspect([], [promob, mobilplan])

    expect(result.competitorsWithFinding).toBe(0)
    expect(result.activeCompetitorsCount).toBe(2)
  })

  it('counts facts and hypotheses of the visible findings', () => {
    const hypothesis: Finding = { ...buildFinding('Promob', FindingAspect.TOPIC, 'h'), kind: FindingKind.HYPOTHESIS }
    const findings = [buildFinding('Promob', FindingAspect.FORMAT, 'f'), hypothesis]

    const result = groupFindingsByAspect(findings, [promob])

    expect(result.factsCount).toBe(1)
    expect(result.hypothesesCount).toBe(1)
    expect(result.findingsCount).toBe(2)
  })

  it('works when only one competitor has findings', () => {
    const findings = [
      buildFinding('Promob', FindingAspect.FORMAT, 'a'),
      buildFinding('Promob', FindingAspect.TOPIC, 'b'),
    ]

    const result = groupFindingsByAspect(findings, [promob, mobilplan])

    expect(result.blocks).toHaveLength(2)
    expect(result.competitorsWithFinding).toBe(1)
  })
})

describe('FindingsByAspect component', () => {
  const findings = [
    buildFinding('Planilha de Excel', FindingAspect.CTA, 'cta secundário'),
    buildFinding('Promob', FindingAspect.CTA, 'cta principal'),
    buildFinding('Promob', FindingAspect.FORMAT, 'formato longo '.repeat(40)),
    buildFinding('Marcenaria Fácil', FindingAspect.FORMAT, 'oculto'),
    buildFinding(' promob', FindingAspect.FORMAT, 'mesmo concorrente'),
  ]
  const competitors = [promob, mobilplan, planilha, hidden]

  function renderBlocks() {
    return renderWithProviders(<FindingsByAspect findingsByAspect={groupFindingsByAspect(findings, competitors)} />)
  }

  it('renders only the aspect blocks that have findings, in the fixed order', () => {
    renderBlocks()

    const headings = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

    expect(headings).toEqual(['Formato', 'Chamada para ação'])
  })

  it('labels every finding with the competitor and a role seal, main before secondary', () => {
    renderBlocks()

    const block = screen.getByRole('region', { name: 'Chamada para ação' })
    const rows = within(block).getAllByRole('listitem')

    expect(rows[0]).toHaveTextContent('Promob')
    expect(rows[0]).toHaveTextContent('Principal')
    expect(rows[1]).toHaveTextContent('Planilha de Excel')
    expect(rows[1]).toHaveTextContent('Secundário')
  })

  it('shows two findings of the same competitor one after the other with the same label', () => {
    renderBlocks()

    const rows = within(screen.getByRole('region', { name: 'Formato' })).getAllByRole('listitem')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Promob')
    expect(rows[1]).toHaveTextContent('Promob')
    expect(rows[1]).toHaveTextContent('mesmo concorrente')
  })

  it('does not show the hidden competitor and breaks the long statement inside the row', () => {
    renderBlocks()

    expect(screen.queryByText('oculto')).not.toBeInTheDocument()
    expect(screen.getByText(/formato longo/)).toHaveClass('break-words')
  })

  it('shows the coverage as "N de M concorrentes com achado" in the header', () => {
    renderWithProviders(
      <ChannelHeader
        projectId="p1"
        channelName="LinkedIn"
        collectedAt="2026-03-15T12:00:00.000Z"
        findingsByAspect={groupFindingsByAspect(findings, competitors)}
      />,
    )

    expect(screen.getByText('2 de 3 concorrentes com achado')).toBeInTheDocument()
    expect(screen.getByText('4 achados · 4 fatos, 0 hipóteses')).toBeInTheDocument()
  })
})
