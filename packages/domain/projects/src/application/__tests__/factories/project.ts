import { some } from '@domain/projects/application/__tests__/utils/some'
import {
  Project,
  ProjectPhase,
  ProjectPlatform,
  ProjectProps,
} from '@domain/projects/enterprise/entities/project'

export function makeProject(overrides: Partial<ProjectProps> = {}): Project {
  return Project.create({
    name: some.name(),
    description: some.string(),
    platform: some.valueBetween(...Object.values(ProjectPlatform)),
    phase: some.valueBetween(...Object.values(ProjectPhase)),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })
}
