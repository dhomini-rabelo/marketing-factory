export type ConfidenceLevel = 'high' | 'medium' | 'low'

export const CONFIDENCE_FILLED_BARS: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

export const CONFIDENCE_HINTS: Record<ConfidenceLevel, string> = {
  high: 'Confiança alta: leitura direta de sitemap, RSS ou HTML.',
  medium: 'Confiança média: depende de uma regra de classificação de URL ou de amostra.',
  low: 'Confiança baixa: depende de buscador ou de julgamento do agente.',
}
