export const API_ROUTES = {
  projects: {
    list: '/projects',
    detail: (projectId: string) => `/projects/${projectId}`,
  },
  documents: {
    list: (projectId: string) => `/projects/${projectId}/documents`,
    detail: (projectId: string, slug: string) => `/projects/${projectId}/documents/${slug}`,
  },
  channels: {
    list: (projectId: string) => `/projects/${projectId}/channels`,
    detail: (projectId: string, channel: string) => `/projects/${projectId}/channels/${channel}`,
  },
  competitors: {
    list: (projectId: string) => `/projects/${projectId}/competitors`,
    detail: (projectId: string, competitorId: string) =>
      `/projects/${projectId}/competitors/${competitorId}`,
    approval: (projectId: string) => `/projects/${projectId}/competitors-approval`,
  },
}
