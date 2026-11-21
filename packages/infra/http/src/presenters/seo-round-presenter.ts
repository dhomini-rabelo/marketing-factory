import type {
  GetSeoCompetitorUseCase,
  GetSeoRoundUseCase,
  ListSeoRoundsUseCase,
  SeoCompetitorData,
  SeoCompetitorPayload,
  SeoRound,
  SeoRoundCompetitorView,
  SeoRoundDocumentView,
  SeoRoundStatus,
  SeoRoundSummary,
  SeoTool,
  SeoWarning,
} from '@domain/competitor-analysis'

type GetSeoRoundResult = Awaited<ReturnType<GetSeoRoundUseCase['execute']>>
type GetSeoCompetitorResult = Awaited<ReturnType<GetSeoCompetitorUseCase['execute']>>
type ListSeoRoundsResult = Awaited<ReturnType<ListSeoRoundsUseCase['execute']>>

export type SeoRoundHttp = {
  id: string
  tool: `${SeoTool}`
  collectedAt: string
  note: string
  market: string
  status: `${SeoRoundStatus}`
  missing: string[]
  warnings: SeoWarning[]
  searches: object[]
  pagesRead: number
  competitors: SeoRoundCompetitorView[]
  documents: SeoRoundDocumentView[]
}

export type SeoRoundSummaryHttp = {
  id: string
  number: number
  tool: `${SeoTool}`
  collectedAt: string
  status: `${SeoRoundStatus}`
  isLatest: boolean
}

export type SeoCompetitorHttp = SeoCompetitorPayload & {
  name: string
  documents: SeoRoundDocumentView[]
}

export class SeoRoundPresenter {
  static toIdHttp(round: SeoRound): { id: string } {
    return { id: round.id.toValue() }
  }

  static toHttp(result: GetSeoRoundResult): SeoRoundHttp {
    const { props } = result.round

    return {
      id: result.round.id.toValue(),
      tool: props.tool,
      collectedAt: props.collectedAt.toISOString().slice(0, 10),
      note: props.note,
      market: props.market,
      status: result.status,
      missing: result.missing,
      warnings: result.warnings,
      searches: props.searches,
      pagesRead: result.pagesRead,
      competitors: result.competitors,
      documents: result.documents,
    }
  }

  static toListHttp(result: ListSeoRoundsResult): { rounds: SeoRoundSummaryHttp[] } {
    return { rounds: result.rounds.map((summary) => SeoRoundPresenter.toSummaryHttp(summary)) }
  }

  static toCompetitorHttp(result: GetSeoCompetitorResult): SeoCompetitorHttp {
    return {
      name: result.competitor.props.name,
      ...SeoRoundPresenter.toPayload(result.competitor),
      documents: result.documents.map((document) => ({
        title: document.props.title,
        fileName: document.props.fileName,
        about: document.props.about,
        size: document.props.size,
        body: document.props.body,
      })),
    }
  }

  private static toSummaryHttp(summary: SeoRoundSummary): SeoRoundSummaryHttp {
    return {
      id: summary.round.id.toValue(),
      number: summary.number,
      tool: summary.round.props.tool,
      collectedAt: summary.round.props.collectedAt.toISOString().slice(0, 10),
      status: summary.status,
      isLatest: summary.isLatest,
    }
  }

  private static toPayload(competitor: SeoCompetitorData): SeoCompetitorPayload {
    return competitor.props.data
  }
}
