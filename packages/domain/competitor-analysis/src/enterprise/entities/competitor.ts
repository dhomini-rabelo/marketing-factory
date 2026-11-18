import { Entity, ID, createID } from '@domain/base'

export enum CompetitorRole {
  MAIN = 'main',
  SECONDARY = 'secondary',
}

export enum CompetitorApproval {
  PENDING = 'pending',
  APPROVED = 'approved',
}

export interface CompetitorProps {
  projectId: ID
  name: string
  role: CompetitorRole
  marketFocus: string
  services: string
  features: string
  audience: string
  rationale: string
  url: string | null
  incorrect: boolean
  qualifiedAt: Date
}

export function normalizeCompetitorName(name: string): string {
  return name.trim().toLowerCase()
}

export class Competitor extends Entity<CompetitorProps> {
  static create(props: CompetitorProps) {
    return new Competitor(props, createID(normalizeCompetitorName(props.name)))
  }

  static reference(id: ID, props: CompetitorProps) {
    return new Competitor(props, id)
  }
}
