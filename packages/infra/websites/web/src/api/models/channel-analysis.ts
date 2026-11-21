export enum Channel {
  SITE_PRICING = 'site-pricing',
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  X_NETWORK = 'x',
  TIKTOK = 'tiktok',
  REDDIT = 'reddit',
  ADS = 'ads',
}

export enum FindingAspect {
  FORMAT = 'format',
  TOPIC = 'topic',
  FREQUENCY = 'frequency',
  PERFORMANCE = 'performance',
  CTA = 'cta',
}

export enum FindingKind {
  FACT = 'fact',
  HYPOTHESIS = 'hypothesis',
}

export type Finding = {
  competitor: string
  aspect: FindingAspect
  kind: FindingKind
  statement: string
  url: string | null
  excerpt: string | null
  tool: string | null
}

export type BestContent = {
  type: string
  evidence: string
  basis: FindingKind
}

export type ChannelAnalysis = {
  channel: Channel
  partial: boolean
  score: number
  rationale: string
  bestContent: BestContent
  findings: Finding[]
  collectedAt: string
}

export type ChannelSummary = {
  channel: Channel
  partial: boolean
  collected: boolean
  score: number | null
  collectedAt: string | null
}
