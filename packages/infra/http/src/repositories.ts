import {
  openDatabase,
  SqliteChannelAnalysisRepository,
  SqliteCompetitorRepository,
  SqliteDocumentRepository,
  SqliteProjectRepository,
  SqliteSeoRoundRepository,
} from '@infra/db'
import { readEnv } from '@infra/http/config/env'

export const database = openDatabase(readEnv().databasePath)
export const projectRepository = new SqliteProjectRepository(database)
export const documentRepository = new SqliteDocumentRepository(database)
export const channelAnalysisRepository = new SqliteChannelAnalysisRepository(database)
export const competitorRepository = new SqliteCompetitorRepository(database)
export const seoRoundRepository = new SqliteSeoRoundRepository(database)
