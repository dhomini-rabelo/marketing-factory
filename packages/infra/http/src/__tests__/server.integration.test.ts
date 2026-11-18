import { networkInterfaces } from 'node:os'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestApp, TestApp } from '@infra/http/__tests__/utils/create-test-app'

function findExternalAddress(): string | undefined {
  return Object.values(networkInterfaces())
    .flat()
    .find((entry) => entry?.family === 'IPv4' && !entry.internal)?.address
}

describe('server listening address', () => {
  let app: TestApp

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.dispose()
  })

  it('listens only on 127.0.0.1', () => {
    expect(new URL(app.baseUrl).hostname).toBe('127.0.0.1')
  })

  it('answers on 127.0.0.1 without any credential', async () => {
    const response = await fetch(`${app.baseUrl}/projects`)

    expect(response.status).toBe(200)
  })

  it.skipIf(!findExternalAddress())('refuses connections through the machine network address', async () => {
    const { port } = new URL(app.baseUrl)

    await expect(fetch(`http://${findExternalAddress()}:${port}/projects`)).rejects.toThrow()
  })
})
