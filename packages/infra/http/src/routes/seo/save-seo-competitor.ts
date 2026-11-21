import type { NextFunction, Request, Response } from 'express'
import { SaveSeoCompetitorUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import {
  competitorRepository,
  projectRepository,
  seoRoundRepository,
} from '@infra/http/repositories'
import {
  seoCompetitorBodySchema,
  seoCompetitorParamsSchema,
} from '@infra/http/routes/seo/seo-schemas'

const saveSeoCompetitorUseCase = new SaveSeoCompetitorUseCase({
  project: projectRepository,
  competitor: competitorRepository,
  seoRound: seoRoundRepository,
})

export async function saveSeoCompetitor(request: Request, response: Response, next: NextFunction) {
  try {
    const params = seoCompetitorParamsSchema.parse(request.params)
    const data = seoCompetitorBodySchema.parse(request.body ?? {})

    await saveSeoCompetitorUseCase.execute({
      projectId: params.id,
      roundId: params.roundId,
      name: params.name,
      data,
    })

    return response.status(HttpStatus.CREATED).json({})
  } catch (error) {
    next(error)
  }
}
