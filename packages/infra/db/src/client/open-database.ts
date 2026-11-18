import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'
import { createSchema } from '@infra/db/client/schema'

const BUSY_TIMEOUT_MS = 5000

export function openDatabase(filePath: string): Database {
  mkdirSync(dirname(filePath), { recursive: true })

  const database = new BetterSqlite3(filePath)
  database.pragma('journal_mode = WAL')
  database.pragma('foreign_keys = ON')
  database.pragma(`busy_timeout = ${BUSY_TIMEOUT_MS}`)
  createSchema(database)

  return database
}
