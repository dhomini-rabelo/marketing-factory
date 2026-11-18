import { DangerErrors, DomainError, ID } from '@domain/base'
import { Project, ProjectRepository } from '@domain/projects'

export class InMemoryProjectRepository extends ProjectRepository {
  public items: Project[] = []

  async create(project: Project): Promise<void> {
    this.items.push(project)
  }

  async update(project: Project): Promise<void> {
    const position = this.items.findIndex((item) => item.id.isEqual(project.id))
    this.items[position] = project
  }

  async getOrThrow(id: ID): Promise<Project> {
    const project = this.items.find((item) => item.id.isEqual(id))

    if (!project) {
      throw new DomainError({ code: 'PROJECT_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
    }

    return project
  }

  async listByName(): Promise<Project[]> {
    return [...this.items]
  }
}
