import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import {
  makeChannelAnalysis,
  makeFinding,
} from '@domain/competitor-analysis/application/__tests__/factories/channel-analysis'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryChannelAnalysisRepository } from '@domain/competitor-analysis/application/__tests__/repositories/channel-analysis'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { GetChannelAnalysisUseCase } from '@domain/competitor-analysis/application/use-cases/channel/get-channel-analysis'
import { Channel } from '@domain/competitor-analysis/enterprise/entities/channel-analysis'
import { Project } from '@domain/projects'

describe('GetChannelAnalysisUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let channelAnalysisRepository: InMemoryChannelAnalysisRepository
  let project: Project
  let sut: GetChannelAnalysisUseCase

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    channelAnalysisRepository = new InMemoryChannelAnalysisRepository()
    project = makeProject()
    projectRepository.items.push(project)
    sut = new GetChannelAnalysisUseCase({
      project: projectRepository,
      channelAnalysis: channelAnalysisRepository,
    })
  })

  it('returns the whole analysis of a collected channel', async () => {
    const stored = makeChannelAnalysis({
      projectId: project.id,
      channel: Channel.YOUTUBE,
      findings: [makeFinding(), makeFinding()],
    })
    channelAnalysisRepository.items.push(stored)

    const analysis = await sut.execute({ projectId: project.id.toValue(), channel: 'youtube' })

    expect(analysis).toEqual(stored)
    expect(analysis.props.findings).toHaveLength(2)
  })

  it('rejects a channel that was not collected with ANALYSIS_NOT_FOUND', async () => {
    await expect(sut.execute({ projectId: project.id.toValue(), channel: 'seo' })).rejects.toMatchObject({
      response: { code: 'ANALYSIS_NOT_FOUND' },
    })
  })

  it('does not return the analysis of another project', async () => {
    channelAnalysisRepository.items.push(
      makeChannelAnalysis({ projectId: createID(), channel: Channel.SEO }),
    )

    await expect(sut.execute({ projectId: project.id.toValue(), channel: 'seo' })).rejects.toMatchObject({
      response: { code: 'ANALYSIS_NOT_FOUND' },
    })
  })

  it('rejects a channel outside the nine with CHANNEL_NOT_FOUND', async () => {
    await expect(
      sut.execute({ projectId: project.id.toValue(), channel: 'facebook' }),
    ).rejects.toMatchObject({ response: { code: 'CHANNEL_NOT_FOUND' } })
  })

  it('rejects an unknown project', async () => {
    await expect(sut.execute({ projectId: createID().toValue(), channel: 'seo' })).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
