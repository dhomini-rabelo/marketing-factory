import { Channel, FindingAspect } from '@/api/models/channel-analysis'
import { CompetitorRole } from '@/api/models/competitor'

export const CHANNEL_KEYS = [
  { key: Channel.SITE_PRICING, label: 'Site e preço' },
  { key: Channel.LINKEDIN, label: 'LinkedIn' },
  { key: Channel.INSTAGRAM, label: 'Instagram' },
  { key: Channel.YOUTUBE, label: 'YouTube' },
  { key: Channel.X_NETWORK, label: 'X' },
  { key: Channel.TIKTOK, label: 'TikTok' },
  { key: Channel.REDDIT, label: 'Reddit' },
  { key: Channel.ADS, label: 'Anúncios' },
]

export const ASPECT_KEYS = [
  { key: FindingAspect.FORMAT, label: 'Formato' },
  { key: FindingAspect.TOPIC, label: 'Assunto' },
  { key: FindingAspect.FREQUENCY, label: 'Frequência' },
  { key: FindingAspect.PERFORMANCE, label: 'Desempenho' },
  { key: FindingAspect.CTA, label: 'Chamada para ação' },
]

export const ROLE_KEYS = [
  { key: CompetitorRole.MAIN, label: 'Principal' },
  { key: CompetitorRole.SECONDARY, label: 'Secundário' },
]

export const COMPETITORS_COUNT = {
  minimum: 3,
  target: 6,
  targetMain: 4,
  targetSecondary: 2,
  maximum: 8,
  maximumMain: 5,
  maximumSecondary: 3,
}
