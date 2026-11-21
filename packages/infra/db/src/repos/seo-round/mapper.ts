import { createID } from '@domain/base'
import {
  SeoCompetitorData,
  SeoCompetitorPayload,
  SeoRound,
  SeoRoundDocument,
  SeoTool,
} from '@domain/competitor-analysis'
import { toEnumMember } from '@infra/db/repos/_base/enum-member'

export type SeoRoundRecord = {
  id: string
  projectId: string
  tool: `${SeoTool}`
  collectedAt: string
  note: string
  market: string
  expectedCompetitors: string
  searches: string
  createdAt: string
}

export type SeoCompetitorRecord = {
  id: string
  roundId: string
  normalizedName: string
  name: string
  data: string
}

export type SeoDocumentRecord = {
  id: string
  roundId: string
  fileName: string
  position: number
  title: string
  about: string
  body: string
}

export class SeoRoundMapper {
  static toPersistence(round: SeoRound): SeoRoundRecord {
    const { props } = round

    return {
      id: round.id.toValue(),
      projectId: props.projectId.toValue(),
      tool: props.tool,
      collectedAt: props.collectedAt.toISOString(),
      note: props.note,
      market: props.market,
      expectedCompetitors: JSON.stringify(props.expectedCompetitors),
      searches: JSON.stringify(props.searches),
      createdAt: props.createdAt.toISOString(),
    }
  }

  static toDomain(record: SeoRoundRecord): SeoRound {
    return SeoRound.reference(createID(record.id), {
      projectId: createID(record.projectId),
      tool: toEnumMember(SeoTool, record.tool),
      collectedAt: new Date(record.collectedAt),
      note: record.note,
      market: record.market,
      expectedCompetitors: JSON.parse(record.expectedCompetitors) as string[],
      searches: JSON.parse(record.searches) as object[],
      createdAt: new Date(record.createdAt),
    })
  }

  static competitorToPersistence(competitor: SeoCompetitorData): SeoCompetitorRecord {
    const { props } = competitor

    return {
      id: competitor.id.toValue(),
      roundId: props.roundId.toValue(),
      normalizedName: props.normalizedName,
      name: props.name,
      data: JSON.stringify(props.data),
    }
  }

  static competitorToDomain(record: SeoCompetitorRecord): SeoCompetitorData {
    return SeoCompetitorData.reference(createID(record.id), {
      roundId: createID(record.roundId),
      name: record.name,
      normalizedName: record.normalizedName,
      data: JSON.parse(record.data) as SeoCompetitorPayload,
    })
  }

  static documentToPersistence(document: SeoRoundDocument, position: number): SeoDocumentRecord {
    const { props } = document

    return {
      id: document.id.toValue(),
      roundId: props.roundId.toValue(),
      fileName: props.fileName,
      position,
      title: props.title,
      about: props.about,
      body: props.body,
    }
  }

  static documentToDomain(record: SeoDocumentRecord): SeoRoundDocument {
    return SeoRoundDocument.reference(createID(record.id), {
      roundId: createID(record.roundId),
      title: record.title,
      fileName: record.fileName,
      about: record.about,
      body: record.body,
      size: new TextEncoder().encode(record.body).length,
    })
  }
}
