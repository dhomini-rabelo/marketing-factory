import { UseCase } from '@domain/base'
import type { ProjectsRepos } from '@domain/projects/application/types/repositories'
import { Project } from '@domain/projects/enterprise/entities/project'

type Response = Project[]

export class ListProjectsUseCase implements UseCase<void, Response> {
  constructor(private readonly repos: Pick<ProjectsRepos, 'project'>) {}

  async execute(): Promise<Response> {
    return this.repos.project.listByName()
  }
}
