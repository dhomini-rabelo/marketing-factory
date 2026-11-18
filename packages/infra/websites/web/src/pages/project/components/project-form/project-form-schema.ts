import { z } from 'zod'
import { ProjectPhase, ProjectPlatform } from '@/api/models/project'

export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do projeto')
    .max(80, 'O nome pode ter até 80 caracteres'),
  platform: z.enum(ProjectPlatform, { error: 'Escolha a plataforma' }),
  phase: z.enum(ProjectPhase, { error: 'Escolha a fase' }),
  description: z
    .string()
    .trim()
    .min(1, 'Informe a descrição do projeto')
    .max(200, 'A descrição pode ter até 200 caracteres'),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>
