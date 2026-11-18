const HTTP_PROTOCOLS = ['http:', 'https:']

export function isHttpUrl(value: string): boolean {
  try {
    return HTTP_PROTOCOLS.includes(new URL(value).protocol)
  } catch {
    return false
  }
}
