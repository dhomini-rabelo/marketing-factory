export type HttpResult<Body> = {
  status: number
  headers: Headers
  body: Body
}

export async function sendJson<Body = unknown>(input: {
  baseUrl: string
  method: string
  path: string
  body?: unknown
  rawBody?: string
}): Promise<HttpResult<Body>> {
  const response = await fetch(`${input.baseUrl}${input.path}`, {
    method: input.method,
    headers: { 'Content-Type': 'application/json' },
    body: input.rawBody ?? (input.body === undefined ? undefined : JSON.stringify(input.body)),
  })

  return {
    status: response.status,
    headers: response.headers,
    body: (await response.json()) as Body,
  }
}
