import type { Database } from 'better-sqlite3'

export function createSchema(database: Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      phase TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (project_id, slug)
    );
    CREATE TABLE IF NOT EXISTS channel_analyses (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id),
      channel TEXT NOT NULL,
      score REAL NOT NULL,
      rationale TEXT NOT NULL,
      best_content_type TEXT NOT NULL,
      best_content_evidence TEXT NOT NULL,
      best_content_basis TEXT NOT NULL,
      collected_at TEXT NOT NULL,
      PRIMARY KEY (project_id, channel)
    );
    CREATE TABLE IF NOT EXISTS channel_findings (
      project_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      position INTEGER NOT NULL,
      competitor TEXT NOT NULL,
      aspect TEXT NOT NULL,
      kind TEXT NOT NULL,
      statement TEXT NOT NULL,
      url TEXT,
      excerpt TEXT,
      tool TEXT,
      PRIMARY KEY (project_id, channel, position),
      FOREIGN KEY (project_id, channel)
        REFERENCES channel_analyses(project_id, channel) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL REFERENCES projects(id),
      normalized_name TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      market_focus TEXT NOT NULL,
      services TEXT NOT NULL,
      features TEXT NOT NULL,
      audience TEXT NOT NULL,
      rationale TEXT NOT NULL,
      url TEXT,
      incorrect INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL,
      qualified_at TEXT NOT NULL,
      PRIMARY KEY (project_id, normalized_name)
    );
    CREATE TABLE IF NOT EXISTS seo_rounds (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id),
      tool TEXT NOT NULL,
      collected_at TEXT NOT NULL,
      note TEXT NOT NULL,
      market TEXT NOT NULL,
      expected_competitors TEXT NOT NULL,
      searches TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS seo_round_competitors (
      id TEXT NOT NULL,
      round_id TEXT NOT NULL REFERENCES seo_rounds(id),
      normalized_name TEXT NOT NULL,
      name TEXT NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (round_id, normalized_name)
    );
    CREATE TABLE IF NOT EXISTS seo_round_documents (
      id TEXT NOT NULL,
      round_id TEXT NOT NULL REFERENCES seo_rounds(id),
      file_name TEXT NOT NULL,
      position INTEGER NOT NULL,
      title TEXT NOT NULL,
      about TEXT NOT NULL,
      body TEXT NOT NULL,
      PRIMARY KEY (round_id, file_name)
    );
    CREATE TABLE IF NOT EXISTS competitor_approvals (
      project_id TEXT PRIMARY KEY REFERENCES projects(id),
      approval TEXT NOT NULL
    );
  `)
}
