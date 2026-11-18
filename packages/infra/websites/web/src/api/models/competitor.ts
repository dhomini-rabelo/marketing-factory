export enum CompetitorRole {
  MAIN = 'main',
  SECONDARY = 'secondary',
}

export enum CompetitorApproval {
  PENDING = 'pending',
  APPROVED = 'approved',
}

export type Competitor = {
  id: string
  name: string
  role: CompetitorRole
  marketFocus: string
  services: string
  features: string
  audience: string
  rationale: string
  url: string | null
  incorrect: boolean
  qualifiedAt: string
}

export type CompetitorsList = {
  approval: CompetitorApproval
  competitors: Competitor[]
}
