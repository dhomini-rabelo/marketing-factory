export enum ProjectPlatform {
  WEB = 'web',
  MOBILE = 'mobile',
  BOTH = 'both',
}

export enum ProjectPhase {
  NO_CUSTOMERS = 'no_customers',
  FINDING_MARKET_FIT = 'finding_market_fit',
  CONSOLIDATED = 'consolidated',
}

export type Project = {
  id: string
  name: string
  platform: ProjectPlatform
  phase: ProjectPhase
  description: string
  createdAt: string
  updatedAt: string
}

export type ProjectInput = Pick<Project, 'name' | 'platform' | 'phase' | 'description'>
