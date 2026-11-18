import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/api/client'

type ApplyApiErrorToFormParams<Values extends FieldValues> = {
  setError: UseFormSetError<Values>
  error: unknown
}

const LIMIT_PATTERN = /at most (\d+) characters/

function buildFieldMessage(code: string, message: string): string {
  if (code === 'REQUIRED') return 'Campo obrigatório'
  if (code === 'INVALID_OPTION') return 'Escolha uma das opções'
  if (code === 'INVALID_TITLE') return 'Use um título com letras ou números'
  const limit = LIMIT_PATTERN.exec(message)?.[1]
  return limit ? `Use no máximo ${limit} caracteres` : 'Passou do limite de caracteres'
}

export function applyApiErrorToForm<Values extends FieldValues>({
  setError,
  error,
}: ApplyApiErrorToFormParams<Values>): void {
  if (!(error instanceof ApiError) || error.fields.length === 0) {
    setError('root.server', { message: 'Não foi possível salvar' })
    return
  }
  for (const issue of error.fields) {
    setError(issue.field as Path<Values>, {
      type: issue.code,
      message: buildFieldMessage(issue.code, issue.message),
    })
  }
}
