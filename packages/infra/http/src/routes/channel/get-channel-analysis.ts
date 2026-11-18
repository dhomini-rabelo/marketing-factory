import type { NextFunction, Request, Response } from 'express'
import { GetChannelAnalysisUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { ChannelAnalysisPresenter } from '@infra/http/presenters/channel-analysis-presenter'
import { channelAnalysisRepository, projectRepository } from '@infra/http/repositories'
import { channelParamsSchema } from '@infra/http/routes/channel/channel-schemas'

const getChannelAnalysisUseCase = new GetChannelAnalysisUseCase({
  project: projectRepository,
  channelAnalysis: channelAnalysisRepository,
})

export async function getChannelAnalysis(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = channelParamsSchema.parse(request.params)
    const analysis = await getChannelAnalysisUseCase.execute({
      projectId: params.id,
      channel: params.channel,
    })

    return response.status(HttpStatus.OK).json(ChannelAnalysisPresenter.toHttp(analysis))
  } catch (error) {
    next(error)
  }
}
