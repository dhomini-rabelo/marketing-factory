import type { Serialize, WithID } from '@domain/base'
import type { Project, ProjectProps } from '@domain/projects'

export type ProjectHttp = Serialize<WithID<ProjectProps>>

export class ProjectPresenter {
  static toHttp(project: Project): ProjectHttp {
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
}
