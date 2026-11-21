import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import {
  makeChannelAnalysisInput,
  makeFactFindingInput,
  makeHypothesisFindingInput,
} from '@domain/competitor-analysis/application/__tests__/factories/channel-analysis-input'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryChannelAnalysisRepository } from '@domain/competitor-analysis/application/__tests__/repositories/channel-analysis'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import { SaveChannelAnalysisUseCase } from '@domain/competitor-analysis/application/use-cases/channel/save-channel-analysis'
import {
  BEST_CONTENT_EVIDENCE_MAX_LENGTH,
  BEST_CONTENT_TYPE_MAX_LENGTH,
  CHANNEL_RATIONALE_MAX_LENGTH,
  FINDINGS_MAX_ITEMS,
  FINDING_COMPETITOR_MAX_LENGTH,
  FINDING_EXCERPT_MAX_LENGTH,
  FINDING_STATEMENT_MAX_LENGTH,
} from '@domain/competitor-analysis/application/validation/channel-analysis'
import { Channel, FindingKind } from '@domain/competitor-analysis/enterprise/entities/channel-analysis'
import { Project } from '@domain/projects'

describe('SaveChannelAnalysisUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let channelAnalysisRepository: InMemoryChannelAnalysisRepository
  let project: Project
  let sut: SaveChannelAnalysisUseCase

  const save = (overrides: Partial<ReturnType<typeof makeChannelAnalysisInput>> = {}, channel = 'linkedin') =>
    sut.execute({
      projectId: project.id.toValue(),
      channel,
      ...makeChannelAnalysisInput(overrides),
    })

  const expectFieldIssue = async (
    promise: Promise<unknown>,
    issue: { field: string; code: string },
  ) => {
    await expect(promise).rejects.toMatchObject({
      fields: expect.arrayContaining([expect.objectContaining(issue)]),
    })
  }

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    channelAnalysisRepository = new InMemoryChannelAnalysisRepository()
    project = makeProject()
    projectRepository.items.push(project)
    sut = new SaveChannelAnalysisUseCase({
      project: projectRepository,
      channelAnalysis: channelAnalysisRepository,
    })
  })

  it('creates and stores the analysis of a channel for the project', async () => {
    const input = makeChannelAnalysisInput({ score: 8 })

    const { analysis, wasCreated } = await sut.execute({
      projectId: project.id.toValue(),
      channel: 'linkedin',
      ...input,
    })

    expect(wasCreated).toBe(true)
    expect(analysis.props.projectId.isEqual(project.id)).toBe(true)
    expect(analysis.props.channel).toBe(Channel.LINKEDIN)
    expect(analysis.props.score).toBe(8)
    expect(analysis.props.rationale).toBe(input.rationale)
    expect(analysis.props.findings).toHaveLength(2)
    expect(channelAnalysisRepository.items).toEqual([analysis])
  })

  it('replaces the analysis and all findings when the same channel is saved again', async () => {
    const first = await save({ findings: [makeHypothesisFindingInput(), makeHypothesisFindingInput()] })

    const second = await save({
      score: 3,
      findings: [makeHypothesisFindingInput({ statement: 'only finding' })],
    })

    expect(second.wasCreated).toBe(false)
    expect(second.analysis.id.isEqual(first.analysis.id)).toBe(true)
    expect(channelAnalysisRepository.items).toHaveLength(1)
    expect(channelAnalysisRepository.items[0].props.score).toBe(3)
    expect(channelAnalysisRepository.items[0].props.findings).toHaveLength(1)
    expect(channelAnalysisRepository.items[0].props.findings[0].statement).toBe('only finding')
  })

  it('keeps one analysis per channel', async () => {
    await save({}, 'linkedin')
    await save({}, 'youtube')

    expect(channelAnalysisRepository.items).toHaveLength(2)
  })

  it.each([0, 10])('accepts the score %i', async (score) => {
    const { analysis } = await save({ score })

    expect(analysis.props.score).toBe(score)
  })

  it.each([-1, 11, 7.5, Number.NaN])('rejects the score %s', async (score) => {
    await expectFieldIssue(save({ score }), { field: 'score', code: 'INVALID_SCORE' })
    expect(channelAnalysisRepository.items).toEqual([])
  })

  it('rejects empty texts of the analysis as required', async () => {
    await expectFieldIssue(save({ rationale: '   ' }), { field: 'rationale', code: 'REQUIRED' })
    await expectFieldIssue(
      save({ bestContent: { ...makeChannelAnalysisInput().bestContent, type: '' } }),
      { field: 'bestContent.type', code: 'REQUIRED' },
    )
    await expectFieldIssue(
      save({ bestContent: { ...makeChannelAnalysisInput().bestContent, evidence: '' } }),
      { field: 'bestContent.evidence', code: 'REQUIRED' },
    )
  })

  it('rejects empty competitor and statement of a finding as required', async () => {
    await expectFieldIssue(save({ findings: [makeHypothesisFindingInput({ competitor: '' })] }), {
      field: 'findings[0].competitor',
      code: 'REQUIRED',
    })
    await expectFieldIssue(save({ findings: [makeHypothesisFindingInput({ statement: ' ' })] }), {
      field: 'findings[0].statement',
      code: 'REQUIRED',
    })
  })

  it('accepts texts with the maximum length and rejects one character more', async () => {
    const bestContent = makeChannelAnalysisInput().bestContent

    await expect(
      save({
        rationale: some.stringWithLength(CHANNEL_RATIONALE_MAX_LENGTH),
        bestContent: {
          ...bestContent,
          type: some.stringWithLength(BEST_CONTENT_TYPE_MAX_LENGTH),
          evidence: some.stringWithLength(BEST_CONTENT_EVIDENCE_MAX_LENGTH),
        },
        findings: [
          makeFactFindingInput({
            competitor: some.stringWithLength(FINDING_COMPETITOR_MAX_LENGTH),
            statement: some.stringWithLength(FINDING_STATEMENT_MAX_LENGTH),
            excerpt: some.stringWithLength(FINDING_EXCERPT_MAX_LENGTH),
          }),
        ],
      }),
    ).resolves.toBeDefined()

    await expectFieldIssue(save({ rationale: some.stringWithLength(CHANNEL_RATIONALE_MAX_LENGTH + 1) }), {
      field: 'rationale',
      code: 'TOO_LONG',
    })
    await expectFieldIssue(
      save({
        bestContent: {
          ...bestContent,
          type: some.stringWithLength(BEST_CONTENT_TYPE_MAX_LENGTH + 1),
        },
      }),
      { field: 'bestContent.type', code: 'TOO_LONG' },
    )
    await expectFieldIssue(
      save({
        bestContent: {
          ...bestContent,
          evidence: some.stringWithLength(BEST_CONTENT_EVIDENCE_MAX_LENGTH + 1),
        },
      }),
      { field: 'bestContent.evidence', code: 'TOO_LONG' },
    )
    await expectFieldIssue(
      save({
        findings: [
          makeHypothesisFindingInput({
            competitor: some.stringWithLength(FINDING_COMPETITOR_MAX_LENGTH + 1),
          }),
        ],
      }),
      { field: 'findings[0].competitor', code: 'TOO_LONG' },
    )
    await expectFieldIssue(
      save({
        findings: [
          makeHypothesisFindingInput({
            statement: some.stringWithLength(FINDING_STATEMENT_MAX_LENGTH + 1),
          }),
        ],
      }),
      { field: 'findings[0].statement', code: 'TOO_LONG' },
    )
  })

  it('requires url, excerpt and tool in a fact', async () => {
    const promise = save({
      findings: [makeFactFindingInput({ url: null, excerpt: '', tool: undefined })],
    })

    await expect(promise).rejects.toMatchObject({
      fields: expect.arrayContaining([
        expect.objectContaining({ field: 'findings[0].url', code: 'REQUIRED' }),
        expect.objectContaining({ field: 'findings[0].excerpt', code: 'REQUIRED' }),
        expect.objectContaining({ field: 'findings[0].tool', code: 'REQUIRED' }),
      ]),
    })
  })

  it('accepts a hypothesis without url, excerpt and tool', async () => {
    const { analysis } = await save({ findings: [makeHypothesisFindingInput()] })

    expect(analysis.props.findings[0]).toMatchObject({
      kind: FindingKind.HYPOTHESIS,
      url: null,
      excerpt: null,
      tool: null,
    })
  })

  it.each(['ftp://example.com/file', 'javascript:alert(1)', 'not a url'])(
    'rejects the url %s',
    async (url) => {
      await expectFieldIssue(save({ findings: [makeFactFindingInput({ url })] }), {
        field: 'findings[0].url',
        code: 'INVALID_URL',
      })
    },
  )

  it('accepts http and https urls', async () => {
    await expect(
      save({
        findings: [
          makeFactFindingInput({ url: 'http://example.com' }),
          makeFactFindingInput({ url: 'https://example.com' }),
        ],
      }),
    ).resolves.toBeDefined()
  })

  it('accepts 30 findings and rejects 31', async () => {
    const makeFindings = (count: number) =>
      Array.from({ length: count }, () => makeHypothesisFindingInput())

    await expect(save({ findings: makeFindings(FINDINGS_MAX_ITEMS) })).resolves.toBeDefined()
    await expectFieldIssue(save({ findings: makeFindings(FINDINGS_MAX_ITEMS + 1) }), {
      field: 'findings',
      code: 'TOO_MANY_ITEMS',
    })
  })

  it('rejects a basis that is neither fact nor hypothesis', async () => {
    await expectFieldIssue(
      save({ bestContent: { ...makeChannelAnalysisInput().bestContent, basis: 'guess' } }),
      { field: 'bestContent.basis', code: 'INVALID_OPTION' },
    )
  })

  it('rejects an unknown project', async () => {
    await expect(
      sut.execute({
        projectId: createID().toValue(),
        channel: 'linkedin',
        ...makeChannelAnalysisInput(),
      }),
    ).rejects.toMatchObject({ response: { code: 'PROJECT_NOT_FOUND' } })
  })

  it('rejects a channel outside the eight', async () => {
    await expect(save({}, 'facebook')).rejects.toMatchObject({
      response: { code: 'CHANNEL_NOT_FOUND' },
    })
  })

  it('keeps the previous analysis intact when the new one is refused', async () => {
    const first = await save({ score: 9 })

    await expectFieldIssue(save({ score: 11 }), { field: 'score', code: 'INVALID_SCORE' })

    expect(channelAnalysisRepository.items).toEqual([first.analysis])
    expect(channelAnalysisRepository.items[0].props.score).toBe(9)
  })
})
