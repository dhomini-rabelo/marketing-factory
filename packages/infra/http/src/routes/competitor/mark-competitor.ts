import type { NextFunction, Request, Response } from 'express'
import { MarkCompetitorUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { CompetitorPresenter } from '@infra/http/presenters/competitor-presenter'
import { competitorRepository, projectRepository } from '@infra/http/repositories'
import {
  competitorParamsSchema,
  markCompetitorBodySchema,
} from '@infra/http/routes/competitor/competitor-schemas'

const markCompetitorUseCase = new MarkCompetitorUseCase({
  project: projectRepository,
  competitor: competitorRepository,
})

export async function markCompetitor(request: Request, response: Response, next: NextFunction) {
  try {
    const params = competitorParamsSchema.parse(request.params)
    const competitor = await markCompetitorUseCase.execute({
      projectId: params.id,
      competitorId: params.competitorId,
      ...markCompetitorBodySchema.parse(request.body ?? {}),
    })

    return response.status(HttpStatus.OK).json(CompetitorPresenter.toHttp(competitor))
  } catch (error) {
    next(error)
  }
}
