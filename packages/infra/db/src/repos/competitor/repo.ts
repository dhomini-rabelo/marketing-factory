import type { Database } from 'better-sqlite3'
import { DangerErrors, DomainError, ID } from '@domain/base'
import { Competitor, CompetitorApproval, CompetitorRepository } from '@domain/competitor-analysis'
import { CompetitorMapper, CompetitorRecord } from '@infra/db/repos/competitor/mapper'

const COMPETITOR_COLUMNS = `
  id, project_id AS projectId, normalized_name AS normalizedName, name, role,
  market_focus AS marketFocus, services, features, audience, rationale, url,
  incorrect, position, qualified_at AS qualifiedAt
`

const UPSERT_APPROVAL = `
  INSERT INTO competitor_approvals (project_id, approval)
  VALUES (@projectId, @approval)
  ON CONFLICT (project_id) DO UPDATE SET approval = excluded.approval
`

export class SqliteCompetitorRepository extends CompetitorRepository {
  constructor(private readonly database: Database) {
    super()
  }

  async replaceList(input: {
    projectId: ID
    competitors: Competitor[]
  }): Promise<{ competitors: Competitor[]; wasCreated: boolean }> {
    const projectId = input.projectId.toValue()
    const replace = this.database.transaction(() => {
      const previous = this.listRecords(projectId)
      const incomingIds = input.competitors.map((competitor) => competitor.id.toValue())
      const wasIncorrect = (competitorId: string) =>
        previous.some((record) => record.id === competitorId && record.incorrect === 1)

      const replaced = input.competitors.map((competitor) =>
        Competitor.reference(competitor.id, {
          ...competitor.props,
          incorrect: wasIncorrect(competitor.id.toValue()),
        }),
      )
      const keptIncorrect = previous
        .filter((record) => record.incorrect === 1 && !incomingIds.includes(record.id))
        .map((record) => CompetitorMapper.toDomain(record))
      const competitors = [...replaced, ...keptIncorrect]

      this.database.prepare('DELETE FROM competitors WHERE project_id = ?').run(projectId)

      const insert = this.database.prepare(
        `INSERT INTO competitors
           (id, project_id, normalized_name, name, role, market_focus, services, features,
            audience, rationale, url, incorrect, position, qualified_at)
         VALUES (@id, @projectId, @normalizedName, @name, @role, @marketFocus, @services,
                 @features, @audience, @rationale, @url, @incorrect, @position, @qualifiedAt)`,
      )
      competitors.forEach((competitor, position) =>
        insert.run(CompetitorMapper.toPersistence(competitor, position)),
      )

      this.database
        .prepare(UPSERT_APPROVAL)
        .run({ projectId, approval: CompetitorApproval.PENDING })

      return { competitors, wasCreated: previous.length === 0 }
    })

    return replace.immediate()
  }

  async listByProject(projectId: ID): Promise<Competitor[]> {
    return this.listRecords(projectId.toValue()).map((record) => CompetitorMapper.toDomain(record))
  }

  async setIncorrect(input: {
    projectId: ID
    competitorId: ID
    incorrect: boolean
  }): Promise<Competitor> {
    const projectId = input.projectId.toValue()
    const competitorId = input.competitorId.toValue()
    const update = this.database.transaction(() => {
      const result = this.database
        .prepare('UPDATE competitors SET incorrect = ? WHERE project_id = ? AND id = ?')
        .run(input.incorrect ? 1 : 0, projectId, competitorId)

      if (result.changes === 0) {
        throw new DomainError({ code: 'COMPETITOR_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
      }

      const record = this.database
        .prepare(`SELECT ${COMPETITOR_COLUMNS} FROM competitors WHERE project_id = ? AND id = ?`)
        .get(projectId, competitorId) as CompetitorRecord

      return CompetitorMapper.toDomain(record)
    })

    return update.immediate()
  }

  async getApproval(projectId: ID): Promise<CompetitorApproval> {
    const record = this.database
      .prepare('SELECT approval FROM competitor_approvals WHERE project_id = ?')
      .get(projectId.toValue()) as { approval: string } | undefined

    return record ? CompetitorMapper.toApproval(record.approval) : CompetitorApproval.PENDING
  }

  async setApproval(input: { projectId: ID; approval: CompetitorApproval }): Promise<void> {
    this.database
      .prepare(UPSERT_APPROVAL)
      .run({ projectId: input.projectId.toValue(), approval: input.approval })
  }

  private listRecords(projectId: string): CompetitorRecord[] {
    return this.database
      .prepare(
        `SELECT ${COMPETITOR_COLUMNS} FROM competitors WHERE project_id = ? ORDER BY position`,
      )
      .all(projectId) as CompetitorRecord[]
  }
}
