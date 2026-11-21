function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readSection(profile: unknown, section: 'numbers' | 'texts'): Record<string, unknown> {
  if (!isRecord(profile)) return {}
  const sectionValue = profile[section]
  return isRecord(sectionValue) ? sectionValue : {}
}

export function readProfileNumber(profile: unknown, key: string): number | null {
  const value = readSection(profile, 'numbers')[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function readProfileText(profile: unknown, key: string): string {
  const value = readSection(profile, 'texts')[key]
  return typeof value === 'string' ? value : ''
}

export function readProfileDomain(profile: unknown): string {
  if (!isRecord(profile) || typeof profile.url !== 'string') return ''
  try {
    return new URL(profile.url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
