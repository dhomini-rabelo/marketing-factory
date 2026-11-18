import type { NextFunction, Request, Response } from 'express'
import { createID } from '@domain/base'
import {
  SaveChannelAnalysisUseCase,
  checkScore,
  resolveChannel,
} from '@domain/competitor-analysis'
import { FieldIssue, FieldsValidationError } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { listSchemaIssues } from '@infra/http/middlewares/error-handler'
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
    const body = channelAnalysisBodySchema.safeParse(request.body ?? {})

    if (!body.success) {
      await projectRepository.getOrThrow(createID(params.id))
      resolveChannel(params.channel)

      throw new FieldsValidationError([
        ...listScoreIssues(request.body),
        ...listSchemaIssues(body.error),
      ])
    }

    const result = await saveChannelAnalysisUseCase.execute({
      projectId: params.id,
      channel: params.channel,
      ...body.data,
    })
    const status = result.wasCreated ? HttpStatus.CREATED : HttpStatus.OK

    return response.status(status).json(ChannelAnalysisPresenter.toHttp(result.analysis))
  } catch (error) {
    next(error)
  }
}

function listScoreIssues(body: unknown): FieldIssue[] {
  const score = typeof body === 'object' && body !== null && 'score' in body ? body.score : null
  const issue = typeof score === 'number' ? checkScore(score) : null

  return issue ? [issue] : []
}
