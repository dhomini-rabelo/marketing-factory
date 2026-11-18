import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig } from '@playwright/test'

const WEB_URL = 'http://localhost:5173'
const API_URL = 'http://127.0.0.1:3333'
const SERVER_TIMEOUT_MS = 120_000
const databasePath = join(mkdtempSync(join(tmpdir(), 'marketing-factory-e2e-')), 'e2e.sqlite')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: WEB_URL,
    channel: 'chrome',
    permissions: ['clipboard-read', 'clipboard-write'],
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --filter @infra/http exec tsx src/server.ts',
      url: `${API_URL}/projects`,
      env: { DATABASE_PATH: databasePath, WEB_ORIGIN: WEB_URL },
      reuseExistingServer: false,
      timeout: SERVER_TIMEOUT_MS,
    },
    {
      command: 'pnpm --filter web build && pnpm --filter web exec vite preview --port 5173 --strictPort',
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: SERVER_TIMEOUT_MS,
    },
  ],
})
