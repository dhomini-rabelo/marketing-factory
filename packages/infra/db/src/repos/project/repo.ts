import type { Database } from 'better-sqlite3'
import { DangerErrors, DomainError, ID } from '@domain/base'
import { Project, ProjectRepository } from '@domain/projects'
import { ProjectMapper, ProjectRecord } from '@infra/db/repos/project/mapper'

const SELECT_PROJECT = `
  SELECT id, name, platform, phase, description,
    created_at AS createdAt, updated_at AS updatedAt
  FROM projects
`

export class SqliteProjectRepository extends ProjectRepository {
  constructor(private readonly database: Database) {
    super()
  }

  async create(project: Project): Promise<void> {
    this.database
      .prepare(
        `INSERT INTO projects (id, name, platform, phase, description, created_at, updated_at)
         VALUES (@id, @name, @platform, @phase, @description, @createdAt, @updatedAt)`,
      )
      .run(ProjectMapper.toPersistence(project))
  }

  async update(project: Project): Promise<void> {
    const result = this.database
      .prepare(
        `UPDATE projects
         SET name = @name, platform = @platform, phase = @phase,
           description = @description, updated_at = @updatedAt
         WHERE id = @id`,
      )
      .run(ProjectMapper.toPersistence(project))

    if (result.changes === 0) {
      throw this.projectNotFound()
    }
  }

  async getOrThrow(id: ID): Promise<Project> {
    const record = this.database.prepare(`${SELECT_PROJECT} WHERE id = ?`).get(id.toValue()) as
      | ProjectRecord
      | undefined

    if (!record) {
      throw this.projectNotFound()
    }

    return ProjectMapper.toDomain(record)
  }

  async listByName(): Promise<Project[]> {
    const records = this.database
      .prepare(`${SELECT_PROJECT} ORDER BY name COLLATE NOCASE, id`)
      .all() as ProjectRecord[]

    return records.map((record) => ProjectMapper.toDomain(record))
  }

  private projectNotFound(): DomainError {
    return new DomainError({ code: 'PROJECT_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
  }
}
