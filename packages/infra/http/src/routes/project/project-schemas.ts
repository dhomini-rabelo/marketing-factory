import { z } from 'zod'

export const projectBodySchema = z.object({
  name: z.string(),
  platform: z.string(),
  phase: z.string(),
  description: z.string(),
})

export const projectParamsSchema = z.object({ id: z.string() })
