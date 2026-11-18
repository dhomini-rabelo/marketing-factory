import type { DocumentRepository } from '@domain/projects/application/repositories/document'
import type { ProjectRepository } from '@domain/projects/application/repositories/project'

export type ProjectsRepos = {
  project: ProjectRepository
  document: DocumentRepository
}
