import {
  checkOption,
  checkTextField,
  validateFieldIssues,
} from '@domain/projects/application/validation/field-issues'
import { ProjectPhase, ProjectPlatform } from '@domain/projects/enterprise/entities/project'

export const PROJECT_NAME_MAX_LENGTH = 80
export const PROJECT_DESCRIPTION_MAX_LENGTH = 200

export function validateProjectFields(input: {
  name: string
  description: string
  platform: string
  phase: string
}): void {
  validateFieldIssues([
    checkTextField({ field: 'name', value: input.name, maxLength: PROJECT_NAME_MAX_LENGTH }),
    checkTextField({
      field: 'description',
      value: input.description,
      maxLength: PROJECT_DESCRIPTION_MAX_LENGTH,
    }),
    checkOption({
      field: 'platform',
      value: input.platform,
      options: Object.values(ProjectPlatform),
    }),
    checkOption({ field: 'phase', value: input.phase, options: Object.values(ProjectPhase) }),
  ])
}
