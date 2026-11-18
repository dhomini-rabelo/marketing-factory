import { UseCase, createID } from '@domain/base'
import type { ProjectsRepos } from '@domain/projects/application/types/repositories'
import { buildDocumentSlug } from '@domain/projects/application/use-cases/document/save-document/build-document-slug'
import { validateDocumentFields } from '@domain/projects/application/use-cases/document/save-document/validate-document-fields'
import { Document } from '@domain/projects/enterprise/entities/document'
import { Project } from '@domain/projects/enterprise/entities/project'
import { getNow } from '@modules/utils'

interface Payload {
  projectId: string
  title: string
  description: string
  body: string
}

type Response = { document: Document; wasCreated: boolean }

export class SaveDocumentUseCase implements UseCase<Payload, Response> {
  constructor(private readonly repos: Pick<ProjectsRepos, 'project' | 'document'>) {}

  async execute(payload: Payload): Promise<Response> {
    const project = await this.requireProject(payload.projectId)

    this.validateDocumentInput(payload)

    const document = this.buildDocument({ project, payload })

    return this.repos.document.saveByTitle(document)
  }

  private async requireProject(projectId: string): Promise<Project> {
    return this.repos.project.getOrThrow(createID(projectId))
  }

  private validateDocumentInput(payload: Payload): void {
    validateDocumentFields(payload)
  }

  private buildDocument(input: { project: Project; payload: Payload }): Document {
    const now = getNow()
    const title = input.payload.title.trim()

    return Document.create({
      projectId: input.project.id,
      slug: buildDocumentSlug(title),
      title,
      description: input.payload.description.trim(),
      body: input.payload.body,
      createdAt: now,
      updatedAt: now,
    })
  }
}
