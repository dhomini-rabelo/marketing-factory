import { beforeEach, describe, expect, it } from 'vitest'
import {
  makeChannelAnalysisInput,
  makeHypothesisFindingInput,
} from '@domain/competitor-analysis/application/__tests__/factories/channel-analysis-input'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryChannelAnalysisRepository } from '@domain/competitor-analysis/application/__tests__/repositories/channel-analysis'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { GetChannelAnalysisUseCase } from '@domain/competitor-analysis/application/use-cases/channel/get-channel-analysis'
import { SaveChannelAnalysisUseCase } from '@domain/competitor-analysis/application/use-cases/channel/save-channel-analysis'
import {
  FINDING_ASPECT_ORDER,
  FindingAspect,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'
import { Project } from '@domain/projects'

describe('SaveChannelAnalysisUseCase aspects', () => {
  let projectRepository: InMemoryProjectRepository
  let channelAnalysisRepository: InMemoryChannelAnalysisRepository
  let project: Project
  let sut: SaveChannelAnalysisUseCase

  const saveWithAspect = (aspect: string | undefined) =>
    sut.execute({
      projectId: project.id.toValue(),
      channel: 'linkedin',
      ...makeChannelAnalysisInput({
        findings: [makeHypothesisFindingInput({ aspect: aspect as string })],
      }),
    })

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

  it('accepts each of the five aspects', async () => {
    expect(FINDING_ASPECT_ORDER).toEqual(['format', 'topic', 'frequency', 'performance', 'cta'])

    for (const aspect of FINDING_ASPECT_ORDER) {
      const { analysis } = await saveWithAspect(aspect)

      expect(analysis.props.findings[0].aspect).toBe(aspect)
    }
  })

  it.each([undefined, '', 'Format', 'cta ', 'tone'])(
    'rejects the aspect %j listing the five accepted ones',
    async (aspect) => {
      await expect(saveWithAspect(aspect)).rejects.toMatchObject({
        fields: [
          {
            field: 'findings[0].aspect',
            code: 'INVALID_OPTION',
            variables: ['format', 'topic', 'frequency', 'performance', 'cta'],
          },
        ],
      })
    },
  )

  it('keeps the previous analysis intact when an aspect is refused', async () => {
    const first = await saveWithAspect(FindingAspect.TOPIC)

    await expect(saveWithAspect('Format')).rejects.toBeDefined()

    expect(channelAnalysisRepository.items).toEqual([first.analysis])
  })

  it('returns each aspect on reading exactly as saved', async () => {
    const getUseCase = new GetChannelAnalysisUseCase({
      project: projectRepository,
      channelAnalysis: channelAnalysisRepository,
    })
    await sut.execute({
      projectId: project.id.toValue(),
      channel: 'linkedin',
      ...makeChannelAnalysisInput({
        findings: FINDING_ASPECT_ORDER.map((aspect) => makeHypothesisFindingInput({ aspect })),
      }),
    })

    const analysis = await getUseCase.execute({ projectId: project.id.toValue(), channel: 'linkedin' })

    expect(analysis.props.findings.map((finding) => finding.aspect)).toEqual(FINDING_ASPECT_ORDER)
  })
})
