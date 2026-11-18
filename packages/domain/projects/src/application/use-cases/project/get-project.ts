import { UseCase, createID } from '@domain/base'
import type { ProjectsRepos } from '@domain/projects/application/types/repositories'
import { Project } from '@domain/projects/enterprise/entities/project'

interface Payload {
  id: string
}

type Response = Project

export class GetProjectUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<ProjectsRepos, 'project'>) {}

  async execute(payload: Payload): Promise<Response> {
    return this.repos.project.getOrThrow(createID(payload.id))
  }
}
