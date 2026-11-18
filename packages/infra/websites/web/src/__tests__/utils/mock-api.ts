import { vi } from 'vitest'
import { API_URL } from '@/core/config'

type MockReply = {
  status?: number
  body?: unknown
}

type MockRequest = {
  method: string
  path: string
  body: unknown
}

type MockHandler = MockReply | ((request: MockRequest) => MockReply | Promise<MockReply>)

export type MockRoutes = Record<string, MockHandler>

function readBody(init: RequestInit | undefined): unknown {
  return typeof init?.body === 'string' ? JSON.parse(init.body) : undefined
}

function toResponse(reply: MockReply): Response {
  const status = reply.status ?? 200
  const body = reply.body === undefined ? null : JSON.stringify(reply.body)
  return new Response(body, { status, headers: { 'Content-Type': 'application/json' } })
}

export function mockApi(routes: MockRoutes) {
  const requests: MockRequest[] = []

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = init?.method ?? 'GET'
    const path = String(input).replace(API_URL, '')
    const request: MockRequest = { method, path, body: readBody(init) }
    requests.push(request)

    const handler = routes[`${method} ${path}`]
    if (!handler) throw new TypeError(`No mock for ${method} ${path}`)
    const reply = typeof handler === 'function' ? await handler(request) : handler
    return toResponse(reply)
  })

  vi.stubGlobal('fetch', fetchMock)

  return {
    fetchMock,
    requestsTo: (method: string, path: string) =>
      requests.filter((request) => request.method === method && request.path === path),
  }
}
