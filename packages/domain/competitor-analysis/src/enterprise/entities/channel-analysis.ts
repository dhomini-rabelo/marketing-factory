import { Entity, ID } from '@domain/base'

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

export const CHANNEL_ORDER: Channel[] = [
  Channel.SITE_PRICING,
  Channel.LINKEDIN,
  Channel.INSTAGRAM,
  Channel.YOUTUBE,
  Channel.X_NETWORK,
  Channel.TIKTOK,
  Channel.REDDIT,
  Channel.ADS,
]

export const PARTIAL_CHANNELS: Channel[] = [
  Channel.X_NETWORK,
  Channel.TIKTOK,
  Channel.REDDIT,
  Channel.ADS,
]

export enum FindingAspect {
  FORMAT = 'format',
  TOPIC = 'topic',
  FREQUENCY = 'frequency',
  PERFORMANCE = 'performance',
  CTA = 'cta',
}

export const FINDING_ASPECT_ORDER: FindingAspect[] = [
  FindingAspect.FORMAT,
  FindingAspect.TOPIC,
  FindingAspect.FREQUENCY,
  FindingAspect.PERFORMANCE,
  FindingAspect.CTA,
]

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

export interface ChannelAnalysisProps {
  projectId: ID
  channel: Channel
  score: number
  rationale: string
  bestContent: BestContent
  findings: Finding[]
  collectedAt: Date
}

export class ChannelAnalysis extends Entity<ChannelAnalysisProps> {
  static create(props: ChannelAnalysisProps) {
    return new ChannelAnalysis(props)
  }

  static reference(id: ID, props: ChannelAnalysisProps) {
    return new ChannelAnalysis(props, id)
  }
}

export function isChannel(value: string): value is Channel {
  return CHANNEL_ORDER.includes(value as Channel)
}

export function isPartialChannel(channel: Channel): boolean {
  return PARTIAL_CHANNELS.includes(channel)
}
