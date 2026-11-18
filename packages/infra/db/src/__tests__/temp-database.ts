import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Database } from 'better-sqlite3'
import { openDatabase } from '@infra/db/client/open-database'

export type TempDatabase = {
  database: Database
  filePath: string
  reopen: () => Database
  dispose: () => void
}

export function createTempDatabase(): TempDatabase {
  const directory = mkdtempSync(join(tmpdir(), 'marketing-factory-db-'))
  const filePath = join(directory, 'nested', 'test.sqlite')
  const opened: Database[] = []

  const reopen = () => {
    const database = openDatabase(filePath)
    opened.push(database)
    return database
  }

  const database = reopen()

  return {
    database,
    filePath,
    reopen,
    dispose: () => {
      opened.forEach((item) => item.close())
      rmSync(directory, { recursive: true, force: true })
    },
  }
}
