import { UseCase, createID } from '@domain/base'
import type { ProjectsRepos } from '@domain/projects/application/types/repositories'
import { validateProjectFields } from '@domain/projects/application/validation/project'
import { Project, ProjectPhase, ProjectPlatform } from '@domain/projects/enterprise/entities/project'
import { getNow } from '@modules/utils'

interface Payload {
  id: string
  name: string
  description: string
  platform: string
  phase: string
}

type Response = Project

export class UpdateProjectUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<ProjectsRepos, 'project'>) {}

  async execute(payload: Payload): Promise<Response> {
    const project = await this.requireProject(payload.id)

    this.validateProjectInput(payload)
    this.applyChanges({ project, payload })
    await this.repos.project.update(project)

    return project
  }

  private async requireProject(id: string): Promise<Project> {
    return this.repos.project.getOrThrow(createID(id))
  }

  private validateProjectInput(payload: Payload): void {
    validateProjectFields(payload)
  }

  private applyChanges(input: { project: Project; payload: Payload }): void {
    input.project.props.name = input.payload.name.trim()
    input.project.props.description = input.payload.description.trim()
    input.project.props.platform = input.payload.platform as ProjectPlatform
    input.project.props.phase = input.payload.phase as ProjectPhase
    input.project.props.updatedAt = getNow()
  }
}
