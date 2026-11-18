import type { Server } from 'node:http'
import { app } from '@infra/http/app'
import { HOST } from '@infra/http/config/env'

export function startServer(port: number): Server {
  return app.listen(port, HOST)
}
