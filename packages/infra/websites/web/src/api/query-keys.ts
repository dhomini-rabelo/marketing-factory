export const QUERY_KEYS = {
  projects: () => ['projects'] as const,
  project: (projectId: string) => ['projects', projectId] as const,
  documents: (projectId: string) => ['projects', projectId, 'documents'] as const,
  document: (projectId: string, slug: string) =>
    ['projects', projectId, 'documents', slug] as const,
  channels: (projectId: string) => ['projects', projectId, 'channels'] as const,
  channel: (projectId: string, channel: string) =>
    ['projects', projectId, 'channels', channel] as const,
  competitors: (projectId: string) => ['projects', projectId, 'competitors'] as const,
  seoRounds: (projectId: string) => ['projects', projectId, 'seo', 'rounds'] as const,
  seoRound: (projectId: string, roundId: string) =>
    ['projects', projectId, 'seo', 'rounds', roundId] as const,
  seoCompetitor: (projectId: string, roundId: string, competitorName: string) =>
    ['projects', projectId, 'seo', 'rounds', roundId, 'competitors', competitorName] as const,
}
