import { randomUUID } from 'node:crypto'

const SUFFIX_LENGTH = 8

export function uniqueName(prefix: string): string {
  return `${prefix} ${randomUUID().slice(0, SUFFIX_LENGTH)}`
}
