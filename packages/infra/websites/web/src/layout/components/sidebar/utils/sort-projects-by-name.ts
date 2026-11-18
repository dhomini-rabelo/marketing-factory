import type { Project } from '@/api/models/project'

export function sortProjectsByName(projects: Project[]): Project[] {
  return [...projects].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'))
}
