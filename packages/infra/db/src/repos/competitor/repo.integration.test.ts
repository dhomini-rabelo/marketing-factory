import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createID, DomainError, ID } from '@domain/base'
import { Competitor, CompetitorApproval, CompetitorRole } from '@domain/competitor-analysis'
import { Project, ProjectPhase, ProjectPlatform } from '@domain/projects'
import { createTempDatabase, TempDatabase } from '@infra/db/__tests__/temp-database'
import { SqliteCompetitorRepository } from '@infra/db/repos/competitor/repo'
import { SqliteProjectRepository } from '@infra/db/repos/project/repo'

function buildCompetitor(projectId: ID, name: string, url: string | null = null): Competitor {
  return Competitor.create({
    projectId,
    name,
    role: CompetitorRole.MAIN,
    marketFocus: 'Small teams',
    services: 'Consulting',
    features: 'Dashboard',
    audience: 'Founders',
    rationale: 'Same buyers',
    url,
    incorrect: false,
    qualifiedAt: new Date('2026-11-18T10:00:00.000Z'),
  })
}

function namesOf(competitors: Competitor[]): string[] {
  return competitors.map((competitor) => competitor.props.name)
}

describe('SqliteCompetitorRepository', () => {
  let temp: TempDatabase
  let repository: SqliteCompetitorRepository
  let projectId: ID

  async function createProject(): Promise<ID> {
    const project = Project.create({
      name: 'Acme',
      platform: ProjectPlatform.WEB,
      phase: ProjectPhase.NO_CUSTOMERS,
      description: 'Acme project',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await new SqliteProjectRepository(temp.database).create(project)

    return project.id
  }

  beforeEach(async () => {
    temp = createTempDatabase()
    repository = new SqliteCompetitorRepository(temp.database)
    projectId = await createProject()
  })

  afterEach(() => {
    temp.dispose()
  })

  it('saves a list and reads it back in the saved order', async () => {
    const list = [
      buildCompetitor(projectId, 'Zeta', 'https://zeta.test'),
      buildCompetitor(projectId, 'Alpha'),
    ]

    const result = await repository.replaceList({ projectId, competitors: list })
    const listed = await repository.listByProject(projectId)

    expect(result.wasCreated).toBe(true)
    expect(namesOf(listed)).toEqual(['Zeta', 'Alpha'])
    expect(listed[0].props).toEqual(list[0].props)
    expect(listed[1].props.url).toBeNull()
  })

  it('replaces the previous list and reports it was not created', async () => {
    await repository.replaceList({ projectId, competitors: [buildCompetitor(projectId, 'Old')] })

    const result = await repository.replaceList({
      projectId,
      competitors: [buildCompetitor(projectId, 'New')],
    })

    expect(result.wasCreated).toBe(false)
    expect(namesOf(await repository.listByProject(projectId))).toEqual(['New'])
  })

  it('keeps the founder mark by id and keeps a marked competitor the agent left out', async () => {
    const alpha = buildCompetitor(projectId, 'Alpha')
    const beta = buildCompetitor(projectId, 'Beta')
    const gamma = buildCompetitor(projectId, 'Gamma')
    await repository.replaceList({ projectId, competitors: [alpha, beta, gamma] })
    await repository.setIncorrect({ projectId, competitorId: alpha.id, incorrect: true })
    await repository.setIncorrect({ projectId, competitorId: beta.id, incorrect: true })

    const result = await repository.replaceList({
      projectId,
      competitors: [buildCompetitor(projectId, ' ALPHA '), buildCompetitor(projectId, 'Delta')],
    })

    const marks = result.competitors.map((item) => [item.props.name, item.props.incorrect])
    expect(marks).toEqual([
      [' ALPHA ', true],
      ['Delta', false],
      ['Beta', true],
    ])
    expect(namesOf(await repository.listByProject(projectId))).toEqual([' ALPHA ', 'Delta', 'Beta'])
  })

  it('sends the approval to pending when the list is saved again', async () => {
    await repository.replaceList({ projectId, competitors: [buildCompetitor(projectId, 'Alpha')] })
    await repository.setApproval({ projectId, approval: CompetitorApproval.APPROVED })

    await repository.replaceList({ projectId, competitors: [buildCompetitor(projectId, 'Alpha')] })

    expect(await repository.getApproval(projectId)).toBe(CompetitorApproval.PENDING)
  })

  it('reads pending for a project that never had approval and stores each approval', async () => {
    expect(await repository.getApproval(projectId)).toBe(CompetitorApproval.PENDING)

    await repository.setApproval({ projectId, approval: CompetitorApproval.APPROVED })
    expect(await repository.getApproval(projectId)).toBe(CompetitorApproval.APPROVED)

    await repository.setApproval({ projectId, approval: CompetitorApproval.PENDING })
    expect(await repository.getApproval(projectId)).toBe(CompetitorApproval.PENDING)
  })

  it('does not change the approval when a mark is set or cleared', async () => {
    const alpha = buildCompetitor(projectId, 'Alpha')
    await repository.replaceList({ projectId, competitors: [alpha] })
    await repository.setApproval({ projectId, approval: CompetitorApproval.APPROVED })

    const marked = await repository.setIncorrect({ projectId, competitorId: alpha.id, incorrect: true })
    const cleared = await repository.setIncorrect({ projectId, competitorId: alpha.id, incorrect: false })

    expect(marked.props.incorrect).toBe(true)
    expect(cleared.props.incorrect).toBe(false)
    expect(await repository.getApproval(projectId)).toBe(CompetitorApproval.APPROVED)
  })

  it('refuses to mark a competitor that does not exist', async () => {
    await expect(
      repository.setIncorrect({ projectId, competitorId: createID('ghost'), incorrect: true }),
    ).rejects.toBeInstanceOf(DomainError)
  })

  it('keeps lists and approvals of different projects apart', async () => {
    const otherProjectId = await createProject()
    await repository.replaceList({ projectId, competitors: [buildCompetitor(projectId, 'Alpha')] })
    await repository.replaceList({
      projectId: otherProjectId,
      competitors: [buildCompetitor(otherProjectId, 'Alpha'), buildCompetitor(otherProjectId, 'Beta')],
    })
    await repository.setApproval({ projectId, approval: CompetitorApproval.APPROVED })

    expect(namesOf(await repository.listByProject(projectId))).toEqual(['Alpha'])
    expect(namesOf(await repository.listByProject(otherProjectId))).toEqual(['Alpha', 'Beta'])
    expect(await repository.getApproval(otherProjectId)).toBe(CompetitorApproval.PENDING)
  })

  it('keeps the previous list whole when the replacement fails midway', async () => {
    const alpha = buildCompetitor(projectId, 'Alpha')
    await repository.replaceList({ projectId, competitors: [alpha] })
    await repository.setApproval({ projectId, approval: CompetitorApproval.APPROVED })
    const broken = Competitor.reference(createID('broken'), {
      ...buildCompetitor(projectId, 'Broken').props,
      marketFocus: null as unknown as string,
    })

    await expect(
      repository.replaceList({ projectId, competitors: [buildCompetitor(projectId, 'Valid'), broken] }),
    ).rejects.toThrow()

    expect(namesOf(await repository.listByProject(projectId))).toEqual(['Alpha'])
    expect(await repository.getApproval(projectId)).toBe(CompetitorApproval.APPROVED)
  })

  it('keeps one whole list when the same project is saved from separate connections', async () => {
    const names = ['One', 'Two', 'Three', 'Four']
    const repositories = names.map(() => new SqliteCompetitorRepository(temp.reopen()))

    await Promise.all(
      names.map((name, index) =>
        repositories[index].replaceList({
          projectId,
          competitors: [buildCompetitor(projectId, `${name} A`), buildCompetitor(projectId, `${name} B`)],
        }),
      ),
    )
    const listed = namesOf(await repository.listByProject(projectId))

    expect(listed).toHaveLength(2)
    expect(listed[0].replace(' A', '')).toBe(listed[1].replace(' B', ''))
  })
})
