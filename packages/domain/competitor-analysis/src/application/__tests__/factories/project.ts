import { some } from '@domain/competitor-analysis/application/__tests__/utils/some'
import { Project, ProjectPhase, ProjectPlatform } from '@domain/projects'

export function makeProject(): Project {
  return Project.create({
    name: some.name(),
    description: some.string(),
    platform: some.valueBetween(...Object.values(ProjectPlatform)),
    phase: some.valueBetween(...Object.values(ProjectPhase)),
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}
