import { ID } from '@domain/base'
import {
  Competitor,
  CompetitorApproval,
} from '@domain/competitor-analysis/enterprise/entities/competitor'

export abstract class CompetitorRepository {
  abstract replaceList(input: {
    projectId: ID
    competitors: Competitor[]
  }): Promise<{ competitors: Competitor[]; wasCreated: boolean }>
  abstract listByProject(projectId: ID): Promise<Competitor[]>
  abstract setIncorrect(input: {
    projectId: ID
    competitorId: ID
    incorrect: boolean
  }): Promise<Competitor>
  abstract getApproval(projectId: ID): Promise<CompetitorApproval>
  abstract setApproval(input: { projectId: ID; approval: CompetitorApproval }): Promise<void>
}
