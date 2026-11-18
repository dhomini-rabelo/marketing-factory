import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { DangerErrors, DomainError } from '@domain/base'
import { NoActiveCompetitorsError } from '@domain/competitor-analysis'
import { FieldErrorCode, FieldIssue, FieldsValidationError } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import {
  describeFieldIssue,
  describeFieldIssues,
  describeNoActiveCompetitors,
  describeNotFound,
} from '@infra/http/services/error-messages'

export type ErrorBody = {
  error: {
    code: string
    message: string
    fields?: { field: string; code: string; message: string }[]
  }
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  const bodyParserErrorType = readBodyParserErrorType(error)

  if (error instanceof FieldsValidationError) {
    return sendValidationError(response, error.fields)
  }

  if (error instanceof ZodError) {
    return sendValidationError(response, listSchemaIssues(error))
  }

  if (error instanceof DomainError && error.response.errorType === DangerErrors.NOT_FOUND) {
    return sendError(response, HttpStatus.NOT_FOUND, {
      error: {
        code: error.response.code,
        message: describeNotFound(error.response.code, error.response.variables),
      },
    })
  }

  if (error instanceof NoActiveCompetitorsError) {
    return sendError(response, HttpStatus.CONFLICT, {
      error: { code: 'NO_ACTIVE_COMPETITORS', message: describeNoActiveCompetitors() },
    })
  }

  if (bodyParserErrorType === 'entity.too.large') {
    return sendError(response, HttpStatus.PAYLOAD_TOO_LARGE, {
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request body is larger than 1 MB, split the content into smaller documents',
      },
    })
  }

  if (bodyParserErrorType === 'entity.parse.failed') {
    return sendError(response, HttpStatus.BAD_REQUEST, {
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' },
    })
  }

  console.error(error)

  return sendError(response, HttpStatus.INTERNAL_SERVER_ERROR, {
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  })
}

function sendError(response: Response, status: HttpStatus, body: ErrorBody) {
  return response.status(status).json(body)
}

function sendValidationError(response: Response, issues: FieldIssue[]) {
  return sendError(response, HttpStatus.BAD_REQUEST, {
    error: {
      code: 'VALIDATION_ERROR',
      message: describeFieldIssues(issues),
      fields: issues.map(describeFieldIssue),
    },
  })
}

export function listSchemaIssues(error: ZodError): FieldIssue[] {
  const fields = new Set(error.issues.map((issue) => formatIssuePath(issue.path)))

  return [...fields].map((field) => ({ field, code: FieldErrorCode.REQUIRED }))
}

function formatIssuePath(path: PropertyKey[]): string {
  if (path.length === 0) {
    return 'body'
  }

  return path.reduce<string>((formatted, segment, position) => {
    if (typeof segment === 'number') {
      return `${formatted}[${segment}]`
    }

    return position === 0 ? String(segment) : `${formatted}.${String(segment)}`
  }, '')
}

function readBodyParserErrorType(error: unknown): string | undefined {
  const hasType = typeof error === 'object' && error !== null && 'type' in error

  return hasType ? String(error.type) : undefined
}
