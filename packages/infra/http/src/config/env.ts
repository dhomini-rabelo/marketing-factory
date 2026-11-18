export const HOST = '127.0.0.1'

const DEFAULT_DATABASE_PATH = './data/marketing-factory.sqlite'
const DEFAULT_PORT = 7341
const DEFAULT_WEB_ORIGIN = 'http://localhost:7342'

export function readEnv(): { databasePath: string; port: number; webOrigin: string } {
  return {
    databasePath: process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH,
    port: Number(process.env.API_PORT) || DEFAULT_PORT,
    webOrigin: process.env.WEB_ORIGIN || DEFAULT_WEB_ORIGIN,
  }
}
