import { UseCase, createID } from '@domain/base'
import type { ProjectsRepos } from '@domain/projects/application/types/repositories'
import { Document } from '@domain/projects/enterprise/entities/document'

interface Payload {
  projectId: string
  slug: string
}

type Response = Document

export class GetDocumentUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<ProjectsRepos, 'project' | 'document'>) {}

  async execute(payload: Payload): Promise<Response> {
    const projectId = createID(payload.projectId)

    await this.repos.project.getOrThrow(projectId)

    return this.repos.document.getOrThrow({ projectId, slug: payload.slug })
  }
}
