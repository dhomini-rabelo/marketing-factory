import type { Database } from 'better-sqlite3'
import { ID } from '@domain/base'
import {
  CHANNEL_ORDER,
  Channel,
  ChannelAnalysis,
  ChannelAnalysisRepository,
} from '@domain/competitor-analysis'
import {
  ChannelAnalysisMapper,
  ChannelAnalysisRecord,
  ChannelFindingRecord,
} from '@infra/db/repos/channel-analysis/mapper'

const ANALYSIS_COLUMNS = `
  id, project_id AS projectId, channel, score, rationale,
  best_content_type AS bestContentType,
  best_content_evidence AS bestContentEvidence,
  best_content_basis AS bestContentBasis,
  collected_at AS collectedAt
`

const FINDING_COLUMNS = `
  project_id AS projectId, channel, position, competitor, aspect, kind,
  statement, url, excerpt, tool
`

export class SqliteChannelAnalysisRepository extends ChannelAnalysisRepository {
  constructor(private readonly database: Database) {
    super()
  }

  async replaceForChannel(
    analysis: ChannelAnalysis,
  ): Promise<{ analysis: ChannelAnalysis; wasCreated: boolean }> {
    const persisted = ChannelAnalysisMapper.toPersistence(analysis)
    const replace = this.database.transaction(() => {
      const existing = this.findAnalysisRecord(persisted.analysis.projectId, persisted.analysis.channel)

      this.database
        .prepare(
          `INSERT INTO channel_analyses
             (id, project_id, channel, score, rationale, best_content_type,
              best_content_evidence, best_content_basis, collected_at)
           VALUES (@id, @projectId, @channel, @score, @rationale, @bestContentType,
                   @bestContentEvidence, @bestContentBasis, @collectedAt)
           ON CONFLICT (project_id, channel) DO UPDATE SET
             score = excluded.score,
             rationale = excluded.rationale,
             best_content_type = excluded.best_content_type,
             best_content_evidence = excluded.best_content_evidence,
             best_content_basis = excluded.best_content_basis,
             collected_at = excluded.collected_at`,
        )
        .run(persisted.analysis)

      this.database
        .prepare('DELETE FROM channel_findings WHERE project_id = ? AND channel = ?')
        .run(persisted.analysis.projectId, persisted.analysis.channel)

      const insertFinding = this.database.prepare(
        `INSERT INTO channel_findings
           (project_id, channel, position, competitor, aspect, kind, statement, url, excerpt, tool)
         VALUES (@projectId, @channel, @position, @competitor, @aspect, @kind, @statement,
                 @url, @excerpt, @tool)`,
      )
      persisted.findings.forEach((finding) => insertFinding.run(finding))

      const saved = this.findAnalysisRecord(
        persisted.analysis.projectId,
        persisted.analysis.channel,
      ) as ChannelAnalysisRecord

      return {
        analysis: ChannelAnalysisMapper.toDomain({
          analysis: saved,
          findings: this.listFindingRecords(saved.projectId, saved.channel),
        }),
        wasCreated: existing === undefined,
      }
    })

    return replace.immediate()
  }

  async findByChannel(input: { projectId: ID; channel: Channel }): Promise<ChannelAnalysis | null> {
    const record = this.findAnalysisRecord(input.projectId.toValue(), input.channel)

    if (!record) {
      return null
    }

    return ChannelAnalysisMapper.toDomain({
      analysis: record,
      findings: this.listFindingRecords(record.projectId, record.channel),
    })
  }

  async listCollected(projectId: ID): Promise<ChannelAnalysis[]> {
    const read = this.database.transaction(() => {
      const records = this.database
        .prepare(`SELECT ${ANALYSIS_COLUMNS} FROM channel_analyses WHERE project_id = ?`)
        .all(projectId.toValue()) as ChannelAnalysisRecord[]

      return records.map((record) =>
        ChannelAnalysisMapper.toDomain({
          analysis: record,
          findings: this.listFindingRecords(record.projectId, record.channel),
        }),
      )
    })

    return read().sort(
      (first, second) =>
        CHANNEL_ORDER.indexOf(first.props.channel) - CHANNEL_ORDER.indexOf(second.props.channel),
    )
  }

  private findAnalysisRecord(projectId: string, channel: string): ChannelAnalysisRecord | undefined {
    return this.database
      .prepare(
        `SELECT ${ANALYSIS_COLUMNS} FROM channel_analyses WHERE project_id = ? AND channel = ?`,
      )
      .get(projectId, channel) as ChannelAnalysisRecord | undefined
  }

  private listFindingRecords(projectId: string, channel: string): ChannelFindingRecord[] {
    return this.database
      .prepare(
        `SELECT ${FINDING_COLUMNS} FROM channel_findings
         WHERE project_id = ? AND channel = ?
         ORDER BY position`,
      )
      .all(projectId, channel) as ChannelFindingRecord[]
  }
}
