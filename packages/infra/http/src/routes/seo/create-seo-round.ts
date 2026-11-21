import type { NextFunction, Request, Response } from 'express'
import { CreateSeoRoundUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { SeoRoundPresenter } from '@infra/http/presenters/seo-round-presenter'
import {
  competitorRepository,
  projectRepository,
  seoRoundRepository,
} from '@infra/http/repositories'
import { seoProjectParamsSchema, seoRoundBodySchema } from '@infra/http/routes/seo/seo-schemas'

const createSeoRoundUseCase = new CreateSeoRoundUseCase({
  project: projectRepository,
  competitor: competitorRepository,
  seoRound: seoRoundRepository,
})

export async function createSeoRound(request: Request, response: Response, next: NextFunction) {
  try {
    const params = seoProjectParamsSchema.parse(request.params)
    const round = await createSeoRoundUseCase.execute({
      projectId: params.id,
      ...seoRoundBodySchema.parse(request.body ?? {}),
    })

    return response.status(HttpStatus.CREATED).json(SeoRoundPresenter.toIdHttp(round))
  } catch (error) {
    next(error)
  }
}
