import { openDatabase, SqliteDocumentRepository, SqliteProjectRepository } from '@infra/db'
import { readEnv } from '@infra/http/config/env'

export const database = openDatabase(readEnv().databasePath)
export const projectRepository = new SqliteProjectRepository(database)
export const documentRepository = new SqliteDocumentRepository(database)
