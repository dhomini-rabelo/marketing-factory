import { isRecord, readProfileNumber, readProfileText } from '@/pages/seo/utils/seo-profile'

export const MIN_CLASSIFIED_EXAMPLES = 20

export type AudienceTier = 'primary' | 'secondary' | 'tertiary'

export type SeoAudience = {
  role: string
  size: string
  posts: number
  percentage: number
  tierByShare: AudienceTier | null
  tierByAgent: AudienceTier | null
  agentReason: string
  declaredPages: string[]
}

export const TIER_LABELS: Record<AudienceTier, string> = {
  primary: 'Primário',
  secondary: 'Secundário',
  tertiary: 'Terciário',
}

const ROLE_LABELS: Record<string, string> = {
  executivo: 'Executivos e fundadores',
  gestao: 'Gestão e liderança',
  vendas: 'Vendas',
  marketing: 'Marketing',
  atendimento: 'Atendimento e sucesso do cliente',
  produto: 'Produto e design',
  engenharia: 'Engenharia e TI',
  rh: 'RH e recrutamento',
  operacoes: 'Operações e projetos',
  financas_juridico: 'Finanças e jurídico',
  educacao_pesquisa: 'Educação e pesquisa',
  autonomo: 'Autônomos e freelancers',
  geral: 'Geral (qualquer leitor)',
}

const SIZE_LABELS: Record<string, string> = {
  smb: 'pequena e média empresa',
  enterprise: 'grande empresa',
  any: 'qualquer porte',
}

export function describeAudienceRole(role: string): string {
  return ROLE_LABELS[role] ?? role
}

export function describeAudienceSize(size: string): string {
  return SIZE_LABELS[size] ?? size
}

function readTier(audience: unknown, key: string): AudienceTier | null {
  const value = readProfileText(audience, key)
  return value === 'primary' || value === 'secondary' || value === 'tertiary' ? value : null
}

export function readAudiences(audiences: object[]): SeoAudience[] {
  return audiences.filter(isRecord).map((audience) => ({
    role: readProfileText(audience, 'audienceRole'),
    size: readProfileText(audience, 'audienceSize'),
    posts: readProfileNumber(audience, 'posts') ?? 0,
    percentage: readProfileNumber(audience, 'pct') ?? 0,
    tierByShare: readTier(audience, 'tierByShare'),
    tierByAgent: readTier(audience, 'tierByAgent'),
    agentReason: readProfileText(audience, 'agentReason'),
    declaredPages: readProfileText(audience, 'declaredPages')
      .split(',')
      .map((page) => page.trim())
      .filter(Boolean),
  }))
}

export function countClassifiedExamples(audiences: SeoAudience[]): number {
  return audiences.reduce((total, audience) => total + audience.posts, 0)
}

export function hasTierDivergence(audience: SeoAudience): boolean {
  const hasAnyTier = audience.tierByShare !== null || audience.tierByAgent !== null
  return hasAnyTier && audience.tierByShare !== audience.tierByAgent
}
