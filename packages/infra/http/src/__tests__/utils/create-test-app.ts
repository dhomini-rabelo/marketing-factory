import { once } from 'node:events'
import { mkdtempSync, rmSync } from 'node:fs'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { openDatabase } from '@infra/db'

type Database = ReturnType<typeof openDatabase>

export type TestApp = {
  baseUrl: string
  database: Database
  dispose: () => Promise<void>
}

export async function createTestApp(): Promise<TestApp> {
  const directory = mkdtempSync(join(tmpdir(), 'marketing-factory-http-'))
  process.env.DATABASE_PATH = join(directory, 'test.sqlite')

  const { startServer } = await import('@infra/http/start-server')
  const { database } = await import('@infra/http/repositories')

  const server = startServer(0)
  await once(server, 'listening')

  const { address, port } = server.address() as AddressInfo

  return {
    baseUrl: `http://${address}:${port}`,
    database,
    dispose: async () => {
      server.closeAllConnections()
      server.close()
      await once(server, 'close')
      database.close()
      rmSync(directory, { recursive: true, force: true })
    },
  }
}
