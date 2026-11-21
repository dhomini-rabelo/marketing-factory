import type { NextFunction, Request, Response } from 'express'
import { GetSeoRoundUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { SeoRoundPresenter } from '@infra/http/presenters/seo-round-presenter'
import {
  competitorRepository,
  projectRepository,
  seoRoundRepository,
} from '@infra/http/repositories'
import { seoRoundParamsSchema } from '@infra/http/routes/seo/seo-schemas'

const getSeoRoundUseCase = new GetSeoRoundUseCase({
  project: projectRepository,
  competitor: competitorRepository,
  seoRound: seoRoundRepository,
})

export async function getSeoRound(request: Request, response: Response, next: NextFunction) {
  try {
    const params = seoRoundParamsSchema.parse(request.params)
    const result = await getSeoRoundUseCase.execute({
      projectId: params.id,
      roundId: params.roundId,
    })

    return response.status(HttpStatus.OK).json(SeoRoundPresenter.toHttp(result))
  } catch (error) {
    next(error)
  }
}
