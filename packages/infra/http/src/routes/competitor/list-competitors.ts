import type { NextFunction, Request, Response } from 'express'
import { ListCompetitorsUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { CompetitorPresenter } from '@infra/http/presenters/competitor-presenter'
import { competitorRepository, projectRepository } from '@infra/http/repositories'
import { competitorProjectParamsSchema } from '@infra/http/routes/competitor/competitor-schemas'

const listCompetitorsUseCase = new ListCompetitorsUseCase({
  project: projectRepository,
  competitor: competitorRepository,
})

export async function listCompetitors(request: Request, response: Response, next: NextFunction) {
  try {
    const result = await listCompetitorsUseCase.execute({
      projectId: competitorProjectParamsSchema.parse(request.params).id,
    })

    return response.status(HttpStatus.OK).json({
      approval: result.approval,
      competitors: result.competitors.map((competitor) => CompetitorPresenter.toHttp(competitor)),
    })
  } catch (error) {
    next(error)
  }
}
