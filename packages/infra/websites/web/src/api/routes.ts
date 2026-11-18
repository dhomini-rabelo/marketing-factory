export const API_ROUTES = {
  projects: {
    list: '/projects',
    detail: (projectId: string) => `/projects/${projectId}`,
  },
  documents: {
    list: (projectId: string) => `/projects/${projectId}/documents`,
    detail: (projectId: string, slug: string) => `/projects/${projectId}/documents/${slug}`,
  },
}
