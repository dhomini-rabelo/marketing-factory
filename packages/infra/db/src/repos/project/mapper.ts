import { createID, Serialize, WithID } from '@domain/base'
import {
  Project,
  ProjectPhase,
  ProjectPlatform,
  ProjectProps,
} from '@domain/projects'
import type { OverWrite } from '@modules/utils'
import { toEnumMember } from '@infra/db/repos/_base/enum-member'

export type ProjectRecord = OverWrite<
  Serialize<WithID<ProjectProps>>,
  { platform: `${ProjectPlatform}`; phase: `${ProjectPhase}` }
>

export class ProjectMapper {
  static toPersistence(project: Project): ProjectRecord {
    return {
      id: project.id.toValue(),
      name: project.props.name,
      platform: project.props.platform,
      phase: project.props.phase,
      description: project.props.description,
      createdAt: project.props.createdAt.toISOString(),
      updatedAt: project.props.updatedAt.toISOString(),
    }
  }

  static toDomain(record: ProjectRecord): Project {
    return Project.reference(createID(record.id), {
      name: record.name,
      platform: toEnumMember(ProjectPlatform, record.platform),
      phase: toEnumMember(ProjectPhase, record.phase),
      description: record.description,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    })
  }
}
