import type { ErrorResponse, FieldIssueResponse } from '@/api/types'
import { API_URL } from '@/core/config'

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: FieldIssueResponse[]

  constructor(params: {
    status: number
    code: string
    message: string
    fields?: FieldIssueResponse[]
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.fields = params.fields ?? []
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function isErrorResponse(payload: unknown): payload is ErrorResponse {
  if (typeof payload !== 'object' || payload === null || !('error' in payload)) return false
  const { error } = payload
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

async function parseResponse<Response_>(response: Response): Promise<Response_> {
  const payload = await readJson(response)
  if (response.ok) return payload as Response_
  if (isErrorResponse(payload)) {
    throw new ApiError({ status: response.status, ...payload.error })
  }
  throw new ApiError({
    status: response.status,
    code: 'INTERNAL_ERROR',
    message: response.statusText,
  })
}

export async function apiFetch<Response_>(path: string, init?: RequestInit): Promise<Response_> {
  const headers = init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers
  const response = await fetch(API_URL + path, { ...init, headers })
  return parseResponse<Response_>(response)
}
