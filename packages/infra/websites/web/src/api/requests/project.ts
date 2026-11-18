import { apiFetch } from '@/api/client'
import type { Project, ProjectInput } from '@/api/models/project'
import { API_ROUTES } from '@/api/routes'
import type { ProjectsResponse } from '@/api/types'

export async function listProjects(): Promise<Project[]> {
  const response = await apiFetch<ProjectsResponse>(API_ROUTES.projects.list)
  return response.projects
}

export function getProject(projectId: string): Promise<Project> {
  return apiFetch<Project>(API_ROUTES.projects.detail(projectId))
}

export function createProject(input: ProjectInput): Promise<Project> {
  return apiFetch<Project>(API_ROUTES.projects.list, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateProject(projectId: string, input: ProjectInput): Promise<Project> {
  return apiFetch<Project>(API_ROUTES.projects.detail(projectId), {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}
