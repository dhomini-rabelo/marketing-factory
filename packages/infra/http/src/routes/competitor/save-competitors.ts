import type { NextFunction, Request, Response } from 'express'
import { SaveCompetitorsUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { CompetitorPresenter } from '@infra/http/presenters/competitor-presenter'
import { competitorRepository, projectRepository } from '@infra/http/repositories'
import {
  competitorProjectParamsSchema,
  competitorsBodySchema,
} from '@infra/http/routes/competitor/competitor-schemas'

const saveCompetitorsUseCase = new SaveCompetitorsUseCase({
  project: projectRepository,
  competitor: competitorRepository,
})

export async function saveCompetitors(request: Request, response: Response, next: NextFunction) {
  try {
    const result = await saveCompetitorsUseCase.execute({
      projectId: competitorProjectParamsSchema.parse(request.params).id,
      ...competitorsBodySchema.parse(request.body ?? {}),
    })
    const status = result.wasCreated ? HttpStatus.CREATED : HttpStatus.OK

    return response.status(status).json({
      approval: result.approval,
      competitors: result.competitors.map((competitor) => CompetitorPresenter.toHttp(competitor)),
    })
  } catch (error) {
    next(error)
  }
}
