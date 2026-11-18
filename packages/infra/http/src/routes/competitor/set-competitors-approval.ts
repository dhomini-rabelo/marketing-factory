import type { NextFunction, Request, Response } from 'express'
import { SetCompetitorsApprovalUseCase } from '@domain/competitor-analysis'
import { HttpStatus } from '@modules/utils'
import { competitorRepository, projectRepository } from '@infra/http/repositories'
import {
  competitorProjectParamsSchema,
  competitorsApprovalBodySchema,
} from '@infra/http/routes/competitor/competitor-schemas'

const setCompetitorsApprovalUseCase = new SetCompetitorsApprovalUseCase({
  project: projectRepository,
  competitor: competitorRepository,
})

export async function setCompetitorsApproval(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await setCompetitorsApprovalUseCase.execute({
      projectId: competitorProjectParamsSchema.parse(request.params).id,
      ...competitorsApprovalBodySchema.parse(request.body ?? {}),
    })

    return response.status(HttpStatus.OK).json({ approval: result.approval })
  } catch (error) {
    next(error)
  }
}
