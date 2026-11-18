import { UseCase } from '@domain/base'
import type { ProjectsRepos } from '@domain/projects/application/types/repositories'
import { validateProjectFields } from '@domain/projects/application/validation/project'
import { Project, ProjectPhase, ProjectPlatform } from '@domain/projects/enterprise/entities/project'
import { getNow } from '@modules/utils'

interface Payload {
  name: string
  description: string
  platform: string
  phase: string
}

type Response = Project

export class CreateProjectUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<ProjectsRepos, 'project'>) {}

  async execute(payload: Payload): Promise<Response> {
    this.validateProjectInput(payload)

    const project = this.buildProject(payload)
    await this.repos.project.create(project)

    return project
  }

  private validateProjectInput(payload: Payload): void {
    validateProjectFields(payload)
  }

  private buildProject(payload: Payload): Project {
    const now = getNow()

    return Project.create({
      name: payload.name.trim(),
      description: payload.description.trim(),
      platform: payload.platform as ProjectPlatform,
      phase: payload.phase as ProjectPhase,
      createdAt: now,
      updatedAt: now,
    })
  }
}
