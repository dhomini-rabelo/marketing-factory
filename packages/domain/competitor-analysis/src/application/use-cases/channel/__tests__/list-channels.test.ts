import { beforeEach, describe, expect, it } from 'vitest'
import { createID } from '@domain/base'
import { makeChannelAnalysis } from '@domain/competitor-analysis/application/__tests__/factories/channel-analysis'
import { makeProject } from '@domain/competitor-analysis/application/__tests__/factories/project'
import { InMemoryChannelAnalysisRepository } from '@domain/competitor-analysis/application/__tests__/repositories/channel-analysis'
import { InMemoryProjectRepository } from '@domain/competitor-analysis/application/__tests__/repositories/project'
import { ListChannelsUseCase } from '@domain/competitor-analysis/application/use-cases/channel/list-channels'
import { CHANNEL_ORDER, Channel } from '@domain/competitor-analysis/enterprise/entities/channel-analysis'
import { Project } from '@domain/projects'

describe('ListChannelsUseCase', () => {
  let projectRepository: InMemoryProjectRepository
  let channelAnalysisRepository: InMemoryChannelAnalysisRepository
  let project: Project
  let sut: ListChannelsUseCase

  const collect = (channel: Channel, score: number) =>
    channelAnalysisRepository.items.push(
      makeChannelAnalysis({ projectId: project.id, channel, score }),
    )

  beforeEach(() => {
    projectRepository = new InMemoryProjectRepository()
    channelAnalysisRepository = new InMemoryChannelAnalysisRepository()
    project = makeProject()
    projectRepository.items.push(project)
    sut = new ListChannelsUseCase({
      project: projectRepository,
      channelAnalysis: channelAnalysisRepository,
    })
  })

  it('lists the eight channels as not collected when nothing was saved', async () => {
    const channels = await sut.execute({ projectId: project.id.toValue() })

    expect(channels.map((summary) => summary.channel)).toEqual(CHANNEL_ORDER)
    expect(channels.every((summary) => !summary.collected)).toBe(true)
    expect(channels.every((summary) => summary.score === null && summary.collectedAt === null)).toBe(
      true,
    )
  })

  it('flags only x, tiktok, reddit and ads as partial', async () => {
    const channels = await sut.execute({ projectId: project.id.toValue() })

    expect(channels.filter((summary) => summary.partial).map((summary) => summary.channel)).toEqual([
      'x',
      'tiktok',
      'reddit',
      'ads',
    ])
  })

  it('orders collected channels by descending score', async () => {
    collect(Channel.INSTAGRAM, 4)
    collect(Channel.YOUTUBE, 9)
    collect(Channel.LINKEDIN, 6)

    const channels = await sut.execute({ projectId: project.id.toValue() })

    expect(channels.slice(0, 3).map((summary) => [summary.channel, summary.score])).toEqual([
      ['youtube', 9],
      ['linkedin', 6],
      ['instagram', 4],
    ])
    expect(channels.slice(0, 3).every((summary) => summary.collected)).toBe(true)
    expect(channels[0].collectedAt).toBeInstanceOf(Date)
  })

  it('breaks score ties by the fixed channel order', async () => {
    collect(Channel.REDDIT, 5)
    collect(Channel.SITE_PRICING, 5)
    collect(Channel.X_NETWORK, 5)

    const channels = await sut.execute({ projectId: project.id.toValue() })

    expect(channels.slice(0, 3).map((summary) => summary.channel)).toEqual([
      'site-pricing',
      'x',
      'reddit',
    ])
  })

  it('lists a collected channel with score 0 before the channels without collection', async () => {
    collect(Channel.ADS, 0)

    const channels = await sut.execute({ projectId: project.id.toValue() })

    expect(channels[0]).toMatchObject({ channel: 'ads', collected: true, score: 0 })
    expect(channels.slice(1).map((summary) => summary.channel)).toEqual(
      CHANNEL_ORDER.filter((channel) => channel !== Channel.ADS),
    )
    expect(channels.slice(1).every((summary) => !summary.collected)).toBe(true)
  })

  it('ignores analyses of other projects', async () => {
    channelAnalysisRepository.items.push(
      makeChannelAnalysis({ projectId: createID(), channel: Channel.INSTAGRAM, score: 10 }),
    )

    const channels = await sut.execute({ projectId: project.id.toValue() })

    expect(channels.every((summary) => !summary.collected)).toBe(true)
  })

  it('rejects an unknown project', async () => {
    await expect(sut.execute({ projectId: createID().toValue() })).rejects.toMatchObject({
      response: { code: 'PROJECT_NOT_FOUND' },
    })
  })
})
