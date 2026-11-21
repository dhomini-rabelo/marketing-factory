import { Entity, ID } from '@domain/base'

export interface SeoRoundDocumentProps {
  roundId: ID
  title: string
  fileName: string
  about: string
  body: string
  size: number
}

export class SeoRoundDocument extends Entity<SeoRoundDocumentProps> {
  static create(props: SeoRoundDocumentProps) {
    return new SeoRoundDocument(props)
  }

  static reference(id: ID, props: SeoRoundDocumentProps) {
    return new SeoRoundDocument(props, id)
  }
}
