import type { NextFunction, Request, Response } from 'express'
import { ListSeoRoundsUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { SeoRoundPresenter } from '@infra/http/presenters/seo-round-presenter'
import {
  competitorRepository,
  projectRepository,
  seoRoundRepository,
} from '@infra/http/repositories'
import { seoProjectParamsSchema } from '@infra/http/routes/seo/seo-schemas'

const listSeoRoundsUseCase = new ListSeoRoundsUseCase({
  project: projectRepository,
  competitor: competitorRepository,
  seoRound: seoRoundRepository,
})

export async function listSeoRounds(request: Request, response: Response, next: NextFunction) {
  try {
    const result = await listSeoRoundsUseCase.execute({
      projectId: seoProjectParamsSchema.parse(request.params).id,
    })

    return response.status(HttpStatus.OK).json(SeoRoundPresenter.toListHttp(result))
  } catch (error) {
    next(error)
  }
}
