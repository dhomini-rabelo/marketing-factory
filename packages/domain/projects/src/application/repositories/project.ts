import { ID } from '@domain/base'
import { Project } from '@domain/projects/enterprise/entities/project'

export abstract class ProjectRepository {
  abstract create(project: Project): Promise<void>
  abstract update(project: Project): Promise<void>
  abstract getOrThrow(id: ID): Promise<Project>
  abstract listByName(): Promise<Project[]>
}
