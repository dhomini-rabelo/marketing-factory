import type { NextFunction, Request, Response } from 'express'
import { GetProjectUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { ProjectPresenter } from '@infra/http/presenters/project-presenter'
import { projectRepository } from '@infra/http/repositories'
import { projectParamsSchema } from '@infra/http/routes/project/project-schemas'

const getProjectUseCase = new GetProjectUseCase({ project: projectRepository })

export async function getProject(request: Request, response: Response, next: NextFunction) {
  try {
    const project = await getProjectUseCase.execute({
      id: projectParamsSchema.parse(request.params).id,
    })

    return response.status(HttpStatus.OK).json(ProjectPresenter.toHttp(project))
  } catch (error) {
    next(error)
  }
}
