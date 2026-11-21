import type { NextFunction, Request, Response } from 'express'
import { GetSeoCompetitorUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { SeoRoundPresenter } from '@infra/http/presenters/seo-round-presenter'
import {
  competitorRepository,
  projectRepository,
  seoRoundRepository,
} from '@infra/http/repositories'
import { seoCompetitorParamsSchema } from '@infra/http/routes/seo/seo-schemas'

const getSeoCompetitorUseCase = new GetSeoCompetitorUseCase({
  project: projectRepository,
  competitor: competitorRepository,
  seoRound: seoRoundRepository,
})

export async function getSeoCompetitor(request: Request, response: Response, next: NextFunction) {
  try {
    const params = seoCompetitorParamsSchema.parse(request.params)
    const result = await getSeoCompetitorUseCase.execute({
      projectId: params.id,
      roundId: params.roundId,
      name: params.name,
    })

    return response.status(HttpStatus.OK).json(SeoRoundPresenter.toCompetitorHttp(result))
  } catch (error) {
    next(error)
  }
}
