import type { NextFunction, Request, Response } from 'express'
import { SaveChannelAnalysisUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { ChannelAnalysisPresenter } from '@infra/http/presenters/channel-analysis-presenter'
import { channelAnalysisRepository, projectRepository } from '@infra/http/repositories'
import {
  channelAnalysisBodySchema,
  channelParamsSchema,
} from '@infra/http/routes/channel/channel-schemas'

const saveChannelAnalysisUseCase = new SaveChannelAnalysisUseCase({
  project: projectRepository,
  channelAnalysis: channelAnalysisRepository,
})

export async function saveChannelAnalysis(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const params = channelParamsSchema.parse(request.params)
    const result = await saveChannelAnalysisUseCase.execute({
      projectId: params.id,
      channel: params.channel,
      ...channelAnalysisBodySchema.parse(request.body ?? {}),
    })
    const status = result.wasCreated ? HttpStatus.CREATED : HttpStatus.OK

    return response.status(status).json(ChannelAnalysisPresenter.toHttp(result.analysis))
  } catch (error) {
    next(error)
  }
}
