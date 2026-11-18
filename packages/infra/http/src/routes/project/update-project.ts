import type { NextFunction, Request, Response } from 'express'
import { UpdateProjectUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { ProjectPresenter } from '@infra/http/presenters/project-presenter'
import { projectRepository } from '@infra/http/repositories'
import { projectBodySchema, projectParamsSchema } from '@infra/http/routes/project/project-schemas'

const updateProjectUseCase = new UpdateProjectUseCase({ project: projectRepository })

export async function updateProject(request: Request, response: Response, next: NextFunction) {
  try {
    const project = await updateProjectUseCase.execute({
      id: projectParamsSchema.parse(request.params).id,
      ...projectBodySchema.parse(request.body ?? {}),
    })

    return response.status(HttpStatus.OK).json(ProjectPresenter.toHttp(project))
  } catch (error) {
    next(error)
  }
}
