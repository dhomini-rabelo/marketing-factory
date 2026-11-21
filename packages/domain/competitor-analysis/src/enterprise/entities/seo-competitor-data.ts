import { Entity, ID } from '@domain/base'

export type SeoCompetitorPayload = {
  profile: Record<string, unknown>
  categories: object[]
  clusters: object[]
  comparisons: object[]
  examples: object[]
  folders: object[]
  items: object[]
  audiences: object[]
}

export interface SeoCompetitorDataProps {
  roundId: ID
  name: string
  normalizedName: string
  data: SeoCompetitorPayload
}

export class SeoCompetitorData extends Entity<SeoCompetitorDataProps> {
  static create(props: SeoCompetitorDataProps) {
    return new SeoCompetitorData(props)
  }

  static reference(id: ID, props: SeoCompetitorDataProps) {
    return new SeoCompetitorData(props, id)
  }
}
