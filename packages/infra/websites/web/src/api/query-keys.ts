export const QUERY_KEYS = {
  projects: () => ['projects'] as const,
  project: (projectId: string) => ['projects', projectId] as const,
  documents: (projectId: string) => ['projects', projectId, 'documents'] as const,
  document: (projectId: string, slug: string) =>
    ['projects', projectId, 'documents', slug] as const,
}
