import type { NextFunction, Request, Response } from 'express'
import { CreateProjectUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { ProjectPresenter } from '@infra/http/presenters/project-presenter'
import { projectRepository } from '@infra/http/repositories'
import { projectBodySchema } from '@infra/http/routes/project/project-schemas'

const createProjectUseCase = new CreateProjectUseCase({ project: projectRepository })

export async function createProject(request: Request, response: Response, next: NextFunction) {
  try {
    const project = await createProjectUseCase.execute(projectBodySchema.parse(request.body ?? {}))

    return response.status(HttpStatus.CREATED).json(ProjectPresenter.toHttp(project))
  } catch (error) {
    next(error)
  }
}
