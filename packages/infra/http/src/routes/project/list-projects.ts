import type { NextFunction, Request, Response } from 'express'
import { ListProjectsUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { ProjectPresenter } from '@infra/http/presenters/project-presenter'
import { projectRepository } from '@infra/http/repositories'

const listProjectsUseCase = new ListProjectsUseCase({ project: projectRepository })

export async function listProjects(_request: Request, response: Response, next: NextFunction) {
  try {
    const projects = await listProjectsUseCase.execute()

    return response
      .status(HttpStatus.OK)
      .json({ projects: projects.map((project) => ProjectPresenter.toHttp(project)) })
  } catch (error) {
    next(error)
  }
}
