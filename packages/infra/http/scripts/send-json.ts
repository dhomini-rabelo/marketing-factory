export async function sendJson<Body>(apiUrl: string, method: string, path: string, body: unknown): Promise<Body> {
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`${method} ${path} respondeu ${response.status}: ${await response.text()}`)
  }
  return (await response.json()) as Body
}
