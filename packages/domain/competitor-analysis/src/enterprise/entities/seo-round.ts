import { Entity, ID } from '@domain/base'

export enum SeoTool {
  CLAUDE_CODE = 'claude-code',
  GROK_BOT = 'grok-bot',
}

export enum SeoRoundStatus {
  COMPLETE = 'complete',
  PARTIAL = 'partial',
}

export interface SeoRoundProps {
  projectId: ID
  tool: SeoTool
  collectedAt: Date
  note: string
  market: string
  expectedCompetitors: string[]
  searches: object[]
  createdAt: Date
}

export class SeoRound extends Entity<SeoRoundProps> {
  static create(props: SeoRoundProps) {
    return new SeoRound(props)
  }

  static reference(id: ID, props: SeoRoundProps) {
    return new SeoRound(props, id)
  }
}

export function listMissingSeoCompetitors(
  round: SeoRound,
  collectedNames: string[],
  incorrectNames: string[] = [],
): string[] {
  return round.props.expectedCompetitors.filter(
    (name) => !collectedNames.includes(name) && !incorrectNames.includes(name),
  )
}

export function isCompleteSeoRound(
  round: SeoRound,
  collectedNames: string[],
  incorrectNames: string[] = [],
): boolean {
  return listMissingSeoCompetitors(round, collectedNames, incorrectNames).length === 0
}
