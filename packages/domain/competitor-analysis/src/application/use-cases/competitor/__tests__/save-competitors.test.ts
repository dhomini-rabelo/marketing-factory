import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeCompetitorInput } from '@domain/competitor-analysis/application/__tests__/factories/competitor-input'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryCompetitorRepository } from '@domain/competitor-analysis/application/__tests__/repositories/competitor'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import { SaveCompetitorsUseCase } from '@domain/competitor-analysis/application/use-cases/competitor/save-competitors'
import { COMPETITORS_MAX_ITEMS } from '@domain/competitor-analysis/application/validation/competitors'
import {
  CompetitorApproval,
  CompetitorRole,
} from '@domain/competitor-analysis/enterprise/entities/competitor'
import { Project } from '@domain/projects'

describe('SaveCompetitorsUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let competitorRepository: InMemoryCompetitorRepository
  let project: Project
  let sut: SaveCompetitorsUseCase

  const save = (competitors: ReturnType<typeof makeCompetitorInput>[]) =>
    sut.execute({ projectId: project.id.toValue(), competitors })

  const makeCompetitors = (count: number) =>
    Array.from({ length: count }, () => makeCompetitorInput())

  const expectFieldIssue = async (
    promise: Promise<unknown>,
    issue: { field: string; code: string; variables?: string[] },
  ) => {
    await expect(promise).rejects.toMatchObject({
      fields: expect.arrayContaining([expect.objectContaining(issue)]),
    })
  }

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    competitorRepository = new InMemoryCompetitorRepository()
    project = makeProject()
    projectRepository.items.push(project)
    sut = new SaveCompetitorsUseCase({
      project: projectRepository,
      competitor: competitorRepository,
    })
  })

  it('stores the list of competitors of the project with a pending approval', async () => {
    const input = makeCompetitorInput({ name: '  Acme  ', url: ' https://acme.com ' })

    const { competitors, approval, wasCreated } = await save([input])

    expect(wasCreated).toBe(true)
    expect(approval).toBe(CompetitorApproval.PENDING)
    expect(competitors).toHaveLength(1)
    expect(competitors[0].props.name).toBe('Acme')
    expect(competitors[0].props.url).toBe('https://acme.com')
    expect(competitors[0].props.incorrect).toBe(false)
    expect(competitorRepository.items).toHaveLength(1)
  })

  it('replaces the list and takes the approval back to pending', async () => {
    await save([makeCompetitorInput({ name: 'First' }), makeCompetitorInput({ name: 'Second' })])
    competitorRepository.approvals.set(project.id.toValue(), CompetitorApproval.APPROVED)

    const { competitors, approval, wasCreated } = await save([makeCompetitorInput({ name: 'Third' })])

    expect(wasCreated).toBe(false)
    expect(approval).toBe(CompetitorApproval.PENDING)
    expect(competitors.map((competitor) => competitor.props.name)).toEqual(['Third'])
    expect(competitorRepository.items.map((competitor) => competitor.props.name)).toEqual(['Third'])
    expect(competitorRepository.approvals.get(project.id.toValue())).toBe(CompetitorApproval.PENDING)
  })

  it('keeps the incorrect mark of a competitor saved again', async () => {
    await save([makeCompetitorInput({ name: 'Acme' }), makeCompetitorInput({ name: 'Other' })])
    await competitorRepository.setIncorrect({
      projectId: project.id,
      competitorId: createID('acme'),
      incorrect: true,
    })

    const { competitors } = await save([
      makeCompetitorInput({ name: ' ACME ' }),
      makeCompetitorInput({ name: 'Other' }),
    ])

    const acme = competitors.find((competitor) => competitor.id.toValue() === 'acme')
    const other = competitors.find((competitor) => competitor.id.toValue() === 'other')
    expect(acme?.props.incorrect).toBe(true)
    expect(other?.props.incorrect).toBe(false)
  })

  it('keeps an incorrect competitor that the new list omits', async () => {
    await save([makeCompetitorInput({ name: 'Acme' }), makeCompetitorInput({ name: 'Other' })])
    await competitorRepository.setIncorrect({
      projectId: project.id,
      competitorId: createID('acme'),
      incorrect: true,
    })

    const { competitors } = await save([makeCompetitorInput({ name: 'Other' })])

    expect(competitors.map((competitor) => competitor.id.toValue())).toEqual(['other', 'acme'])
    expect(competitors[1].props.incorrect).toBe(true)
  })

  it('drops a competitor that was not marked and the new list omits', async () => {
    await save([makeCompetitorInput({ name: 'Acme' }), makeCompetitorInput({ name: 'Other' })])

    await save([makeCompetitorInput({ name: 'Other' })])

    expect(competitorRepository.items.map((competitor) => competitor.id.toValue())).toEqual(['other'])
  })

  it('returns main competitors, then secondary, then incorrect, keeping the saved order in each group', async () => {
    await save([makeCompetitorInput({ name: 'Marked', role: CompetitorRole.MAIN })])
    await competitorRepository.setIncorrect({
      projectId: project.id,
      competitorId: createID('marked'),
      incorrect: true,
    })

    const { competitors } = await save([
      makeCompetitorInput({ name: 'Secondary one', role: CompetitorRole.SECONDARY }),
      makeCompetitorInput({ name: 'Main one', role: CompetitorRole.MAIN }),
      makeCompetitorInput({ name: 'Secondary two', role: CompetitorRole.SECONDARY }),
      makeCompetitorInput({ name: 'Main two', role: CompetitorRole.MAIN }),
      makeCompetitorInput({ name: 'Marked', role: CompetitorRole.MAIN }),
    ])

    expect(competitors.map((competitor) => competitor.props.name)).toEqual([
      'Main one',
      'Main two',
      'Secondary one',
      'Secondary two',
      'Marked',
    ])
  })

  it('stores a blank url as null', async () => {
    const { competitors } = await save([makeCompetitorInput({ url: '   ' })])

    expect(competitors[0].props.url).toBeNull()
  })

  it('rejects a role outside main and secondary', async () => {
    await expectFieldIssue(save([makeCompetitorInput({ role: 'Principal' })]), {
      field: 'competitors[0].role',
      code: 'INVALID_OPTION',
      variables: ['main', 'secondary'],
    })
    expect(competitorRepository.items).toEqual([])
  })

  it('rejects an empty list as required', async () => {
    await expectFieldIssue(save([]), { field: 'competitors', code: 'REQUIRED' })
  })

  it('accepts 15 competitors and rejects 16', async () => {
    await expect(save(makeCompetitors(COMPETITORS_MAX_ITEMS))).resolves.toBeDefined()
    await expectFieldIssue(save(makeCompetitors(COMPETITORS_MAX_ITEMS + 1)), {
      field: 'competitors',
      code: 'TOO_MANY_ITEMS',
    })
  })

  it('rejects a name repeated after normalization', async () => {
    await expectFieldIssue(
      save([makeCompetitorInput({ name: 'Acme' }), makeCompetitorInput({ name: '  aCME ' })]),
      { field: 'competitors[1].name', code: 'DUPLICATED_NAME' },
    )
  })

  it('rejects empty fields as required', async () => {
    const promise = save([
      makeCompetitorInput({
        name: ' ',
        marketFocus: '',
        services: '',
        features: '',
        audience: '',
        rationale: ' ',
      }),
    ])

    await expect(promise).rejects.toMatchObject({
      fields: expect.arrayContaining(
        ['name', 'marketFocus', 'services', 'features', 'audience', 'rationale'].map((field) =>
          expect.objectContaining({ field: `competitors[0].${field}`, code: 'REQUIRED' }),
        ),
      ),
    })
  })

  it('rejects a url that is not http or https', async () => {
    await expectFieldIssue(save([makeCompetitorInput({ url: 'ftp://example.com/file' })]), {
      field: 'competitors[0].url',
      code: 'INVALID_URL',
    })
  })

  it('rejects a text longer than the limit', async () => {
    await expectFieldIssue(save([makeCompetitorInput({ services: some.stringWithLength(301) })]), {
      field: 'competitors[0].services',
      code: 'TOO_LONG',
    })
  })

  it('keeps the previous list intact when the new one is refused', async () => {
    const first = await save([makeCompetitorInput({ name: 'Acme' })])

    await expectFieldIssue(save([]), { field: 'competitors', code: 'REQUIRED' })

    expect(competitorRepository.items).toEqual(first.competitors)
  })

  it('rejects an unknown project', async () => {
    await expect(
      sut.execute({ projectId: createID().toValue(), competitors: [makeCompetitorInput()] }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })
})
