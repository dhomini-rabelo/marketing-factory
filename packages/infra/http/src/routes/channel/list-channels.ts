import type { NextFunction, Request, Response } from 'express'
import { ListChannelsUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { ChannelAnalysisPresenter } from '@infra/http/presenters/channel-analysis-presenter'
import { channelAnalysisRepository, projectRepository } from '@infra/http/repositories'
import { channelProjectParamsSchema } from '@infra/http/routes/channel/channel-schemas'

const listChannelsUseCase = new ListChannelsUseCase({
  project: projectRepository,
  channelAnalysis: channelAnalysisRepository,
})

export async function listChannels(request: Request, response: Response, next: NextFunction) {
  try {
    const summaries = await listChannelsUseCase.execute({
      projectId: channelProjectParamsSchema.parse(request.params).id,
    })

    return response
      .status(HttpStatus.OK)
      .json({ channels: summaries.map((summary) => ChannelAnalysisPresenter.toSummaryHttp(summary)) })
  } catch (error) {
    next(error)
  }
}
