import type { NextFunction, Request, Response } from 'express'
import { SaveSeoDocumentUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { projectRepository, seoRoundRepository } from '@infra/http/repositories'
import { seoDocumentBodySchema, seoRoundParamsSchema } from '@infra/http/routes/seo/seo-schemas'

const saveSeoDocumentUseCase = new SaveSeoDocumentUseCase({
  project: projectRepository,
  seoRound: seoRoundRepository,
})

export async function saveSeoDocument(request: Request, response: Response, next: NextFunction) {
  try {
    const params = seoRoundParamsSchema.parse(request.params)

    await saveSeoDocumentUseCase.execute({
      projectId: params.id,
      roundId: params.roundId,
      ...seoDocumentBodySchema.parse(request.body ?? {}),
    })

    return response.status(HttpStatus.CREATED).json({})
  } catch (error) {
    next(error)
  }
}
