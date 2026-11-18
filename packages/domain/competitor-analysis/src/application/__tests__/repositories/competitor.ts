import { DangerErrors, DomainError, ID } from '@domain/base'
import { CompetitorRepository } from '@domain/competitor-analysis/application/repositories/competitor'
import {
  Competitor,
  CompetitorApproval,
} from '@domain/competitor-analysis/enterprise/entities/competitor'

export class InMemoryCompetitorRepository extends CompetitorRepository {
  public items: Competitor[] = []
  public approvals = new Map<string, CompetitorApproval>()

  async replaceList(input: {
    projectId: ID
    competitors: Competitor[]
  }): Promise<{ competitors: Competitor[]; wasCreated: boolean }> {
    const previous = this.listOfProject(input.projectId)
    const incomingIds = input.competitors.map((competitor) => competitor.id.toValue())

    const replaced = input.competitors.map((competitor) =>
      Competitor.reference(competitor.id, {
        ...competitor.props,
        incorrect: this.wasIncorrect(previous, competitor),
      }),
    )
    const keptIncorrect = previous.filter(
      (competitor) => competitor.props.incorrect && !incomingIds.includes(competitor.id.toValue()),
    )
    const competitors = [...replaced, ...keptIncorrect]

    this.items = [
      ...this.items.filter((item) => !item.props.projectId.isEqual(input.projectId)),
      ...competitors,
    ]
    this.approvals.set(input.projectId.toValue(), CompetitorApproval.PENDING)

    return { competitors, wasCreated: previous.length === 0 }
  }

  async listByProject(projectId: ID): Promise<Competitor[]> {
    return this.listOfProject(projectId)
  }

  async setIncorrect(input: {
    projectId: ID
    competitorId: ID
    incorrect: boolean
  }): Promise<Competitor> {
    const existing = this.listOfProject(input.projectId).find((item) =>
      item.id.isEqual(input.competitorId),
    )

    if (!existing) {
      throw new DomainError({ code: 'COMPETITOR_NOT_FOUND', errorType: DangerErrors.NOT_FOUND })
    }

    const updated = Competitor.reference(existing.id, {
      ...existing.props,
      incorrect: input.incorrect,
    })
    this.items[this.items.indexOf(existing)] = updated

    return updated
  }

  async getApproval(projectId: ID): Promise<CompetitorApproval> {
    return this.approvals.get(projectId.toValue()) ?? CompetitorApproval.PENDING
  }

  async setApproval(input: { projectId: ID; approval: CompetitorApproval }): Promise<void> {
    this.approvals.set(input.projectId.toValue(), input.approval)
  }

  private listOfProject(projectId: ID): Competitor[] {
    return this.items.filter((item) => item.props.projectId.isEqual(projectId))
  }

  private wasIncorrect(previous: Competitor[], competitor: Competitor): boolean {
    return previous.some((item) => item.id.isEqual(competitor.id) && item.props.incorrect)
  }
}
