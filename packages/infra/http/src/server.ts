import { readEnv } from '@infra/http/config/env'
import { startServer } from '@infra/http/start-server'

startServer(readEnv().port)
