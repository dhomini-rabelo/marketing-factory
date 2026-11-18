import { Entity, ID } from '@domain/base'

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

export interface ProjectProps {
  name: string
  platform: ProjectPlatform
  phase: ProjectPhase
  description: string
  createdAt: Date
  updatedAt: Date
}

export class Project extends Entity<ProjectProps> {
  static create(props: ProjectProps) {
    return new Project(props)
  }

  static reference(id: ID, props: ProjectProps) {
    return new Project(props, id)
  }
}
